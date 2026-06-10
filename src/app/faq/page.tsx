'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Simply browse our products, add items to your cart, and proceed to checkout. Fill in your delivery details and place your order — no account needed.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept cash on delivery and bank transfer on delivery. No upfront online payment is required. You only pay when your order arrives.',
  },
  {
    q: 'Where do you deliver?',
    a: 'We currently deliver across Auckland. If you\'re unsure whether we deliver to your area, feel free to contact us before placing an order.',
  },
  {
    q: 'What is the minimum order amount?',
    a: 'Our minimum order amount is NZ$30. A delivery fee applies per order — you can see the exact amount at checkout.',
  },
  {
    q: 'How long does delivery take?',
    a: 'We aim to deliver within 1–3 business days after your order is confirmed. You\'ll receive updates on your order status and can track it anytime.',
  },
  {
    q: 'How do I track my order?',
    a: 'You can track your order anytime using the Track Order page. Just enter your order number or email address to see the latest status.',
  },
  {
    q: 'What if I receive a damaged or wrong item?',
    a: 'Please contact us immediately via WhatsApp or email with a photo of the issue. We\'ll resolve it promptly with a replacement or refund.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'Please contact us as soon as possible if you need to change or cancel your order. We\'ll do our best to accommodate requests before dispatch.',
  },
  {
    q: 'Are your products authentic?',
    a: 'Yes — every product is personally selected for authenticity and quality. We only carry items we trust and use ourselves.',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

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
              ❓ Got Questions?
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900, color: 'white', marginBottom: '16px',
            }}>
              Frequently Asked <span style={{color: '#F97316'}}>Questions</span>
            </h1>
            <p style={{color: '#A8A29E', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7}}>
              Everything you need to know about ordering from Little Orange.
            </p>
          </div>
        </div>

        {/* FAQ List */}
        <div style={{maxWidth: '760px', margin: '0 auto', padding: '64px 24px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'white', borderRadius: '16px',
                  border: `1.5px solid ${open === i ? '#F97316' : '#F0E0CC'}`,
                  overflow: 'hidden', transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', background: 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px',
                  }}
                >
                  <span style={{fontWeight: 700, fontSize: '15px', color: '#1C1917'}}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    style={{
                      color: '#F97316', flexShrink: 0,
                      transform: open === i ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                {open === i && (
                  <div style={{
                    padding: '0 24px 20px',
                    color: '#78716C', fontSize: '14px', lineHeight: 1.8,
                    borderTop: '1px solid #F0E0CC',
                    paddingTop: '16px',
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}