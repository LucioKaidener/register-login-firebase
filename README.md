# register-login-firebase

A simple registration, login, and profile website using HTML, CSS, JavaScript, and Firebase Authentication + Firestore.

## Project Structure
- `assets/` - images and other static assets
- `css/` - shared styles
- `js/` - application logic for auth and profile validation
- `pages/` - `login.html`, `register.html`, `profile.html`
- `firebase.json` - Firebase Hosting and Firestore settings
- `.firebaserc` - linked Firebase project

## Features
- Real-time registration validation
- Email/password authentication
- Profile page with editable details
- Firebase Hosting deployment support

## How to Run Locally
1. Open `pages/register.html` or `pages/login.html` in your browser.
2. Make sure `js/app.js` contains the correct Firebase config for your project.
3. If you want local testing without Firebase, the app can fallback to `localStorage`.

## Deploy to Firebase Hosting
1. Install Firebase CLI if needed.
2. Authenticate: `firebase login`
3. From project root: `firebase deploy --only hosting --non-interactive`

## Notes
- The register page now validates email, password strength, and password matching in real time.
- `firebaseConfig` in `js/app.js` must match the Firebase project being used.
