/* Turns low-level server errors (mostly MongoDB) into a message that says what to fix. */
export function explainError(e) {
  const m = String(e?.message || e);
  if (/bad auth|authentication failed/i.test(m)) return 'Database login failed: the username or password in MONGODB_URI is wrong. Check Atlas > Database Access, URL-encode special characters, then redeploy.';
  if (/querySrv|querytxt|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(m)) return 'Your network blocked the database address lookup (DNS). The site tries a workaround by itself; if this stays, open Atlas > Connect > Drivers and paste the standard (non-SRV) connection string into MONGODB_URI, or try another network. Then also check Atlas > Network Access allows your IP (or 0.0.0.0/0).';
  if (/ServerSelection|ETIMEDOUT|whitelist/i.test(m)) return 'Cannot reach the database. In Atlas > Network Access add your current IP (or 0.0.0.0/0 for anywhere), wait until it is Active, then try again.';
  if (/Invalid scheme|Invalid connection string|mongodb\+srv/i.test(m)) return 'MONGODB_URI is not a valid connection string. Copy it again from Atlas > Connect > Drivers and redeploy.';
  return `Server error: ${m.replace(/\/\/[^@]*@/, '//***@').slice(0, 200)}`;
}
