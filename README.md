# BharatQuest 🇮🇳

### Explore India's World Heritage. Learn through play.

BharatQuest is a cross-platform educational adventure prototype built with **Expo + React Native + TypeScript**. It turns exploration of India's UNESCO World Heritage sites into an interactive experience built around discovery, source-backed information, missions, map challenges, collection progress, and lightweight game mechanics.

The project is designed around a simple principle:

> **Make heritage exploration feel like a game without compromising the provenance of the facts.**

Heritage information displayed in the app is sourced from the **UNESCO World Heritage DataHub**. When source data is unavailable, BharatQuest does not invent replacement facts.

---

## ✨ Highlights

- 🗺️ **Explore UNESCO World Heritage sites in India**
- 🏛️ **Source-backed site records** with descriptions, categories, inscription years, coordinates and image attribution when provided
- 🎯 **Mission system** for progressive exploration
- 🧭 **Map challenge** based on UNESCO coordinates
- 🧩 **Heritage matching mini-games**
- 📅 **Daily challenge** with a once-per-day reward
- 🏆 **XP, levels, streaks, discoveries and achievements**
- 📚 **Collection/progress tracking**
- 🔎 **Heritage search and regional filtering**
- 📖 **Site detail pages with source attribution**
- 📍 **Optional “Near Me” experience** using device location
- 💾 **Local progress persistence** using AsyncStorage
- 🌐 **Expo Web support**
- 📱 **React Native / Expo architecture** for native platforms

---

## 🧠 Design Philosophy

BharatQuest deliberately separates **documentary data** from **game mechanics**.

UNESCO provides the factual heritage record. BharatQuest adds the interactive layer around it:

- XP is game metadata.
- Rarity is game metadata.
- Missions are game mechanics.
- Challenge scores are game mechanics.
- The illustrated game world is conceptual artwork.
- UNESCO-provided site information remains tied to its source.

This means the application can be playful without presenting game-generated information as historical fact.

---

## 🏛️ Data & Source Provenance

### Primary data source

**UNESCO World Heritage DataHub**

Dataset:

`whc001`

The API retrieves UNESCO's World Heritage records, filters for the State Party **India**, normalizes the published fields, and stores the latest successful dataset in PostgreSQL.

The application uses UNESCO data for fields such as:

- Site name
- Description
- Short description
- UNESCO region
- Category
- Inscription year
- Criteria
- Coordinates
- Image URL
- Image author
- Image copyright
- Image caption
- Component information

Every heritage record returned by the API identifies UNESCO as its source.

### Resilient data loading

BharatQuest uses a database-backed cache:

```text
UNESCO DataHub
      │
      ▼
API normalization
      │
      ▼
PostgreSQL cache
      │
      ▼
BharatQuest client
