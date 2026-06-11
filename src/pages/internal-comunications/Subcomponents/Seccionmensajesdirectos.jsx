import React from 'react';
import { Send, User, Search } from 'lucide-react';
import { toast } from '../../../helpers/alerts.js';
import { tidApi } from '../../../services/tid.js';

export default function SeccionMensajesDirectos({ session, contactos = [] }) {
  const [chatActivo, setChatActivo] = React.useState(null);
  const [mensaje, setMensaje] = React.useState('');
  const [busqueda, setBusqueda] = React.useState('');
  const [mensajes, setMensajes] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (!chatActivo || !session?.id) {
      setMensajes([]);
      return;
    }

    let active = true;
    setLoading(true);
    tidApi.getMensajes(session.id, chatActivo.id)
      .then((data) => {
        if (active) setMensajes(data);
      })
      .catch((error) => toast.error(error.message || 'No fue posible cargar la conversacion'))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [chatActivo?.id, session?.id]);

  const manejarEnvio = async () => {
    if (!mensaje.trim() || !chatActivo || !session?.id) return;

    setSending(true);
    try {
      const nuevoMsg = await tidApi.sendMensaje({
        senderId: session.id,
        receiverId: chatActivo.id,
        texto: mensaje.trim(),
      });
      setMensajes((prev) => [...prev, nuevoMsg]);
      setMensaje('');
    } catch (error) {
      toast.error(error.message || 'No fue posible enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const contactosFiltrados = contactos.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', gap: 16, height: '420px', backgroundColor: '#888b8d2f', borderRadius: '12px', padding: 12 }}>
      <div style={{ width: '38%', borderRight: '1px solid #374151', paddingRight: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} color="#6b7280" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%', backgroundColor: '#1f2937', color: '#fff',
              fontSize: '12px', border: '1px solid #363636',
              borderRadius: '20px', padding: '6px 12px 6px 30px',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {contactosFiltrados.length === 0 ? (
            <small style={{ color: '#000000', padding: 8, textAlign: 'center' }}>No se encontraron usuarios</small>
          ) : (
            contactosFiltrados.map((u) => (
              <div
                key={u.id}
                onClick={() => setChatActivo(u)}
                style={{
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  backgroundColor: chatActivo?.id === u.id ? '#00AEC7' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background-color 0.2s',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#000000" />
                  <div style={{ width: 8, height: 8, backgroundColor: u.online ? '#10b981' : '#ff0000', borderRadius: '50%', position: 'absolute', bottom: 0, right: 0 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, color: '#000000', fontWeight: 500 }}>{u.nombre}</span>
                  <small style={{ fontSize: 11, color: '#000000' }}>{u.rol}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {chatActivo ? (
          <>
            <div style={{ paddingBottom: 8, borderBottom: '1px solid #3c3c3c' }}>
              <strong style={{ color: '#000000' }}>{chatActivo.nombre}</strong>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#393939', fontSize: 13 }}>
                  Cargando conversacion...
                </div>
              ) : mensajes.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#393939', fontSize: 13 }}>
                  Inicia la conversacion enviando un mensaje privado.
                </div>
              ) : (
                mensajes.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.remitenteId === 'yo' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '8px 12px', borderRadius: '12px', maxWidth: '70%', fontSize: 14,
                      backgroundColor: m.remitenteId === 'yo' ? '#2D6DF6' : '#374151', color: '#ffffff',
                    }}>
                      {m.texto}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder={`Enviar mensaje a ${chatActivo.nombre}...`}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && manejarEnvio()}
                style={{ flex: 1, backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '6px', padding: '6px 12px' }}
              />
              <button className="btn btn-primary" onClick={manejarEnvio} disabled={sending}>
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', fontSize: 14 }}>
            Selecciona o busca un colaborador para iniciar un chat privado.
          </div>
        )}
      </div>
    </div>
  );
}
