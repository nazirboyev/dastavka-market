import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';

export default function SearchPage() {
  const { lang, products } = useApp();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="app-layout">
      <Header showSearch searchValue={query} onSearchChange={setQuery} />
      <div className="page-content">
        {filtered.length > 0 ? (
          <div className="product-grid" style={{ marginTop: 12 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>{t('noProducts', lang)}</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
