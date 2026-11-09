import { randomInt } from 'node:crypto'

// Sin caracteres ambiguos (0/O, 1/I/L) para que se puedan dictar o copiar sin errores
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Codigo aleatorio y no adivinable para el enlace de cada invitacion (10 caracteres). */
export function generateCode(length = 10): string {
  let code = ''
  for (let i = 0; i < length; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return code
}
