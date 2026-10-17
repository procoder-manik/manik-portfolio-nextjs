/* One-time local setup: creates .env.local with a random JWT secret and admin password,
   so `npm run dev` works right after extracting. Add MONGODB_URI later to save changes. */
import fs from 'fs';
import crypto from 'crypto';

const file = '.env.local';
if (fs.existsSync(file)) { console.log('.env.local already exists. Nothing changed.'); process.exit(0); }
const pass = crypto.randomBytes(9).toString('base64url');
let env = fs.readFileSync('.env.example', 'utf8')
  .replace(/^MONGODB_URI=.*$/m, 'MONGODB_URI=""')
  .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET="${crypto.randomBytes(48).toString('base64url')}"`)
  .replace(/^NEXT_PUBLIC_SITE_URL=.*$/m, 'NEXT_PUBLIC_SITE_URL="http://localhost:3000"')
  .replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD="${pass}"`);
fs.writeFileSync(file, env);
const email = (env.match(/^ADMIN_EMAIL="?([^"\n]*)/m) || [])[1];
console.log(`\nCreated .env.local\n  Admin email:    ${email}\n  Admin password: ${pass}\n\nNext: npm run dev  ->  http://localhost:3000  and  /admin\nAdd MONGODB_URI to .env.local (then npm run seed) when you want to save changes.\n`);
