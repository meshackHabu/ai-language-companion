# External Dataset Notes

## Active external source

- Provider: Tatoeba
- API: https://api.tatoeba.org/
- Downloads page: https://tatoeba.org/en/downloads
- License notes:
  - Tatoeba content can include CC BY and CC0 entries.
  - Always keep attribution metadata when exporting.

## How we import into this app

1. Run:
   - `cd backend`
   - `npm run import:dataset`
2. The script pulls sentence pairs (target language -> English) from Tatoeba API.
3. It generates:
   - `backend/data/external-tatoeba-seed.json` (raw import snapshot)
   - `/data.js` (frontend-ready dataset used by dashboard/flashcards/quiz)

## Important quality checks

- After import, manually spot-check random entries per language.
- Remove offensive or unnatural examples before production use.
- Keep `version`, `source`, and generation date for traceability.
