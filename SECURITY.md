# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| main    | :white_check_mark: |
| < main  | :x: |

Security fixes are applied to `main`. Static hosting means clients are public — **Realtime Database / Firestore rules are the enforcement boundary**, not client-side checks.

## Firebase hardening applied

- `database.rules.json`: default deny; per-node least privilege.
  - `users/$uid` has **no blanket `.write`**. Each child (`username`, `Dynamites`, `inventory`, `friends`, …) has its own rule so clients **cannot** self-set `isAdmin` (admin-only write).
  - `isAdmin` under users is `auth.token.admin === true` only. Grant admin via **Firebase Admin SDK custom claims** (`auth.setCustomUserClaims(uid, {admin:true})`), never via client writes or `username === "Admin"` checks.
  - `games`: creator-only create/update with `creatorUid === auth.uid`, length limits (title ≤40, desc ≤500, fileData ≤2MB, thumbnail ≤300KB), `maxPlayers` 1–20.
  - `catalog`: admin-only writes, price 0–100, approved status.
  - `ugcSubmissions`: creator `creatorUid === auth.uid` + `status:"pending"` on create; admin full access.
  - `posts`/`replies`: `creatorUid === auth.uid` required; length caps; admin can moderate.
  - `reports`: any signed-in user can create (with `reason`); **read/delete admin-only**.
  - `used_gumroad_keys`: create-once via transaction; no updates/deletes.
  - `usernames`: public read for search; create-only `uid` mapping.
- `firestore.rules` (for `firebase-init_Version0.js`): profiles/users owner-only + admin; deny-by-default.
- Client fixes: UID-keyed profile paths (not username-keyed), no plaintext passwords in RTDB (Auth `updatePassword`/`updateEmail` + reauth), XSS via `textContent` instead of `innerHTML`, price clamping, file-size caps, claim-once redeem transactions.

## Deploying rules

```bash
# Realtime Database
firebase deploy --only database

# Firestore (if used)
firebase deploy --only firestore:rules
```

Test in the Firebase console **Rules Playground** with authenticated / unauthenticated / admin-token contexts before deploying.

## Granting admin (server-side only)

```js
// Node.js with firebase-admin
await admin.auth().setCustomUserClaims(uid, { admin: true });
// Client then refreshes token: user.getIdTokenResult(true)
```

Do not add `isAdmin: true` to the database to make someone admin — rules ignore it.

## Reporting a Vulnerability

Open a GitHub issue with **no exploit payloads in public** for sensitive issues, or contact the repo owner directly. Include: affected page/rule, repro steps with a test account, and expected vs actual rule behavior. Expect triage within 7 days.

## Client-side notes

- `apiKey` in `firebase-config.js` is public by design; security comes from rules + Auth.
- Never store passwords, license keys, or Gumroad secrets in RTDB client-writable nodes.
- All admin UI checks (`isAdmin` in localStorage) are **hints only**; writes still fail without the custom claim.
