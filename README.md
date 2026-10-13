# Bushbells Safaris

https://bushbellsdemo.vercel.app/

Website for Bushbells Safaris, featuring safari packages, destination guides, a photo gallery, and WhatsApp enquiries for Kenya, Uganda, and Tanzania.

## Run locally on Windows with Git Bash

The project uses [Bun](https://bun.sh) to install packages and run the development server. If Bun is not installed, run this in Git Bash:

```bash
curl -fsSL https://bun.sh/install | bash
```

If Git Bash does not recognise `bun` after installation, add Bun to the current shell session:

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

Then move to the project folder, install dependencies, and start the site:

```bash
cd "/c/Users/Administrator/Desktop/Trash/Bushbells-Safaris"
bun install
bun run dev
```

Open the local address printed in the terminal (usually <http://localhost:8080>). Keep the terminal running while you use the site. Press `Ctrl+C` to stop it.

To make Bun available in new Git Bash windows, add these two lines to `~/.bash_profile`:

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

If `~/.bash_profile` does not exist yet, create it with `touch ~/.bash_profile` before opening it in a text editor. Restart Git Bash after saving the file.

## Useful commands

```bash
bun run dev       # Start the local development site
bun run build     # Create a production build
bun run preview   # Preview the production build
bun run lint      # Check the code for issues
bun run test      # Run the automated tests
```

## Site features

- Responsive pages for safari packages and destination details
- Country filters and destination search
- Package itineraries, highlights, and enquiry links
- Gallery with an image viewer and optional admin uploads
- Enquiries that open a prefilled WhatsApp message
- Search and social sharing metadata on site pages

## Updating site content

- **Destinations, packages, itineraries, experiences, and FAQs:** `src/lib/safari-data.json`
- **Kenya destination descriptions, image assignments, WhatsApp link, and shared data helpers:** `src/lib/safaris.ts`
- **Safari package records:** `src/lib/operator-tours.ts`
- **Bundled safari photographs:** `src/assets/`
- **Shared page layout and cards:** `src/components/safari-site.tsx`
- **Page routes:** `src/routes/`
- **Global styles and design tokens:** `src/styles.css`

Replace bundled photographs with images you have permission to use. Keep the existing asset filenames when replacing files so the current image references continue to work.

## Gallery administration

Gallery uploads require a Supabase project. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md), then copy `.env.example` to `.env.local` and provide the project URL and publishable key. Do not put a Supabase service-role key in a browser environment variable.

## Production build

```bash
bun run build
bun run preview
```

The production build is written to `.output/`.
