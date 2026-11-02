# KOWL — Coffee Caravan

A real 3D browser coffee-caravan tycoon built with Three.js and Vite. Run a colorful café in a small park, serve walking customers, manage supplies, and upgrade your business. All interface text is in English. Models are generated locally; no paid APIs, external character assets, or secrets are required.

## Run in GitHub Codespaces

Open a terminal in the directory containing this README and package.json:

```bash
npm ci
npm run dev -- --port 5173
```

Open port 5173 through the Codespaces Ports panel. Keep the server running. Use a current browser with WebGL and graphics acceleration. No app installation or Android emulator is required.

## Play

- Drag the scene to rotate the camera. Pinch or use +/− to zoom.
- Check the next customer's order, select its recipe, and brew.
- Scroll the recipe list in the left panel to explore the full menu.
- Buy beans and milk in Supplies. Each recipe lists ingredients, selling price and current preparation time.
- Use Upgrades to grow the business. All three upgrade tracks reach level 10.

### Coffee menu

| Machine level | New recipes |
| --- | --- |
| 0 | Espresso |
| 1 | Latte, Americano |
| 2 | Mocha |
| 3 | Cappuccino |
| 4 | Flat White |
| 5 | Cortado |
| 6 | Iced Latte |
| 7 | Macchiato |
| 8 | Cold Brew |
| 9 | Café au Lait |
| 10 | KOWL Signature |

### Upgrades

- **Machine, levels 0–10:** unlock recipes and reduce brewing time by 4.5% of base time per level.
- **Caravan, levels 0–10:** add 4 lira per coffee per level, improve arrivals, and add one queue slot every two levels.
- **Barista, levels 0–10:** level 1 hires an automatic brewer; every level reduces brewing time by 3.5% before combining with the machine modifier. Minimum preparation time is 1.1 seconds.

Upgrade prices increase by 45% per level and round up to the nearest 10 lira. Existing saves keep cash, stock, sales and upgrades. A previously hired barista becomes level 1; an unhired barista becomes level 0.

## Graphics and customers

A rounded turquoise caravan, owl emblem, striped awning, vivid park colors, flowers, umbrellas, benches and a pond. Customers have varied height, build, skin, hair, clothing and feminine/masculine presentations. Some wear hats, glasses, earrings or bags. Arms and legs animate while walking. Performance depends on device hardware.

## Save progress

Progress is stored in this browser's localStorage under `kowl-v2`. Use the same browser and game address to retain it. Saves do not transfer between addresses or devices, and are not cloud saves. Incognito mode or clearing site data may remove progress.

## Validate

```bash
npm run build
node --test tests/*.test.js
npm exec playwright test
```

