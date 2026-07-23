# Skill Notes

## Project Goal
Build a complete user authentication flow with registration, login, and profile editing using Firebase.

## Stack
- HTML
- CSS / Tailwind CDN
- JavaScript
- Firebase Authentication + Firestore

## Current Implementation
- `pages/register.html`, `pages/login.html`, `pages/profile.html`
- `js/app.js` contains Firebase setup, auth flow, real-time register validation, and profile data loading.
- Real-time validation on register form for:
  - valid email format
  - email uniqueness
  - password strength
  - confirm password matching
- Firebase Hosting configured via `firebase.json`.

## Next Steps
- Verify Firebase Console settings: Email/Password auth enabled
- Deploy hosting and test live site
- Optionally add better user feedback and custom error handling

