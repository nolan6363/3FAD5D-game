FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p /data
# dev : flask  |  prod : gunicorn (surchargé dans docker-compose.prod.yml)
CMD ["python", "app.py"]
