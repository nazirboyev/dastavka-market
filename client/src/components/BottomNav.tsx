import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { IconHome, IconSearch, IconCart, IconProfile, IconOrders } from './Icons';

interface Props {
  mode?: 'user' | 'admin';
}

export default function BottomNav({ mode = 'user' }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, cartCount } = useApp();

  type Tab = { path: string; icon: typeof IconHome; label: string; badge?: number };

  const tabs: Tab[] = mode === 'admin' ? [
    { path: '/admin', icon: IconHome, label: t('home', lang) },
    { path: '/admin/orders', icon: IconOrders, label: t('orders', lang) },
    { path: '/admin/profile', icon: IconProfile, label: t('profile', lang) },
  ] : [
    { path: '/', icon: IconHome, label: t('home', lang) },
    { path: '/search', icon: IconSearch, label: t('search', lang) },
    { path: '/cart', icon: IconCart, label: t('cart', lang), badge: cartCount },
    { path: '/profile', icon: IconProfile, label: t('profile', lang) },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const active = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button key={tab.path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
            <Icon active={active} />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && <span className="nav-badge">{tab.badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}
