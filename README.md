<<<<<<< HEAD
# MusicMitra
uvicorn main:app --reload
npx cross-env PORT=3002 bun run src/server.ts
npm run dev

MusicMitra is a full-stack web application for discovering, searching, and playing Telugu music. It features a modern Next.js frontend and a JioSaavn API backend, providing a seamless music experience with robust search, playlists, albums, artists, and a fully functional audio player.

## Features

- **Browse & Search:**
  - Search for songs, albums, artists, and playlists.
  - Dedicated pages for albums, artists, playlists, and songs.
- **Audio Player:**
  - Single, unified audio player at the bottom of the page (no duplicate audio).
  - Always plays the highest quality audio available (prefers 320kbps, then 160kbps, then 96kbps).
  - Play, pause, next, previous, shuffle, repeat, and seek controls.
  - Volume and mute controls.
  - Displays current song info, artwork, and debug info (audio quality and URL).
  - Debug: Button to open the current audio URL in a new tab for direct comparison.
- **Robust Image Handling:**
  - All images are validated before being shown.
  - If an image URL is invalid, missing, or returns an error/HTML, a safe placeholder is used.
  - No more Next.js <Image> errors from broken or backend error URLs.
- **Responsive UI:**
  - Modern, mobile-friendly design with light/dark mode toggle.
- **Fallbacks:**
  - MusicMitra logo is shown if any cover image is missing or invalid.
- **Robust Error Handling:**
  - User-friendly messages for empty states and errors.
  - Handles backend 500 errors for images gracefully.

## Tech Stack
- **Frontend:** Next.js (React, TypeScript, Tailwind CSS)
- **Backend:** Bun (JioSaavn API)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for frontend)
- [Bun](https://bun.sh/) (for backend)

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd MusicMitra
```

### 2. Start the Backend (JioSaavn API)
```sh
cd jiosaavn-api
bun install
bun run src/server.ts
```
- The backend will run on `http://localhost:3000` by default.

### 3. Start the Frontend (Next.js)
```sh
cd ../frontend
npm install
npm run dev
```
- The frontend will run on `http://localhost:3001` by default.

### 4. Environment Variables
- The frontend expects the backend URL in `.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3000
  ```
- Create this file in `frontend/` if it doesn't exist.

---

## Usage
- Use the navigation bar to browse Home, Search, Songs, Playlists, Albums, and Artists.
- Use the search bar in the header for global search (results appear on the Search page).
- Each resource page (songs, albums, playlists, artists) has its own search bar for filtering.
- The audio player at the bottom provides full playback controls and always plays the best available version of each song.
- Missing or broken images are replaced with the MusicMitra logo.
- Debug info under the player shows the current audio quality and URL, with a button to open the audio in a new tab.

---

## Troubleshooting

- **Audio plays slowly or with poor quality:**
  - The player always selects the highest quality available from the API. If you experience slow playback, check the debug info and try opening the audio URL in a new tab to compare.
  - Only one <audio> element is present; if you see multiple, check the browser console for warnings.
- **Image errors or broken covers:**
  - All images are validated before being shown. If the backend returns an error or HTML, a placeholder is used instead.
- **Next.js <Image> errors:**
  - The app uses a robust safeImageUrl helper to prevent invalid or broken URLs from causing errors.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE) 
=======

# 🎤 MusicMitra - AI Karaoke Converter

**MusicMitra** is an AI-powered Karaoke Converter that removes vocals from songs using the **Demucs** deep learning model. Just upload a song, and get a clean karaoke version — ready to sing along!

> Built with ❤️ using **FastAPI**, **Demucs**, **FFmpeg**, and **Next.js + Tailwind CSS**

---

## 📸 Preview

> Upload song → Get karaoke version → Download or play 🎶

---

## 🚀 Features

- 🎧 Upload `.mp3` or `.wav` songs
- 🤖 AI vocal removal using Facebook’s Demucs model
- 🎨 Simple and elegant web interface (Next.js + Tailwind)
- ⏱️ Real-time progress and status updates
- 📥 Download karaoke output (`karaoke.wav`)

---

## 🛠 Tech Stack

| Layer     | Technology        |
|-----------|-------------------|
| Frontend  | Next.js, Tailwind CSS |
| Backend   | FastAPI, Python   |
| AI Engine | Demucs (Hybrid Transformer) |
| Utilities | FFmpeg, Torchaudio |

---

## 📁 Project Structure

```
musicmitra/
├── demucs-backend/
│   ├── backend/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── venv/ (virtual environment)
├── next-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── README.md
└── .gitignore
```

---

## ✅ Prerequisites

Make sure you have the following installed:

- Python 3.8+
- Node.js 18+
- FFmpeg
- Git

---

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/Monica-1107/MusicMitra.git
cd MusicMitra
```

---

### 2. Backend Setup (FastAPI + Demucs)

```bash
cd demucs-backend
python -m venv venv
```

Activate the virtual environment:

- On Windows:
  ```bash
  venv\Scripts\activate
  ```
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

Install the dependencies:

```bash
cd backend
pip install -r requirements.txt
```

> If you don’t have `demucs` installed:
```bash
pip install demucs
```

---

### 3. Install FFmpeg

1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Extract it to `C:\ffmpeg\`
3. Add this to your system **PATH**:
   ```
   C:\ffmpeg\bin
   ```
4. Restart terminal and check:
   ```bash
   ffmpeg -version
   ```

---

### 4. Run Backend

```bash
cd demucs-backend/backend
uvicorn main:app --reload
```

✅ API is live at: [http://localhost:8000](http://localhost:8000)  
✅ API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 5. Frontend Setup (Next.js)

Open a **new terminal** window:

```bash
cd next-frontend
npm install
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 How It Works

1. Upload a song from the frontend
2. The backend saves it in `/uploads`
3. Demucs processes and separates vocals
4. Instrumental (karaoke) is returned to frontend
5. You can preview or download the karaoke output

---
