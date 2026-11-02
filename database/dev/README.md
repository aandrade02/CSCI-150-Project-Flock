Database Setup Guide

Use these steps to run the Django database and API on your own computer. Python 3.11 and PostgreSQL must already be installed and PostgreSQL must be running.

1. Get the files

From the repository folder (save your work before switching branches):

git fetch origin
git switch --track origin/feature/database-setup

If you already have that local branch, use git switch feature/database-setup instead. If you're working on a separate backend branch, coordinate merging these files rather than replacing your work.

2. Install Python packages

macOS/Linux (from the repository folder):
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r database/dev/requirements.txt

Windows PowerShell:
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r database/dev/requirements.txt

3. Connect PostgreSQL to Django

Django needs your PostgreSQL username, which may be different from your computer username.

A. Find your PostgreSQL username. Try:
psql -d postgres -c "SELECT current_user;"
The result under current_user is the role you're using. If this fails, try the PostgreSQL user you configured during installation (often postgres on Windows):
psql -h localhost -U postgres -d postgres -c "SELECT current_user;"

B. Set the connection values in your terminal. Replace YOUR_ROLE with the PostgreSQL username from step A.

macOS/Linux (local PostgreSQL using a Unix socket):
export DB_USER=YOUR_ROLE
export DB_NAME=operation_flock
Windows PowerShell (common password-based PostgreSQL setup):
$env:DB_USER = "YOUR_ROLE"
$env:DB_NAME = "operation_flock"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_PASSWORD = Read-Host "PostgreSQL password"
If you use password-based PostgreSQL on macOS/Linux too, additionally set DB_HOST=localhost, DB_PORT=5432, and DB_PASSWORD in your terminal. Never put passwords in Git.

C. Create your database (only once).

macOS/Linux:
createdb -U "$DB_USER" operation_flock

Windows PowerShell:
psql -h localhost -U $env:DB_USER -d postgres -c "CREATE DATABASE operation_flock;"
If it already exists, skip creation. If you get a permissions error, use a PostgreSQL role allowed to create databases.

D. Test the Django connection:

cd database/dev
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print(connection.vendor)"

Expected: postgresql. If it fails, check that PostgreSQL is running and the username/password match your local installation. This setup requires config/settings.py to read the DB_* environment variables.

4. Create the tables and load sample data

Stay inside database/dev:
python manage.py migrate
python manage.py loaddata sample_parking_data

Load the sample data into a new development database, not one containing important records.

5. Test the API

python manage.py runserver
Open http://127.0.0.1:8000/api/lots/.

You should see P20 data: 200 total spaces, 50 available, 75% occupied.