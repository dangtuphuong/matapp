FROM python:3.11-slim

# Set Environment Variables for Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set Work Directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn && \
    rm -rf /root/.cache /root/.config

# Pre-download the model during image build
ARG SENTENCE_TRANSFORMER_MODEL_ARG=all-MiniLM-L6-v2
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${SENTENCE_TRANSFORMER_MODEL_ARG}')"

# Copy Application Code
COPY . .

# Expose Port
EXPOSE 8000

# Start App
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:create_app()"]