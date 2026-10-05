import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { apiPost } from '../api';

interface Props {
  onClose: () => void;
}

type Step = 'choose' | 'admin-login' | 'user-login' | 'user-register';

export default function AuthModal({ onClose }: Props) {
  const { lang, setUser, setIsAdmin } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('choose');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = async () => {
    try {
      const res = await apiPost<{ success: boolean }>('/api/auth/admin', { login, password });
      if (res.success) {
        setIsAdmin(true);
        onClose();
        navigate('/admin');
      }
    } catch {
      setError('Login yoki parol noto\'g\'ri');
    }
  };

  const handleUserLogin = async () => {
    try {
      const res = await apiPost<{ user: { id: string; name: string; surname: string; phone: string } }>(
        '/api/auth/login', { phone, password }
      );
      setUser(res.user);
      onClose();
    } catch {
      setError('Telefon yoki parol noto\'g\'ri');
    }
  };

  const handleRegister = async () => {
    try {
      const res = await apiPost<{ user: { id: string; name: string; surname: string; phone: string } }>(
        '/api/auth/register', { name, surname, phone, password }
      );
      setUser(res.user);
      onClose();
    } catch {
      setError('Bu telefon allaqachon ro\'yxatdan o\'tgan');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {step === 'choose' && (
          <>
            <div className="modal-title">{t('adminOrUser', lang)}</div>
            <div className="modal-actions" style={{ flexDirection: 'column' }}>
              <button className="btn btn-primary" onClick={() => setStep('admin-login')}>{t('admin', lang)}</button>
              <button className="btn btn-secondary" onClick={() => setStep('user-login')}>{t('user', lang)}</button>
            </div>
          </>
        )}

        {step === 'admin-login' && (
          <>
            <div className="modal-title">{t('admin', lang)} {t('login', lang)}</div>
            <div className="form-group">
              <label>Login</label>
              <input className="form-input" value={login} onChange={e => setLogin(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t('password', lang)}</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button className="btn btn-primary" onClick={handleAdminLogin}>{t('login', lang)}</button>
            <button className="btn btn-secondary" style={{ marginTop: 8, width: '100%' }} onClick={() => setStep('choose')}>{t('cancel', lang)}</button>
          </>
        )}

        {step === 'user-login' && (
          <>
            <div className="modal-title">{t('login', lang)}</div>
            <div className="form-group">
              <label>{t('phone', lang)}</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998" />
            </div>
            <div className="form-group">
              <label>{t('password', lang)}</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button className="btn btn-primary" onClick={handleUserLogin}>{t('login', lang)}</button>
            <button className="btn btn-outline" style={{ marginTop: 8, width: '100%' }} onClick={() => { setStep('user-register'); setError(''); }}>
              {t('register', lang)}
            </button>
            <button className="btn btn-secondary" style={{ marginTop: 8, width: '100%' }} onClick={() => setStep('choose')}>{t('cancel', lang)}</button>
          </>
        )}

        {step === 'user-register' && (
          <>
            <div className="modal-title">{t('register', lang)}</div>
            <div className="form-group">
              <label>{t('name', lang)}</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t('surname', lang)}</label>
              <input className="form-input" value={surname} onChange={e => setSurname(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t('phone', lang)}</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998" />
            </div>
            <div className="form-group">
              <label>{t('password', lang)}</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button className="btn btn-primary" onClick={handleRegister}>{t('register', lang)}</button>
            <button className="btn btn-secondary" style={{ marginTop: 8, width: '100%' }} onClick={() => { setStep('user-login'); setError(''); }}>{t('cancel', lang)}</button>
          </>
        )}
      </div>
    </div>
  );
}
