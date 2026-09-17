# Portfolio audit — 17 September 2026

## Fixed

- Removed the embedded development API credential and the credential from the local Git remote URL. Production values in Vercel were preserved.
- Unified the local and Vercel carousel handlers; fixed question-mode responses, missing-provider handling, provider timeouts, response validation, and JSON parsing. Gemini uses its documented `gemini-2.5-flash` default, with an optional server-side override.
- Corrected GitHub links, an incorrect contact email, the sitemap/robots domain, and project metadata.
- Added an explicit email-draft fallback because `VITE_WEB3FORMS_KEY` is absent in Vercel. The page does not claim a message was sent when it merely opens the email client.
- Fixed undefined door references and a conditional hook order, removed a missing preload asset, and cleaned up unused declarations.
- Preserved direct room URLs and fixed Back/Forward history during asynchronous teleportation.
- Added keyboard entrance controls, visible accessible navigation, project/contact content when the CMS is disabled, dialog focus handling, and inert closed dialogs.
- Added a WebGL capability check, a render error boundary, and a lightweight-page escape link. Blocked browser storage no longer prevents startup.
- Fixed production `/start` routing and restricted SPA rewrites so missing files return real 404s. Added security headers and immutable caching for hashed assets.
- Lazy-loaded the carousel editor, disposed the generated background texture, and stopped video scrubbing on reduced-motion changes or backgrounding.
- Updated vulnerable dependencies and removed the unused performance package that introduced incompatible React peers.

## Verification

- Production Vite build passes.
- Nine Node tests pass, including carousel validation, question generation, provider fallback response parsing, and lightweight-page interactions.
- Static asset scan finds no missing literal asset paths.
- ESLint has zero errors and 160 warnings. Compiler-related checks and mixed-export Fast Refresh checks are explicitly warnings, because React Compiler is not enabled. Hook-order and undefined-variable checks remain errors. These warnings are follow-up code-quality work, not a claim that every diagnostic was repaired.
- Desktop browser: entrance and Gallery, Studio, About, Contact, Carousel navigation; no JavaScript errors or failed network responses.
- Mobile browser: direct Gallery link, disabled browser storage, Contact navigation, Back/Forward without extra history entries; no JavaScript errors or failed network responses.
- No-WebGL recovery and the no-JavaScript mobile `/start` page pass.
- Dependency installation reports zero known vulnerabilities. The updated Sharp image optimizer was exercised with an in-memory resize.

## Operational notes

- Existing Vercel production variable names were checked without printing values. The carousel currently uses `GROQ_API_KEY`, `GEMINI_API_KEY`, and `GEMINI_API_KEY_2`. Other existing variables were left intact.
- Rotate the previously embedded API key and Git credential: removing them from current files does not invalidate prior copies or remove Git history.
- Direct form delivery requires a valid Web3Forms public access key followed by a rebuild. Until then, visitors send through their own email client.
- The 3D bundle still exceeds Vite's size advisory. `/start` provides the lightweight alternative. Software-rendered browser tests are not a guarantee of performance on every physical device.
- Provider availability and rate limits remain external dependencies. Mocked tests do not establish that production provider quotas are available.

Provider references: [Gemini model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash), [Groq supported models](https://console.groq.com/docs/models).
