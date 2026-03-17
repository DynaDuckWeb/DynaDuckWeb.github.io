// Minimal Firebase initialization and helper auth/profile functions.
// Uses your provided firebaseConfig. Add this file to your site and ensure other modules import from './firebase-init.js'.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as fuOnAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  updatePassword
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  collection,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtxYw55qR1wO3fw3EBivVhz4XI_H7GzvQ",
  authDomain: "dynaduck-19dbb.firebaseapp.com",
  projectId: "dynaduck-19dbb",
  storageBucket: "dynaduck-19dbb.firebasestorage.app",
  messagingSenderId: "777148453502",
  appId: "1:777148453502:web:2f67ac439ec29dc4fc3e2f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* Sign up and create a profile document using the chosen username as doc id.
   Uses a transaction to ensure username uniqueness. */
export async function signUpWithUsername(email, password, username){
  // create auth user
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const profileRef = doc(db, "profiles", username);
  await runTransaction(db, async (t) => {
    const snap = await t.get(profileRef);
    if (snap.exists()) throw new Error("Username already taken");
    t.set(profileRef, { uid, username, displayName: username, createdAt: serverTimestamp() });
    t.set(doc(db, "users", uid), { username, email, createdAt: serverTimestamp() });
  });
  return cred;
}

/* Sign in by username OR email.
   If input contains '@' we'll treat it as email; otherwise look up the profile and sign in with the stored email. */
export async function signInByUsernameOrEmail(loginInput, password){
  if (loginInput.includes('@')) {
    // email path
    return signInWithEmailAndPassword(auth, loginInput, password);
  } else {
    // username path: find profile doc to get uid -> users/{uid} to get email
    const profileRef = doc(db, "profiles", loginInput);
    const profileSnap = await getDoc(profileRef);
    if(!profileSnap.exists()) throw new Error("Username not found");
    const uid = profileSnap.data().uid;
    const userSnap = await getDoc(doc(db, "users", uid));
    if(!userSnap.exists() || !userSnap.data().email) throw new Error("Account email not found for username");
    const email = userSnap.data().email;
    return signInWithEmailAndPassword(auth, email, password);
  }
}

export async function signOutUser(){ return signOut(auth); }

export function onAuthStateChanged(cb){ fuOnAuthStateChanged(auth, cb); }

export async function getProfileByUid(uid){
  // find profile doc where uid == uid (profiles keyed by username)
  const profilesCol = collection(db, "profiles");
  const q = query(profilesCol, where("uid", "==", uid), limit(1));
  const snaps = await getDocs(q);
  if(snaps.empty) return null;
  return snaps.docs[0].data();
}

export async function getProfileByUsername(username){
  const snap = await getDoc(doc(db, "profiles", username));
  return snap.exists() ? snap.data() : null;
}

export async function updateProfileDisplayName(newName){
  const user = auth.currentUser;
  if(!user) throw new Error("Not authenticated");
  const profile = await getProfileByUid(user.uid);
  if(!profile) throw new Error("Profile not found");
  const profileRef = doc(db, "profiles", profile.username);
  await setDoc(profileRef, { ...profile, displayName: newName }, { merge: true });
  await setDoc(doc(db, "users", user.uid), { displayName: newName }, { merge: true });
}

export async function changePassword(newPassword){
  const user = auth.currentUser;
  if(!user) throw new Error("Not authenticated");
  await updatePassword(user, newPassword);
}

/* Delete account (reauth required). currentPassword must be provided. */
export async function deleteAccountWithReauth(currentPassword){
  const user = auth.currentUser;
  if(!user) throw new Error("Not authenticated");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  // remove profile doc
  const profile = await getProfileByUid(user.uid);
  if(profile){
    // NOTE: setDoc with empty object here — you may prefer to delete the doc using deleteDoc in production
    await setDoc(doc(db, "profiles", profile.username), {}, { merge: false });
  }
  //*
