# AI Interview Training System Frontend

This frontend is a React, TypeScript, Vite, and Tailwind CSS application for an AI-powered interview training experience. It connects to the backend API to support user registration, login, CV upload, CV analysis display, interview setup, AI HR interview sessions, speech-to-text answering, text-to-speech question playback, webcam/microphone controls, profile management, and a dashboard shell.

The main user journey is:

1. User registers or signs in.
2. User uploads a CV.
3. Frontend sends the CV to the backend for extraction and AI parsing.
4. Frontend displays the parsed CV analysis.
5. User selects target company, job role, and expertise level.
6. Frontend starts a backend interview session.
7. AI HR questions are shown and spoken aloud in the browser.
8. User answers by typing or speaking.
9. Frontend submits answers to the backend.
10. Backend generates the next question until the 5-question interview is completed.

## Current Implementation Status

Implemented so far:

- Vite React 19 application with TypeScript.
- Tailwind CSS styling with custom brand colors.
- React Router based routing.
- Public routes for sign-in and registration.
- Protected routes for interview setup, interview session, dashboard, and profile.
- Local/session storage auth persistence.
- Remember-me behavior for login.
- Axios API wrapper with automatic Bearer token injection.
- Global Axios response handling for 401, 403, and 500 errors.
- Toast notifications using `react-toastify`.
- Registration form connected to backend `/register`.
- Login form connected to backend `/login`.
- Forgot password UI flow with OTP screens.
- CV upload and processing screen.
- Latest CV fetch on interview setup page.
- CV analysis display card.
- Auto-apply logic that maps detected CV role/level to interview context fields.
- Interview context selection for company, job role, and expertise level.
- Interview session creation through backend `/interview/start`.
- Live interview session screen.
- AI question display and progress tracking.
- Browser text-to-speech playback for AI questions.
- Browser speech recognition for spoken answers.
- Manual typed answer input.
- Webcam and microphone permission handling.
- Microphone mute/unmute and video on/off controls.
- Answer submission to backend `/interview/submit-answer`.
- Interview completed state.
- Profile page with personal information and password reset tabs.
- Profile fetch, update, password reset, and avatar upload UI.
- Dashboard layout with sidebar, header, profile dropdown, and logout.
- Dashboard page with course progress, live sessions, practical sessions, attendance, and payment-related UI.
- Firebase Realtime Database chat support code in the heading bar.
- Firebase Cloud Messaging helper code.
- DevTools/inspect detection hook that reports attempted inspection to backend endpoints if available.
- Vercel SPA rewrite config.

Not fully connected or not implemented in the current backend repo:

- Forgot password backend endpoints used by the frontend:
  - `/forgotpassword`
  - `/otpforgotpassword`
- Profile avatar upload backend endpoint:
  - `/update_profile_avatar`
- DevTools logging backend endpoints:
  - `/log-devtools`
  - `/devtools/log`
- Dashboard LMS-style endpoints:
  - `/student-attendance-history`
  - `/get-enroll-class-list`
  - `/get-live-class-list-live-class`
  - `/practical-sessions`
  - `/mark-zoom-attendance`
  - `/practical-sessions/:id/confirm`
- Routes linked from dashboard but not declared in `App.tsx`, such as:
  - `/my-courses`
  - `/live-classes`
  - `/payments`
- Automated frontend tests.
- Environment-variable based API configuration.
- Production secret management for Firebase config/VAPID key.

## Tech Stack

- Framework: React 19
- Language: TypeScript
- Build tool: Vite 6
- Routing: `react-router-dom` 7
- Styling: Tailwind CSS 3
- Icons: `lucide-react`
- HTTP client: `axios`
- Toasts: `react-toastify`
- UI libraries included: Material UI, Flowbite
- Charts included: Chart.js and React Chart.js 2
- Firebase:
  - Realtime Database
  - Messaging helper
- Browser APIs:
  - `navigator.mediaDevices.getUserMedia`
  - Web Speech API `SpeechRecognition` / `webkitSpeechRecognition`
  - Web Speech API `speechSynthesis`
- PDF/export libraries included:
  - `jspdf`
  - `html2canvas`
  - `react-to-print`
- Barcode/QR libraries included:
  - `jsbarcode`
  - `react-barcode`
  - `jsqr`

## Project Structure

```text
AI-Interview-Training-System-Frontend/
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  eslint.config.js
  vercel.json
  public/
    images/
    favicon.ico
  src/
    App.tsx
    main.tsx
    index.css
    App.css
    firebase.ts
    firebaseInit.ts
    context/
      PageContext.tsx
    hooks/
      useDevtoolsDetection.ts
      useSpeechToText.ts
      useTextToSpeech.ts
      useWebcamMic.ts
    app/
      configs/
        common.tsx
      lib/
        authStorage.ts
        axiosInstance.ts
        sessionUtils.ts
      auth/
        signin.tsx
        register.tsx
      dashboard/
        dashboard.tsx
      interview/
        checkout.tsx
        CVAnalysisCard.tsx
        HRSessionPage.tsx
    components/
      dashboardLayout/
        ChatContext.tsx
        dashboard.tsx
        headingbar.tsx
      profile/
        profile.tsx
      sidebar/
        sidebar.tsx
```

