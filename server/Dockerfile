# Dockerfile
FROM python:3.12-slim

# 2. Set Environment Variables for Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Set Work Directory
WORKDIR /app

# 4. Install System Dependencies (if any)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package

# 5. Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# 6. Pre-download the model during image build
# This makes startup faster on Azure as the model is part of the image.
ARG SENTENCE_TRANSFORMER_MODEL_ARG=all-MiniLM-L6-v2
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${SENTENCE_TRANSFORMER_MODEL_ARG}')"

# 7. Copy Application Code
COPY . .

# 8. Expose Port (Gunicorn will run on this port inside the container)
EXPOSE 8000

# 9. Command to Run the Application
# Use Gunicorn for production.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:create_app()"]