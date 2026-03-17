// Minimal Firebase initialization and helper auth/profile functions.
// Uses your firebaseConfig. Add this file to your repo root.

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

/* Sign in by username OR email. */
export async function signInByUsernameOrEmail(loginInput, password){
  if (loginInput.includes('@')) {
    return signInWithEmailAndPassword(auth, loginInput, password);
  } else {
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

export async function deleteAccountWithReauth(currentPassword){
  const user = auth.currentUser;
  if(!user) throw new Error("Not authenticated");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  const profile = await getProfileByUid(user.uid);
  if(profile){
    await setDoc(doc(db, "profiles", profile.username), {}, { merge: false });
  }
  await deleteUser(user);
}