## Application Entry Flow

The app starts from:

```text
src/main.tsx
```

`main.tsx` does three things:

1. Imports global CSS from `index.css`.
2. Imports React Toastify styles.
3. Renders `<App />` into the `root` element.

The main application shell is:

```text
src/App.tsx
```

`App.tsx` wraps the application with:

- `PageProvider`
- `ChatProvider`
- `BrowserRouter`
- `ToastContainer`

It also runs:

```text
useDevtoolsDetection()
```

This means the inspect/devtools detection hook is active globally.

## Route Design

Routes are declared in `src/App.tsx`.

### Public Routes

These are accessible only when no auth token exists.

```text
/signin
/register
```

If a token exists, `PublicRoute` redirects the user to:

```text
/interview-checkout
```

### Protected Routes

These require an auth token in local storage or session storage.

```text
/interview-checkout
/interview/session/:sessionId
/dashboard
/profile
```

If no token exists, `ProtectedRoute` redirects the user to:

```text
/signin
```

### Default And Fallback Routing

Root route:

```text
/
```

redirects to:

```text
/interview-checkout
```

Unknown routes:

```text
*
```

redirect to:

```text
/signin
```

Why this works this way:

- The main product workflow is interview setup, so authenticated users are sent directly there.
- Public auth pages are blocked after login to avoid users returning to sign-in/register unnecessarily.
- Protected pages use a simple token existence check for quick client-side gating.

## Configuration

Frontend config lives in:

```text
src/app/configs/common.tsx
```

Current values:

```ts
export const defaultConfig = {
  BASE_API_URL: "http://localhost:8000/api",
  BASE_ASSEST_URL: "http://localhost:8000",
  ENABLE_INSPECT_BLOCK: true,
};
```

Meaning:

- `BASE_API_URL`: base URL for backend API calls.
- `BASE_ASSEST_URL`: base URL used to resolve backend-hosted assets such as profile images.
- `ENABLE_INSPECT_BLOCK`: enables the inspect/devtools detection hook.

Current limitation:

- These values are hardcoded. For deployment, they should move to Vite environment variables such as `VITE_BASE_API_URL`.

Suggested `.env` style for future improvement:

```env
VITE_BASE_API_URL=http://localhost:8000/api
VITE_BASE_ASSET_URL=http://localhost:8000
VITE_ENABLE_INSPECT_BLOCK=true
```

## Installation And Running

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run lint:

```bash
npm run lint
```

Default Vite local URL is usually:

```text
http://localhost:5173
```

The backend should be running at:

```text
http://localhost:8000
```

because `BASE_API_URL` currently points to:

```text
http://localhost:8000/api
```

## Authentication Flow

Authentication storage helpers are implemented in:

```text
src/app/lib/authStorage.ts
```

### Stored Auth Values

The frontend stores:

- `authToken`
- `name`
- `avatar`
- `role`
- `user_id`
- `email`

### Remember Me Logic

Function:

```text
setAuthStorage(payload, rememberMe)
```

Behavior:

- If `rememberMe` is true, values are stored in `localStorage`.
- If `rememberMe` is false, values are stored in `sessionStorage`.
- Before saving new values, previous auth values are cleared from both storage locations.

Why it works this way:

- `localStorage` persists after browser restart.
- `sessionStorage` lasts only for the current browser tab/session.
- Clearing both first prevents stale auth data from existing in both places.

### Token Lookup

Function:

```text
getAuthToken()
```

Search order:

1. `localStorage.authToken`
2. `sessionStorage.authToken`

Protected routes depend on this function.

### Logout Logic

Function:

```text
clearAuthStorage()
```

Removes all auth-related values from both local and session storage.

Logout is used in:

- Interview setup header.
- Interview session header.
- Dashboard layout.
- Sidebar.

The dashboard layout also calls backend `/logout`; other logout buttons mostly clear local state and redirect.

## API Layer

Central Axios instance:

```text
src/app/lib/axiosInstance.ts
```

It is configured with:

```text
baseURL = defaultConfig.BASE_API_URL
Content-Type = application/json
```

### Request Interceptor

Before each request:

1. Reads auth token using `getAuthToken()`.
2. If token exists, sets:

```http
Authorization: Bearer <token>
```

Why it works this way:

- Components do not need to manually attach the token for protected API calls.
- Auth behavior stays centralized.

### Response Interceptor

Global error handling:

- `401`: shows "Session expired", clears auth storage, redirects to `/`.
- `403`: shows "Access forbidden", redirects to `/`.
- `500`: shows "Internal Server Error".

Current behavior note:

- Redirecting to `/` eventually redirects according to app routes. Since `/` redirects to `/interview-checkout`, and protected route redirects unauthenticated users to `/signin`, the user should end up on sign-in after auth is cleared.

## Screen And Feature Breakdown

## 1. Sign In Page

File:

```text
src/app/auth/signin.tsx
```

Route:

```text
/signin
```

Main features:

- Login by email.
- Login by mobile number.
- Mobile number client validation:
  - starts with `0`
  - exactly 10 digits
