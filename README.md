# ✒️ HandScript v2 — Image-Based, No API Key

Uses your actual handwritten letter images. Works 100% offline.

---

## Setup

1. Make sure Node.js is installed (run: node --version)
   If not: https://nodejs.org

2. Put your letter images in the  alaphabet/  folder
   Naming: a_1.jpg, a_2.jpg, a_3.jpg, b_1.jpg, b_2.jpg ... etc.

3. Run:  node server.js

4. Open:  http://localhost:3000

---

## Adding missing letters (u, v, w, x, y, z)

You currently have a–t. To add more:
- Write the letter on paper (3 variations)
- Crop tightly, save as  u_1.jpg  u_2.jpg  u_3.jpg
- Put them in the  alaphabet/  folder
- Run:  node build_data.js  to rebuild letters_data.js
- Refresh the browser

---

## Features

- Randomly picks from 3 variants per letter — looks natural
- Global size scale slider
- Per-letter size override (great for m, n, b which may be larger)
- Letter spacing, word spacing, line height controls
- Baseline jitter for natural handwritten feel
- Download as PNG
