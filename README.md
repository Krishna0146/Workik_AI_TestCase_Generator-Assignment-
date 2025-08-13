# 🚀 AI Test Case Generator - Workik AI Assignment
An intelligent test case generator that integrates with GitHub and uses AI to automatically generate comprehensive test cases for your codebase.
## ✨ Features

GitHub Integration: Browse and select code files from any repository
AI-Powered Generation: Uses Mistral AI to analyze code and generate test cases
Multi-Framework Support: Supports JUnit, Jest, pytest, Selenium, and more
Batch Processing: Generate tests for multiple selected files
Interactive UI: Clean interface with test case summaries and code preview
GitHub PR Creation: Optional feature to create pull requests with generated tests

## 🛠️ Tech Stack
Frontend: React 18 + Vite + JavaScript
Backend: Python Flask + Mistral AI
Integration: GitHub API, RESTful APIs
## 📦 Installation
Backend Setup
### Clone repository
git clone <your-repo-url>
cd <repo-name>

### Activate virtual environment
# Windows:
Scripts\activate
Then :
                  
          cd server
### Install dependencies
          pip install -r requirements.txt

## Setup environment variables
### Create .env file and add:
MISTRAL_API_KEY="your_mistral_api_key"

### Run Flask backend
          python app.py
### Server runs at: http://127.0.0.1:5000
## Frontend Setup
Navigate to frontend directory
                
            cd client

### Install dependencies
          npm install

### Start development server
          npm run dev
### Frontend runs at: http://localhost:5173
🔑 API Key Setup

### Visit Mistral AI
Create a free account
Generate an API key from the dashboard
Add it to your .env file

### 🚀 Usage

Connect Repository: Enter GitHub repository URL
Browse Files: Navigate through the file tree structure
Select Files: Choose files for test case generation
View Summaries: AI generates test case summaries
Generate Code: Select summaries to generate full test code
Create PR: Optionally create a GitHub pull request

### 📁 Project Structure
        ├── backend/
        │   ├── app.py              # Flask application
        │   ├── requirements.txt    # Python dependencies
        │   └── .env               # Environment variables
        ├── frontend/
        │   ├── src/               # React components
        │   ├── package.json       # Node dependencies
        │   └── vite.config.js     # Vite configuration
        └── README.md
## 🎯 Key Implementation Highlights

GitHub API Integration: Fetches repository structure and file contents
AI Code Analysis: Mistral AI analyzes code patterns and suggests relevant tests
Framework Detection: Automatically identifies appropriate testing frameworks
Responsive Design: Clean UI/UX with mobile compatibility
Error Handling: Comprehensive error management and user feedback
Security: Environment-based API key management
