# Python 3.11 slim image for lightweight containerization
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy dependency definition first for Docker layer caching
COPY dev/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# download packages for image processor_v2.py (ultralytics, shapely, opencv)
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir ultralytics shapely opencv-python

# Copy application source files
COPY dev/ .

# Copy and configure entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose backend server port (800)
EXPOSE 800

# Start container via entrypoint
ENTRYPOINT ["/entrypoint.sh"]

