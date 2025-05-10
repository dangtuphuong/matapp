# Dockerfile
FROM python:3.12-slim

# Set Environment Variables for Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set Work Directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# Pre-download the model during image build
# This makes startup faster on Azure as the model is part of the image.
ARG SENTENCE_TRANSFORMER_MODEL_ARG=all-MiniLM-L6-v2
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${SENTENCE_TRANSFORMER_MODEL_ARG}')"

# Copy Application Code
COPY . .

# Expose Port (will be overridden by PORT env var if set)
EXPOSE 8000

# Command to Run the Application
CMD gunicorn --bind "0.0.0.0:${PORT:-8000}" "app:create_app()"