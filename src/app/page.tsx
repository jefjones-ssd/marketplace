'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const SUBURBS = [
  'Muizenberg',
  'Kalk Bay',
  'St James',
  'Fish Hoek',
  "Simon's Town",
  'Noordhoek',
  'Kommetjie',
  'Glencairn',
  'Lakeside',
  'Marina da Gama',
];

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
    price: 'R3 500',
    cond: ['Surf-ready', 'Excellent'],
    img: '1677534712773-e616c25baae7',
    art: 'surfboard',
  },
  {
    title: 'Emerald velvet three-seater sofa',
    suburb: 'Noordhoek',
    price: 'R6 800',
    cond: ['Barely used', 'Excellent'],
    img: '1555041469-a586c61ea9bc',
    art: 'armchair',
  },
  {
    title: 'Cream tufted accent armchair',
    suburb: 'Kalk Bay',
    price: 'R2 400',
    cond: ['Reupholstered', 'Very good'],
    img: '1567538096630-e0c55bd6374c',
    art: 'armchair',
  },
  {
    title: 'Modern dining chairs · set of 4',
    suburb: "Simon's Town",
    price: 'R4 800',
    cond: ['Matching set', 'Very good'],
    img: '1592078615290-033ee584e267',
    art: 'chair',
  },
  {
    title: 'Steel commuter bicycle · 7-speed',
    suburb: 'Fish Hoek',
    price: 'R2 900',
    cond: ['Recently serviced', 'Good'],
    img: '1485965120184-e220f721d03e',
    art: 'bike',
  },
  {
    title: 'Mature monstera in ceramic pot',
    suburb: 'Lakeside',
    price: 'R650',
    cond: ['Thriving', 'Very good'],
    img: '1614594975525-e45190c55d0b',
    art: 'plant',
  },
  {
    title: 'Vinyl LP collection · 80+ records',
    suburb: 'Kommetjie',
    price: 'R3 200',
    cond: ['Well cared for', 'Good'],
    img: '1461360228754-6e81c478b882',
    art: 'record',
  },
  {
    title: 'Copper arc reading lamp',
    suburb: 'St James',
    price: 'R1 250',
    cond: ['Rewired', 'Excellent'],
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

  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const updateCarouselUI = useCallback(() => {
    const rail = railRef.current;
    const bar = barRef.current;
    const prevBtn = prevBtnRef.current;
    const nextBtn = nextBtnRef.current;
    if (!rail || !bar || !prevBtn || !nextBtn) return;

    const max = rail.scrollWidth - rail.clientWidth;
    const pct = max > 0 ? rail.scrollLeft / max : 0;
    const track = bar.parentElement!;
    const travel = Math.max(0, track.clientWidth - bar.clientWidth);
    bar.style.transform = `translateX(${pct * travel}px)`;
    prevBtn.disabled = rail.scrollLeft <= 2;
    nextBtn.disabled = rail.scrollLeft >= max - 2;
  }, []);

  const getCardStep = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 384;
    const first = rail.querySelector('.listing') as HTMLElement | null;
    if (!first) return 384;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 24;
    return first.getBoundingClientRect().width + gap;
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add('dragging');
      rail.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      rail.scrollLeft = startScroll - (e.clientX - startX);
    };

    const endDrag = () => {
      isDown = false;
      rail.classList.remove('dragging');
    };

    rail.addEventListener('pointerdown', onPointerDown);
    rail.addEventListener('pointermove', onPointerMove);
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    rail.addEventListener('scroll', updateCarouselUI, { passive: true });
    window.addEventListener('resize', updateCarouselUI);

    requestAnimationFrame(updateCarouselUI);

    return () => {
      rail.removeEventListener('pointerdown', onPointerDown);
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerup', endDrag);
      rail.removeEventListener('pointercancel', endDrag);
      rail.removeEventListener('scroll', updateCarouselUI);
      window.removeEventListener('resize', updateCarouselUI);
    };
  }, [updateCarouselUI]);

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
      <header className="site-header">
        <div className="wrap header-inner">
          <div className="wordmark">
            South&nbsp;Peninsula <span className="mk">Marketplace</span>
          </div>
          <div className="scope-pill">
            <span className="dot" />
            South Peninsula only
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero + Waitlist ── */}
        <section className="wrap hero">
          {/* Left: hero copy */}
          <div>
            <span className="eyebrow">
              <span className="eyebrow-bar" />
              Verified neighbours only
            </span>
            <h1 className="headline">
              Buy and sell locally,
              <br />
              <span className="soft">no scammers.</span>
            </h1>
            <p className="lede">
              Facebook Marketplace is full of fakes. We verify every seller&rsquo;s{' '}
              <strong>SA identity</strong> before they list — so you always know exactly who
              you&rsquo;re dealing with. Cash on collection. No deposits. No shipping.
            </p>

            <div className="features">
              <div className="feature">
                <span className="ic">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div>
                  <h4>Verified identity check</h4>
                  <p>
                    Every seller passes an SA ID &amp; selfie match before listing — locking
                    scammers out.
                  </p>
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
                  <h4>Cash on collection only</h4>
                  <p>
                    No upfront payments or deposits — which means no fake receipts and no
                    advance-fee scams.
                  </p>
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
                  <h4>100% hyper-local</h4>
                  <p>
                    Muizenberg through to Simon&rsquo;s Town, Noordhoek to Kommetjie. Your
                    community, not the internet.
                  </p>
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
                    ? "We already have your email on the waitlist. We'll notify you when verification opens in your suburb."
                    : "We've added you to the waitlist. Watch your inbox for an onboarding email as verification opens in your suburb."}
                </p>
                <button className="reset-btn" onClick={() => setStatus('idle')}>
                  Add another email
                </button>
              </div>
            ) : (
              <>
                <h2>Join the waitlist</h2>
                <p className="sub">
                  Get early access the moment listings go live in your suburb.
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
                      placeholder="sarah@peninsula.co.za"
                      autoComplete="email"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="suburb">Your suburb</label>
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
                      'Request invitation'
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
              </>
            )}
          </div>
        </section>

        {/* ── Listings carousel ── */}
        <section className="listings-section wrap">
          <div className="listings-head">
            <div className="lead">
              <h2>A peek at what&rsquo;s coming</h2>
              <p>Recent submissions from verified neighbours getting ready to sell.</p>
            </div>
            <div className="nav-btns">
              <button
                ref={prevBtnRef}
                className="nav-btn"
                aria-label="Previous"
                onClick={() =>
                  railRef.current?.scrollBy({ left: -getCardStep(), behavior: 'smooth' })
                }
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                ref={nextBtnRef}
                className="nav-btn"
                aria-label="Next"
                onClick={() =>
                  railRef.current?.scrollBy({ left: getCardStep(), behavior: 'smooth' })
                }
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={railRef} className="rail">
            {LISTINGS.map((listing, i) => (
              <ListingCard key={i} listing={listing} />
            ))}
          </div>

          <div className="progress">
            <div ref={barRef} className="bar" />
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
