import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { t, langLabels } from '../../i18n';
import { apiPost, apiGet } from '../../api';
import { Lang, Message } from '../../types';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { IconArrow } from '../../components/Icons';

interface Conversation {
  userId: string;
  userName: string;
  messages: Message[];
  unread: number;
}

export default function AdminProfile() {
  const { lang, setLang, setIsAdmin } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<'menu' | 'messages' | 'chat' | 'lang'>('menu');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  useEffect(() => {
    if (view === 'messages' || view === 'menu') {
      apiGet<Conversation[]>('/api/messages').then(setConversations).catch(console.error);
    }
  }, [view]);

  const openChat = async (conv: Conversation) => {
    const msgs = await apiGet<Message[]>(`/api/messages/${conv.userId}`);
    setActiveChat({ ...conv, messages: msgs });
    setView('chat');
  };

  const handleReply = async () => {
    if (!reply.trim() || !activeChat) return;
    await apiPost('/api/messages', {
      userId: activeChat.userId,
      userName: activeChat.userName,
      text: reply,
      from: 'admin'
    });
    setActiveChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, { id: Date.now().toString(), userId: activeChat.userId, userName: activeChat.userName, text: reply, from: 'admin', read: true, createdAt: new Date().toISOString() }]
    } : null);
    setReply('');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('/');
  };

  if (view === 'chat' && activeChat) {
    return (
      <div className="app-layout">
        <Header showLogout onLogout={handleLogout} />
        <div className="page-content" style={{ padding: 0 }}>
          <button onClick={() => setView('messages')} style={{ background: 'none', fontSize: 14, color: 'var(--primary)', padding: '12px' }}>
            ← {activeChat.userName}
          </button>
          <div className="chat-container">
            <div className="chat-messages">
              {activeChat.messages.map(m => (
                <div key={m.id} className={`chat-bubble ${m.from === 'admin' ? 'admin' : 'user'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="chat-input-bar">
              <input value={reply} onChange={e => setReply(e.target.value)} placeholder={t('typeMessage', lang)} onKeyDown={e => e.key === 'Enter' && handleReply()} />
              <button onClick={handleReply}>➤</button>
            </div>
          </div>
        </div>
        <BottomNav mode="admin" />
      </div>
    );
  }

  if (view === 'messages') {
    return (
      <div className="app-layout">
        <Header showLogout onLogout={handleLogout} />
        <div className="page-content" style={{ padding: 0 }}>
          <button onClick={() => setView('menu')} style={{ background: 'none', fontSize: 14, color: 'var(--primary)', padding: '12px' }}>← {t('profile', lang)}</button>
          {conversations.length === 0 ? (
            <div className="empty-state"><p>{t('messages', lang)}</p></div>
          ) : (
            conversations.map(conv => (
              <div key={conv.userId} className="conv-item" onClick={() => openChat(conv)}>
                <div className="conv-avatar">{conv.userName.charAt(0).toUpperCase()}</div>
                <div className="conv-info">
                  <div className="conv-name">{conv.userName}</div>
                  <div className="conv-preview">
                    {conv.messages[conv.messages.length - 1]?.text || '...'}
                  </div>
                </div>
                {conv.unread > 0 && <span className="badge-count">{conv.unread}</span>}
              </div>
            ))
          )}
        </div>
        <BottomNav mode="admin" />
      </div>
    );
  }

  if (view === 'lang') {
    return (
      <div className="app-layout">
        <Header showLogout onLogout={handleLogout} />
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
        <BottomNav mode="admin" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header showLogout onLogout={handleLogout} />
      <div className="page-content">
        <div className="profile-menu">
          <div className="profile-menu-item" onClick={() => setView('messages')}>
            {t('faq', lang)}
            {totalUnread > 0 && <span className="badge-count">{totalUnread}</span>}
            <IconArrow />
          </div>
          <div className="profile-menu-item" onClick={() => setView('lang')}>
            {t('changeLang', lang)}
            <IconArrow />
          </div>
          <div className="profile-menu-item" onClick={handleLogout}>
            {t('logout', lang)} → Foydalanuvchi
            <IconArrow />
          </div>
        </div>
      </div>
      <BottomNav mode="admin" />
    </div>
  );
}
