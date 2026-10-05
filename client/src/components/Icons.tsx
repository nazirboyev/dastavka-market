export function IconHome({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

export function IconSearch({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

export function IconCart({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M6 6h15l-1.5 9H8L6 6z" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M6 6L5 3H2" />
    </svg>
  );
}

export function IconProfile({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function IconOrders({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function IconArrow() {
  return <span className="arrow">›</span>;
}

export function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.5.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.5.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.5-.4-1.1-.4-2.3-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5s.9-.8 1.5-1c.5-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2M12 0C8.7 0 8.3 0 7 0.1 5.7.1 4.8.3 4 .7c-.8.4-1.5 1-2.1 1.7C1.3 3 0.7 3.7.3 4.5.1 5.3 0 6.2 0 7.5 0 8.8 0 9.2 0 12.5v.1C0 15.8 0 16.2.1 17.5c.1 1.3.3 2.2.7 3 .4.8 1 1.5 1.7 2.1.7.6 1.4 1.2 2.2 1.6.8.4 1.7.6 3 .7 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.2-.3 3-.7.8-.4 1.5-1 2.1-1.7.6-.7 1.2-1.4 1.6-2.2.4-.8.6-1.7.7-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.2-.7-3-.4-.8-1-1.5-1.7-2.1C21 1.3 20.3.7 19.5.3 18.7.1 17.8 0 16.5 0 15.2 0 14.8 0 11.5 0H12z" />
      <path d="M12 5.8A6.2 6.2 0 1012 18.2 6.2 6.2 0 0012 5.8m0 10.2A4 4 0 1112 7.8a4 4 0 010 8.2M18.4 4.6a1.4 1.4 0 11-2.9 0 1.4 1.4 0 012.9 0" />
    </svg>
  );
}

export function IconTelegram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 8.2l-1.9 9c-.1.5-.4.6-.8.4l-2.2-1.6-1.1 1c-.1.1-.2.2-.4.2l.2-2.7 4.1-3.7c.2-.2-.1-.3-.3-.1l-5 3.1-2.2-.7c-.5-.2-.5-.5.1-.7l8.5-3.3c.4-.2.8.1.7.7z" />
    </svg>
  );
}
