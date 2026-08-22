"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { mapAuthError } from "@/lib/firebase/errors";

export interface RanklyUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextValue {
  user: RanklyUser | null;
  /** True until the first Firebase auth state resolution completes. */
  loading: boolean;
  signInWithGoogle: () => Promise<RanklyUser>;
  signInEmail: (email: string, password: string) => Promise<RanklyUser>;
  signUpEmail: (name: string, email: string, password: string) => Promise<RanklyUser>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toRanklyUser(u: User): RanklyUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

/** Fire-and-forget profile sync to Firestore via the secure server API. */
function syncProfile(token: string | null) {
  if (!token) return;
  fetch("/api/users/sync", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RanklyUser | null>(null);
  // Start "loading" only when Firebase auth can actually resolve on this client.
  const [loading, setLoading] = useState(
    () => typeof window !== "undefined" && isFirebaseClientConfigured()
  );

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    // Track whether this is a fresh page load (sync profile) vs later changes.
    let first = true;
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? toRanklyUser(fbUser) : null);
      setLoading(false);
      if (fbUser && first) {
        fbUser.getIdToken().then(syncProfile).catch(() => {});
      }
      first = false;
    });
    return unsub;
  }, []);

  const afterAuth = useCallback(async (fbUser: User) => {
    const token = await fbUser.getIdToken().catch(() => null);
    syncProfile(token);

    // Link any guest-created audit(s) from the signed cookie to this account.
    fetch("/api/audits/link-guest", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).catch(() => {});

    try {
      localStorage.removeItem("rankly_guest_audit_used");
    } catch {}
    return toRanklyUser(fbUser);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth || !googleProvider) throw new Error("Authentication isn't configured yet.");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      return await afterAuth(cred.user);
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  }, [afterAuth]);

  const signInEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Authentication isn't configured yet.");
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return await afterAuth(cred.user);
      } catch (err) {
        throw new Error(mapAuthError(err));
      }
    },
    [afterAuth]
  );

  const signUpEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Authentication isn't configured yet.");
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {});
        }
        return await afterAuth(cred.user);
      } catch (err) {
        throw new Error(mapAuthError(err));
      }
    },
    [afterAuth]
  );

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Authentication isn't configured yet.");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  const getIdToken = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signInEmail, signUpEmail, resetPassword, signOutUser, getIdToken }),
    [user, loading, signInWithGoogle, signInEmail, signUpEmail, resetPassword, signOutUser, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
