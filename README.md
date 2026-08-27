# My Little World 🌷

A cozy, whimsical, scrapbook-style personal journaling site — a private-feeling
digital sanctuary for journaling, memories, music, affirmations, letters to
yourself, a 100-day challenge, digital bouquets, and more.

Built with **plain HTML, CSS, and vanilla JavaScript only** — no frameworks,
no backend, no build step. It's designed to be hosted for free on
**GitHub Pages**.

## ✨ What's inside

| Page | What it does |
|---|---|
| `index.html` | Home dashboard — affirmation of the day, mood check-in, quick stats, quick actions |
| `journal.html` | The "Dump Book" — notebook-style journal with drag/resize/rotate stickers, photos, tags, search & filters |
| `music.html` | Your personal soundtrack — songs with notes, memories, and links |
| `challenge.html` | A customizable 100-day "Becoming Me" tracker with milestones |
| `affirmations.html` | Affirmation Garden — plant, favorite, and randomly pick affirmations |
| `bouquets.html` | Digital Bouquet Studio — build a bouquet, write a letter, export as an image |
| `letters.html` | Sealed envelopes / letters to your future self, organized by "open when…" |
| `memories.html` | A polaroid-style memory wall |
| `highest-self.html` | Values, habits, bucket list, vision board, promises to yourself |
| `joys.html` | Little Joys Jar — tiny good moments, picked at random |
| `monthly-reset.html` | A monthly reflection ritual, saved by month |
| `collections.html` | Custom shelves for favorite quotes, movies, snacks, and anything else |

## 🔒 How your data is stored

Everything you type or upload stays **on your device, in this browser**:

- Text data (journal entries, affirmations, letters, etc.) is stored in
  **`localStorage`**.
- Photos and uploaded stickers are stored in **IndexedDB** (better suited to
  larger files than `localStorage`).

This is **not** a secure, private vault — anyone using the same browser
profile could open developer tools and read this data, and clearing your
browser data or switching devices/browsers means your world won't follow you.

Use the **Export My World** button (in the sidebar of every page) regularly
to download a full backup as a `.json` file, and **Import My World** to
restore it later or move it to another device/browser. There's also a
journal-only export on the Journal page.

## 🚀 Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `my-little-world`).
2. Upload all the files in this folder, keeping the folder structure
   (`css/`, `js/`, `assets/`) intact, with `index.html` at the repository root.
3. In your repository, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   choose the branch (usually `main`) and the `/ (root)` folder, then save.
5. GitHub will give you a URL like `https://yourusername.github.io/my-little-world/`.
   Open it — your little world is live. 🌷

No build tools, no `npm install`, no server required.

## 🎀 Customizing

- Add your own stickers on the Journal page via **"upload sticker"** (PNG/WebP
  with transparency work best).
- Everything you see when you first open the site (sample songs, sample
  affirmations, etc.) is just placeholder/demo content shown when a section
  is empty — your own entries replace it as you use the site.
- Colors and fonts live at the top of `css/style.css` as CSS variables if you
  want to tweak the palette.

## 🗂 Project structure

```
/my-little-world
  index.html, journal.html, music.html, challenge.html, affirmations.html,
  bouquets.html, letters.html, memories.html, highest-self.html, joys.html,
  monthly-reset.html, collections.html

  /css
    style.css        — design tokens, layout, nav, buttons, cards
    journal.css       — notebook paper look, entry archive
    components.css    — decorative components (envelopes, jar, flowers, etc.)
    responsive.css     — mobile/tablet breakpoints

  /js
    storage.js         — localStorage + IndexedDB utility, export/import
    app.js              — shared nav, toasts, affirmations, home dashboard
    stickers.js         — drag/resize/rotate canvas engine (journal + bouquets)
    journal.js, music.js, challenge.js, affirmations.js, bouquet.js,
    letters.js, memories.js, highest-self.js, joys.js, monthly-reset.js,
    collections.js      — one file per page

  /assets
    /stickers, /flowers, /icons  — optional folders for your own custom art
```

Made to feel like a Pinterest scrapbook, a private diary, and a tiny personal
museum, all in one. Enjoy your little world. ♡
