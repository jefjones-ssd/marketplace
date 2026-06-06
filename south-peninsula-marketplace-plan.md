# South Peninsula Marketplace — Phased Reference Document

---

## **Concept**

A safe, managed, localised alternative to Facebook Marketplace for the South Peninsula, Cape Town.

Facebook Marketplace is overrun with scammers. OLX is dead. Gumtree is barely alive. The gap is a hyper-local platform where every seller is a real, verified person.

**Core proposition:** Everyone here is who they say they are.

**Geographic scope:** Muizenberg through to Simon's Town (False Bay side) and Noordhoek through to Kommetjie (Atlantic side). Approximately 80,000–100,000 residents across interconnected communities that already share a common identity.

---

## **Positioning**

- Verified SA ID behind every seller listing  
- Cash on collection only — no upfront payments, no deposits, no shipping in v1  
- Suburb-level scoping — your community, not the internet  
- Human moderation — not an algorithm  
- Private sellers only in v1 — no dealers, no resellers  
- Communication through the platform only — no external contact until both parties opt in

**One-line pitch:** Buy and sell locally, from verified neighbours only.

---

## **Stack**

- **Frontend:** Next.js (App Router)  
- **Backend/DB:** Supabase (auth, Postgres, storage, real-time subscriptions)  
- **Infrastructure:** Cloudflare (DNS, WAF, caching), Vercel or Cloudways Node  
- **Styling:** Tailwind CSS — no component library to start  
- **Identity verification:** Manual review for tester phase. Tiered API verification at scale (Home Affairs ID number check for low-value, full DocV/selfie match for high-value)  
- **Email/onboarding:** ActiveCampaign  
- **AI layer (Phase 3):** Claude or GPT-4o vision API via Next.js API routes or Supabase Edge Functions

---

## **Database Schema (Core Tables)**

- `profiles` — linked to auth.users, display name, suburb, verification status (enum: unverified / pending / verified / rejected), rating aggregate, phone  
- `listings` — title, description, price, category, condition, suburb \+ lat/lng, status (active / sold / removed), seller\_id, created\_at  
- `listing_images` — FK to listing, storage path, order index  
- `messages` — sender\_id, recipient\_id, listing\_id, body, created\_at, read\_at  
- `reviews` — reviewer\_id, reviewed\_id, listing\_id, rating (1–5), comment, created\_at. Only writable after both parties mark transaction complete.  
- `reports` — reporter\_id, listing\_id or user\_id, reason, status, created\_at

Row Level Security on all tables.

---

## **Identity Verification Strategy**

**Tester phase (Phase 1–2):** Manual review. Seller uploads SA ID photo and selfie via form to Supabase Storage. Reviewed and approved manually. Zero API cost. Manageable at 50 users. Builds direct relationships with early communities.

**Scale phase (Phase 3+):** Tiered approach to control cost:

- Tier 1 — Phone OTP only. Browse and message. Free.  
- Tier 2 — ID number checked against Home Affairs database via third-party provider (LexisNexis, Compuscan, or TransUnion). List items under R500. Approximately R2–R5 per check.  
- Tier 3 — Full DocV with selfie match (Smile Identity or Onfido). Required for listings above R500 or high-risk categories (electronics, vehicles). Approximately R15–R30 per check.

**Cost recovery:** When monetisation launches, bake verification cost into seller subscription or charge a once-off R25 verified seller badge fee. This also acts as a scammer deterrent.

**Automate only when manual review exceeds \~200–300 pending verifications per month.**

---

## **Buyer Protection**

**v1 model — no financial protection, social accountability only:**

- Verified identity makes anonymity impossible  
- Seller rating persists, tied to verified ID — cannot be deleted and recreated  
- Public dispute flag visible on profile  
- COC-only policy eliminates the most common scam vectors (fake proof of payment, advance fee fraud, non-delivery)  
- Platform limits scope to local pickup — no shipping

**v2 (Phase 4+, only if warranted):** Optional escrow for items above R2,000. PayFast or Peach Payments for fund holding. 48-hour inspection window. Manual dispute resolution capped at defined monthly volume. Requires legal advice on liability structure before first transaction.

---

## **AI Layer**

**Phase 3 priority order:**

1. **Listing creation assistant** — seller takes a photo, AI returns suggested title, description, category, condition, and ZAR price range. Seller edits rather than writes. Single API call (Claude or GPT-4o vision). Removes the biggest friction point in listing creation.  
     
2. **Scam detection in messaging** — Supabase webhook triggers on each new message insert. AI classifies for known patterns: requests to move to WhatsApp, upfront payment requests, external links, urgency language. Inline warning rendered in thread. Flag logged to reports table.  
     
3. **Listing risk scoring** — on listing creation, AI scores against fraud signals: price anomaly, description patterns, account age, category risk. High-risk listings routed to moderation queue. Low-risk auto-publish. Threshold tunable from admin.

**Later phases:**

- Natural language search  
- Behavioural trust scoring per user (inputs: listing quality, response rate, transaction completion, reviews, report history, messaging behaviour)  
- Moderation assist: AI summarises reports and cross-references user history before you review

