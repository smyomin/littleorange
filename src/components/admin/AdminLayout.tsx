'use client'
import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package,
  Tag, Settings, LogOut, Menu, Users, ChevronRight
} from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'staff'
}

const ALL_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['owner', 'admin', 'staff'] },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} />, roles: ['owner', 'admin', 'staff'] },
  { href: '/admin/products', label: 'Products', icon: <Package size={18} />, roles: ['owner', 'admin'] },
  { href: '/admin/categories', label: 'Categories', icon: <Tag size={18} />, roles: ['owner', 'admin'] },
  { href: '/admin/inventory', label: 'Inventory', icon: <Package size={18} />, roles: ['owner', 'admin', 'staff'] },
  { href: '/admin/users', label: 'Admin Users', icon: <Users size={18} />, roles: ['owner'] },
  { href: '/admin/settings', label: 'Settings', icon: <Settings size={18} />, roles: ['owner'] },
]

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  owner: { label: 'Owner', color: '#D97706', bg: '#FEF3C7' },
  admin: { label: 'Admin', color: '#2563EB', bg: '#DBEAFE' },
  staff: { label: 'Staff', color: '#16A34A', bg: '#DCFCE7' },
}

export default function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const authed = localStorage.getItem('admin_authed')
    const userStr = localStorage.getItem('admin_user')
    if (!authed) {
      router.push('/admin')
      return
    }
    if (userStr) {
      setAdminUser(JSON.parse(userStr))
    }
  }, [router])

  function logout() {
    localStorage.removeItem('admin_authed')
    localStorage.removeItem('admin_user')
    router.push('/admin')
  }

  const nav = ALL_NAV.filter(item =>
    adminUser ? item.roles.includes(adminUser.role) : false
  )

  const roleBadge = adminUser ? ROLE_BADGE[adminUser.role] : null

  const Sidebar = () => (
    <div style={{
      width: '240px', background: '#1C1917',
      display: 'flex', flexDirection: 'column',
      height: '100%', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{padding: '24px 20px', borderBottom: '1px solid #292524'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span style={{fontSize: '24px'}}>🍊</span>
          <div>
            <p style={{fontWeight: 900, fontSize: '15px', color: 'white'}}>Little Orange</p>
            <p style={{fontSize: '11px', color: '#78716C'}}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 600,
              textDecoration: 'none',
              background: active ? '#F97316' : 'transparent',
              color: active ? 'white' : '#A8A29E',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#292524' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div style={{padding: '16px 12px', borderTop: '1px solid #292524'}}>
        {adminUser && (
          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: '#292524', marginBottom: '8px',
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}}>
              <p style={{fontSize: '13px', fontWeight: 700, color: 'white'}}>{adminUser.name}</p>
              {roleBadge && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                  borderRadius: '999px', background: roleBadge.bg, color: roleBadge.color,
                }}>
                  {roleBadge.label}
                </span>
              )}
            </div>
            <p style={{fontSize: '11px', color: '#78716C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{adminUser.email}</p>
          </div>
        )}
        <a href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 600, color: '#78716C',
          textDecoration: 'none', marginBottom: '4px',
        }}>
          <ChevronRight size={16} /> View Store
        </a>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 600, color: '#78716C',
          background: 'none', border: 'none', cursor: 'pointer', width: '100%',
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div style={{display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F5F4'}}>
      {/* Desktop Sidebar */}
      <div style={{display: 'none'}} className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
          }} />
          <div style={{position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 50}}>
            <Sidebar />
          </div>
        </>
      )}

      {/* Main */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {/* Top bar */}
        <div style={{
          background: 'white', borderBottom: '1.5px solid #F0E0CC',
          padding: '0 24px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-menu-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#78716C', display: 'none',
              }}
            >
              <Menu size={22} />
            </button>
            <h1 style={{fontWeight: 900, fontSize: '18px', color: '#1C1917'}}>{title}</h1>
          </div>
          {adminUser && roleBadge && (
            <span style={{
              fontSize: '12px', fontWeight: 700,
              padding: '4px 12px', borderRadius: '999px',
              background: roleBadge.bg, color: roleBadge.color,
            }}>
              {roleBadge.label}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{flex: 1, overflowY: 'auto', padding: '32px 24px'}}>
          {children}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: flex !important; }
          .admin-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .admin-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}