Browser tests use Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` for a different installed executable. They cover sales, persistence, restocking, recipe unlocks, legacy barista migration, all upgrade tracks, scrolling the expanded menu on a phone, and the portable build.

## Portable single-file build

```bash
npm run build
node scripts/export.mjs
python3 -m http.server 8000 --directory export
```

Open port 8000 using Codespaces. `export/index.html` bundles the game, styles and 3D library. Regenerate it after changing source. The `src/` files are the editable source; `export/index.html` is generated output.

## GitHub workflow

Commit source changes and the regenerated portable export. Do not commit node_modules, dist, or test results. Saving a file in Codespaces alone does not push it to GitHub; use Commit and Sync Changes. This repository has not been deployed to GitHub Pages.

## Scope

Playable prototype with 12 coffees, inventory, sales, 10 levels each for machine/caravan/barista, animated customers and local saves. Decorations are currently fixed. Day/night lighting, café seating, occasional traffic and daily financial reports are included. Buildable regions, sound, quest rewards and cloud saves are future features. No Hay Day assets are used.

## Sale animations

The machine emits animated steam while brewing. A completed drink arcs from the counter into the customer's hand; the customer then leaves carrying it. Payment creates spinning gold coins flying toward the wallet, a floating income label, and a brief wallet pulse. These effects do not delay or duplicate saved sales. Temporary effects clean themselves up. The browser's reduced-motion preference shortens coffee delivery and removes flying coins.

## Caravan evolution

The starting level 0 cart grows through ten upgrades: Tiny Trailer, Weekend Camper, Street Café, Neighborhood Favorite, Coffee Truck, Mobile Café, Roastery on Wheels, Solar Café, Grand Coffee Lounge, and KOWL Flagship. Each level changes the actual model: body proportions, hatch, counter, canopy, driving cab, wheels, espresso stations, roaster, solar panels or premium signage. Buying a caravan level shrinks away the old model and reveals the new one with a spring animation, expanding light ring and stage-name banner. Loading a save displays the correct model immediately. Rapid upgrades clean up replaced geometry and sign textures, and reduced-motion preferences skip the 3D transformation.

## Order kiosk and pickup

Customers first walk to the separate touchscreen kiosk diagonally in front of the caravan. Only the customer at the screen can submit an order. They then walk along a separate approach into the caravan's FIFO pickup queue. Drinks may finish while a customer is still walking: the prepared cup waits visibly on the caravan counter, with no payment or departure until the matching customer reaches the front of pickup. Delivery and coin effects then play as usual. The interface shows kiosk/pickup counts and a ready-coffee status. Customers and outstanding orders are session-local; cash, inventory and upgrade progress keep using the existing save format.

## Café seating and occasional traffic

Served guests reserve one of six chairs, walk to their table, sit with bent knees and sip their drink. Visits last a randomly selected 18–35 seconds after seating. Guests then stand, free the chair and leave; later guests can reuse it. If all chairs are occupied, a guest leaves with their takeaway coffee. Seated guests do not consume order-queue capacity.

A separate road lane in front of the café carries colorful cars and vans in both directions. One vehicle passes at a time, followed by a random 25–55 second gap after it leaves. The vehicle lane is separated from customer entry, kiosk and pickup routes. Vehicle geometry is disposed after leaving the scene. Café visits and traffic pause while the tab is hidden.

## Side panels, game clock and daily accounts

Menu and Supplies are on the left; upgrades and the daily business report are on the right, keeping the scene center clear. Narrow screens use the Café and Business buttons to open one side drawer at a time. The 24-hour game clock sits at the top center.

A full game day lasts four real minutes of active play: 06:00–18:00 takes two minutes, then 18:00–06:00 takes another two. Sky, ambient lighting, stars and warm café lights transition with the clock. The clock pauses in a hidden tab and resumes from the saved game time; it does not simulate offline days.

Daily reports count coffees delivered, revenue, ingredient cost and upgrade spending. Net profit is revenue minus ingredients used minus upgrades. Beans cost 4 lira per portion; milk costs 3.75 lira per portion. Purchasing inventory is not charged again in this report: its cost is recognized when a coffee is sold. All accounting is stored as integer cents. A new report starts at 06:00; up to seven previous days are retained, with the last day summarized in the panel. Existing saves begin a fresh report while keeping lifetime sales, cash, stock and upgrades. Clock/report state autosaves every five seconds and on gameplay transactions or hiding the page.

## Responsive mobile play

The game fills both 9:16 portrait and 16:9 landscape viewports, as well as intermediate phone/tablet sizes. Fluid typography and touch targets adapt to the available screen. Touch devices and short landscape windows use collapsible side drawers so the café remains visible. Drawers scroll independently, including on small iPhone-sized screens. Camera field of view updates on rotation, without resetting the game or camera controls. Dynamic viewport height and safe-area insets keep controls clear of iPhone notches, home indicators and changing browser chrome. Browser zoom remains available. Use the same game address and browser to keep progress when rotating.

## Publish for players without GitHub accounts

The repository includes `.github/workflows/deploy-pages.yml`. It tests and builds the game on pushes to `main`, then publishes `dist` through GitHub Pages. Relative Vite asset URLs support the `/MOCK-KOWL/` project path.

One-time repository setting: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Then open **Actions → Publish KOWL to GitHub Pages → Run workflow**, select `main`, and run it. After the deployment job is green, the expected public address is `https://kadirbaykus.github.io/MOCK-KOWL/`. Check the workflow's deployment link for the actual published URL. Later pushes to `main` publish automatically.

Players need only a WebGL-capable browser and the public game link; they do not need a GitHub account or a running Codespace. Saves remain local to each player's browser. A first visit to the published URL starts a separate save from a Codespaces address; neither address overwrites the other's progress.
