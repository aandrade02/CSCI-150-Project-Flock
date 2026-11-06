accounts = {}

def create_account(email, password, role):
    email = email.lower()
    if "@" not in email:
        return "Invalid email"
    if email in accounts:
        return "Account already exists"
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if role not in ("student", "staff"):
        return "Role must be student or staff"

    accounts[email] = {
        "password": password,
        "role": role,
        "is_admin": False,
        "preferred_lots": [],
        "preferred_times": [],
    }
    return "Account created"


def login(email, password):
    account = accounts.get(email.lower())
    if account is None or account["password"] != password:
        return "Invalid email or password"
    return "Login successful"

# Test
while True:
    choice = input("\n1) Create account  2) Login  3) Quit: ").strip()

    if choice == "1":
        # Keep asking until the email is valid and not taken
        while True:
            email = input("Email: ").strip().lower()
            if "@" not in email or "." not in email:
                print("Invalid email, try again")
            elif email in accounts:
                print("Account already exists, try another email")
            else:
                break

        # Keep asking until the password is long enough
        while True:
            password = input("Password: ").strip()
            if len(password) < 8:
                print("Password must be at least 8 characters, try again")
            else:
                break

        role = ""
        while role == "":
            pick = input("1) Student  2) Staff: ").strip()
            if pick == "1":
                role = "student"
            elif pick == "2":
                role = "staff"
            else:
                print("Please enter 1 or 2")

        print(create_account(email, password, role))

    elif choice == "2":
        email = input("Email: ").strip()
        password = input("Password: ").strip()
        print(login(email, password))

    else:
        break