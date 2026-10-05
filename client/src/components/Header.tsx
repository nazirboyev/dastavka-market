import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

interface Props {
  showAuth?: boolean;
  showLogout?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  showSearch?: boolean;
}

export default function Header({ showAuth, showLogout, onLoginClick, onLogout, searchValue, onSearchChange, showSearch }: Props) {
  const { lang, user } = useApp();
  const navigate = useNavigate();

  return (
    <header className="header">
      <span className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>{t('appName', lang)}</span>
      {showSearch && (
        <div className="search-bar" onClick={() => !onSearchChange && navigate('/search')}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={t('searchPlaceholder', lang)}
            value={searchValue || ''}
            onChange={e => onSearchChange?.(e.target.value)}
            onFocus={() => !onSearchChange && navigate('/search')}
            readOnly={!onSearchChange}
          />
        </div>
      )}
      <div className="header-actions">
        {showAuth && !user && (
          <button className="header-btn" onClick={onLoginClick}>{t('login', lang)}</button>
        )}
        {showLogout && (
          <button className="header-btn" onClick={onLogout}>{t('logout', lang)}</button>
        )}
      </div>
    </header>
  );
}
