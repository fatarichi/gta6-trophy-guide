# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/fatarichi/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/fatarichi/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline checklist and guide for all 55 Grand Theft Auto VI trophies on
PlayStation 5: the official list, a roadmap to the platinum, missable flags,
and a guide to each trophy with its sources.

## What it is

- `app/` — the guide itself, plain static files. Open `app/index.html` in a
  desktop browser; it works with the network off.
- `app/data/trophies.json` — all 55 official trophies with their official
  names, descriptions and grades, plus a guide to each in our own words with
  its sources.
- `screenshots/` — renders of the guide running in a browser.
- `main.ts` — the hand-in program: it copies `app/` and `screenshots/` to
  the output directory and writes `dossier.json` with the vendored make.fun
  library (`vendor/makefun-frontend.ts`, unchanged from the kit).

## Run it locally

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080 in a browser.

## Build the hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Trophy names, descriptions and grades are the official PlayStation 5 list as
published on 18 November 2026 (Exophase, as reported by Push Square).
Unlock details come from Output Lag's GTA 6 trophy list, cross-checked
against GGRecon and GTA Vice City Hub. Every guide on this page is original
writing; sources are cited beside each trophy. This is an unofficial fan
guide and uses no Rockstar Games logo, artwork or box art.

## License

MIT — see `LICENSE`.
