import { useState, useEffect } from 'react';
import { Banner } from '../types';

interface Props {
  banners: Banner[];
}

export default function Carousel({ banners }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="carousel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        Sifat Market
      </div>
    );
  }

  return (
    <div className="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map(b => (
          <div key={b.id} className="carousel-slide">
            <img src={b.image} alt="Banner" />
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="carousel-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
