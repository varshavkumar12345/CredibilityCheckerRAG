#!/bin/bash

# Exit on error
set -e

echo "Starting deployment setup..."

# 1. System Updates & Dependencies
echo "Updating system and installing dependencies..."
sudo apt-get update -y
sudo apt-get install -y python3-pip python3-venv

# 2. Setup Swap (Crucial for t2.micro 1GB RAM)
if [ ! -f /swapfile ]; then
    echo "Creating 2GB swap file to prevent Out-Of-Memory errors..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap file created successfully."
else
    echo "Swap file already exists. Skipping."
fi

# 3. Python Environment Setup
echo "Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
fi

source venv/bin/activate

# 4. Install Python Dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
# Using --no-cache-dir to save memory on small instance
pip install --no-cache-dir -r requirements.txt

# 5. Create Start Script
echo "Creating start_app.sh..."
cat << 'EOF' > start_app.sh
#!/bin/bash
source venv/bin/activate
# Run with Gunicorn
# Adjust workers based on CPU cores (2 * cores + 1). For t2.micro (1 core), 3 workers might be too much ram. 
# Using 1 worker and upgrade threads for concurrency on small instance.
exec gunicorn --bind 0.0.0.0:5000 --workers 1 --threads 4 --timeout 120 transformer.app:app
EOF

chmod +x start_app.sh

echo "=========================================="
echo "Deployment Setup Complete!"
echo "To start the application, run:"
echo "  ./start_app.sh"
echo "=========================================="
