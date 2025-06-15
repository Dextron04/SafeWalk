# SafeWalk 🚶‍♀️🛡️

<p align="center">
  <img src="https://github.com/user-attachments/assets/f6641fff-220d-446f-9fda-5755d79a0a8b" alt="SafeWalk Hero" width="600"/>
</p>

<p align="center">
  <b>🚦 Your Real-Time Pedestrian Safety Navigator 🚦</b><br>
  <i>Find the <b>safest</b> and <b>shortest</b> walking routes, avoid danger zones, and walk with confidence!</i>
</p>

---

> **❓ Why SafeWalk?**
>
> <b>In 2024, over 3,300+ pedestrian deaths were reported in the U.S.</b> 🚨
> Poor lighting, isolated routes, and unreported crime zones threaten daily commuters. <br> > <b>SafeWalk</b> is here to change that — with live data, AI, and community alerts.

---

## ✨ Features at a Glance

| 🚦  | **Smart Route Suggestion**<br>Find the shortest & safest path, powered by Google Maps & live 911 alerts |
| --- | ------------------------------------------------------------------------------------------------------- |
| 🗺️  | **Interactive Map**<br>See crime hotspots and live alerts on a beautiful map                            |
| 📰  | **Live Safety Feed**<br>Real-time 911 calls, filterable by time, agency, and type                       |
| 🤖  | **AI Route Assistant**<br>Get personalized safety tips and route comparisons                            |
| 📊  | **Crime Trends**<br>Visualize 911 call stats and safety trends in your area                             |
| 🚨  | **Emergency Help Center**<br>Panic button, safety tips, and instant support                             |
| 👥  | **Crowd-Sourced Alerts**<br>Users can report unsafe activity to help others                             |

---

## 🚀 Quickstart

```bash
# 1. Clone & Install
cd safewalk
npm install

# 2. Set up your Google Maps API key
# (in a .env file)
GOOGLE_API_KEY=your_google_api_key

# 3. Start the backend
node server.js

# 4. Start the frontend
npm run dev

# 5. Open the app
# Visit http://localhost:5173
```

---

## 🧠 How It Works

> **Backend:** Node.js + Express
>
> - Fetches walking routes from Google Directions API
> - Aggregates live 911 call data (San Francisco Open Data)
> - Groups alerts by location to identify hotspots
> - Exposes endpoints for directions, 911 calls, and safety analysis

> **Frontend:** React + Vite + Tailwind
>
> - Interactive map (Leaflet) for routes & hotspots
> - Pages for route planning, live alerts, stats, and help
> - AI Route Assistant for personalized safety guidance
> - Real-time data updates and a beautiful, responsive UI

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white"/>
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
</p>

---

## 🏆 Why You'll Love SafeWalk

- **Live, actionable safety data** — not just static maps!
- **AI-powered chat** for route and safety questions
- **Mobile-friendly** and beautiful on any device
- **Community-driven**: help others by reporting alerts
- **Open source** — contribute and make your city safer!

---

## 📸 Screenshots

<p align="center">
  <img src="safewalk/src/assets/Screenshot 2025-06-15 at 3.25.02 PM.png" alt="SafeWalk Home - Welcome and Features" width="80%"/>
  <br><b>Welcome Page: Engaging intro, mission, and feature highlights</b>
</p>

<p align="center">
  <img src="safewalk/src/assets/Screenshot 2025-06-15 at 3.25.46 PM.png" alt="SafeWalk Live Safety Alerts" width="80%"/>
  <br><b>Live Safety Alerts: Real-time 911 calls, filterable and grouped by priority</b>
</p>

<p align="center">
  <img src="safewalk/src/assets/Screenshot 2025-06-15 at 3.26.11 PM.png" alt="SafeWalk Smart Routes Map" width="80%"/>
  <br><b>Smart Routes: Map with safety alerts and route planning</b>
</p>

---

## 🤝 Contributing

Pull requests and suggestions are welcome! For major changes, please open an issue first.

---

## 📜 License

MIT

---

<p align="center">
  <b>🚦 Walk smart. Walk safe. Walk with <span style="color:#FFD600">SafeWalk</span>! 🚦</b>
</p>
