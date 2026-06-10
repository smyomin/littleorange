import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFBF5'}}>
      <Header />

      <main style={{flex: 1}}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1C1917 0%, #292524 60%, #3C1F0A 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '400px', height: '400px', opacity: 0.15,
            background: 'radial-gradient(circle at top right, #F97316, transparent 65%)',
          }} />
          <div style={{
            position: 'relative', maxWidth: '1100px',
            margin: '0 auto', padding: '64px 24px', textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '999px',
              background: 'rgba(249,115,22,0.15)',
              border: '1px solid rgba(249,115,22,0.25)',
              color: '#FDBA74', fontSize: '12px', fontWeight: 700,
              marginBottom: '20px',
            }}>
              🍊 Our Story
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900, color: 'white', marginBottom: '16px',
            }}>
              About <span style={{color: '#F97316'}}>Little Orange</span>
            </h1>
            <p style={{color: '#A8A29E', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7}}>
              Bringing the bold, authentic flavours of Asia straight to your Auckland kitchen.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{maxWidth: '1100px', margin: '0 auto', padding: '64px 24px'}}>

          {/* Story */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px', alignItems: 'center', marginBottom: '80px',
          }}>
            <div>
              <p style={{
                fontSize: '11px', fontWeight: 700, color: '#F97316',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px',
              }}>
                Who We Are
              </p>
              <h2 style={{fontSize: '1.75rem', fontWeight: 900, color: '#1C1917', marginBottom: '16px', lineHeight: 1.3}}>
                Passion for Authentic Asian Flavours
              </h2>
              <p style={{color: '#78716C', lineHeight: 1.8, fontSize: '15px', marginBottom: '12px'}}>
                Little Orange was born from a simple love of bold, authentic Asian cooking. We noticed how hard it was to find quality pantry staples — real mala paste, proper tom yam, genuine curry bases — in Auckland supermarkets.
              </p>
              <p style={{color: '#78716C', lineHeight: 1.8, fontSize: '15px'}}>
                So we built Little Orange to bridge that gap. Every product we carry is handpicked for quality, authenticity, and flavour. No compromises, no bland substitutes — just the real thing, delivered to your door.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
              borderRadius: '24px', padding: '48px',
              textAlign: 'center', border: '1.5px solid #F0E0CC',
            }}>
              <span style={{fontSize: '80px', display: 'block', marginBottom: '16px'}}>🍊</span>
              <p style={{fontWeight: 900, fontSize: '1.25rem', color: '#1C1917', marginBottom: '8px'}}>
                Little Orange
              </p>
              <p style={{color: '#78716C', fontSize: '14px'}}>
                Auckland&apos;s Asian Pantry Essentials
              </p>
            </div>
          </div>

          {/* Values */}
          <div style={{marginBottom: '80px'}}>
            <p style={{
              fontSize: '11px', fontWeight: 700, color: '#F97316',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '12px', textAlign: 'center',
            }}>
              What We Stand For
            </p>
            <h2 style={{
              fontSize: '1.75rem', fontWeight: 900, color: '#1C1917',
              marginBottom: '40px', textAlign: 'center',
            }}>
              Our Values
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
            }}>
              {[
                { emoji: '🌶️', title: 'Authenticity', desc: 'Every product is sourced for genuine flavour — no watered-down versions of your favourite Asian staples.' },
                { emoji: '🤝', title: 'Community', desc: 'We\'re proud to serve Auckland\'s diverse Asian community and food lovers who appreciate bold flavours.' },
                { emoji: '📦', title: 'Convenience', desc: 'From browsing to doorstep delivery, we make getting your pantry essentials effortless.' },
                { emoji: '✅', title: 'Quality', desc: 'We personally try every product before listing it. If we wouldn\'t cook with it, we won\'t sell it.' },
              ].map(item => (
                <div key={item.title} style={{
                  background: 'white', borderRadius: '20px',
                  padding: '28px 24px', border: '1.5px solid #F0E0CC',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  <span style={{fontSize: '36px', display: 'block', marginBottom: '16px'}}>{item.emoji}</span>
                  <h3 style={{fontWeight: 800, fontSize: '16px', color: '#1C1917', marginBottom: '8px'}}>{item.title}</h3>
                  <p style={{color: '#78716C', fontSize: '13px', lineHeight: 1.7}}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}