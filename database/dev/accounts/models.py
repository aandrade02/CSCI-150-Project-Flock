from django.db import models

# Define student or staff account
class Account(models.Model):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("staff", "Staff"),
    ]

    # requires each account to have a unique email address
    email = models.EmailField(unique=True)
    # stores the hashed password for the account (using Django's default hashing)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
