# 🎯 Project Overview for Friends

Welcome! This document explains what BiasBounty is and how to get started quickly.

---

## What Does This App Do?

BiasBounty is a web application that helps detect bias in AI datasets. Think of it like this:

1. **User uploads a dataset** (CSV file with data)
2. **AI analyzes it** for different types of bias (gender, race, age, etc.)
3. **User gets a detailed report** with visualizations
4. **User earns points** and competes on a leaderboard

---

## How The App Works

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                          │
│                    (http://localhost:3000)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │  Dashboard   │  │  Leaderboard │     │
│  │     Page     │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Built with: Next.js + React + TypeScript + Tailwind       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Sends requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────┐    ┌──────────────────────┐   │
│  │  Next.js API Routes    │    │  Python AI Service   │   │
│  │  (localhost:3000/api)  │◄───┤  (localhost:8000)    │   │
│  │                        │    │                      │   │
│  │  - Handles uploads     │    │  - Bias detection    │   │
│  │  - User auth           │    │  - ML analysis       │   │
│  │  - Data fetching       │    │  - Generates reports │   │
│  └────────┬───────────────┘    └──────────────────────┘   │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ Stores data
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase)                       │
│                                                              │
│  Tables:                                                     │
│  - users (user accounts)                                     │
│  - datasets (uploaded files)                                 │
│  - analysis_reports (bias detection results)                 │
│  - leaderboard (points & rankings)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Steps (5 Minutes)

### 1. Install Prerequisites
- Install Node.js from https://nodejs.org/
- Install Python from https://www.python.org/
- Install Git from https://git-scm.com/

### 2. Open Terminal and Run Commands

```bash
# Go to the project folder
cd "Byte Rush"

# Install frontend dependencies
npm install

# Install Python dependencies
cd bias-detection-service
pip install -r requirements.txt
cd ..
```

### 3. Create Environment File

Create a file named `.env.local` in the root folder with this content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Start Both Servers

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
cd bias-detection-service
python main.py
```

### 5. Open Browser

Go to: http://localhost:3000

---

## File Structure (What Each Folder Does)

```
Byte Rush/
│
├── app/                    # All the web pages
│   ├── page.tsx           # Home page (what users see first)
│   ├── dashboard/         # User's personal dashboard
│   ├── datasets/          # Dataset upload & management
│   ├── leaderboard/       # Rankings & competition
│   └── api/               # Backend API endpoints
│
├── components/            # Reusable UI pieces
│   ├── ui/               # Buttons, cards, forms, etc.
│   ├── navbar.tsx        # Top navigation bar
│   └── footer.tsx        # Bottom footer
│
├── bias-detection-service/ # Python AI backend
│   ├── main.py           # Main Python server
│   └── requirements.txt  # Python packages needed
│
├── lib/                  # Helper functions & utilities
│   ├── supabase.ts       # Database connection
│   └── utils.ts          # Common functions
│
├── public/               # Images, icons, static files
│
├── .env.local           # Secret keys (YOU CREATE THIS)
├── package.json         # Node.js dependencies
└── README.md            # Project documentation
```

---

## Key Technologies Used

| Technology | What It Does | Why We Use It |
|------------|-------------|---------------|
| **Next.js** | React framework for building web apps | Fast, modern, SEO-friendly |
| **TypeScript** | JavaScript with types | Catches errors early |
| **Tailwind CSS** | Utility-first CSS framework | Beautiful styling, fast development |
| **Python** | Programming language | Great for AI/ML |
| **FastAPI** | Python web framework | Fast API creation |
| **Supabase** | Database & authentication | Easy to use, PostgreSQL-based |
| **Framer Motion** | Animation library | Smooth, professional animations |
| **Recharts** | Charting library | Beautiful data visualizations |

---

## Common Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build app for production |
| `npm install` | Install Node.js dependencies |
| `python main.py` | Start Python AI service |
| `pip install -r requirements.txt` | Install Python dependencies |

---

## Features You Can Try

Once everything is running:

### 1. **Landing Page** (No Login Required)
- Upload a CSV file
- Get instant bias analysis
- See beautiful visualizations

### 2. **Sign Up / Login**
- Create an account
- Track your analysis history
- Earn points for discoveries

### 3. **Dashboard**
- View your stats
- See your uploaded datasets
- Track your progress

### 4. **Upload Dataset**
- Upload CSV files
- Analyze for bias
- Get detailed reports

### 5. **Leaderboard**
- See top bias hunters
- Compete with others
- Earn achievements

---

## Need Help?

### Quick Troubleshooting

**Problem: "Port already in use"**
- Close other apps using port 3000 or 8000
- Or change the port in the code

**Problem: "Module not found"**
- Run `npm install` again
- Make sure you're in the right folder

**Problem: "Database connection error"**
- Check your `.env.local` file
- Make sure Supabase URL and key are correct

**Problem: "Python errors"**
- Run `pip install -r requirements.txt` again
- Make sure Python version is 3.11+

### Where to Get Help

1. Read the [SETUP.md](./SETUP.md) file for detailed instructions
2. Check the [README.md](./README.md) for more info
3. Look at the browser console (F12) for errors
4. Check terminal output for error messages

---

## Development Tips

### Making Changes

1. **Frontend changes**: Edit files in `app/` or `components/`
2. **Styling changes**: Use Tailwind classes or edit `globals.css`
3. **API changes**: Edit files in `app/api/`
4. **Python/AI changes**: Edit files in `bias-detection-service/`

### The app auto-refreshes when you save files!

### Testing Your Changes

1. Save your file
2. Browser automatically refreshes
3. Check if it works
4. Fix any errors in the console

---

## Next Steps

After getting it running:

1. **Explore the code** - Start with `app/page.tsx` (landing page)
2. **Try making changes** - Change some text, colors, or layout
3. **Add features** - Add new pages or functionality
4. **Deploy it** - Put it online with Vercel (free!)

---

## Resources to Learn

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Python:** https://docs.python.org/3/
- **FastAPI:** https://fastapi.tiangolo.com/

---

Made with ❤️ for learning and building cool stuff!

**Questions?** Just ask! 🚀
