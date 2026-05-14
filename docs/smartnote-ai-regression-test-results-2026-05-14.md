# SmartNote AI Regression Test Results - 2026-05-14

Target: `https://smartnoteai-ashen.vercel.app/`

Branch checked in repository: `cursor/smartnote-guides-c54e`, based on latest verified remote `origin/master`.

## 1. Overall Result

Overall status: FAIL

Reason: Most public routes and all public template previews loaded successfully, but the regression pass found a home page client-side failure in a WebGL-unavailable browser environment, production Clerk development-key warnings, an empty marketplace, and a missing favicon resource. Authenticated notebook creation/editing flows could not be fully completed because no reusable test account or email-verification access was available.

## 2. Test Scope

### Tested directly on live deployment

- Public marketing routes.
- Sign-in and sign-up pages.
- Pricing page.
- Contact page.
- Public template gallery.
- All 58 public template cards and preview views.
- Marketplace list page and marketplace templates API.
- Public/protected route behavior for signed-out users.
- Selected unauthenticated API responses.
- Browser console and network checks with headless Chrome.

### Blocked or partially covered

- New account completion.
- Login with an existing user.
- Dashboard notebook creation.
- Notebook editor save/edit behavior.
- Authenticated AI toolbar calls.
- Authenticated sharing and collaboration flows.
- Workspaces CRUD after login.
- Account subscription management.
- Admin dashboard behavior after login.

Blocker: no test credentials were available, and creating a real account may require email verification outside the test environment.

## 3. Summary Table

| Area | Status | Notes |
| --- | --- | --- |
| Home page | FAIL | HTTP 200, but browser pass showed client-side application error when WebGL/Three renderer failed. |
| Features page | PASS_WITH_WARNINGS | Page rendered; Clerk development-key and deprecated redirect prop warnings present. |
| Pricing page | PASS_WITH_WARNINGS | Page rendered with Free/Pro/Ultra content; warnings present. |
| Templates page | PASS_WITH_WARNINGS | Page rendered and all 58 template previews passed; favicon 404 observed. |
| Marketplace page | FAIL | Page rendered, but marketplace API returned zero templates and UI showed "No templates found." |
| Contact page | PASS_WITH_WARNINGS | Page rendered and feedback content displayed; warnings present. |
| Sign-in page | PASS_WITH_WARNINGS | Form rendered; browser console showed "WebGL not supported" and Clerk warnings. |
| Sign-up page | PASS_WITH_WARNINGS | Form rendered; browser console showed "WebGL not supported" and Clerk warnings. |
| Offline page | PASS | Route returned HTTP 200 and offline copy was present. |
| Protected route handling | PASS | Signed-out users were redirected or shown sign-in content. |
| Public APIs checked | PASS_WITH_WARNINGS | Expected unauthenticated errors or valid empty payloads returned; marketplace content empty. |
| Authenticated app flows | BLOCKED | Login/test account unavailable. |

## 4. Public Route Results

| Route | HTTP | Browser Result | Status |
| --- | --- | --- | --- |
| `/` | 200 | App error observed in browser regression pass under WebGL-unavailable environment. | FAIL |
| `/features` | 200 | Rendered expected feature content. | PASS_WITH_WARNINGS |
| `/pricing` | 200 | Rendered Free, Pro, Ultra, billing toggle, and credits content. | PASS_WITH_WARNINGS |
| `/templates` | 200 | Rendered template gallery and all template cards. | PASS_WITH_WARNINGS |
| `/marketplace` | 200 | Rendered marketplace shell but no templates were returned. | FAIL |
| `/contact` | 200 | Rendered feedback/contact content. | PASS_WITH_WARNINGS |
| `/sign-in` | 200 | Rendered Clerk sign-in form. | PASS_WITH_WARNINGS |
| `/sign-up` | 200 | Rendered Clerk sign-up form. | PASS_WITH_WARNINGS |
| `/offline` | 200 | Rendered offline fallback page. | PASS |

## 5. Template Regression Results

Method:

1. Opened `/templates`.
2. Counted public template cards.
3. Selected every template card.
4. Clicked "Preview Template".
5. Verified the preview opened with "Back to Templates" and "Use This Template".
6. Verified no "Application error" text appeared in the preview.
7. Returned to the template gallery before testing the next card.

