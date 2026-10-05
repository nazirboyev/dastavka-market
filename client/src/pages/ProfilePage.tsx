import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t, langLabels } from '../i18n';
import { apiPost } from '../api';
import { Lang, Order } from '../types';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AuthModal from '../components/AuthModal';
import { IconArrow } from '../components/Icons';

export default function ProfilePage() {
  const { lang, setLang, user, orders, refreshOrders } = useApp();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [view, setView] = useState<'menu' | 'orders' | 'chat' | 'lang'>('menu');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; from: string; createdAt: string }[]>([]);

  const activeOrders = orders.filter(o =>
    o.status === 'pending' || o.status === 'delivering'
  );

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(t('confirmCancel', lang))) return;
    await apiPost(`/api/orders/${orderId}/cancel`);
    refreshOrders();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    await apiPost('/api/messages', {
      userId: user.id,
      userName: `${user.name} ${user.surname}`,
      text: message,
      from: 'user'
    });
    setChatMessages(prev => [...prev, { text: message, from: 'user', createdAt: new Date().toISOString() }]);
    setMessage('');
  };

  const loadChat = async () => {
    if (!user) return;
    const msgs = await fetch(`/api/messages/${user.id}`).then(r => r.json());
    setChatMessages(msgs);
    setView('chat');
  };

  const statusLabel = (status: Order['status']) => {
    const map: Record<string, string> = {
      pending: t('pending', lang),
      delivering: t('onTheWay', lang),
      delivered: t('delivered', lang),
      cancelled: t('cancelled', lang)
    };
    return map[status] || status;
  };

  if (view === 'orders') {
    return (
      <div className="app-layout">
        <Header />
        <div className="page-content">
          <button onClick={() => setView('menu')} style={{ background: 'none', fontSize: 14, color: 'var(--primary)', marginBottom: 12 }}>← {t('profile', lang)}</button>
          <h2 className="section-title">{t('myOrders', lang)}</h2>
          {activeOrders.length === 0 ? (
            <div className="empty-state"><p>{t('emptyOrders', lang)}</p></div>
          ) : (
            activeOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span style={{ fontSize: 13, color: '#666' }}>{new Date(order.createdAt).toLocaleString()}</span>
                  <span className={`order-status status-${order.status}`}>{statusLabel(order.status)}</span>
                </div>
                {order.items.map(item => (
                  <div key={item.id} style={{ fontSize: 14, marginBottom: 4 }}>
                    {item.name} × {item.quantity}
                  </div>
                ))}
                <div style={{ fontWeight: 700, marginTop: 8 }}>{order.total.toLocaleString()} so'm</div>
                {(order.status === 'pending' || order.status === 'delivering') && (
                  <button className="btn btn-danger" style={{ marginTop: 10, width: '100%', padding: '8px' }} onClick={() => handleCancelOrder(order.id)}>
                    {t('cancelOrder', lang)}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (view === 'chat') {
    return (
      <div className="app-layout">
        <Header />
        <div className="page-content" style={{ padding: 0 }}>
          <button onClick={() => setView('menu')} style={{ background: 'none', fontSize: 14, color: 'var(--primary)', padding: '12px' }}>← {t('profile', lang)}</button>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.from}`}>{m.text}</div>
              ))}
            </div>
            <div className="chat-input-bar">
              <input value={message} onChange={e => setMessage(e.target.value)} placeholder={t('typeMessage', lang)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage}>➤</button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (view === 'lang') {
    return (
      <div className="app-layout">
        <Header />
        <div className="page-content">
          <button onClick={() => setView('menu')} style={{ background: 'none', fontSize: 14, color: 'var(--primary)', marginBottom: 12 }}>← {t('profile', lang)}</button>
          <h2 className="section-title">{t('changeLang', lang)}</h2>
          <div className="lang-selector">
            {(Object.keys(langLabels) as Lang[]).map(l => (
              <button key={l} className={`lang-option ${lang === l ? 'active' : ''}`} onClick={() => { setLang(l); setView('menu'); }}>
                {langLabels[l]}
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header showAuth onLoginClick={() => setShowAuth(true)} />
      <div className="page-content">
        {user && (
          <div style={{ background: 'white', borderRadius: 12, padding: 16, marginTop: 12, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name} {user.surname}</div>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{user.phone}</div>
          </div>
        )}

        <div className="profile-menu">
          <div className="profile-menu-item" onClick={() => { refreshOrders(); setView('orders'); }}>
            {t('myOrders', lang)}
            {activeOrders.length > 0 && <span className="badge-count">{activeOrders.length}</span>}
            <IconArrow />
          </div>
          <div className="profile-menu-item" onClick={loadChat}>
            {t('contactDev', lang)}
            <IconArrow />
          </div>
          <div className="profile-menu-item" onClick={() => setView('lang')}>
            {t('changeLang', lang)}
            <IconArrow />
          </div>
        </div>
      </div>
      <BottomNav />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
