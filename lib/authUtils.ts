export function getOwnerEmails(): string[] {
  const envEmails = process.env.OWNER_EMAILS || process.env.ADMIN_EMAIL || '';
  return envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const owners = getOwnerEmails();
  return owners.includes(normalized);
}