- Password visibility toggle.
- Remember-me checkbox.
- Toast-based success/error feedback.
- Redirect to `/interview-checkout` after successful login.
- Forgot-password modal/step flow.
- OTP resend countdown.

Backend endpoints used:

```http
POST /api/login
POST /api/forgotpassword
POST /api/otpforgotpassword
```

Login payload:

```json
{
  "type": "email",
  "value": "user@example.com",
  "password": "secret123"
}
```

or:

```json
{
  "type": "mobile_contact_number",
  "value": "0712345678",
  "password": "secret123"
}
```

Login success behavior:

1. Reads token and user data from response.
2. Saves auth values using `setAuthStorage`.
3. Shows success toast.
4. Navigates to `/interview-checkout`.

Current backend dependency gap:

- The current backend repo implements `/login`.
- The current backend repo does not implement `/forgotpassword` or `/otpforgotpassword`.
- Therefore, the forgot-password UI exists, but it needs matching backend endpoints before it works end-to-end.

## 2. Register Page

File:

```text
src/app/auth/register.tsx
```

Route:

```text
/register
```

Main features:

- Full name input.
- Email input.
- Phone number input.
- NIC/passport input.
- Date of birth input.
- Gender selection.
- Address textarea.
- Password and confirm password fields.
- Password visibility toggles.
- Frontend password confirmation check.
- Backend validation error display through toasts.

Backend endpoint used:

```http
POST /api/register
```

Important implementation detail:

- Frontend collects `fullName`.
- Before sending to backend, it splits `fullName` into:
  - `first_name`: first word
  - `last_name`: remaining words, or the same first name if no remaining words exist

Payload sent to backend:

