export const COMMUNICATIONS_UNREAD_KEY = 'tid_comunicaciones_mensajes_pendientes';
export const COMMUNICATIONS_UNREAD_EVENT = 'tid-comunicaciones-unread-change';

export function setComunicacionesUnread(value) {
  localStorage.setItem(COMMUNICATIONS_UNREAD_KEY, value ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent(COMMUNICATIONS_UNREAD_EVENT, { detail: value }));
}
