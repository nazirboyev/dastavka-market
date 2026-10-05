import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';
import { apiPost, apiPatch } from '../../api';
import { Order } from '../../types';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { openGoogleMapsRoute, getDistanceMeters } from '../../components/LocationPicker';

export default function AdminOrders() {
  const { lang, orders, refreshOrders } = useApp();
  const [nearbyOrders, setNearbyOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    refreshOrders();
    const interval = setInterval(refreshOrders, 5000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const check = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        const near = new Set<string>();
        orders.forEach(o => {
          if (o.status === 'delivering' && o.location) {
            const dist = getDistanceMeters(pos.coords.latitude, pos.coords.longitude, o.location.lat, o.location.lng);
            if (dist <= 50) near.add(o.id);
          }
        });
        setNearbyOrders(near);
      });
    };
    check();
    const timer = setInterval(check, 10000);
    return () => clearInterval(timer);
  }, [orders]);

  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');

  const handleDeliver = async (id: string) => {
    await apiPost(`/api/orders/${id}/deliver`);
    refreshOrders();
  };

  const handleStartDelivery = async (id: string) => {
    await apiPatch(`/api/orders/${id}`, { status: 'delivering' });
    refreshOrders();
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

  return (
    <div className="app-layout">
      <Header showLogout onLogout={() => { localStorage.removeItem('isAdmin'); window.location.href = '/'; }} />
      <div className="page-content">
        <h2 className="section-title">{t('orders', lang)}</h2>
        {activeOrders.length === 0 ? (
          <div className="empty-state"><p>{t('emptyOrders', lang)}</p></div>
        ) : (
          activeOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <div style={{ fontWeight: 600 }}>{order.userName}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>{order.phone}</div>
                </div>
                <span className={`order-status status-${order.status}`}>{statusLabel(order.status)}</span>
              </div>

              {order.items.map(item => (
                <div key={item.id} style={{ fontSize: 14, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{Math.round(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8, color: 'var(--primary)' }}>
                {t('total', lang)}: {order.total.toLocaleString()} so'm
              </div>

              {order.address && (
                <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>📍 {order.address}</div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {order.location && (
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '8px', fontSize: 13 }}
                    onClick={() => openGoogleMapsRoute(order.location.lat, order.location.lng)}
                  >
                    📍 {t('viewLocation', lang)}
                  </button>
                )}
                {order.status === 'pending' && (
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: 13 }} onClick={() => handleStartDelivery(order.id)}>
                    🚚 {t('onTheWay', lang)}
                  </button>
                )}
                {(order.status === 'delivering' || nearbyOrders.has(order.id)) && (
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: 13, background: 'var(--success)' }} onClick={() => handleDeliver(order.id)}>
                    ✓ {nearbyOrders.has(order.id) ? t('courierNear', lang) : t('markDelivered', lang)}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav mode="admin" />
    </div>
  );
}
