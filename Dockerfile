# Gunakan base image Python yang ringan
FROM python:3.13-slim

# Set label dan metadata
LABEL maintainer="Telkom University Lost & Found Team"
LABEL description="Aplikasi Lost & Found Telkom University untuk Tugas Komputasi Awan dan Terdistribusi"

# Set direktori kerja
WORKDIR /app

# Hindari buffering output python di log container
ENV PYTHONUNBUFFERED=1 \
    PORT=5000 \
    ALLOWED_ORIGIN=*

# Pasang dependensi curl untuk health check Docker
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Salin file requirements terlebih dahulu agar memanfaatkan cache layer docker
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Salin seluruh kode backend, frontend, dan folder public ke container
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY public/ ./public/

# Buka port aplikasi (default 5000)
EXPOSE 5000

# Health check container untuk AWS Load Balancer / ECS / Docker daemon
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Jalankan server Flask
CMD ["python", "backend/app.py"]
