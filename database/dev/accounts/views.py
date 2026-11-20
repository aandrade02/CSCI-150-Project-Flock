from django.contrib.auth.hashers import check_password, make_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Account

MIN_PASSWORD_LENGTH = 8


def account_json(account):
    return {"email": account.email, "role": account.role}  # never send the password back


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def signup_view(request):
    email = str(request.data.get("email", "")).strip().lower()
    password = str(request.data.get("password", ""))
    role = str(request.data.get("role", "student")).strip().lower()

    try:
        validate_email(email)
    except ValidationError:
        return Response({"error": "Please enter a valid email address."}, status=400)
    if len(password) < MIN_PASSWORD_LENGTH:
        return Response({"error": f"Password must be at least {MIN_PASSWORD_LENGTH} characters."}, status=400)
    if role not in ("student", "staff"):
        return Response({"error": "Role must be student or staff."}, status=400)
    if Account.objects.filter(email=email).exists():
        return Response({"error": "An account with that email already exists."}, status=409)

    account = Account.objects.create(email=email, password=make_password(password), role=role)
    return Response(account_json(account), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    email = str(request.data.get("email", "")).strip().lower()
    password = str(request.data.get("password", ""))
    account = Account.objects.filter(email=email).first()
    if account is None or not check_password(password, account.password):
        return Response({"error": "Invalid email or password."}, status=401)
    return Response(account_json(account))