```json
{
  "first_name": "Kamal",
  "last_name": "Perera",
  "email": "kamal@example.com",
  "mobile_contact_number": "0712345678",
  "address": "Colombo",
  "nic": "200012345678",
  "dateOfBirth": "2000-01-01",
  "gender": "Male",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Why it works this way:

- Backend expects separate `first_name` and `last_name`.
- Frontend keeps the UI simpler with one full-name field.

Current validation mismatch:

- Frontend password inputs require at least 8 characters.
- Backend currently requires at least 6 characters.
- This is not a breaking issue, but the rules should be aligned for clarity.

## 3. Interview Setup / Checkout Page

File:

```text
src/app/interview/checkout.tsx
```

Route:

```text
/interview-checkout
```

Main purpose:

- Let the user upload a CV.
- Display backend AI analysis of the CV.
- Let the user choose interview target context.
- Start a personalized interview session.

Backend endpoints used:

```http
GET /api/cv/latest
POST /api/cv/upload
POST /api/interview/start
```

### Latest CV Loading

On page load:

1. Sets page metadata to "Interview Setup".
2. Calls `/cv/latest`.
3. If a latest CV exists:
   - stores it in `cvAnalysisData`.
   - shows the uploaded filename.
   - sets upload state to `success`.
4. If no latest CV exists:
   - returns to idle upload state.

Why it works this way:

- A returning user can continue with the latest analyzed CV instead of uploading again.

### CV Upload Flow

File input accepts:

```text
.pdf,.doc,.docx
```

Frontend size limit:

```text
10 MB
```

Upload states:

- `idle`
- `uploading`
- `extracting`
- `ocr`
- `analyzing`
- `success`
- `error`

Actual request:

```http
POST /api/cv/upload
Content-Type: multipart/form-data
Field: cv
```

The UI uses timers to show progress messages:

- "Uploading your CV..."
- "Extracting CV text..."
- "Analyzing CV structure & skills with AI..."

When backend returns success:

- CV analysis data is saved in component state.
- If `extraction_method` is `pdf-ocr`, a toast explains that OCR was used.
- Upload state becomes `success`.

Why it works this way:

- CV processing can take time, especially OCR and AI parsing.
- Progress labels keep the user informed even though the backend returns one final response.

### CV Analysis Display

Component:

```text
src/app/interview/CVAnalysisCard.tsx
```

Displays:

- Candidate name.
- Candidate email.
- Candidate phone.
- Professional summary.
- Suggested role.
- Expertise level.
- Experience years.
- Detected technical skills.
- Soft skills.
- Other suggested roles.

Actions:

- Clear result.
- Auto-apply to interview context.

### Auto-Apply Business Logic

Function:

```text
handleAutoApply()
```

Role mapping:

- Full stack terms -> `Full Stack Developer`
- Frontend/React/Vue/UI/web terms -> `Frontend Engineer`
- Backend/Node/Express/Laravel/Spring/Java terms -> `Backend Engineer`
- QA/testing terms -> `QA / Test Automation Engineer`
- DevOps/cloud/AWS/Kubernetes terms -> `DevOps / Cloud Engineer`
- Mobile/iOS/Android/Flutter/React Native terms -> `Mobile Application Developer`
- Data/AI/ML/Python terms -> `Data Engineer / AI Engineer`
- fallback -> `Software Engineer`

Expertise mapping:

- senior text or 5+ years -> `Senior`
- lead/architect/principal/manager text -> `Lead Architect`
- junior/intern/beginner text or <= 1 year -> `Beginner`
- fallback -> `Intermediate`

Why it works this way:

- The backend parser returns role and level suggestions.
- The frontend maps those suggestions into the fixed select options available in the UI.
- The user can still manually override the auto-applied values.

### Interview Context Form

Fields:

- Company:
  - optional
  - select includes Google, Microsoft, Virtusa, WSO2, IFS, Dialog Axiata, Sysco LABS, Other/Startup
- Job Role:
  - required by backend fallback logic
  - defaults to `Software Engineer`
- Expertise Level:
  - defaults to `Intermediate`

Start interview payload:

```json
{
  "cvData": {},
  "cvId": 1,
  "company": "WSO2",
  "jobRole": "Software Engineer",
  "expertiseLevel": "Intermediate"
}
```

Success behavior:

1. Shows success toast.
2. Waits 500ms.
3. Navigates to:

```text
/interview/session/:sessionId
```

## 4. HR Interview Session Page

File:

```text
src/app/interview/HRSessionPage.tsx
```

Route:

```text
/interview/session/:sessionId
```

Main purpose:

- Run the active AI HR interview.
- Show the current AI-generated question.
- Speak the question using browser TTS.
- Allow the user to answer using voice or text.
- Submit the answer and receive the next question.

Backend endpoints used:

```http
GET /api/interview/session/:id
POST /api/interview/submit-answer
```

### Session Loading

On page load:

1. Reads `sessionId` from route params.
2. Calls `/interview/session/:id`.
3. Stores session data.
4. If session is completed, shows completed state.
5. Otherwise stores current question and existing answer if available.

### Question Audio Playback

Hook:

```text
src/hooks/useTextToSpeech.ts
```

Uses:

```text
window.speechSynthesis
SpeechSynthesisUtterance
```

Behavior:

- Cancels any active speech before speaking a new question.
- Uses rate `0.95`.
- Uses pitch `1.0`.
- Uses language `en-US`.
- Attempts to choose a natural English voice if available.
- Tracks whether speech is currently playing.

Page behavior:

- Auto-play is enabled by default.
- When the current question changes, the question is spoken after a short delay.
- User can replay or stop the question audio.

Why it works this way:

- The interview feels closer to a live HR session.
- The user can listen instead of only reading.
- Browser TTS avoids needing a backend TTS service.

### Speech-To-Text Answering

Hook:

```text
src/hooks/useSpeechToText.ts
```

Uses browser APIs:

```text
window.SpeechRecognition
window.webkitSpeechRecognition
```

Behavior:

- Uses continuous recognition.
- Uses interim results.
- Language is `en-US`.
- Transcript is synced into the answer textarea.
- If speech recognition is unsupported, user can type manually.

Why it works this way:

- The candidate can practice spoken answers.
- The final transcript is still editable before submission.
- Manual typing remains a fallback.

### Webcam And Microphone

Hook:

```text
src/hooks/useWebcamMic.ts
```

Uses:

```text
navigator.mediaDevices.getUserMedia
```

Requested media:

```ts
{
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  },
  audio: true
}
```

Behavior:

- Requests camera and microphone permissions when the hook mounts.
- Binds the stream to a video element.
- Tracks permission status.
- Allows mic mute/unmute by toggling audio track `enabled`.
- Allows video on/off by toggling video track `enabled`.
- Stops active tracks when the component unmounts.

Why it works this way:

- The interface simulates a real remote interview room.
- Local controls work without backend streaming.
- Tracks are cleaned up to release camera/mic after leaving the page.

### Answer Submission Flow

When user clicks submit:

1. Stops speech recognition if active.
2. Stops AI speech playback.
3. Validates that answer text is not empty.
4. Sends:

```json
{
  "sessionId": 1,
  "qaId": 1,
  "userAnswerText": "My answer..."
}
```

to:

```http
POST /api/interview/submit-answer
```

If backend says interview is complete:

- Shows completed state.
- Speaks a thank-you message.
- Shows success toast.

If backend returns another question:

- Replaces current question.
- Clears answer input.
- Resets transcript.
- Updates local current question index.

## 5. Profile Page

File:

```text
src/components/profile/profile.tsx
```

Route:

```text
/profile
```

Main features:

- Fetch profile data.
- Display avatar, name, username, and status.
- Personal information tab.
- Security/password tab.
- Save confirmation modal.
- Avatar preview and upload UI.
- Password visibility toggles.

Backend endpoints used:

```http
GET /api/profile
POST /api/update_profile
POST /api/profile-reset-password
POST /api/update_profile_avatar
```

Profile fields:

- First name
- Last name
- Email
- WhatsApp/mobile number
- Date of birth
- Gender
- Username/student ID
- Status
- Avatar
- QR code placeholder

Current backend dependency notes:

- `/profile`, `/update_profile`, and `/profile-reset-password` exist in the current backend.
- `/update_profile_avatar` does not exist in the current backend repo.
- The frontend sends `email` and `gender` during profile update, but the current backend update SQL does not update email or gender.

## 6. Dashboard Page

File:

```text
src/app/dashboard/dashboard.tsx
```

Route:

```text
/dashboard
```

Main features:

- Dashboard layout wrapper.
- Welcome banner.
- Course progress list.
- Upcoming live sessions.
- Mark attendance action.
- Join session action.
- Upcoming practical sessions.
- Confirm practical participation.
- Payment-required flow for unpaid sessions.

Backend endpoints used:

```http
GET /api/student-attendance-history
GET /api/get-enroll-class-list
GET /api/get-live-class-list-live-class
GET /api/practical-sessions
POST /api/mark-zoom-attendance
POST /api/practical-sessions/:id/confirm
```

Important current status:

- These endpoints are not present in the current AI Interview backend repo.
- This page appears to come from, or still support, a broader LMS/student dashboard system.
- It is implemented in the frontend but not fully supported by the current backend.

## 7. Dashboard Layout And Sidebar

Files:

```text
src/components/dashboardLayout/dashboard.tsx
src/components/sidebar/sidebar.tsx
```

Dashboard layout provides:

- Fixed sidebar on desktop.
- Mobile sidebar toggle.
- Header with page title from `PageContext`.
- Profile dropdown.
- Logout action.
- Main scrollable content area.

Sidebar currently includes:

- Dashboard link.
- Logout button.

Page metadata comes from:

```text
src/context/PageContext.tsx
```

Components can call:

```ts
setPageMetadata({
  title: "Dashboard",
  subtitle: "Welcome back"
});
```

Why it works this way:

- Pages can update header title/subtitle without hardcoding layout text.
- Shared dashboard chrome stays reusable.

## 8. Firebase Chat Support

Files:

```text
src/firebase.ts
src/firebaseInit.ts
src/components/dashboardLayout/ChatContext.tsx
src/components/dashboardLayout/headingbar.tsx
```

Implemented chat behavior:

- Stores chat messages in Firebase Realtime Database.
- Chat path format:

```text
chats/{userId}/{subject}
```

- Supports subject-based chat history.
- Supports unread counts from admin messages.
- Marks admin messages as read when subject is opened.
- Supports sending text messages.
- Supports image attachment by base64 conversion.
- Supports deleting a subject chat.

Subject list:

- Order Status Inquiry
- Product Availability
- Billing & Payment Issue
- Other

Current integration note:

- `Headingbar` contains a large chat UI, but the main `DashboardLayout` currently does not render `Headingbar`.
- `ChatProvider` is still mounted globally in `App.tsx`.
- Firebase config is hardcoded in source.

Recommended improvement:

- Move Firebase config to Vite environment variables.
- Confirm whether chat support belongs to this AI interview product or should be removed/split.

## Browser Hooks

### `useWebcamMic`

File:

```text
src/hooks/useWebcamMic.ts
```

Purpose:

- Request camera/mic.
- Show local video feed.
- Toggle microphone.
- Toggle camera.
- Stop tracks on cleanup.

Used by:

```text
HRSessionPage
```

### `useSpeechToText`

File:

```text
src/hooks/useSpeechToText.ts
```

Purpose:

- Convert spoken answer into text using browser speech recognition.

Used by:

```text
HRSessionPage
```

Browser support note:

- Works best in Chromium-based browsers.
- If unsupported, the UI lets the user type the answer manually.

### `useTextToSpeech`

File:

```text
src/hooks/useTextToSpeech.ts
```

Purpose:

- Speak AI-generated interview questions aloud.

Used by:

```text
HRSessionPage
```

### `useDevtoolsDetection`

File:

```text
src/hooks/useDevtoolsDetection.ts
```

Purpose:

- Detect common inspect/devtools actions.
- Prevent some keyboard shortcuts.
- Send detection logs to backend if available.

Detected actions:

- F12
- Ctrl/Cmd + Shift + I
- Ctrl/Cmd + Shift + J
- Ctrl/Cmd + Shift + C
- Ctrl/Cmd + U
- Right-click context menu
- Docked DevTools window size detection

Backend endpoint candidates:

```http
POST /api/log-devtools
POST /api/devtools/log
```

Current backend dependency gap:

- These endpoints are not implemented in the current backend repo.
- The hook silently ignores failed network calls.

## Styling And Design System

Tailwind configuration:

```text
tailwind.config.js
```

Custom brand colors:

```js
brand: {
  DEFAULT: "#0E8C86",
  dark: "#0C7873",
  darker: "#0A625E",
  navy: "#0B3538",
  accent: "#C9A227"
}
```

Custom screens:

- `sm`: 640px
- `md`: 768px
- `ipad`: 1024px to 1366px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Flowbite plugin is enabled:

```js
require("flowbite/plugin")
```

Design direction currently used:

- Teal/navy brand palette.
- Card-based forms.
- Responsive two-column auth pages on desktop.
- Sticky top navigation in interview screens.
- Dashboard shell with sidebar and header.
- Toasts for feedback.
- Lucide icons for actions and visual labels.

## Backend Endpoint Dependency Map

Endpoints supported by the current backend repo:

```text
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
GET  /api/profile
POST /api/update_profile
POST /api/profile-reset-password
POST /api/cv/upload
GET  /api/cv/latest
GET  /api/cv/:id
POST /api/cv/start-interview
POST /api/interview/start
GET  /api/interview/session/:id
POST /api/interview/submit-answer
POST /api/interview/complete
```

Frontend calls that are not currently supported by the backend repo:

```text
POST /api/forgotpassword
POST /api/otpforgotpassword
POST /api/update_profile_avatar
POST /api/log-devtools
POST /api/devtools/log
GET  /api/student-attendance-history
GET  /api/get-enroll-class-list
GET  /api/get-live-class-list-live-class
GET  /api/practical-sessions
POST /api/mark-zoom-attendance
POST /api/practical-sessions/:id/confirm
```

This means the interview flow is mostly aligned with the backend, while dashboard/LMS, forgot-password, avatar upload, and inspect logging need backend work or removal.

## Business Logic Implemented In Frontend

Auth:

- Redirect authenticated users away from sign-in/register.
- Redirect unauthenticated users away from protected routes.
- Store auth data in local/session storage depending on remember-me choice.
- Automatically attach Bearer token to protected API requests.
- Clear auth storage on auth failures and logout.

Registration:

- Split full name into first and last names for backend compatibility.
- Validate password confirmation before backend call.
- Restrict mobile number entry to 10 numeric digits.

Login:

- Support email or mobile number login.
- Validate mobile format when mobile login is selected.
- Persist user details after successful login.

CV processing:

- Reject files larger than 10 MB before upload.
- Accept only document-like CV extensions through file input.
- Show staged processing states while backend extracts/parses CV.
- Display parsed CV results.
- Allow clearing or replacing a CV.

Interview setup:

- Load latest CV automatically.
- Map parsed CV role suggestions into UI role select options.
- Map parsed CV level/experience into UI expertise select options.
- Allow manual override after auto-apply.
- Start backend interview session and route to session room.

Interview session:

- Load session and active question by URL session ID.
- Auto-speak new AI questions.
- Let user replay/mute AI question audio.
- Capture user answer by speech recognition or manual typing.
- Require a non-empty answer before submission.
- Submit current answer with session ID and Q&A ID.
- Move to next question or completed state based on backend response.
- Show progress bar using current question number and total questions.

Profile:

- Fetch profile on mount.
- Let user edit personal fields.
- Confirm before saving.
- Validate password change fields before backend call.
- Preview avatar immediately before upload response.

Dashboard/LMS:

- Fetch course, live session, attendance, and practical-session data.
- Detect expired sessions.
- Mark live attendance.
- Confirm practical participation.
- Redirect to payment screen when fees are required.

## Known Issues And Improvement Opportunities

High-priority improvements:

- Move API base URLs from hardcoded config to Vite env variables.
- Add `.env.example`.
- Align frontend password minimum length with backend password minimum length.
- Either implement forgot-password endpoints in backend or hide the forgot-password UI for now.
- Either implement avatar upload endpoint or remove/avatar-disable the upload feature.
- Remove or separate LMS dashboard code if this project is only the AI interview system.
- Add missing app routes for `/my-courses`, `/live-classes`, and `/payments`, or remove links to those pages.
- Fix backend/profile mismatch where frontend sends `gender` but backend currently does not update it.
- Add automated tests for auth flow, protected route behavior, CV upload, interview setup, and answer submission.
- Add browser compatibility messaging for speech recognition and camera permissions.

Security and production improvements:

- Do not hardcode Firebase config and VAPID key directly in source.
- Reconsider inspect/devtools blocking. It can be bypassed and may harm accessibility/debugging.
- Avoid storing sensitive data in local storage beyond what is necessary.
- Add token expiry awareness on frontend instead of only reacting to 401.
- Sanitize HTML before using `dangerouslySetInnerHTML` in dashboard course descriptions.

UX improvements:

- Add drag-and-drop handlers to the CV upload area. The UI says drag and drop, but current code only handles click/file input.
- Add loading skeletons for profile and dashboard pages.
- Add retry action for failed session loading.
- Add a clear browser support notice for speech recognition.
- Add interview result/score page after completion.

Code organization improvements:

- Extract shared interview header/user dropdown into a component.
- Extract auth form input components.
- Extract API service modules instead of calling endpoints directly inside components.
- Remove unused dependencies if they are not needed for the interview product.
- Standardize naming: `BASE_ASSEST_URL` should be corrected to `BASE_ASSET_URL`.

## C3 Coaching And Progress Module

The frontend now includes the C3 module for candidate coaching analytics. C3 means the app can compare a candidate's interview delivery against their own warm-up baseline, show delivery deviation and expression indicators, generate explainable coaching tips, and export pilot evaluation data for admin review.

This module intentionally uses careful wording:

- `delivery deviation`
- `expression indicators`
- `compared with your own baseline`

It does not describe emotion, mental state, personality, truthfulness, hiring suitability, or psychological diagnosis.

### C3 Routes

Protected candidate routes:

```text
/progress
/progress/session/:sessionId
/progress/warmup
/coaching
```

Protected admin route:

```text
/admin/evaluation
```

The admin route is guarded on the frontend by the stored `role` value. If `role !== "admin"`, the user is redirected back to `/dashboard`.

### C3 Files Added

```text
src/app/progress/
  c3Api.ts
  errorUtils.ts
  ProgressOverviewPage.tsx
  SessionDetailPage.tsx
  CoachingPage.tsx
  AdminEvaluationPage.tsx
  WarmupPage.tsx

