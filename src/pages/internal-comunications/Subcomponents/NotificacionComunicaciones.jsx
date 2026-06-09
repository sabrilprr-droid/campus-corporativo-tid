import React from 'react';
import { COMMUNICATIONS_UNREAD_EVENT, COMMUNICATIONS_UNREAD_KEY } from './notificacionComunicacionesState.js';

export default function NotificacionComunicaciones() {
  const [hasUnread, setHasUnread] = React.useState(() => {
    const saved = localStorage.getItem(COMMUNICATIONS_UNREAD_KEY);
    return saved === null ? true : saved === 'true';
  });

  React.useEffect(() => {
    if (localStorage.getItem(COMMUNICATIONS_UNREAD_KEY) === null) {
      localStorage.setItem(COMMUNICATIONS_UNREAD_KEY, 'true');
    }

    const syncUnread = () => {
      setHasUnread(localStorage.getItem(COMMUNICATIONS_UNREAD_KEY) === 'true');
    };

    const handleCustomEvent = (event) => setHasUnread(Boolean(event.detail));

    window.addEventListener('storage', syncUnread);
    window.addEventListener(COMMUNICATIONS_UNREAD_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', syncUnread);
      window.removeEventListener(COMMUNICATIONS_UNREAD_EVENT, handleCustomEvent);
    };
  }, []);

  if (!hasUnread) return null;

  return (
    <span
      title="Hay mensajes pendientes"
      aria-label="Hay mensajes pendientes"
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#dc2626',
        boxShadow: '0 0 0 2px #ffffff',
        marginLeft: 'auto',
        flexShrink: 0,
      }}
    />
  );
}
