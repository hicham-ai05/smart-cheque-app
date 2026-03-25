import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2, Users, UserSquare2, CreditCard, FileText,
  ArrowDownToLine, ArrowUpRight, Activity, Settings2
} from 'lucide-react';

const mainNavItems = [
  { path: '/banques', label: 'BANQUES', icon: Building2 },
  { path: '/destinataires', label: 'DESTINATAIRES', icon: Users },
  { path: '/clients', label: 'CLIENTS', icon: UserSquare2 },
  { path: '/cheques', label: 'CHÈQUES', icon: CreditCard },
  { path: '/effets', label: 'EFFETS', icon: FileText },
  { path: '/encaissement', label: 'ENCAISSEMENT', icon: ArrowDownToLine },
  { path: '/decaissement', label: 'DÉCAISSEMENT', icon: ArrowUpRight },
  { path: '/consultation', label: 'CONSULTATION', icon: Activity },
  { path: '/templates', label: 'MODÈLES', icon: Settings2 },
];

const linkStyle = (isActive) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6rem',
  padding: '1rem',
  textDecoration: 'none',
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '12px',
  margin: '0.5rem 1rem',
  height: '85px',
  backgroundColor: isActive ? 'var(--accent-active-bg)' : 'var(--bg-element)',
  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
  boxShadow: isActive ? '0 4px 12px rgba(249, 115, 22, 0.15)' : 'none',
});

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>$</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.02em' }}>SMART</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chèques & Effets</div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
        {mainNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/consultation'}
            style={({ isActive }) => linkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))' : 'none' }} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        <div style={styles.userProfile}>
          <div style={styles.avatar}>A</div>
          <div>
            <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Administrateur</p>
            <p style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
              Connecté
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '180px',
    minWidth: '180px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-main)',
    backgroundImage: 'linear-gradient(to bottom, rgba(39, 39, 42, 0.3), transparent)',
    boxShadow: '4px 0 24px -10px rgba(0,0,0,0.5)',
    zIndex: 10
  },
  logo: {
    padding: '1.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-light)',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  logoIcon: {
    width: '42px', height: '42px',
    background: 'linear-gradient(135deg, var(--accent-primary), #ea580c)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '1.4rem',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid var(--border-light)',
    background: 'rgba(24, 24, 27, 0.5)',
  },
  userProfile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'center'
  },
  avatar: {
    width: '36px', height: '36px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-element-hover)',
    border: '1px solid var(--border-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '1rem',
  }
};
