// A room code must look like something generateRoomId() would produce,
// lowercase letters and digits only, reasonable length. This guards
// against navigating to a session with a garbage/malicious room code.

export function isValidRoomId(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 4 || trimmed.length > 20) return false;
  return /^[a-z0-9]+$/.test(trimmed);
}