# douglasadamoski.github.io

**A scientific portfolio, built in the open → [douglasadamoski.github.io](https://douglasadamoski.github.io)**

A single-page, static portfolio for a working scientist: papers, conference
abstracts, teaching videos, code and awards — with a career trajectory, an
interactive world map, per-paper figures + downloadable PDFs, and a "productivity
by place / role" view. No framework, no build server: just HTML/CSS/vanilla JS that
GitHub Pages serves as-is. All the *content* lives in a couple of spreadsheets and
a folder of files, so it stays easy to maintain by hand.

It was **vibecoded with [Claude Code](https://claude.ai)** — and if you'd like one
like it, you can **[fork it and let an AI agent make it yours](#fork-it-and-let-an-ai-coding-agent-make-it-yours)**.

---

## What's in it

- **Home** — hero + bio, a **career trajectory** (each stage a card that links to
  the institution and drops a red dot on a faint Mercator **world map** on hover),
  research goals, and rotating **featured papers**.
- **Papers** — every paper as a card with the journal's banner, figure, full author
  list (you in bold), abstract, affiliation + theme tags, an optional GitHub link,
  and open/locked **PDF + supplementary** downloads. Plus a **production-by-year**
  stacked chart (cycle the stacking by place / role / theme) and filters for
  **productivity by place** and **by role** (first/co-first · corresponding · collaboration).
- **Conferences / Awards** — same shape as Papers, fed from their own data files.
- **Videos** — a YouTube channel as searchable cards with topic chips.
- **Code** — GitHub repos with cross-links to the related papers.
- **About** — portrait, curriculum, and contact links (email is click-to-reveal, so
  crawlers can't scrape it).
- **EN ⇄ PT** language toggle, mobile-friendly, keyboard-accessible.

## How it's built

```
data/           ← the editable source of truth (you touch these)
  papers_meta.xlsx     one row per paper: include, affiliation, roles, tags,
                       authors, abstract, github, … (colour-coded dropdowns)
  journals.xlsx        one row per journal: impact factor, banner file, …
  conferences.json     conference abstracts / talks (empty until you add them)
  awards.json          awards / honours
  videos.json          pulled once from the YouTube API
  papers_site.json     build cache (metadata fetched from Crossref, etc.)
assets/
  papers/<id>/         one folder per paper: <FirstAuthor_Year_Journal>.pdf + .png
                       (figure) + optional .zip (supplementary)
  logos/               institution logos for the trajectory
  journals/            journal logo banners (top strip of each card)
  portrait.jpg
build/          ← Python generators (run by hand; not part of the served site)
  gen_site.py          reads the data + assets → writes index.html
  site_template.html   the actual app (vanilla JS); gen_site injects data into it
  make_*.py, import_*.py, fetch_*.py, extract_*.py …  data helpers
index.html      ← GENERATED. This is what GitHub Pages serves.
```

The **spreadsheets are the master**. `build/gen_site.py` reads them (falling back to
`papers_site.json` for anything not overridden), scans each `assets/papers/<id>/`
folder for the real PDF/figure/zip, and bakes everything into a single self-contained
`index.html`. The page never reads the spreadsheets at runtime — the build does that
for you.

## Run it locally

```bash
git clone git@github.com:douglasadamoski/douglasadamoski.github.io.git
cd douglasadamoski.github.io

python3 build/gen_site.py          # regenerate index.html from the data
bash build/serve.sh                # serve at http://localhost:8123/index.html
```

`gen_site.py` needs `openpyxl` (`pip install openpyxl`); a few optional helpers use
`PyMuPDF` (PDF figures/abstracts) and `jsdom` (the smoke test).

## Make it your own (edit the data, not the code)

1. **Papers** — drop each paper's files into `assets/papers/<id>/` (a PDF, an image
   for the card, optionally a `.zip` of supplementary data — any filenames; the build
   scans the folder). Add/adjust its row in `data/papers_meta.xlsx` (title, authors,
   affiliation, roles, tags, abstract, an optional GitHub link).
2. **Journals** — fill `data/journals.xlsx` (impact factor, banner filename) and drop
   the journal's logo into `assets/journals/`.
3. **Trajectory** — edit the `CV` / `CV_FULL` constants near the top of
   `build/site_template.html` (institution, years, city lat/long) and replace the
   placeholder SVGs in `assets/logos/`.
4. **Conferences / Awards / Videos** — edit `data/conferences.json`,
   `data/awards.json`, `data/videos.json`.
5. `python3 build/gen_site.py` and commit `index.html`.

Placeholder generators (`make_logo_placeholders.py`, `make_journal_banners.py`) never
overwrite a real logo you've dropped in.

---

## Fork it, and let an AI coding agent make it yours

You don't need to build one from scratch — **fork this repository and let an agentic
coding CLI adapt it to you.** Tools like **[Claude Code](https://claude.ai)**, OpenAI
**Codex**, or Google **Antigravity (`agy`)** are great at exactly this: point them at
the repo, hand them your content, and let them swap it in as a **pull request you
review** before it goes live.

1. **Fork** `github.com/douglasadamoski/douglasadamoski.github.io`, and rename your fork
   to `<yourusername>.github.io`.
2. **Clone** your fork and open it inside your AI coding CLI.
3. **Point it at your content** (a folder of your papers, your bio, your links) and ask
   it to adapt the site — it edits the data tables and drops in your files, then opens a
   **PR on your fork**.
4. **Review the PR**, merge it, and GitHub Pages serves your version at
   `<yourusername>.github.io`.

Almost everything the agent changes lives in `data/` and `assets/` — you rarely touch
the app code itself.

**Example prompts** (run inside your fork):

```text
# Make it yours — a PR that swaps in your identity
"This is a forked scientific-portfolio site (see the README). Replace Douglas's
 identity with mine — name, bio, affiliations, profile photo, and the social links in
 build/site_template.html and assets/ — then open a pull request with just those
 changes."

# Bring in your papers
"Here's a folder of my papers (a PDF + one figure each). For each, create an
 assets/papers/<id>/ folder, fetch the authors + abstract from Crossref by the DOI,
 add a row to data/papers_meta.xlsx, run build/gen_site.py, and open it as a PR."

# Your trajectory, logos and journals
"Update the CV / CV_FULL constants in build/site_template.html with my career stages
 (institution, city lat/long, years), and swap the placeholder SVGs in assets/logos/
 and assets/journals/ for my institutions' and journals' logos."

# Polish & review before merging
"Regenerate index.html, run build/smoke_test.mjs, and get a second opinion from
 Gemini/Codex on the changes before finalising the PR."
```

**How to organise your files** for the agent: drop your PDFs (and any figures) in one
folder, and if you already keep a list of your papers (title, journal, year, DOI, career
stage), hand that over too — the agent can fetch the rest (authors, abstracts, figures)
from public APIs and lay them out into the `data/` + `assets/` structure above.

---

**Copy away — it's free to fork and adapt for your own portfolio. 🎉** And if you do,
a little link back to
[**douglasadamoski.github.io**](https://douglasadamoski.github.io) as a reference would
totally make my day. 🙌😊

*Content © Douglas Adamoski.*
