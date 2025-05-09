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
# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. (Optional but Recommended) Pre-download the model during image build
# This makes startup faster on Azure as the model is part of the image.
ARG SENTENCE_TRANSFORMER_MODEL_ARG=all-MiniLM-L6-v2
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${SENTENCE_TRANSFORMER_MODEL_ARG}')"

# 7. Copy Application Code
COPY . .

# 8. Expose Port (Gunicorn will run on this port inside the container)
# App Service will map an external port (80/443) to this internal port.
# It usually expects 8000, but you can configure WEBSITES_PORT.
EXPOSE 8000

# 9. Command to Run the Application
# Use Gunicorn for production.
# The number of workers can be tuned. `app:app` means `filename:flask_variable_name`.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:create_app()"]