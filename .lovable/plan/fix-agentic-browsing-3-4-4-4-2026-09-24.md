# Fix Agentic Browsing (3/4 → 4/4)

PageSpeed marks the AI catalog file invalid. It expects the ARD manifest format, which needs a `specVersion` field and an `entries` list. The current file uses a different layout, with `version` and `resources`.

## Change
Rewrite `public/.well-known/ai-catalog.json` to the ARD shape and keep the same content:

- `specVersion` at the top (the current ARD version string, checked against the spec page before writing)
- Publisher details: name PalmMitra, url https://www.palmmitra.in/, contact thepalmmitra@gmail.com
- `entries` array, one entry for each existing resource, each with its type, name, url, description and media type:
  - llms.txt (the documentation file)
  - Start a palm reading (/upload)
  - PalmMatch compatibility (/palmmatch)
  - Help and FAQ (/help)

## Checks
- Test the file against the ARD JSON schema, if the spec publishes one. Otherwise check it field by field against the spec.
- Confirm the file is served as JSON at `/.well-known/ai-catalog.json` locally.
- After you publish, re-run PageSpeed on palmmitra.in to confirm 4/4.

No other files change.
