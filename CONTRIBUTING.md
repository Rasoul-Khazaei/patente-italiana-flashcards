# Contributing to Patente Italiana Flashcards

Thanks for your interest in contributing! This project exists to help Persian-speaking learners pass the Italian driving license exam, and any help — from typo fixes to new features — is welcome.

## Ways to contribute

### 🐛 Report bugs
If something doesn't work as expected, [open an issue](../../issues/new) with:
- What you were trying to do
- What happened instead
- Your browser and OS
- Steps to reproduce, if possible

### 💡 Suggest features
Have an idea? Open an issue with the `enhancement` label and describe:
- The problem you're trying to solve
- Your proposed solution
- Why it would be useful for other learners

### 📖 Add vocabulary
Vocabulary contributions are especially valuable. To add a new vocabulary set:

1. Create a CSV file with the format `italiano,farsi,categoria,note`
2. Place it in a `decks/` folder (create it if needed)
3. Open a PR with a brief description of the category

### 🌍 Improve translations
The UI is currently Persian. If you'd like to:
- Improve existing Persian translations
- Add another language (Arabic, English, etc.)

…open an issue first to discuss the approach.

### 🔧 Code contributions

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes (keep them focused — one feature per PR)
4. Test in at least one modern browser (Chrome/Firefox/Safari)
5. Commit with a clear message: `git commit -m "Add audio playback for Italian words"`
6. Push and open a PR

## Code style

This is a **vanilla JS** project with no build step. Please keep it that way:

- No frameworks (React, Vue, etc.)
- No external dependencies for core functionality
- No bundlers required
- ES6+ is fine — modern browsers only

### JavaScript

- Use `const` by default, `let` when reassignment is needed
- Functions should do one thing well
- Comment non-obvious logic
- Keep state mutations in one place (`saveState()`)

### CSS

- Use CSS custom properties (variables) for theming
- Mobile-first responsive design
- Keep selectors flat — avoid deep nesting

### HTML

- Semantic elements (`<nav>`, `<header>`, etc.)
- ARIA attributes where appropriate
- RTL-aware layouts

## Testing manually

Before submitting a PR, please test:

1. ✅ The app loads with seed data on a fresh browser profile
2. ✅ Adding a word manually works
3. ✅ CSV import works
4. ✅ Study mode shows cards and SRS scheduling works
5. ✅ Quiz mode works (try all three: manual, file, AI)
6. ✅ Export → clear → import restores everything
7. ✅ Light and dark themes both look fine
8. ✅ Mobile (or narrow window) layout works

## Questions?

If you're unsure about anything, just open an issue and ask. There are no stupid questions.

---

**ممنون از کمکت! 🙏**