**Positioning note:** The AI is not a feature to advertise. It is the mechanism behind "the platform is actively watching out for you." That is the message.

---

## **Monetisation (Deferred)**

Do not charge during tester phase. Introduce only when there is real density.

- **Free tier:** 5 active listings at a time  
- **Seller subscription:** R49/month — unlimited listings, priority placement, verified seller badge highlight  
- **Featured listing:** R19 per listing per week  
- **No transaction fees in v1**

---

## **Admin (Tester)**

Password-protected `/admin` route in Next.js. Not a separate system.

- Pending ID verifications — approve/reject  
- Reported listings and users — action buttons  
- Recent signups  
- Basic counts: active listings, verified users, messages sent, reports open

---

## **Phase 0 — Validate Before Building (2 weeks)**

**Goal:** Confirm people want this, find an anchor person, prove local demand with a waitlist.

**Conversations:**

Talk to 15 people in Week 1 — people you know personally who buy/sell secondhand, are active in community groups, or have experienced Marketplace scams. Not friends who will be polite.

Ask three questions:

- How often do you use Facebook Marketplace?  
- Have you been scammed or know someone who has?  
- Would verified SA ID change whether you trust a seller?  
- "Who else locally do you think would care about this?"

Document every conversation: name, response, referrals. Map the network.

In Week 2, follow the referrals. Another 15–20 conversations. By end of Week 2 you want 30+ conversations done.

**What strong signal looks like:** Genuine frustration, not polite agreement. "I stopped using Marketplace after I got scammed" is strong. "Yes I'd probably use it" from someone who rarely lists is weak.

**Anchor person criteria:**

- Local credibility in at least one active community group  
- Active presence (not just a member — someone people listen to)  
- Genuine enthusiasm for the problem, not just polite interest

Candidates: neighbourhood watch coordinator, Muizenberg Improvement District, NCAN (Noordhoek Community Action Network — well organised, strong local credibility), school parent group admin, active local small business owner.

**What you ask of them:** Be the first verified seller. Post 3–4 real listings. When ready, send one WhatsApp message to their group with a personal endorsement. Nothing else unless they want more involvement.

**Waitlist page:**

Single page. Name, email, suburb, submit. No navigation, no about page. Deployed to Vercel or Cloudflare Pages. Form posts to Supabase table or Google Sheet.

Set up in Week 1 before conversations start so you have somewhere to send people.

**Automated email on signup (ActiveCampaign):**

- Subject: You're on the list — here's what's coming  
- Two sentences on what the platform is  
- Approximate launch date  
- One question: "What's the one thing that would make you trust a local selling platform?"  
- Read every reply — these are your most engaged early users

**Community group research (1 hour):**

Read the last two weeks of the main Muizenberg and South Peninsula Facebook/WhatsApp groups. Document every post that is a scam warning, complaint about a dodgy seller, request to verify a listing, or recommendation request. This is real evidence of the problem in your specific community and future marketing material.

**Target communities for anchor and waitlist seeding:**

- False Bay Neighbourhood Watch  
- Fish Hoek Valley Residents Association  
- Noordhoek Community Action Network (NCAN)  
- Kommetjie Residents and Ratepayers Association  
- Simon's Town Residents Association  
- School parent groups across the peninsula  
- Kalk Bay and St James community pages  
- South Peninsula Facebook community groups

**Waitlist target:** 300–500 signups from the South Peninsula without paid ads.

**Decision gate — all four must be yes to proceed to Phase 1:**

- Did at least 15 of 30 conversations show genuine frustration, not just polite interest?  
- Do you have an anchor person who said yes without needing convincing?  
- Did you hit 300+ waitlist signups without paid promotion?  
- Do you have documented real scam complaints from local community groups?

Three yes: identify the one that failed and why before proceeding. Two or fewer: do not build yet.

---

## **Phase 1 — Tester Build (6–8 weeks)**

Build the minimum product. No AI layer. No payments. No shipping.

**Week 1–2: Foundation**

- Next.js App Router project scaffolded  
- Supabase configured: phone OTP auth, database schema, RLS policies, storage buckets  
- Cloudflare DNS, basic WAF rules  
- Core tables: profiles, listings, listing\_images, messages, reviews, reports  
- Auth flow: phone OTP signup, profile creation, suburb selection

**Week 3–4: Listings**

- Multi-step listing creation form (details then photos)  
- Image upload to Supabase Storage via signed URLs, server-side resize to two sizes (thumbnail \+ full)  
- Listing feed with suburb filtering  
- Listing detail page  
- Full-text search via Postgres (sufficient for tester volume)  
- Categories (8 maximum to start): Electronics, Furniture, Clothing, Vehicles, Garden, Sports, Books, Other

**Week 5–6: Trust and messaging**

- Manual verification flow: upload SA ID photo and selfie, stored in Supabase Storage, status updated via admin  
- Verified badge on profiles and listings  
- Real-time messaging via Supabase subscriptions, scoped to listing \+ two parties  
- No phone numbers exchanged through the platform  
- Report button on listings and profiles

**Week 7: Admin**

