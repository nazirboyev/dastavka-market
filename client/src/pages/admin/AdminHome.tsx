import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';
import { apiUpload, apiDelete } from '../../api';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { Banner } from '../../types';

export default function AdminHome() {
  const { lang, banners, refreshBanners, refreshProducts } = useApp();
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', discount: '0' });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const slots = Array.from({ length: 6 }, (_, i) => banners[i] || null);

  const handleBannerUpload = async (file: File, bannerId?: string) => {
    const fd = new FormData();
    fd.append('image', file);
    if (bannerId) {
      await apiUpload(`/api/banners/${bannerId}`, fd, 'PUT');
    } else {
      await apiUpload('/api/banners', fd);
    }
    refreshBanners();
    setEditingBanner(null);
  };

  const handleBannerDelete = async (id: string) => {
    await apiDelete(`/api/banners/${id}`);
    refreshBanners();
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) return;
    const fd = new FormData();
    fd.append('name', productForm.name);
    fd.append('price', productForm.price);
    fd.append('description', productForm.description);
    fd.append('discount', productForm.discount);
    if (productImage) fd.append('image', productImage);
    await apiUpload('/api/products', fd);
    setProductForm({ name: '', price: '', description: '', discount: '0' });
    setProductImage(null);
    setPreview('');
    refreshProducts();
  };

  const handleImageSelect = (file: File) => {
    setProductImage(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="app-layout">
      <Header showSearch searchValue={search} onSearchChange={setSearch} showLogout onLogout={() => {
        localStorage.removeItem('isAdmin');
        window.location.href = '/';
      }} />
      <div className="page-content">
        <h2 className="section-title">Reklama rasmlari</h2>
        {slots.map((banner, i) => (
          <div key={banner?.id || `empty-${i}`} className="admin-banner-slot">
            {banner ? (
              <>
                <img src={banner.image} alt="" />
                <div className="admin-banner-actions">
                  <button onClick={() => { setEditingBanner(banner.id); fileRef.current?.click(); }}>{t('changeBanner', lang)}</button>
                  <button onClick={() => handleBannerDelete(banner.id)}>{t('removeBanner', lang)}</button>
                </div>
              </>
            ) : (
              banners.length < 6 && (
                <button className="btn btn-outline" onClick={() => { setEditingBanner(null); fileRef.current?.click(); }}>
                  + {t('addBanner', lang)}
                </button>
              )
            )}
          </div>
        ))}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleBannerUpload(file, editingBanner || undefined);
            e.target.value = '';
          }}
        />

        <div className="admin-product-form">
          <h2 className="section-title">{t('addProduct', lang)}</h2>
          <div className="image-picker" onClick={() => productFileRef.current?.click()}>
            {preview ? <img src={preview} alt="" /> : (
              <div className="image-picker-btns">
                <button type="button" onClick={e => { e.stopPropagation(); productFileRef.current?.setAttribute('capture', 'environment'); productFileRef.current?.click(); }}>
                  📷 {t('takePhoto', lang)}
                </button>
                <button type="button" onClick={e => { e.stopPropagation(); productFileRef.current?.removeAttribute('capture'); productFileRef.current?.click(); }}>
                  🖼 {t('fromGallery', lang)}
                </button>
              </div>
            )}
          </div>
          <input ref={productFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); e.target.value = ''; }} />

          <div className="form-group">
            <label>{t('productName', lang)}</label>
            <input className="form-input" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{t('price', lang)}</label>
            <input className="form-input" type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Chegirma (%)</label>
            <input className="form-input" type="number" value={productForm.discount} onChange={e => setProductForm(p => ({ ...p, discount: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{t('description', lang)}</label>
            <textarea className="form-input" rows={3} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={handleAddProduct}>{t('addProduct', lang)}</button>
        </div>
      </div>
      <BottomNav mode="admin" />
    </div>
  );
}