Result: 58 of 58 template previews passed.

| # | Template | Result |
| --- | --- | --- |
| 1 | Simple Notebook | PASS |
| 2 | Meeting Notes | PASS |
| 3 | Document | PASS |
| 4 | Dashboard | PASS |
| 5 | Code Notebook | PASS |
| 6 | Planner | PASS |
| 7 | AI Research | PASS |
| 8 | Diary | PASS |
| 9 | Journal | PASS |
| 10 | Doodle | PASS |
| 11 | Project | PASS |
| 12 | Loop | PASS |
| 13 | Story | PASS |
| 14 | Typewriter | PASS |
| 15 | Link Collection | PASS |
| 16 | Study Book | PASS |
| 17 | Flashcards | PASS |
| 18 | Whiteboard | PASS |
| 19 | Recipe Book | PASS |
| 20 | Expense Tracker | PASS |
| 21 | Trip Planner | PASS |
| 22 | Todo List | PASS |
| 23 | Sound Box | PASS |
| 24 | Book Reading Notes | PASS |
| 25 | Habit Tracker | PASS |
| 26 | Workout Log | PASS |
| 27 | Budget Planner | PASS |
| 28 | Class Notes | PASS |
| 29 | Research Builder | PASS |
| 30 | Grocery List | PASS |
| 31 | Expense Sharer | PASS |
| 32 | Project Pipeline | PASS |
| 33 | Prompt Diary | PASS |
| 34 | Save the Date | PASS |
| 35 | Important URLs | PASS |
| 36 | Language Translator | PASS |
| 37 | Dictionary | PASS |
| 38 | Meals Planner | PASS |
| 39 | Games Scorecard | PASS |
| 40 | Sticker Book | PASS |
| 41 | Tutorial Learn | PASS |
| 42 | Mind Map | PASS |
| 43 | Goal Tracker | PASS |
| 44 | AI Prompt Studio | PASS |
| 45 | Project Builder | PASS |
| 46 | Second Brain Daily Log | PASS |
| 47 | Narrative Storyboard | PASS |
| 48 | Piano Virtuoso | PASS |
| 49 | Dev-Flow Architect | PASS |
| 50 | Cinematic Storyboarder | PASS |
| 51 | Meeting Strategist | PASS |
| 52 | Research Synthesizer | PASS |
| 53 | Workflow Automator | PASS |
| 54 | Stock Pulse | PASS |
| 55 | Language Bridge | PASS |
| 56 | Smart Carrom Coach | PASS |
| 57 | Piano Notes | PASS |
| 58 | Vocabulary | PASS |

### Template coverage note

Source template registry count: 58.

Create notebook dialog template count from source: 63.

The create dialog includes these additional template IDs not present in the public `NOTEBOOK_TEMPLATES` registry:

- `custom`
- `image-prompt`
- `n8n`
- `storytelling`
- `video-prompt`

This is not a live preview failure, but it is a product consistency risk because the public gallery and create dialog do not use the exact same registry.

## 6. Protected Route Results for Signed-out User

| Route | Result | Notes |
| --- | --- | --- |
| `/dashboard` | PASS | Redirected to sign-in. |
| `/dashboard/trash` | PASS | Redirected to sign-in. |
| `/dashboard/settings` | PASS | Redirected to sign-in. |
| `/dashboard/workspaces` | PASS | Sign-in content displayed for signed-out user. |
| `/dashboard/search` | PASS | Redirected to sign-in. |
| `/account` | PASS | Sign-in content displayed for signed-out user. |
| `/analytics` | PASS | Sign-in content displayed for signed-out user. |
| `/admin` | PASS | Redirected to sign-in. |
| `/admin/dashboard` | PASS | Sign-in content displayed for signed-out user. |
| `/admin/notebooks` | PASS | Redirected to sign-in. |

## 7. API Regression Results

| Endpoint | Result | Response |
| --- | --- | --- |
| `GET /api/marketplace/templates?limit=1` | FAIL_CONTENT | HTTP 200 with `success: true`, but returned `templates: []`. |
| `GET /api/notebook-templates/enabled` | PASS | HTTP 200 with enabled template IDs. |
| `GET /api/share/invalid-regression-share-id` | PASS | HTTP 404 with `Share not found`. |
| `GET /api/favorites` | PASS | HTTP 401 Unauthorized. |
| `GET /api/subscription/status` | PASS | HTTP 401 Unauthorized. |