- Password-protected `/admin` route  
- Verification queue with approve/reject  
- Reports queue with action buttons  
- Basic dashboard counts

**Week 8: Polish and pre-launch**

- Mobile-first UI pass  
- ActiveCampaign onboarding sequence: signup confirmation, verification prompt, first listing prompt  
- Error handling, loading states, edge cases  
- Staging environment smoke test  
- RLS audit, API route auth checks, Cloudflare rules review

---

## **Phase 2 — Muizenberg / South Peninsula Soft Launch (4 weeks)**

Invite-only. No public signup link. Waitlist and anchor community only.

**Week 1:** Seed the platform. You and anchor person create 20–30 real listings. Invite first 50–100 people from waitlist. Anchor person posts in their group with personal endorsement in their own words.

**Week 2–3:** Monitor daily. Respond to every piece of feedback personally. Fix critical bugs within 24 hours.

**Track:** Signup completion rate, verification completion rate, listings created, messages sent, reported issues, transactions completed.

**Week 4:** Assess against decision gate:

- Verification drop-off above 40%? Friction too high — fix the flow before expanding.  
- Listings getting enquiries? Transactions completing? Proceed to Phase 3\.

**Targets before proceeding:** 50+ active users, 50+ live listings, 10+ completed transactions, documented feedback.

---

## **Phase 3 — AI Layer (4–6 weeks, parallel to Phase 2 expansion)**

**Week 1–2:** Listing creation assistant

- API route calling Claude or GPT-4o vision  
- Seller uploads photo, gets back suggested title, description, category, condition, ZAR price range  
- Editable before submission  
- Prompt engineered for SA context and ZAR pricing  
- Measure: time-to-list before and after

**Week 3–4:** Scam detection in messaging

- Supabase webhook on message insert triggers Edge Function or API route  
- AI classifies message for known scam signals  
- Inline warning in thread when triggered  
- False positive rate monitored — tune threshold

**Week 5–6:** Listing risk scoring

- AI scores listing on creation against fraud signals  
- High-risk to moderation queue, low-risk auto-publishes  
- Threshold configurable from admin  
- Monitor false positive rate on legitimate listings

---

## **Phase 4 — Expand and Monetise (Month 4 onwards)**

**Geographic expansion pattern:**

- Adjacent suburbs: Marina da Gama, Lakeside, Kalk Bay as immediate next nodes  
- Each new suburb requires a local anchor person before launch  
- Same invite-only soft launch repeated each time  
- "Now live in \[suburb\]" is always the marketing message  
- Never expand to a new area before the previous one has real listing density

**Natural expansion sequence:** False Bay corridor first (already connected identity), then Noordhoek/Kommetjie, then consider Southern Suburbs boundary suburbs (Tokai, Bergvliet) if organically requested.

**Monetisation introduction:**

- Free tier: 5 active listings  
- Seller subscription: R49/month — unlimited listings, priority placement  
- Featured listing: R19/listing/week  
- Optional once-off R25 verified seller badge fee (covers verification cost, acts as scam deterrent)

**Platform features based on Phase 2–3 feedback (likely candidates):**

- Seller opt-in to share phone number after first message exchange  
- Suggested meetup points on listing page (police stations, petrol stations, shopping centres)  
- Transaction completion flow — both parties confirm, review unlocked  
- Trust tiers: Verified, Trusted Seller (10+ completed), Top Seller (50+)

---

## **Phase 5 — Escrow (Month 6+, only if warranted)**

Only build if: consistent transaction volume, users explicitly requesting it, and legal advice obtained on liability structure.

- PayFast or Peach Payments for fund holding  
- 48-hour inspection window after collection  
- Manual dispute resolution, capped at defined monthly volume  
- T\&Cs drafted by a lawyer before first transaction  
- FSCA implications reviewed — you are a payment facilitator, not an escrow provider. Structure accordingly.

This may never be necessary if COC remains the dominant transaction mode. Do not build speculatively.

---

## **Risk Register**

| Phase | Biggest risk |
| :---- | :---- |
| Phase 0 | Not finding an anchor person. Do not skip this step. |
| Phase 1 | Over-building. Ship the minimum. |
| Phase 2 | Verification drop-off killing listing supply. |
| Phase 3 | AI false positives frustrating legitimate sellers. |
| Phase 4 | Expanding geographically before previous area has density. |
| Phase 5 | Building escrow without understanding legal exposure. |

**On idea protection:** The technology is replicable. The community trust relationships are not. A competitor can clone the product but cannot clone the fact that you are from Muizenberg, that your anchor person vouches for you personally, and that you had these conversations six months before anyone else showed up. Execution speed and community depth are the moat. Talk openly about the problem. Be specific about the solution only with people whose help you need.

---

## **What Is Out of Scope for the Tester**

- Escrow or any payment flow through the platform  
- Shipping  
- Native mobile app  
- Advanced search or recommendations  
- Social features beyond ratings and messaging  
- Dealer or business listings  
- Categories beyond the initial 8  
- Geographic expansion beyond the initial anchor community

---

*Last updated: June 2026*  
