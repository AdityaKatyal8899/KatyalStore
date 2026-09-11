export function getOwnerEmails(): string[] {
  const envEmails = process.env.OWNER_EMAILS || process.env.ADMIN_EMAIL || '';
  const list = envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Default allowed owner emails if none specified in env
  const defaults = ['adityakatyal8899@gmail.com', 'admin@katyalstore.com', 'owner@katyalstore.com'];
  
  const combined = Array.from(new Set([...list, ...defaults]));
  return combined;
}

export function isOwnerEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const owners = getOwnerEmails();
  return owners.includes(normalized);
}
