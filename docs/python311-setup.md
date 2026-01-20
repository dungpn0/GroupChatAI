# Python 3.11 Setup Guide

## Create Virtual Environment with Python 3.11

### Step 1: Check Available Python Versions
```bash
# Windows - List installed Python versions
py -0  

# Linux/Mac
python3.11 --version
python3 --version
which python3.11
```

### Step 2: Remove Old Virtual Environment
```bash
cd backend

# Remove existing venv
rm -rf venv        # Linux/Mac
rmdir /s venv      # Windows Command Prompt
Remove-Item -Recurse -Force venv  # Windows PowerShell
```

### Step 3: Create New venv with Python 3.11

#### Windows:
```bash
# Method 1: Python Launcher (recommended)
py -3.11 -m venv venv

# Method 2: Direct path (if Python 3.11 installed)
C:\Python311\python.exe -m venv venv

# Method 3: If added to PATH
python3.11 -m venv venv
```

#### Linux/Ubuntu:
```bash
# Install Python 3.11 if not available
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev

# Create venv
python3.11 -m venv venv
```

#### macOS:
```bash
# Install Python 3.11 via Homebrew
brew install python@3.11

# Create venv
python3.11 -m venv venv

# Or using pyenv
pyenv install 3.11.8
pyenv local 3.11.8
python -m venv venv
```

### Step 4: Activate and Install Dependencies
```bash
# Activate virtual environment
source venv/bin/activate     # Linux/Mac
venv\Scripts\activate        # Windows

# Verify Python version
python --version
# Should show: Python 3.11.x

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 5: Test Backend
```bash
# Copy environment file
cp ../.env .env

# Start backend
uvicorn app.main:app --reload

# Should start without SQLAlchemy compatibility errors
```

## Install Python 3.11 (if not available)

### Windows:
```bash
# Option 1: Download from python.org
# Go to https://www.python.org/downloads/
# Download Python 3.11.8 installer

# Option 2: Chocolatey
choco install python --version=3.11.8

# Option 3: Microsoft Store
# Search "Python 3.11" in Microsoft Store
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-pip
```

### macOS:
```bash
# Homebrew
brew install python@3.11

# Pyenv (recommended)
brew install pyenv
pyenv install 3.11.8
pyenv global 3.11.8
```

## Troubleshooting

### Python 3.11 not found:
```bash
# Windows - Check all Python installations
py -0

# Add Python 3.11 to PATH manually
# Add C:\Python311\ to system PATH

# Linux/Mac - Check installations
ls /usr/bin/python*
which python3.11
```

### Virtual environment issues:
```bash
# Clear pip cache
pip cache purge

# Recreate venv completely
rm -rf venv
python3.11 -m venv venv --clear

# Install pip tools
pip install --upgrade pip setuptools wheel
```

### SQLAlchemy compatibility:
```bash
# After creating Python 3.11 venv, should work with:
pip install sqlalchemy==2.0.25 asyncpg==0.29.0

# Test import
python -c "from sqlalchemy.ext.asyncio import create_async_engine; print('✅ SQLAlchemy working!')"
```