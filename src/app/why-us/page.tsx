import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function WhyUsPage() {
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
              💡 Why Little Orange
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900, color: 'white', marginBottom: '16px',
            }}>
              Why Choose <span style={{color: '#F97316'}}>Us?</span>
            </h1>
            <p style={{color: '#A8A29E', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7}}>
              There are plenty of places to buy groceries online. Here&apos;s why Little Orange is different.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{maxWidth: '1100px', margin: '0 auto', padding: '64px 24px'}}>

          {/* Reasons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px', marginBottom: '80px',
          }}>
            {[
              { emoji: '🌏', title: 'Curated Asian Pantry', desc: 'We focus exclusively on shelf-stable Asian pantry staples. No fillers, no irrelevant products — just the sauces, pastes and bases that matter.' },
              { emoji: '💵', title: 'Pay on Delivery', desc: 'No upfront payment required. Pay with cash or bank transfer when your order arrives at your door. Zero risk.' },
              { emoji: '🚚', title: 'Auckland Delivery', desc: 'We deliver across Auckland. Quick, reliable, and handled with care so your products arrive in perfect condition.' },
              { emoji: '📱', title: 'WhatsApp Confirmation', desc: 'After placing your order, share it instantly via WhatsApp so we can confirm and keep you updated in real time.' },
              { emoji: '🔍', title: 'Track Your Order', desc: 'Know exactly where your order is at all times with our real-time order tracking — from confirmed to delivered.' },
              { emoji: '🛡️', title: 'Quality You Can Trust', desc: 'Every product is personally selected. We only carry items we\'d use in our own kitchens.' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'white', borderRadius: '20px',
                padding: '32px 28px', border: '1.5px solid #F0E0CC',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.25s',
              }}>
                <span style={{fontSize: '40px', display: 'block', marginBottom: '20px'}}>{item.emoji}</span>
                <h3 style={{fontWeight: 800, fontSize: '17px', color: '#1C1917', marginBottom: '10px'}}>{item.title}</h3>
                <p style={{color: '#78716C', fontSize: '14px', lineHeight: 1.75}}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #1C1917, #3C1F0A)',
            borderRadius: '24px', padding: '48px 32px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            <div style={{position: 'relative'}}>
              <h2 style={{fontWeight: 900, fontSize: '1.75rem', color: 'white', marginBottom: '12px'}}>
                Ready to stock your pantry? 🍊
              </h2>
              <p style={{color: '#A8A29E', marginBottom: '28px', fontSize: '15px'}}>
                Browse our full range of authentic Asian pantry essentials.
              </p>
              <a href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#F97316', color: 'white',
                padding: '14px 32px', borderRadius: '14px',
                fontWeight: 700, fontSize: '15px',
                textDecoration: 'none',
              }}>
                Shop Now 🛒
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}