// Password verification - obfuscated to prevent easy extraction
// Uses a simple XOR cipher with the encoded password

const ENCODED = [1, 49, 44, 55, 51, 42, 47, 44, 55, 38, 45]
const KEY = 67

export function verifyPassword(password: string): boolean {
  if (password.length !== ENCODED.length) return false

  for (let i = 0; i < password.length; i++) {
    if ((password.charCodeAt(i) ^ KEY) !== ENCODED[i]) {
      return false
    }
  }

  return true
}
