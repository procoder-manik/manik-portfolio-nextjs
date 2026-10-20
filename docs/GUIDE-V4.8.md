# Update guide: version 4.8 (AI project writer)

## What it does

Add a portfolio project and the AI writes it for you: the short description, the project story, deliverables, work tags, tools, the meta title and meta description, social title and description, focus keyword, the screenshot alt text and the accent colour. It also looks at your screenshot and gives you ready prompts for a 1600 x 840 banner.

## Adding a new project

1. **Admin > Portfolio > Add new.** A window opens at once and asks what you did.
2. Type the **website name** and **address**.
3. Pick **what you did** (one or more): New website build, Redesign, New pages or landing pages, Maintenance and support, Online store, Speed optimisation, SEO, Local SEO, Migration, Fixes and updates, Custom features.
4. Pick **where the work is now**: Finished, Still building, or Ongoing care.
5. Add the **full-page screenshot** (upload or pick from the library). This is the only thing you do by hand.
6. Optional, under **More details**: platform (or let it detect), industry, client name, dates, and your notes. Write real details in the notes: the problem, pages you built, plugins, and results with numbers. The AI never invents numbers; it only uses numbers from your notes.
7. Press **Write it**. Three steps run: reading the website, reading the screenshot, writing the project.
8. Check the preview (Google preview with character counts, summary, tags, story), then press **Put it in the form**.
9. Read the tabs, change anything you like, and press **Create**.

Press **Skip, I will fill it in myself** to close the window and work by hand.

## Existing projects

Open the project and press **Write with AI** at the top. Choose **Only fill empty fields** (keeps what you wrote) or **Replace what is there**. The address (slug) of a saved project is never changed.

## Banner prompts

**Images tab > Banner prompts from your screenshot.** You get the site's colours (click one to use it as the accent colour), the text for the banner and three prompts:

- **Device mockup** and **Floating browser**: paste into ChatGPT or Nano Banana (Gemini) and **attach your screenshot** in the same message.
- **Background only**: for Midjourney or any image AI; place the screenshot yourself in Canva or Figma.

Upload the result under **Finished banner**. This also turns off "Use the screenshot as the banner", so Facebook, LinkedIn and X show the banner, while the project page keeps the scrolling screenshot. Press **Read again** for new prompts after changing the screenshot.

## Where the work is now

New field in the **Timeline** tab. Still building and Ongoing care show a status badge and a Status line on the project page instead of a finish date, and the list heading reads "What I am delivering" or "What I look after".

## Good to know

- It uses the same free AI keys as the AI writer (Admin > AI writer > Settings > API keys). Reading the screenshot needs a model that can see images: Gemini works best (free); Groq and OpenRouter vision models are tried after it.
- Reading the website needs no AI. Some sites block robots; then the AI writes from your answers and says so.
- SVG screenshots work in the browser; if the browser cannot read the image, the server opens PNG, JPG or WebP files itself.
- The meta title keeps your brand part from SEO settings (for example "| Manik Hossain") and stays around 60 characters.

## Quick test

- [ ] Portfolio > Add new: the window opens by itself.
- [ ] Fill name, address, two kinds of work, Ongoing care, a screenshot, a note with one number. Press Write it: three green steps.
- [ ] Put it in the form: Project, What I did and SEO tabs are filled; the meta title ends with your brand.
- [ ] Images tab: colours and prompts are shown; Copy prompt works; uploading a finished banner turns the banner switch off.
- [ ] Create, then open the project page: "Ongoing care" badge and Status line, no finish date.
- [ ] Open an existing project, Write with AI with "Only fill empty fields": your own texts stay.
