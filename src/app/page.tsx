'use client';

import React, { useState } from 'react';
import { SUBURBS } from '@/lib/suburbs';

interface Listing {
  title: string;
  suburb: string;
  price: string;
  cond: [string, string];
  img: string;
  art: keyof typeof ART;
}

const ART = {
  surfboard: (
    <svg className="art" fill="none" viewBox="0 0 80 80" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 8c-9 12-9 52 0 64 9-12 9-52 0-64z" strokeWidth="2.2" />
      <line x1="40" y1="10" x2="40" y2="70" strokeWidth="2.2" />
    </svg>
  ),
  chair: (
    <svg className="art" fill="none" viewBox="0 0 80 80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
      <path d="M26 30V16a3 3 0 013-3h22a3 3 0 013 3v14" />
      <path d="M24 30h32" />
      <path d="M26 30v18h28V30" />
      <path d="M28 48v18M52 48v18M34 48v14M46 48v14" />
    </svg>
  ),
  armchair: (
    <svg className="art" fill="none" viewBox="0 0 80 80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
      <path d="M20 38v-8a6 6 0 016-6h28a6 6 0 016 6v8" />
      <path d="M16 50V42a4 4 0 018 0v6h24v-6a4 4 0 018 0v8" />
      <path d="M16 50a6 6 0 006 6h36a6 6 0 006-6" />
      <path d="M22 56v8M58 56v8" />
    </svg>
  ),
  bike: (
    <svg className="art" fill="none" viewBox="0 0 80 80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
      <circle cx="22" cy="50" r="13" />
      <circle cx="58" cy="50" r="13" />
      <path d="M22 50l11-22h13M33 28l13 22M46 28h8M30 50h21" />
    </svg>
  ),
  plant: (
    <svg className="art" fill="none" viewBox="0 0 80 80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
      <path d="M30 48h20l-3 20H33z" />
      <path d="M40 48V30" />
      <path d="M40 34c-3-8-12-10-18-8 1 9 9 13 18 10z" />
      <path d="M40 30c2-9 11-12 18-10-1 9-9 13-18 12z" />
    </svg>
  ),
  record: (
    <svg className="art" fill="none" viewBox="0 0 80 80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
      <rect x="14" y="18" width="52" height="44" rx="4" />
      <circle cx="34" cy="40" r="14" />
      <circle cx="34" cy="40" r="3" />
      <circle cx="56" cy="28" r="2.4" />
    </svg>
  ),
  lamp: (
    <svg className="art" fill="none" viewBox="0 0 80 80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
      <path d="M30 22h20l6 18H24z" />
      <path d="M40 40v22" />
      <path d="M30 66h20" />
    </svg>
  ),
};

const LISTINGS: Listing[] = [
  {
    title: "Classic 9′2″ single-fin longboard",
    suburb: 'Muizenberg',
    price: 'R3 200',
    cond: ['Hardly used', 'Excellent condition'],
    img: '1677534712773-e616c25baae7',
    art: 'surfboard',
  },
  {
    title: 'Emerald velvet three-seater sofa',
    suburb: 'Noordhoek',
    price: 'R6 800',
    cond: ['2 months old', 'Excellent condition'],
    img: '1555041469-a586c61ea9bc',
    art: 'armchair',
  },
  {
    title: 'Cream tufted accent armchair',
    suburb: 'Kalk Bay',
    price: 'R1 400',
    cond: ['Reupholstered', 'Very good condition'],
    img: '1567538096630-e0c55bd6374c',
    art: 'armchair',
  },
  {
    title: 'Modern dining chairs · set of 4',
    suburb: "Simon's Town",
    price: 'R4 800',
    cond: ['Matching set', 'Very good condition'],
    img: '1592078615290-033ee584e267',
    art: 'chair',
  },
  {
    title: 'Road bike with steel frame',
    suburb: 'Fish Hoek',
    price: 'R2 900',
    cond: ['Recently serviced', 'Good condition'],
    img: '1485965120184-e220f721d03e',
    art: 'bike',
  },
  {
    title: 'Mature monstera in ceramic pot',
    suburb: 'Lakeside',
    price: 'R450',
    cond: ['Thriving', 'Very good condition'],
    img: '1614594975525-e45190c55d0b',
    art: 'plant',
  },
  {
    title: '80+ Classic rock vinyls',
    suburb: 'Kommetjie',
    price: 'R3 200',
    cond: ['Well cared for', 'Good condition'],
    img: '1461360228754-6e81c478b882',
    art: 'record',
  },
  {
    title: 'Copper arc reading lamp',
    suburb: 'St James',
    price: 'R950',
    cond: ['Rewired', 'Excellent condition'],
    img: '1542728928-1413d1894ed1',
    art: 'lamp',
  },
];

