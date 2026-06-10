export default function Footer() {
  return (
    <footer style={{background: '#1C1917', marginTop: '64px'}}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '48px 24px 32px',
      }}>

        {/* Top section */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '32px',
          marginBottom: '40px',
        }}>

          {/* Brand */}
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
              <span style={{fontSize: '28px'}}>🍊</span>
              <span style={{fontWeight: 900, fontSize: '20px', color: 'white'}}>Little Orange</span>
            </div>
            <p style={{fontSize: '13px', color: '#A8A29E', maxWidth: '240px', lineHeight: 1.6}}>
              Specialty Asian pantry essentials — delivered fresh to your Auckland doorstep.
            </p>
          </div>

          {/* Info columns */}
          <div style={{display: 'flex', gap: '48px', flexWrap: 'wrap'}}>
           <div>
                <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'}}>
                  Pages
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {[
                    { href: '/', label: 'Shop' },
                    { href: '/about', label: 'About Us' },
                    { href: '/why-us', label: 'Why Us' },
                    { href: '/faq', label: 'FAQ' },
                    { href: '/contact', label: 'Contact' },
                    { href: '/track', label: 'Track Order' },
                  ].map(link => (
                    <a 
                      key={link.href} 
                      href={link.href} 
                      className="text-[13px] text-[#78716C] no-underline transition-colors duration-200 hover:text-[#F97316]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            <div>
              <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'}}>
                Info
              </p>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {[
                  { icon: '🚚', text: 'Auckland delivery' },
                  { icon: '💵', text: 'Cash on delivery' },
                  { icon: '🏦', text: 'Bank transfer' },
                  { icon: '📦', text: 'Track your order' },
                ].map(item => (
                  <span key={item.text} style={{fontSize: '13px', color: '#78716C', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <span>{item.icon}</span>{item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{borderTop: '1px solid #292524', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px'}}>
          <p style={{fontSize: '12px', color: '#57534E'}}>
            © {new Date().getFullYear()} Little Orange. All rights reserved.
          </p>
          <p style={{fontSize: '12px', color: '#57534E'}}>
            Made with 🍊 in Auckland, NZ
          </p>
        </div>
      </div>
    </footer>
  )
}