src/components/c3/
  ChartCard.tsx
  ConfirmModal.tsx
  SelfRatingModal.tsx
  StateViews.tsx
  StatCard.tsx
  StatusBadge.tsx
  TipCard.tsx

src/hooks/
  useC3SignalBatcher.ts
```

Existing files connected to C3:

- `src/App.tsx`: C3 route registration and admin route guard.
- `src/components/sidebar/sidebar.tsx`: sidebar links for Progress, Coaching, and admin-only Evaluation.
- `src/app/interview/checkout.tsx`: C3 measurement consent and warm-up entry.
- `src/app/interview/HRSessionPage.tsx`: signal batching integration and self-rating modal after completion.

### C3 API Service

The C3 frontend API wrapper lives in:

```text
src/app/progress/c3Api.ts
```

It uses the existing shared Axios instance:

```text
src/app/lib/axiosInstance.ts
```

Why it works this way:

- The C3 module automatically reuses the existing backend base URL.
- Bearer token injection remains centralized.
- C3 does not create a second API configuration path.
- 401/403/500 handling stays consistent with the rest of the app.

Backend endpoints used:

```http
GET  /api/c3/progress/overview
GET  /api/c3/progress/per-type
GET  /api/c3/progress/comparison
GET  /api/c3/drift
GET  /api/c3/session/:sessionId
POST /api/c3/baseline/refresh
POST /api/c3/warmup
POST /api/c3/baseline/build
POST /api/c3/signals
POST /api/c3/coaching/:sessionId/generate
GET  /api/c3/tips
PATCH /api/c3/tips/:tipId/followed
POST /api/c3/tips/evaluate
GET  /api/c3/tips/outcomes
POST /api/c3/self-rating
GET  /api/c3/evaluation/dataset
GET  /api/c3/evaluation/correlation
GET  /api/c3/evaluation/csv
```

### C3 Consent And Warm-Up Flow

Interview setup now includes a Research & Coaching Measurements consent card.

What happens:

1. User opens `/interview-checkout`.
2. User sees a C3 explanation before starting an interview.
3. User can open `/progress/warmup` to create a personal baseline.
4. User must tick consent before starting an interview with C3 signal capture enabled.
5. Consent is saved in:

```text
localStorage.c3SignalConsent
```

Why it works this way:

- The product should not silently collect browser-derived coaching signals.
- Warm-up gives the system a user-specific reference point.
- Future interview progress can be compared with the candidate's own baseline instead of a generic threshold.

### Warm-Up Page

Route:

```text
/progress/warmup
```

File:

```text
src/app/progress/WarmupPage.tsx
```

Main behavior:

- Creates a C3 warm-up session through `/c3/warmup`.
- Requests webcam and microphone using the existing media hook.
- Shows relaxed speaking prompts.
- Uses browser speech recognition to collect transcript text.
- Sends text-derived signal readings through `useC3SignalBatcher`.
- Can optionally use development mock expression indicators.
- Builds a baseline through `/c3/baseline/build`.
- Redirects to `/progress` after baseline creation.

Development mock signal mode is off by default.

Why it exists:

- The backend needs enough readings to compute baseline means, spread, count, and confidence.
- The warm-up should be neutral and low-pressure, so later interview delivery can be compared against a calmer reference.

### Signal Batching Hook

File:

```text
src/hooks/useC3SignalBatcher.ts
```

Purpose:

- Queue browser-side signal readings.
- Send them to `/c3/signals` in small batches.
- Avoid blocking answer submission on every individual metric.
- Requeue a failed batch so temporary network issues do not immediately lose readings.

Current signals captured by the frontend:

- Text signal when an answer is submitted:
  - `browser_word_count`
  - `browser_answer_length`
- Optional development mock signals:
  - `tension`
  - `gaze_off`
  - `pace`
  - `pause_ratio`

Important limitation:

- The frontend does not currently implement real face-landmark or voice-feature extraction.
- `useC3SignalBatcher` is the integration point where those real browser metrics can later be plugged in.

### Progress Overview

Route:

```text
/progress
```

File:

```text
src/app/progress/ProgressOverviewPage.tsx
```

Displays:

- Total interview sessions with progress data.
- Latest delivery deviation.
- Latest answer score when backend scoring exists.
- Drift status.
- Delivery deviation trend across sessions.
- Per-metric expression indicator trend.
- Active baseline version, source, confidence, and metric statistics.
- Per-question-type analysis.
- Drift events.
- Fixed-threshold progress versus baseline-relative progress.
- Latest self-rated improvement.
- Session history table with links to detail pages.

Why it works this way:

- Users can see whether delivery is moving closer to their own baseline.
- Per-type analysis helps identify where delivery changes most, such as technical, behavioral, or introduction questions.
- Fixed-threshold and baseline-relative progress are shown side by side because the C3 research goal is to compare those two approaches.

### Session Detail

Route:

```text
/progress/session/:sessionId
```

File:

```text
src/app/progress/SessionDetailPage.tsx
```

Displays:

- Session role, company, level, and date.
- Question-level answer score, latency, word count, delivery deviation, and signal status.
- Per-question metric summary.
- Baseline mean versus question mean.
- Peak metric values and peak timestamps.
- Coaching tips for that session.
- Self-rating modal.

Important implementation detail:

- The backend currently returns per-question metric summaries, peaks, and baseline means.
- It does not expose raw time-series signal points yet.
- Therefore, the frontend chart shows returned metric summaries instead of inventing a fake time-series graph.

### Coaching Page

Route:

```text
/coaching
```

File:

```text
src/app/progress/CoachingPage.tsx
```

Displays:

- Total coaching tips.
- Tips followed.
- Improved outcomes.
- Filters by session, question type, and outcome.
- Expandable evidence for each tip.
- Follow-up selector:
  - `yes`
  - `partly`
  - `no`

Why it works this way:

- Coaching should be explainable.
- The user can see why a tip was generated.
- Followed/not-followed tracking lets the backend evaluate whether tips are associated with later improvement.

### Self-Rating Modal

File:

```text
src/components/c3/SelfRatingModal.tsx
```

Used in:

- `HRSessionPage`
- `SessionDetailPage`

Fields:

- Improvement rating.
- Tip clarity rating.
- Tip usefulness rating.
- Optional comment.

Why it exists:

- The C3 evaluation compares objective progress signals with the candidate's own perceived improvement.
- The modal appears after interview completion and can also be opened from session detail.

### Admin Evaluation Page

Route:

```text
/admin/evaluation
```

File:

```text
src/app/progress/AdminEvaluationPage.tsx
```

Displays:

- Participant count.
- Fixed-threshold Spearman correlation.
- Baseline-relative Spearman correlation.
- Optional seeded demo users toggle.
- CSV export button.
- Pseudonymised dataset table using user IDs only.

Why it works this way:

- The page supports small pilot evaluation without exposing candidate names or emails.
- It lets admins compare whether baseline-relative progress better matches self-rated improvement than fixed-threshold progress.

### Sidebar Integration

File:

```text
src/components/sidebar/sidebar.tsx
```

New links:

- Progress -> `/progress`
- Coaching -> `/coaching`
- Evaluation -> `/admin/evaluation`, only shown for admin users

The role comes from existing auth storage:

```text
getStoredValue("role")
```

### Manual C3 Verification Checklist

1. Start backend on `http://localhost:8000`.
2. Start frontend with `npm run dev`.
3. Login as a seeded demo candidate:

