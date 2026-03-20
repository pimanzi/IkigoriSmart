const BRAND = '#04966a';
const BRAND_DARK = '#037d59';
const BRAND_LIGHT = '#f0fdf4';

const App = () => {
  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(160deg, ${BRAND_LIGHT} 0%, #ffffff 55%, ${BRAND_LIGHT} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 380, height: 380, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(4,150,106,0.10) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -140, left: -140,
        width: 460, height: 460, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(4,150,106,0.07) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div style={{ textAlign: 'center', maxWidth: 440, width: '100%', zIndex: 1 }}>

        {/* Animated checkmark icon */}
        <div className="icon-wrap" style={{ marginBottom: 36 }}>
          {/* Outer glow ring */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `rgba(4,150,106,0.12)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: `linear-gradient(145deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 12px 40px rgba(4,150,106,0.35)`,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand wordmark */}
        <div className="content">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: `rgba(4,150,106,0.08)`,
            borderRadius: 999, padding: '4px 14px',
            marginBottom: 20,
          }}>
            {/* Leaf icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill={BRAND}>
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 8 10 11 10 12c0 0 0-4 7-4z"/>
            </svg>
            <span style={{
              fontSize: 11, fontWeight: 700, color: BRAND,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              IkigoriSmart
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 34, fontWeight: 800, color: '#111827',
            lineHeight: 1.15, letterSpacing: '-0.6px',
            margin: '0 0 8px',
          }}>
            Email Confirmed!
          </h1>
          <p style={{
            fontSize: 17, fontWeight: 600, color: BRAND,
            margin: '0 0 28px', letterSpacing: '-0.2px',
          }}>
            Imeyili Yemejwe Neza!
          </p>

          {/* Accent rule */}
          <div style={{
            width: 40, height: 3,
            background: `linear-gradient(90deg, ${BRAND}, #10b981)`,
            borderRadius: 2, margin: '0 auto 32px',
          }} />

          {/* Body — English */}
          <p style={{
            fontSize: 15, color: '#374151', lineHeight: 1.75,
            margin: '0 0 14px',
          }}>
            Your account is now active. Return to the{' '}
            <strong style={{ color: '#111827' }}>IkigoriSmart</strong> app
            and log in to start protecting your maize crops.
          </p>

          {/* Body — Kinyarwanda */}
          <p style={{
            fontSize: 15, color: '#6B7280', lineHeight: 1.75,
            margin: '0 0 44px',
          }}>
            Konti yawe irakora. Subira muri porogaramu ya{' '}
            <strong style={{ color: '#374151' }}>IkigoriSmart</strong>{' '}
            ukinjire kugira ngo utangire kurinda ibigori byawe.
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: '#F3F4F6', margin: '0 0 24px' }} />

          {/* Footer note */}
          <p style={{
            fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: '0 0 20px',
          }}>
            If you didn't create this account, please ignore this page.
            <br />
            Niba utaremye iyi konti, wirengagize iyi paji.
          </p>

          {/* Copyright */}
          <p style={{ fontSize: 11, color: '#D1D5DB', margin: 0 }}>
            © 2026 IkigoriSmart · Musanze &amp; Nyabihu, Rwanda
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
