'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    if (!form.name || !form.email || !form.message) {
      alert('Please fill in all fields.')
      return
    }
    const text = `Hi Little Orange! 👋\n\nName: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    setSent(true)
  }

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
              📬 Get In Touch
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900, color: 'white', marginBottom: '16px',
            }}>
              Contact <span style={{color: '#F97316'}}>Us</span>
            </h1>
            <p style={{color: '#A8A29E', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7}}>
              Have a question or need help with your order? We&apos;d love to hear from you.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{maxWidth: '1100px', margin: '0 auto', padding: '64px 24px'}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px',
          }}>

            {/* Contact Info */}
            <div>
              <h2 style={{fontWeight: 900, fontSize: '1.35rem', color: '#1C1917', marginBottom: '24px'}}>
                Get in touch
              </h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                {[
                  { icon: <MessageCircle size={20} />, title: 'WhatsApp', desc: 'Chat with us directly for the fastest response.', },
                  { icon: <Mail size={20} />, title: 'Email', desc: 'Send us an email and we\'ll get back to you shortly.', },
                  { icon: <MapPin size={20} />, title: 'Location', desc: 'Delivering across Auckland, New Zealand.', },
                  { icon: <Clock size={20} />, title: 'Hours', desc: 'Mon–Sat: 9am – 6pm\nSun: 10am – 4pm', },
                ].map(item => (
                  <div key={item.title} style={{display: 'flex', gap: '16px', alignItems: 'flex-start'}}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: '#FFF7ED', border: '1.5px solid #F0E0CC',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#F97316', flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{fontWeight: 700, fontSize: '14px', color: '#1C1917', marginBottom: '4px'}}>{item.title}</p>
                      <p style={{fontSize: '13px', color: '#78716C', lineHeight: 1.6, whiteSpace: 'pre-line'}}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{
              background: 'white', borderRadius: '24px',
              padding: '36px', border: '1.5px solid #F0E0CC',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              {sent ? (
                <div style={{textAlign: 'center', padding: '32px 0'}}>
                  <span style={{fontSize: '56px', display: 'block', marginBottom: '16px'}}>🎉</span>
                  <h3 style={{fontWeight: 900, fontSize: '1.25rem', color: '#1C1917', marginBottom: '8px'}}>Message Sent!</h3>
                  <p style={{color: '#78716C', fontSize: '14px'}}>Thanks for reaching out. We&apos;ll get back to you soon.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}
                    style={{
                      marginTop: '20px', background: '#F97316', color: 'white',
                      border: 'none', borderRadius: '12px', padding: '10px 24px',
                      fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                    }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{fontWeight: 900, fontSize: '1.35rem', color: '#1C1917', marginBottom: '24px'}}>
                    Send a message
                  </h2>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {[
                      { name: 'name', label: 'Your Name', placeholder: 'John Smith', type: 'input' },
                      { name: 'email', label: 'Email Address', placeholder: 'john@email.com', type: 'input' },
                    ].map(field => (
                      <div key={field.name}>
                        <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>
                          {field.label}
                        </label>
                        <input
                          name={field.name}
                          value={form[field.name as keyof typeof form]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          style={{
                            width: '100%', padding: '12px 16px',
                            borderRadius: '12px', border: '2px solid #F0E0CC',
                            fontSize: '14px', color: '#1C1917',
                            background: '#FFFBF5', outline: 'none',
                            boxSizing: 'border-box',
                          }}
                          onFocus={e => (e.target.style.borderColor = '#F97316')}
                          onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        rows={4}
                        style={{
                          width: '100%', padding: '12px 16px',
                          borderRadius: '12px', border: '2px solid #F0E0CC',
                          fontSize: '14px', color: '#1C1917',
                          background: '#FFFBF5', outline: 'none',
                          resize: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#F97316')}
                        onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      style={{
                        width: '100%', background: '#F97316', color: 'white',
                        border: 'none', borderRadius: '12px', padding: '14px',
                        fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#EA6C0A')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#F97316')}
                    >
                      Send via WhatsApp 💬
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}