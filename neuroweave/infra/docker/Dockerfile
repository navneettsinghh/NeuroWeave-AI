FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY neuroweave ./neuroweave

EXPOSE 8000
CMD ["uvicorn", "neuroweave.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
