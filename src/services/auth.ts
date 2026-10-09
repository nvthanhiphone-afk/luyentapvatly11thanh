/**
 * Authentication service using standard Web Crypto API for SHA-256 password hashing.
 * Passwords are never stored in plaintext.
 */

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

const TEACHER_SESSION_KEY = 'vl11_teacher_token';

export function getTeacherSession(): { loggedIn: boolean; username: string; timestamp: number } | null {
  try {
    const raw = sessionStorage.getItem(TEACHER_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 12 hours
    if (Date.now() - data.timestamp > 12 * 60 * 60 * 1000) {
      sessionStorage.removeItem(TEACHER_SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setTeacherSession(username: string): void {
  sessionStorage.setItem(
    TEACHER_SESSION_KEY,
    JSON.stringify({
      loggedIn: true,
      username,
      timestamp: Date.now(),
    })
  );
}

export function clearTeacherSession(): void {
  sessionStorage.removeItem(TEACHER_SESSION_KEY);
}