function ListingCard({ listing }: { listing: Listing }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="listing">
      <div className="thumb">
        <img
          src={`https://images.unsplash.com/photo-${listing.img}?fm=jpg&q=75&w=900&auto=format&fit=crop`}
          alt={listing.title}
          loading="lazy"
          draggable={false}
          onError={() => setImgError(true)}
          style={{ display: imgError ? 'none' : undefined }}
        />
        <div className="art-fallback" style={{ display: imgError ? 'grid' : 'none' }}>
          {ART[listing.art]}
        </div>
        <span className="price-tag">{listing.price}</span>
        <span className="vbadge">
          <span className="dot" />
          Verified neighbour
        </span>
      </div>
      <div className="meta">
        <div className="suburb">{listing.suburb}</div>
        <h3>{listing.title}</h3>
        <div className="cond">
          <span>{listing.cond[0]}</span>
          <span className="sep" />
          <span>{listing.cond[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState({ name: '', email: '', suburb: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setIsDuplicate(false);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit. Please try again.');
      if (data.isDuplicate) setIsDuplicate(true);
      setStatus('success');
      setFormData({ name: '', email: '', suburb: '' });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <>
      {/* ── Header ── */}
      {/* <header className="site-header">
        <div className="wrap header-inner">
          <div className="wordmark">
            South&nbsp;Peninsula <span className="mk">Marketplace</span>
          </div>
          <div className="scope-pill">
            <span className="dot" />
            South Peninsula only
          </div>
        </div>
      </header> */}

      <main>
        {/* ── Hero + Waitlist ── */}
        <section className="wrap hero">
          {/* Left: hero copy */}
          <div>
            {/* <span className="eyebrow">
              <span className="eyebrow-bar" />
              Verified neighbours only
            </span> */}
            <h1 className="headline">
              Buy & sell safely, locally.
              <br />
              <span className="soft">No scammers.</span>
            </h1>
            <div className="lede">
              <p><strong className="highlight">Finally, a local, trustworthy alternative to Facebook Marketplace.</strong></p>
<p>Here, every seller is verified with against their ID. No fakes. No deposits. No nonsense. Pay on collection, from neighbours you can trust.</p>
            </div>

            <div className="features">
              <div className="feature">
                <span className="ic">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div>
                  <h4>Every seller is SA ID-verified before they can list.</h4>
                </div>
              </div>

              <div className="feature">
                <span className="ic">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div>
                  <h4>Pay on collection only.</h4>
                </div>
              </div>

              <div className="feature">
                <span className="ic">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div>
                  <h4>Your community, not the entire internet.</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Right: waitlist card */}
          <div className="card">
            {status === 'success' ? (
              <div className="success-view">
                <div className="badge">
                  <svg
                    width="26"
                    height="26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2>
                  {isDuplicate ? "You're already registered" : "You're on the list"}
                </h2>
                <p>
                  {isDuplicate
                    ? "You're already on the waitlist. We'll notify you when verification opens in your suburb."
                    : "You're on the waitlist. Watch your inbox for notification when onboarding opens in your suburb."}
                </p>
                <button className="reset-btn" onClick={() => setStatus('idle')}>
                  Add another email
                </button>
              </div>
            ) : (
              <>
                <h2>Join the waitlist</h2>
                <p className="sub">
                  Get notified the moment listings go live in your suburb.
                </p>

                <form className="wl-form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Sarah Davies"
                      autoComplete="name"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">Email address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="joe@emailaddress.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="suburb">Your suburb (or nearest suburb)</label>
                    <div className="select-wrap">
                      <select
                        id="suburb"
                        name="suburb"
                        required
                        value={formData.suburb}
                        onChange={handleChange}
                        className={formData.suburb ? 'filled' : ''}
                      >
                        <option value="" disabled>
                          Select your suburb
                        </option>
                        {SUBURBS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="chev"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 9l6 6 6-6"
                        />
                      </svg>
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="error-banner">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <svg
                          style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }}
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            style={{ opacity: 0.25 }}
                          />
                          <path
                            fill="currentColor"
                            style={{ opacity: 0.75 }}
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Registering…
                      </>
                    ) : (
                      'Get notified - obligation free'
                    )}
                  </button>
                </form>

                <div className="reassure">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM16 11V7a4 4 0 00-8 0v4"
                    />
                  </svg>
                  We&rsquo;ll never share your details. No spam, ever.
                </div>
                <div className="popi-link-row">
            <a href="#popi" className="popi-link">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="13" height="13">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM16 11V7a4 4 0 00-8 0v4" />
              </svg>
              Why we&rsquo;re collecting your information (POPI Act)
            </a>
          </div>
              </>
            )}
          </div>
        </section>

        {/* ── Listings carousel ── */}
        <section className="listings-section wrap">
          <div className="listings-head">
            <div className="lead">
              <h2>A peek at what&rsquo;s coming...</h2>
            </div>
          </div>

          <div className="rail-outer">
            <div className="rail">
              {[...LISTINGS, ...LISTINGS].map((listing, i) => (
                <ListingCard key={i} listing={listing} />
              ))}
            </div>
          </div>
        </section>

        {/* ── POPI disclosure ── */}
        <section id="popi" className="popi-section wrap">
          <div className="popi-inner">
            <h2 className="popi-heading">Your privacy &amp; the POPI Act</h2>
            <div className="popi-grid">
              <div className="popi-block">
                <h3>Why we&rsquo;re collecting your information</h3>
                <p>We&rsquo;re building a verified, local buying and selling platform for the South Peninsula. Your name, email, and suburb help us confirm there&rsquo;s enough interest in your area before we build anything, and to let you know when we&rsquo;re ready to launch near you.</p>
              </div>
              <div className="popi-block">
                <h3>What we do with it</h3>
                <p>We&rsquo;ll send you one confirmation email and updates about the launch. That&rsquo;s it. We won&rsquo;t sell your information, share it with third parties, or use it for anything other than keeping you informed about this platform.</p>
              </div>
              <div className="popi-block">
                <h3>How to request deletion</h3>
                <p>Email us at <a href="mailto:hello@southpeninsula.market" className="popi-mailto">hello@southpeninsula.market</a> with the subject &ldquo;Remove me&rdquo; and we&rsquo;ll delete your details within 7 days.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p className="copy">© 2026 South Peninsula Marketplace · Cape Town</p>
          <div className="suburbs">
            <span>Muizenberg</span>
            <span className="pt" />
            <span>Kalk Bay</span>
            <span className="pt" />
            <span>Fish Hoek</span>
            <span className="pt" />
            <span>Noordhoek</span>
            <span className="pt" />
            <span>Simon&rsquo;s Town</span>
            <span className="pt" />
            <span>Kommetjie</span>
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
