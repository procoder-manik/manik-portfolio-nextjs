# 12 How to extend

Always: make the change, run `npm run build`, test the admin and the public page, then deploy. Run `npx tsx scripts/gen-docs.ts` afterwards so the reference stays true.

## Add a field to an existing content type

1. Add it to the model in `lib/models/index.js` (for example `subtitle: String`). Without this the value is dropped on save.
2. Add it to the right tab in `lib/admin-schema.js` under `RESOURCES`:
   ```js
   { name: 'subtitle', label: 'Subtitle', type: 'text', info: 'A short line shown under the title.' }
   ```
   Field types include text, textarea, number, switch, select, segmented, tags, image, url, datetime, repeater (with `fields`), ref (pick another item), note. Use `showIf: (doc) => ...` to show a field only sometimes, and `half: true` for half width.
3. Add the help text in `info`. Every field needs one (it is covered by `lib/field-info.js`).
4. Show it on the public page (`app/(site)/<section>/[slug]/page.js` or a component).
5. If it should be in the starter content, add it to `lib/seed-data.js`.

## Add a new content type (a new list in the admin)

1. Model in `lib/models/index.js` and add it to the `MODELS` map.
2. Entry in `RESOURCES` (`lib/admin-schema.js`): `label`, `singular`, `slugFrom`, `columns`, `defaults`, `sections`, `preview`.
3. Permission area in `RESOURCE_AREA` (`lib/roles.js`).
4. Menu item in `components/admin/Sidebar.jsx` (`NAV`).
5. Optional: add to `TRASHABLE`, `DUPLICABLE` (`lib/trash.js`) and `STATUS` for the Published switch; add to `SEO_RES` in `admin-schema.js` for the SEO column.
6. A public page, a getter in `lib/data.js` (wrap with `cache`), the sitemap route, and `lib/schema-item.js` if it needs schema.

The generic list, editor, API, bulk actions, Trash, duplicate and quick edit work with no further code.

## Add a settings group or option

- New option in an existing group: add a field in `SETTINGS.<key>` (`lib/admin-schema.js`) and a default in `lib/seed-data.js`. Read it with `getSettings('<key>')` (defaults are merged under saved values).
- New group: add `SETTINGS.<key>`, a default in `seed-data.js` (`settings`), an area in `settingsArea()` (`lib/roles.js`) and a menu item.

## Add a page section type (block)

1. Define it in `lib/blocks.js` (`BLOCKS.<type>`: label, icon, description, fields). Reuse `layoutCtl` for grid or carousel options.
2. Render it in `components/site/blocks/Blocks.jsx` (add a `case`).
3. Cards inside a block use `components/site/cards/CardLayout.jsx`.

## Add a card design

Add it to `CARD_TEMPLATES` in `lib/card-templates.js` and render it in `components/site/cards/Cards.jsx`.

## Add an email

1. Defaults in `lib/seed-data.js` (`settings.email`), fields in `SETTINGS.email`.
2. A template function in `lib/email/templates.js` (use `layout()`, `button()`, `B(site)` for links).
3. A sender in `lib/notifications.js` that builds the context with `ctx()` and logs the send.
4. Call the sender where the event happens.

## Add an AI provider

In `lib/ai.js`: add it to `ALL_KEYS`, `LABEL`, `SIGNUP`, `MODELS`, a branch in `callOne()` (most providers are OpenAI-compatible, so copy the Groq branch) and optionally a `discover()` branch for its model list. Add its key to `KEY_NAMES` in `lib/secrets.js` and to `components/admin/AiKeys.jsx`.

## Add a built-in page with its own SEO

Add it to `BUILTIN_PAGES` in `lib/admin-schema.js`, create `app/(site)/<name>/page.js`, call `getPageSeo('<key>')` for metadata and `<JsonLd builtin="<key>" ...>`. It then appears in the sitemap, the SEO overview and the SEO settings automatically.

## Add a scheduled job

Create `app/api/cron/<name>/route.js` that checks `Authorization: Bearer CRON_SECRET`, add it to `vercel.json` under `crons` and `functions`. Vercel Hobby allows one run per day per job.

## Conventions to keep

- Plain English everywhere in the interface, emails and docs; no long dashes.
- Never read a model directly from a public page; use `lib/data.js`.
- Never read an AI key directly; use `lib/ai.js` (it applies admin-saved keys).
- Never trust the browser for prices; compute on the server (`lib/plans.js`).
- Use `refreshContent()` after any change that public pages show.
- Keep free text out of the code: put defaults in `lib/seed-data.js`, not inside components.
- Guard every admin route with `adminRoute(handler, area)`.
- Add a quick-test checklist to the update guide for every feature.