```text
demo.user1@demo.local
demo12345
```

4. Open `/progress` and confirm the overview loads.
5. Open a session from the Session History table.
6. Confirm question-level delivery deviation, expression indicators, and coaching section render.
7. Open `/coaching` and confirm tip filters and follow-up status controls work.
8. Login as admin:

```text
admin@example.com
Admin@123
```

9. Open `/admin/evaluation`.
10. Toggle seeded demo users.
11. Download the CSV export.
12. Open `/interview-checkout`.
13. Tick the C3 consent checkbox.
14. Open `/progress/warmup`, complete prompts, and confirm baseline creation.
15. Complete a normal interview and confirm the self-rating modal appears at the end.

### C3 Current Limitations

- Real face and voice metric extraction is not implemented yet.
- Development mock expression indicators exist for local testing, but they are off by default.
- C3 consent is stored in local storage, not a backend consent-audit table.
- Raw time-series signal visualization is limited because the backend session detail endpoint returns summaries, not raw signal points.
- Admin route protection is frontend-only; backend admin authorization is still required for true production security.
- Existing project lint still has unrelated errors in older auth, dashboard, chat, profile, Firebase, and speech hook files.

## Testing Status

Current scripts:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

There is no automated frontend test suite yet.

Manual verification checklist:

1. Start backend on `http://localhost:8000`.
2. Start frontend with `npm run dev`.
3. Register a new account.
4. Login with email.
5. Confirm token is stored.
6. Open `/interview-checkout`.
7. Upload a PDF/DOCX CV under 10 MB.
8. Confirm CV analysis card appears.
9. Click auto-apply and confirm role/level fields update.
10. Start interview.
11. Allow camera/microphone permission.
12. Confirm AI question appears and speaks.
13. Type or speak an answer.
14. Submit answer and confirm next question appears.
15. Continue until completion.
16. Open profile and test profile fetch/password reset.

## Deployment Notes

Vercel rewrite config:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Why it exists:

- React Router handles routes on the client.
- Direct browser refresh on `/signin`, `/dashboard`, or `/interview/session/:id` should still serve `index.html`.

Before deploying:

- Replace hardcoded localhost API URLs with production API URLs.
- Move Firebase values into environment variables.
- Confirm backend CORS allows the deployed frontend domain.
- Build with `npm run build`.
- Fix any TypeScript build errors before deploy.

## Summary

This frontend already implements the core interview training user experience:

- authentication screens
- protected routing
- CV upload and AI analysis display
- interview setup
- AI HR interview room
- webcam/mic simulation
- spoken AI questions
- spoken or typed candidate answers
- profile management

The strongest completed product flow is the CV-to-interview flow. The main cleanup needed is to separate or complete the older LMS/dashboard-related features and to align all frontend API calls with the backend endpoints that actually exist.
