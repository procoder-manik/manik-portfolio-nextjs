/* Turns low-level server errors (mostly MongoDB) into a message that says what to fix. */
export function explainError(e) {
  const m = String(e?.message || e);
  if (/bad auth|authentication failed/i.test(m)) return 'Database login failed: the username or password in MONGODB_URI is wrong. Check Atlas > Database Access, URL-encode special characters, then redeploy.';
  if (/ServerSelection|ENOTFOUND|ETIMEDOUT|ECONNREFUSED|whitelist|querySrv/i.test(m)) return 'Cannot reach the database. In Atlas > Network Access add 0.0.0.0/0, wait until it is Active, then try again.';
  if (/Invalid scheme|Invalid connection string|mongodb\+srv/i.test(m)) return 'MONGODB_URI is not a valid connection string. Copy it again from Atlas > Connect > Drivers and redeploy.';
  return `Server error: ${m.replace(/\/\/[^@]*@/, '//***@').slice(0, 200)}`;
}
