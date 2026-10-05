import { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

interface Props {
  product: Product;
}

function formatPrice(price: number) {
  return price.toLocaleString('uz-UZ');
}

export default function ProductCard({ product }: Props) {
  const { lang, addToCart } = useApp();
  const [added, setAdded] = useState(false);

  const finalPrice = product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <div className="product-card-img">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: 0.2 }}>📦</div>
        )}
        {product.discount > 0 && (
          <span className="discount-badge">-{product.discount}%</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-name">{product.name}</div>
        <div className="product-price">
          {formatPrice(finalPrice)}
          <span className="format-price" />
          {product.discount > 0 && (
            <span className="product-price-old">{formatPrice(product.price)}</span>
          )}
        </div>
        <button className={`add-cart-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
          {added ? '✓' : t('addToCart', lang)}
        </button>
      </div>
    </div>
  );
}
