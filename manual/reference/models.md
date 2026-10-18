# Database models

> Generated from the code by `scripts/gen-docs.ts`. Do not edit by hand; run the script again after changing the code.

Mongoose models in `lib/models/index.js` (field names found in each schema; see the file for types and defaults).

## Project

`title, slug, client, industry, summary, content, liveUrl, bannerImage, scrollImage, useScrollAsBanner, scrollDirection, gallery, platformType, cms, technologies, services, duration, startDate, endDate, deliverables, metrics, value, label, video, provider, url, accent, featured, published, order`

## Post

`title, slug, kind, category, excerpt, cover, content, tags, blocks, aiMeta, aiScore, featured, published, publishedAt`

## Category

`name, slug, description, color, order`

## Service

`name, slug, summary, description, icon, group, order, active`

## Package

`name, slug, service, tagline, price, priceMax, currency, billing, unitNote, deliveryDays, revisions, features, popular, active, order, ctaLabel, checkoutMode, checkoutNote, choice, monthlyYearly, yearlyDiscount, yearlyPrice`

## Order

`number, token, package, amount, currency, customer, name, email, phone, company, country, requirements, method, status, payment, provider, transactionId, senderNumber, reference, paidAt, amountLocal, raw, notes, invoiceNumber, emails, history, at, note, portal, customerId, progress, dueDate, updates, text, link, linkLabel, deliverables, label, url, Discounts, subtotal, discount, creditUsed, coupon, code, value, referral, kind, rewarded, adjust, couponReleased, creditRestored, voided, subscription, period, startsAt, endsAt, expiredAt, reminders, renewedBy, noAuto`

## Message

`name, email, phone, subject, budget, service, message, read, starred, replies, autoReplied, customerId, orderNumber`

## Page

`title, slug, content, blocks, layout, hideTitle, published, showInFooter, showInHeader`

## Media

`url, name, size`

## Setting

`key, data`

## User

`email, name, passwordHash, role, disabled, avatar, phone, note, failedLogins, lockUntil, lastLoginAt, lastLoginIp`

## Customer

`email, lowercase, name, phone, company, country, passwordHash, select, emailVerified, disabled, tokenVersion, verifyTokenHash, verifyExpires, resetTokenHash, resetExpires, failedLogins, lockUntil, lastLoginAt, lastLoginIp, messagesSeenAt, notes, avatar, refCode, referredBy, credit, refStats, clicks, signups, orders, affiliate, status, rate, about, website, payoutMethod, payoutDetails, appliedAt, approvedAt, adminNote`

## Coupon

`code, uppercase, description, value, currency, maxDiscount, minAmount, packages, startsAt, expiresAt, maxUses, usesCount, perCustomer, firstOrderOnly, customersOnly, assignedTo, source, active`

## Commission

`kind, customerId, orderId, orderNumber, buyerName, base, rate, amount, currency, couponCode, status, availableAt, payoutId, note`

## Payout

`customerId, name, email, amount, currency, method, details, status, reference, note, paidAt`

## CaseStudy

`title, slug, client, clientLogo, industry, location, liveUrl, project, summary, cover, scrollImage, accent, duration, startDate, endDate, services, technologies, platform, team, overview, challengeIntro, challenges, body, approachIntro, approach, phase, resultsIntro, results, metrics, label, before, after, value, testimonial, quote, name, role, avatar, gallery, blocks, featured, published, order, publishedAt`

## App

`name, slug, tagline, description, logo, image, url, status, category, tech, featured, showInFooter, published, order`

## Contact

`email, name, phone, company, country, stage, value, tags, notes, source, lastContactAt, orders, messages, spent, activity, text, at`

## RateHit

`key, count, expiresAt, expires, builder, name, slug, title, description, fields, settings, notify, autoReply, payment, style, active, entries, views`

## FormEntry

`formId, formSlug, formName, data, labels, email, name, status, payment, orderNumber, amount, currency, method, lines, page, referrer, ip, ua`

## Popup

`name, slug, active, priority, template, layout, position, size, contentType, content, design, trigger, target, frequency, stats, views, clicks, conversions`

## Redirect

`from, to, code, match, keepQuery, active, note, hits, lastHitAt, auto`

## NotFoundHit

`path, hits, lastAt, referrer, ua`

## Knowledge

`question, answer, category, keywords, active, showOnFaq, order, slug, showInHelp, body, center, source`

## ChatGap

`question, count, lastAt, resolved`
