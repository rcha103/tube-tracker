FROM python:3.12-slim

LABEL org.opencontainers.image.title="Tube Tracker"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/<your-username>/tube-tracker"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY static ./static

RUN mkdir -p /app/data

EXPOSE 8000

CMD ["python", "app.py"]
