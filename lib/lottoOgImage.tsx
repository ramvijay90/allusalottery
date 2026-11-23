import { ImageResponse } from 'next/og';

export interface LottoOgOptions {
  badge: string;
  title: string;
  subtitle: string;
  pills?: string[];
  jackpot?: string;
  numbers?: string[];
  powerBall?: string;
  gradient?: string;
}

export function renderLottoOgImage(opts: LottoOgOptions): ImageResponse {
  const bg = opts.gradient || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #020617 100%)';
  const pills = opts.pills && opts.pills.length > 0 ? opts.pills : ['Live Drawings', 'Official Winning Numbers', 'Verified Results'];

  return new ImageResponse(
    (
      <div
        style={{
          background: bg,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          padding: '40px 50px',
          position: 'relative',
        }}
      >
        {/* Top Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 24px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            color: '#fbbf24',
            fontSize: '20px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          {opts.badge}
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: '900',
            margin: '0',
            textAlign: 'center',
            letterSpacing: '-1px',
            maxWidth: '1000px',
            lineHeight: 1.15,
          }}
        >
          {opts.title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#93c5fd',
            margin: '14px 0 20px 0',
            textAlign: 'center',
            fontWeight: '500',
          }}
        >
          {opts.subtitle}
        </p>

        {/* Number Balls Preview if provided */}
        {opts.numbers && opts.numbers.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              margin: '10px 0 20px 0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {opts.numbers.slice(0, 6).map((num, i) => (
              <div
                key={i}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '28px',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                }}
              >
                {num}
              </div>
            ))}
            {opts.powerBall && (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #ffffff',
                  boxShadow: '0 8px 24px rgba(220,38,38,0.5)',
                }}
              >
                {opts.powerBall}
              </div>
            )}
          </div>
        )}

        {/* Jackpot / Info Pills */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            marginTop: '12px',
          }}
        >
          {opts.jackpot && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 18px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.6)',
                color: '#fca5a5',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              Jackpot: {opts.jackpot}
            </div>
          )}
          {pills.map((pill, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {pill}
            </div>
          ))}
        </div>

        {/* Footer Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            fontSize: '18px',
            color: '#64748b',
            letterSpacing: '1px',
            fontWeight: 'bold',
          }}
        >
          ALLUSALOTTERY.COM • OFFICIAL RESULTS
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
