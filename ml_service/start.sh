#!/bin/bash

echo "Starting Mosam AI ML Service..."
echo ""
echo "Installing dependencies (if needed)..."
pip install -r requirements.txt
echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo ""
python app.py