## 8. Issues Found

### Issue 1 - Home page can crash when WebGL is unavailable

Severity: High

Area: Home page / 3D hero

Observed:

- Browser pass showed: `Application error: a client-side exception has occurred`.
- Console showed repeated Three.js/WebGL renderer errors:
  - `THREE.WebGLRenderer: A WebGL context could not be created`

Impact:

- Users on browsers/devices where WebGL is blocked or unavailable can see a full client-side app error instead of the landing page.

Recommendation:

- Wrap the 3D/Spline/Three hero in an error boundary.
- Detect WebGL support before rendering.
- Provide a static fallback image or lightweight illustration.
- Lazy-load the 3D scene after the core landing content renders.

### Issue 2 - Deployment uses Clerk development keys

Severity: High

Area: Authentication / production deployment configuration

Observed warning:

- `Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.`

Impact:

- Production auth may be subject to development limits or behavior.
- Users may encounter reliability issues as traffic grows.

Recommendation:

- Configure production Clerk keys for the deployed Vercel environment.
- Verify redirect URLs and allowed origins in Clerk production settings.

### Issue 3 - Deprecated Clerk redirect prop warning

Severity: Medium

Area: Authentication

Observed warning:

- `The prop "afterSignInUrl" is deprecated and should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead.`

Impact:

- Future Clerk upgrades may break or alter redirect behavior.

Recommendation:

- Update Clerk usage to the currently supported redirect props.

### Issue 4 - Marketplace has no templates

Severity: Medium

Area: Marketplace

Observed:

- `GET /api/marketplace/templates?limit=1` returned:
  - `success: true`
  - `templates: []`
  - `pagination.total: 0`
- UI displayed: `No templates found. Try adjusting your filters.`

Impact:

- The page promises community-created templates but currently has no visible content.
- This makes the marketplace look incomplete.

Recommendation:

- Seed marketplace data in production.
- Add curated starter templates.
- If empty state is expected, change the message to explain that templates are coming soon and provide a clear submission CTA.

### Issue 5 - Missing favicon

Severity: Low

Area: Global assets

Observed:

- `https://smartnoteai-ashen.vercel.app/favicon.ico` returned HTTP 404 during template page browser checks.

Impact:

- Browser tab icon may be missing.
- Creates avoidable console/network noise.

Recommendation:

- Add `favicon.ico` under `public/` or update app metadata icon paths.

### Issue 6 - WebGL not supported errors on auth pages

Severity: Low to Medium

Area: Sign-in / Sign-up visual background

Observed:

- Sign-in and sign-up pages rendered correctly, but console showed `WebGL not supported`.

Impact:

- Auth page visuals may degrade on restricted devices.
- Currently the forms still render, so this is lower severity than the home page crash.

Recommendation:

- Add a no-WebGL fallback for the auth background.
- Avoid logging user-visible console errors for expected fallback cases.

### Issue 7 - Authenticated regression flows are blocked without a test account

Severity: Process Gap

Area: QA / regression environment

Blocked flows:

- Register and verify a new account.
- Login with stable test credentials.
- Create notebook from each template inside the dashboard.
- Edit and save notebook pages.
- Run AI assistant actions.
- Share notebooks.
- Create workspaces.
- Test billing/account actions.

Recommendation:

- Add a dedicated staging QA account.
- Provide test credentials through a secure secret store.
- Add a seeded QA workspace with sample notebooks.
- Add automated Playwright regression tests that authenticate with Clerk test credentials.

## 9. Regression Conclusion

The deployed application is partially healthy:

- Public content routes mostly return HTTP 200.
- All 58 public template previews work.
- Signed-out protected routes do not expose protected dashboard data.
- Basic unauthenticated API behavior is safe.

However, the regression result is FAIL because:

1. The home page can show a client-side application error when WebGL fails.
2. Production is using Clerk development keys.
3. Marketplace content is empty.
4. Some authenticated core product flows could not be verified without a QA account.

Recommended next action: fix the WebGL fallback and production Clerk configuration first, then add seeded marketplace content and a reusable QA account for full authenticated regression coverage.
