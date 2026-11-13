#!/bin/sh
set -e

# Wait for PostgreSQL to become available if DB_HOST is set
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST:${DB_PORT:-5432}..."
  python -c "
import socket, time, os
host = os.environ.get('DB_HOST')
port = int(os.environ.get('DB_PORT', 5432))
for i in range(30):
    try:
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        print('Database connection established!')
        break
    except Exception:
        time.sleep(1)
else:
    print('Warning: Database connection wait timed out. Attempting to proceed...')
"
fi

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Loading sample parking data..."
python manage.py loaddata sample_parking_data || true

PORT="${PORT:-800}"

# If arguments are provided to the container, execute them; otherwise start the server
if [ $# -gt 0 ]; then
  exec "$@"
else
  echo "Starting Django server on 0.0.0.0:$PORT..."
  exec python manage.py runserver "0.0.0.0:$PORT"
fi

