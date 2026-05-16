# Patente Italiana Flashcards 🚗

> A free, open-source flashcard app for Persian-speaking learners studying for the Italian driving license exam (Patente italiana).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made for: Patente B](https://img.shields.io/badge/Made_for-Patente_B-c8472f.svg)]()
[![Language: Italian → Farsi](https://img.shields.io/badge/Language-Italian_→_Farsi-2d6a4f.svg)]()

---

## 🎯 Why this exists

The Italian driving license theory exam is hard enough in Italian — and even harder when you're learning the language at the same time. Most existing flashcard tools assume you already speak Italian fluently, and there's almost nothing tailored for Persian (Farsi) speakers.

This app fills that gap: a lightweight, offline-first flashcard tool with Italian-to-Persian vocabulary, spaced repetition, true/false quizzes, and AI-powered vocabulary extraction from any Italian text.

No accounts. No tracking. No ads. Runs entirely in your browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📚 **Spaced Repetition** | Cards reappear at increasing intervals based on how well you know them |
| 🃏 **Flip Cards** | Classic flashcard UI — Italian on the front, Persian on the back |
| ✦ **True/False Quizzes** | Test your understanding with quiz statements |
| ✦ **AI Vocabulary Extraction** | Paste any Italian text — AI extracts the relevant Patente vocab automatically |
| ✦ **AI Quiz Generation** | Generate quiz questions on any topic via the Anthropic API |
| 📥 **CSV Import** | Bulk import vocabulary from CSV (paste or file upload) |
| 🔍 **Search & Filter** | By category, status (known / learning), or text |
| 🏷️ **Categories** | Organize vocabulary by theme (signs, rules, vehicle parts, etc.) |
| ✓ **Known/Unknown Marking** | Track which words you've mastered |
| ✦ **Visual Quiz Flag** | Vocabulary words used in quizzes are visually marked |
| 🌙 **Light/Dark Theme** | Easy on the eyes, day or night |
| 💾 **Export/Import Backup** | Download all your data as JSON; restore anywhere |
| 🇮🇷 **Full RTL Support** | Persian-first UI, properly typeset |

---

## 🚀 Quick Start

### Option 1 — Just open the file

1. Download or clone this repo
2. Open `index.html` in any modern browser
3. That's it — no install, no build step, no server

```bash
git clone https://github.com/Rasoul-Khazaei/patente-italiana-flashcards.git
cd patente-italiana-flashcards
open index.html   # or double-click it
```

### Option 2 — Serve locally (optional)

If you'd like to serve it via HTTP (e.g. for testing on a phone in your network):

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000`.

---

## 🤖 Using AI features (optional)

The AI extraction and quiz generation features use the [Anthropic API](https://docs.claude.com). They are completely optional — the app works fine without them.

To use the AI features:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Open the **افزودن** (Add) tab and paste your key into the API key field
3. The key is stored only in your browser's `localStorage` and is never sent anywhere except directly to the Anthropic API

> **Note:** API usage incurs a small cost on your Anthropic account (typically fractions of a cent per extraction).

---

## 📂 CSV Format

When importing vocabulary in bulk, use this format (one word per line):

```csv
italiano,farsi,categoria,note
precedenza,حق تقدم,قوانین,
incrocio,تقاطع,علائم,
sorpasso,سبقت,قوانین,not allowed in tunnels
```

- The first two columns (`italiano` and `farsi`) are required.
- `categoria` and `note` are optional.
- Lines starting with `#` are treated as comments.

---

## 🏗️ Architecture

This is intentionally a **single-page, vanilla-JS app** with no build step, no dependencies, no framework. Why?

- **Portability** — runs anywhere a browser runs, including older phones
- **Offline-first** — once loaded, no network needed (except for AI features)
- **Privacy** — no servers means no data leaves your device
- **Hackability** — anyone can fork it and modify it with basic web skills

```
patente-italiana-flashcards/
├── index.html      ← UI, styles, and structure
├── app.js          ← All logic (state, SRS, quiz, AI calls)
├── README.md       ← You are here
├── CONTRIBUTING.md ← How to help out
└── LICENSE         ← MIT
```

All state lives in `localStorage` under three keys: `patente_fc_data_v1`, `patente_fc_settings_v1`, and `patente_fc_theme`.

---

## 🛣️ Roadmap

Planned features (PRs welcome!):

- [ ] Native Android app (Kotlin, planned via Android Studio)
- [ ] Daily review push notifications (PWA)
- [ ] More sophisticated SRS algorithm (full SM-2)
- [ ] Audio pronunciation for Italian words
- [ ] Image associations (especially for road signs)
- [ ] Multiple-choice quiz mode
- [ ] Multiple language pairs (Arabic, English, etc.)
- [ ] Pre-built vocabulary decks by topic

---

## 🤝 Contributing

Contributions are very welcome! Whether you want to:

- Fix a bug
- Add a feature
- Improve translations
- Add vocabulary for a specific Patente category
- Translate the UI to another language

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📜 License

[MIT](LICENSE) © Rasoul Khazaei

You are free to use, modify, distribute, and learn from this code. If it helps you pass your Patente, that's the only thanks needed. 🎉

---

## 🙏 Acknowledgments

- The Persian-speaking community in Italy preparing for the Patente
- Anthropic for the Claude API used for AI features
- Everyone who has ever struggled to translate `precedenza` correctly

---

## 📬 Contact

Questions, suggestions, or want to share your Patente success story? Open an issue or reach out on GitHub.

**در آرزوی موفقیت در آزمون پاتنته! 🍀**
