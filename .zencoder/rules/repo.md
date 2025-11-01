---
description: Repository Information Overview
alwaysApply: true
---

# BiasBounty Information

## Summary
BiasBounty is a platform that gamifies AI bias detection through crowdsourcing. Users can upload datasets, analyze them for bias using AI, and earn rewards for discovering and reporting bias patterns. The platform features a Next.js frontend with a Python FastAPI backend service for bias detection.

## Structure
- **app/**: Next.js app router pages and API routes
- **components/**: React components including UI components from shadcn/ui
- **lib/**: Utilities and configuration files
- **bias-detection-service/**: Python FastAPI service for bias analysis
- **hooks/**: Custom React hooks
- **sample-data/**: Example datasets for testing
- **scripts/**: Setup and utility scripts
- **jobs/**: Storage for analysis jobs and results

## Main Project

### Language & Runtime
**Frontend**:
- **Language**: TypeScript 5
- **Framework**: Next.js 14 (App Router)
- **Node Version**: 18+ (required)

**Backend Service**:
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104.1

### Dependencies
**Frontend Main Dependencies**:
- Next.js 14
- React 18.3
- Supabase Auth & DB
- TailwindCSS
- shadcn/ui components (Radix UI)
- Recharts for data visualization
- Framer Motion for animations

**Backend Main Dependencies**:
- FastAPI
- Uvicorn
- Pandas
- NumPy
- Transformers (Hugging Face)
- PyTorch
- scikit-learn

### Build & Installation
**Frontend**:
```bash
npm install
npm run dev     # Development
npm run build   # Production build
npm run start   # Start production server
```

**Backend Service**:
```bash
cd bias-detection-service
pip install -r requirements.txt
python main.py
```

**Complete Setup**:
```bash
npm run setup           # Install dependencies and setup database
npm run complete-setup  # Full project setup
```

### Docker
**Dockerfile**: bias-detection-service/Dockerfile
**Base Image**: python:3.11-slim
**Exposed Port**: 8000
**Run Command**:
```bash
docker build -t bias-detection ./bias-detection-service
docker run -p 8000:8000 bias-detection
```

### Testing
No formal testing framework configuration was found in the repository. The project includes sample datasets for manual testing:

**Sample Datasets**:
- HR Dataset (hr_dataset.csv): Gender pay gap bias
- Loan Applications (loan_applications.csv): Racial bias in approvals
- Product Reviews (product_reviews.json): Gender stereotypes in text

### Configuration
**Environment Variables**:
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key
- SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
- BIAS_DETECTION_API_URL: URL for bias detection service (default: http://localhost:8000)

**API Endpoints**:
- Frontend: /api/analyze-bias, /api/datasets, /api/leaderboard
- Backend: /analyze, /health, /analyze-upload, /download/{job_id}

### Entry Points
**Frontend**: app/page.tsx (homepage)
**Backend**: bias-detection-service/main.py (FastAPI application)