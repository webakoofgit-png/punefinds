# PuneFinds frontend recreation

Static HTML, CSS, and vanilla JavaScript converted from the publicly accessible frontend at https://webakoof.in/. No WordPress, PHP, React, package installation, or build step is required.

## Run locally

Double-click `start.bat`, or run `python serve.py --port 8765` in this folder. Open http://127.0.0.1:8765/. Python is only a development file server; the website itself is static. Any static web server can serve this folder.

Use the local server rather than opening index.html directly: navigation uses site-root paths and property search loads catalog.json. Copy the complete folder to another drive or static host without changing the files.

## Included

- Original page markup, responsive theme styles, available fonts, and available public images, stored locally.
- Homepage, rent/buy/sell category pages, individual property pages, services, contact, blog overview, signup and listing pages.
- Mobile navigation, accessible dropdowns, advanced search, property filters, sorting, pagination, and featured carousel.
- Saved properties and three-property comparison, persisted on the current browser.
- Local property listing drafts and locally saved reviews. These do not publish to the original website.
- Form validation, login dialog, and explicit frontend-only feedback for operations that need a backend.
- Reduced-motion support, keyboard interaction, focus indicators, and responsive layouts.

## Source limitations

See source-report.json for the full source URL inventory and download failures. Many original media URLs return 404. Missing property images now use locally stored representative Pexels photos, as requested; they are demo images rather than original listing photos. See assets/demo-properties/README.md for credits. The header and footer use the owner-supplied assets/punefinds_logo.png. Other unavailable media retain transparent placeholders.

The supplied Google Drive folder is publicly browsable and contains WordPress database/theme/plugin backups, but no uploads backup. The original themes archive was downloaded and inspected (250 entries); it does not contain the missing property uploads. The homepage video points to a localhost URL. Missing media therefore cannot be fully recovered from these sources.

Authentication, password recovery, public property publishing, message delivery and embedded third-party maps are not provided by a static frontend. The login form never sends or stores passwords. Contact forms validate locally and explain that no message has been sent. Saved properties, comparison, drafts and reviews use browser local storage.

## Main files

- index.html and each route's index.html: static page markup.
- styles.css: standalone runtime styles and responsive behavior.
- app.js: all frontend interactions, written in vanilla JavaScript.
- assets/: locally downloaded theme styles, fonts and media.
- catalog.json: property records and original card markup for local search.
- source-report.json: recovered pages and inaccessible source materials.
- serve.py and start.bat: local preview helpers.

The original CSS class names are retained for visual fidelity; they do not require the WordPress or Elementor runtimes. Original executable scripts, AJAX configuration, hidden nonces and inline event handlers were removed.
