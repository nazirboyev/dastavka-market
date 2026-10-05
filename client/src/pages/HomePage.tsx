import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { IconInstagram, IconTelegram } from '../components/Icons';

export default function HomePage() {
  const { lang, products, banners } = useApp();

  const bestSellers = useMemo(() =>
    [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 10),
    [products]
  );

  const discounts = useMemo(() =>
    products.filter(p => p.discount > 0).slice(0, 10),
    [products]
  );

  return (
    <div className="app-layout">
      <Header showSearch />
      <div className="page-content">
        <Carousel banners={banners} />

        {bestSellers.length > 0 && (
          <>
            <h2 className="section-title">{t('bestSellers', lang)}</h2>
            <div className="product-grid">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}

        {discounts.length > 0 && (
          <>
            <h2 className="section-title">{t('discounts', lang)}</h2>
            <div className="product-grid">
              {discounts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}

        {products.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p>{t('noProducts', lang)}</p>
          </div>
        )}

        <div className="social-links">
          <a href="https://instagram.com/sifatmarket" target="_blank" rel="noopener" className="social-link instagram">
            <IconInstagram /> {t('instagram', lang)}
          </a>
          <a href="https://t.me/sifatmarket" target="_blank" rel="noopener" className="social-link telegram">
            <IconTelegram /> {t('telegram', lang)}
          </a>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
