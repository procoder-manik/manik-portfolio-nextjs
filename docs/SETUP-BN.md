# সেটআপ গাইড (বাংলা)

## ধাপ ১: কম্পিউটারে যা লাগবে
- Node.js 20 (nodejs.org থেকে LTS ভার্সন)
- Git (git-scm.com)
- একটা GitHub অ্যাকাউন্ট আর একটা Vercel অ্যাকাউন্ট (GitHub দিয়ে সাইন আপ করলেই হবে)

## ধাপ ২: MongoDB Atlas (ফ্রি ডাটাবেস)
1. mongodb.com/atlas এ অ্যাকাউন্ট খুলুন, তারপর **Create** থেকে **M0 Free** ক্লাস্টার বানান। Provider AWS, Region **Singapore (ap-southeast-1)** দিন।
2. **Database Access > Add New Database User**: একটা ইউজারনেম আর পাসওয়ার্ড দিন। পাসওয়ার্ডে `@ # / :` এর মতো চিহ্ন না রাখাই ভালো।
3. **Network Access > Add IP Address > Allow Access from Anywhere** (`0.0.0.0/0`)। Vercel-এর IP বদলায়, তাই এটা লাগবে।
4. **Database > Connect > Drivers** থেকে কানেকশন স্ট্রিং কপি করুন। `/?` এর আগে ডাটাবেসের নাম বসান:
   `mongodb+srv://manik:PASSWORD@cluster0.xxxxx.mongodb.net/manik-portfolio?retryWrites=true&w=majority`

## ধাপ ৩: Cloudinary (Vercel-এ ছবি ও ভিডিও আপলোডের জন্য বাধ্যতামূলক)
1. cloudinary.com এ ফ্রি অ্যাকাউন্ট খুলুন।
2. Dashboard থেকে **Cloud name, API Key, API Secret** কপি করুন।
3. CV PDF Cloudinary-তে রাখতে চাইলে **Settings > Security > Allow delivery of PDF and ZIP files** চালু করুন।

## ধাপ ৪: লোকালি চালানো
```bash
npm install
npm run setup
```
`npm run setup` নিজে থেকে `.env.local` বানায় আর অ্যাডমিন পাসওয়ার্ড একবার দেখায়, সেটা লিখে রাখুন। এরপর শুধু `MONGODB_URI` বসালেই হবে।
`.env.local` ফাইলে বসান:
- `MONGODB_URI`: ধাপ ২ এর স্ট্রিং
- `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` চালিয়ে যা আসে
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: প্রথম লগইনের জন্য
- `NEXT_PUBLIC_SITE_URL="http://localhost:3000"`
- তিনটা `CLOUDINARY_*` (লোকালে ঐচ্ছিক)

তারপর:
```bash
npm run seed
npm run dev
```
http://localhost:3000/admin এ লগইন করুন, তারপর **Account** থেকে পাসওয়ার্ড বদলান।

## ধাপ ৫: GitHub-এ পুশ
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/manik-portfolio-nextjs.git
git push -u origin main
```
`.env.local` কখনো GitHub-এ যাবে না, `.gitignore` এ বাদ দেওয়া আছে।

## ধাপ ৬: Vercel-এ ডিপ্লয়
1. vercel.com > **Add New > Project** > আপনার রিপোজিটরি **Import** করুন।
2. Framework নিজে থেকেই Next.js ধরবে। Build সেটিংস যেমন আছে রাখুন (`vercel.json` এ সব দেওয়া আছে)।
3. **Environment Variables** এ এগুলো যোগ করুন:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | Atlas স্ট্রিং |
| `JWT_SECRET` | লম্বা র‍্যান্ডম স্ট্রিং |
| `ADMIN_EMAIL` | আপনার ইমেইল |
| `ADMIN_PASSWORD` | শক্ত পাসওয়ার্ড |
| `NEXT_PUBLIC_SITE_URL` | `https://manikhossain.in` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary থেকে |
| `CLOUDINARY_API_KEY` | Cloudinary থেকে |
| `CLOUDINARY_API_SECRET` | Cloudinary থেকে |

4. **Deploy** চাপুন।
5. `https://আপনার-প্রজেক্ট.vercel.app/admin` এ লগইন করুন। ডাটাবেস খালি থাকলে ড্যাশবোর্ডে **Load starter content** বাটন আসবে, সেটায় চাপলে আপনার সব প্রজেক্ট, প্যাকেজ, resume আর FAQ চলে আসবে। (লোকালে আগেই `npm run seed` করে থাকলে এটা লাগবে না।)

## ধাপ ৭: নিজের ডোমেইন যুক্ত করা
1. Vercel > Project > **Settings > Domains** > `manikhossain.in` আর `www.manikhossain.in` যোগ করুন।
2. ডোমেইন প্রোভাইডারের DNS-এ Vercel যা বলে সেটা বসান। সাধারণত:
   - `A` রেকর্ড, `@` এর জন্য, `76.76.21.21`
   - `CNAME` রেকর্ড, `www` এর জন্য, `cname.vercel-dns.com`
