# ⚡ Quick Reference Card

## 🚀 Start The App (2 Commands)

### Terminal 1 - Frontend
```bash
npm run dev
```
→ Opens at http://localhost:3000

### Terminal 2 - Backend
```bash
cd bias-detection-service
python main.py
```
→ Opens at http://localhost:8000

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Secret keys (CREATE THIS FIRST!) |
| `app/page.tsx` | Landing page |
| `app/dashboard/page.tsx` | User dashboard |
| `components/navbar.tsx` | Navigation bar |
| `components/footer.tsx` | Footer |
| `lib/supabase.ts` | Database functions |
| `bias-detection-service/main.py` | AI analysis server |

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start frontend
npm run dev

# Build for production
npm run build

# Install Python packages
pip install -r requirements.txt

# Start Python server
python main.py
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Python API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## 🔑 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

Get these from: https://supabase.com/

---

## 🐛 Quick Fixes

### Port already in use?
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies not installed?
```bash
npm install
cd bias-detection-service
pip install -r requirements.txt
```

### App not loading?
1. Check both servers are running
2. Check `.env.local` exists
3. Check browser console (F12)
4. Restart both servers

---

## 📂 Project Structure

```
Byte Rush/
├── app/              # Pages & API
├── components/       # UI components
├── lib/             # Helper functions
├── bias-detection-service/  # Python AI
└── public/          # Static files
```

---

## 🎯 Features

- ✅ Upload datasets (CSV)
- ✅ AI bias detection
- ✅ Interactive dashboards
- ✅ Leaderboard system
- ✅ Points & achievements
- ✅ Dark mode
- ✅ Responsive design

---

## 📚 Learn More

- [START_HERE.md](./START_HERE.md) - Beginner guide
- [SETUP.md](./SETUP.md) - Detailed setup
- [README.md](./README.md) - Full documentation

---

**Need help? Read the full [SETUP.md](./SETUP.md) guide!** 📖
