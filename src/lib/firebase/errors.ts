/**
 * Maps raw Firebase auth errors to human-readable Rankly messages.
 * Never surface raw Firebase error codes in the UI.
 */

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address doesn't look valid.",
  "auth/user-disabled": "This account has been disabled. Contact support if you think this is a mistake.",
  "auth/user-not-found": "No account found with this email. Try creating one instead.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/email-already-in-use": "An account already exists with this email. Try signing in instead.",
  "auth/weak-password": "Please choose a stronger password (at least 6 characters).",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
  "auth/cancelled-popup-request": "Only one Google sign-in window can be open at a time.",
  "auth/popup-blocked": "Your browser blocked the sign-in window. Allow popups and try again.",
  "auth/network-request-failed": "Network issue — check your connection and try again.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled yet. Please try another way.",
  "auth/unauthorized-domain": "This domain isn't authorized for sign-in yet.",
};

export function mapAuthError(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    if (AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  }
  return "Something went wrong while signing you in. Please try again.";
}

export function getFirebaseErrorCode(err: unknown): string | null {
  if (typeof err === "object" && err !== null && "code" in err) {
    return (err as { code: string }).code ?? null;
  }
  return null;
}