3. DNS কাজ করলে `NEXT_PUBLIC_SITE_URL` আসল ডোমেইনে সেট করে **Redeploy** করুন।
4. পুরনো WordPress সাইট একই ডোমেইনে থাকলে, DNS বদলানোর আগে নতুন সাইট পুরোপুরি চেক করে নিন।

## ধাপ ৮: পেমেন্ট সেটআপ
- **Admin > Payments** এ bKash, Nagad, Rocket নম্বর, ব্যাংক ডিটেইলস, PayPal আর Payoneer ইমেইল আর USD থেকে BDT রেট দিন।
- এগুলো কোনো API key ছাড়াই চলে। ক্রেতা টাকা পাঠিয়ে transaction ID দেবে, আপনি **Admin > Orders** থেকে মিলিয়ে **Paid** করবেন।
- **কার্ড আর অটোমেটিক bKash/Nagad (SSLCommerz):** sslcommerz.com এ merchant অ্যাকাউন্ট খুলুন (ট্রেড লাইসেন্স লাগে)। টেস্টের জন্য developer.sslcommerz.com থেকে sandbox store নিন। তারপর Vercel-এ দিন: `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD`, `SSLCZ_SANDBOX=true`। লাইভ হলে `false`।
- **PayPal অটোমেটিক:** developer.paypal.com > Apps & Credentials থেকে Client ID আর Secret নিয়ে `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_SANDBOX=true` দিন। লাইভ হলে `false`।
- প্রতিবার env বদলানোর পর **Redeploy** করতে হবে।

## ধাপ ৯: ইমেইল (ধন্যবাদ মেইল, অর্ডার মেইল, ইনভয়েস)
সহজ উপায় Resend:
1. resend.com এ অ্যাকাউন্ট খুলুন > **Domains > Add domain** > `manikhossain.in` দিন।
2. Resend যে DNS রেকর্ডগুলো (TXT, MX, CNAME) দেখায়, সেগুলো ডোমেইনের DNS-এ বসান। Verified হওয়া পর্যন্ত অপেক্ষা করুন।
3. **API Keys** থেকে একটা key বানান।
4. Vercel-এ যোগ করুন: `RESEND_API_KEY`, `MAIL_FROM=hello@manikhossain.in`, `NOTIFY_EMAIL=আপনার ইমেইল`। তারপর Redeploy।
5. Admin > **Emails** থেকে প্রতিটা মেইলের লেখা বদলান আর প্রিভিউ দেখুন।

অথবা SMTP (নিচের মতো) ব্যবহার করতে পারেন।

### SMTP বিকল্প
Gmail দিয়ে: Google Account > Security > 2-Step Verification চালু করুন > **App passwords** থেকে একটা পাসওয়ার্ড বানান। তারপর:
`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=আপনার@gmail.com`, `SMTP_PASS=অ্যাপ-পাসওয়ার্ড`, `NOTIFY_EMAIL=যেখানে নোটিফিকেশন যাবে`

## ধাপ ১০: চ্যাটে AI উত্তর (ঐচ্ছিক, ফ্রি অপশন আছে)
চ্যাট AI ছাড়াই কাজ করে, আপনার FAQ আর প্যাকেজ থেকে উত্তর দেয়। AI চাইলে:
- **Google Gemini (ফ্রি):** aistudio.google.com > **Get API key** > Create API key। কার্ড লাগে না। Vercel-এ `GEMINI_API_KEY` বসান।
- **ChatGPT:** platform.openai.com এ API key বানান। এটার জন্য আলাদা প্রিপেইড ক্রেডিট লাগে; ChatGPT Plus সাবস্ক্রিপশনে API থাকে না। Vercel-এ `OPENAI_API_KEY` বসান।
- Redeploy করে Admin > **SEO and integrations > Chat > AI answers** থেকে Gemini বা ChatGPT বাছাই করুন।
- Key না থাকলে বা AI কোনো কারণে উত্তর না দিলে চ্যাট নিজে থেকেই ফ্রি rule-based উত্তরে ফিরে যায়।

## ধাপ ১১: Case studies চালু করা
1. Admin > **Case studies** এ দুটো উদাহরণ আছে। লেখা ঠিক করুন আর আসল ফলাফলের সংখ্যা বসান, বা নতুন বানান।
2. Admin > **Site and contact > Features** এ **Case studies** সুইচ অন করে Save দিন।
3. সাথে সাথে `/case-studies` পেজ, হোমপেজের সেকশন, হেডার মেনু আর ফুটারের লিংক চালু হয়ে যাবে। অফ করলে সব জায়গা থেকে একসাথে লুকিয়ে যাবে, কিন্তু লেখাগুলো সেভ থাকবে।

## ধাপ ১২: লাইভের পর
- প্রতিটা প্রজেক্টে আসল full-page screenshot আপলোড করুন (Chrome DevTools > `Ctrl+Shift+P` > "Capture full size screenshot")।
- **Site and contact** থেকে CV PDF আর ছবি বদলান।
- Google Search Console-এ `https://manikhossain.in/sitemap.xml` সাবমিট করুন।
- পরে কোড আপডেট করলে শুধু `git push` করুন, Vercel নিজে থেকেই আবার ডিপ্লয় করবে।
