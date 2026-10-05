import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { apiPost } from '../api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import LocationPicker from '../components/LocationPicker';

export default function CartPage() {
  const { lang, cart, cartTotal, updateQuantity, removeFromCart, clearCart, user } = useApp();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLocation = (loc: { lat: number; lng: number }, addr: string) => {
    setLocation(loc);
    setAddress(addr);
  };

  const handleOrder = async () => {
    if (!location || !phone || cart.length === 0) return;
    setOrdering(true);
    try {
      await apiPost('/api/orders', {
        userId: user?.id || 'guest',
        userName: user ? `${user.name} ${user.surname}` : 'Mehmon',
        phone,
        items: cart,
        total: cartTotal,
        location,
        address
      });
      clearCart();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setOrdering(false);
  };

  return (
    <div className="app-layout" style={{ paddingBottom: cart.length > 0 ? '160px' : undefined }}>
      <Header />
      <div className="page-content">
        {cart.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p>{t('emptyCart', lang)}</p>
          </div>
        ) : (
          <>
            {cart.map(item => {
              const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
              return (
                <div key={item.id} className="cart-item">
                  {item.image ? (
                    <img className="cart-item-img" src={item.image} alt={item.name} />
                  ) : (
                    <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>
                  )}
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">{Math.round(price).toLocaleString()} so'm</div>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button className="qty-btn" style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 16 }}>
              <div className="form-group">
                <label>{t('phone', lang)}</label>
                <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998" />
              </div>
              <LocationPicker onLocationSelect={handleLocation} />
            </div>

            {success && (
              <div style={{ background: '#dcfce7', color: '#166534', padding: 12, borderRadius: 10, textAlign: 'center', marginTop: 12, fontWeight: 600 }}>
                ✓ {t('orderSuccess', lang)}
              </div>
            )}
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>{t('total', lang)}:</span>
            <span>{Math.round(cartTotal).toLocaleString()} so'm</span>
          </div>
          <button
            className="btn btn-primary"
            disabled={!location || !phone || ordering}
            onClick={handleOrder}
          >
            {t('checkout', lang)}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
