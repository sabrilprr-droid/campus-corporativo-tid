import React from 'react';
import { Send, Search } from 'lucide-react';
import { toast } from '../../../helpers/alerts.js';
import { tidApi } from '../../../services/tid.js';

// Función helper para obtener las iniciales del nombre
const obtenerIniciales = (nombre) => {
  if (!nombre) return '';
  const palabras = nombre.trim().split(' ');
  if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
};

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
    <div style={{ display: 'flex', gap: 16, height: '420px', backgroundColor: '#eef1f4', borderRadius: '12px', padding: 12 }}>
      
      {/* PANEL IZQUIERDO: LISTA DE CONTACTOS */}
      <div style={{ width: '38%', borderRight: '1px solid #b0b5b9', paddingRight: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} color="#6b7280" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%', 
              backgroundColor: '#ffffff', 
              color: '#333333', // CAMBIADO: Texto oscuro para que sea legible
              fontSize: '12px', 
              border: '1px solid #d1d5db',
              borderRadius: '20px', 
              padding: '6px 12px 6px 30px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {contactosFiltrados.length === 0 ? (
            <small style={{ color: '#6b7280', padding: 8, textAlign: 'center' }}>No se encontraron usuarios</small>
          ) : (
            contactosFiltrados.map((u) => {
              const esActivo = chatActivo?.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => setChatActivo(u)}
                  style={{
                    padding: '8px 10px', 
                    borderRadius: 12, 
                    cursor: 'pointer',
                    // CAMBIADO: Fondo azul claro con borde para el item activo
                    backgroundColor: esActivo ? '#e8f0fe' : 'transparent',
                    border: esActivo ? '1.5px solid #2D6DF6' : '1.5px solid transparent',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    transition: 'all 0.2s',
                  }}
                >
                  {/* CAMBIADO: Nuevo Avatar circular azul con Iniciales */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: 13,
                      overflow: 'hidden'
                    }}>
                      {obtenerIniciales(u.nombre)}
                    </div>
                    {/* Indicador de estado conectado/desconectado */}
                    <div style={{ 
                      width: 10, 
                      height: 10, 
                      backgroundColor: u.online ? '#22c55e' : '#ef4444', 
                      borderRadius: '50%', 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0,
                      border: '2px solid #ffffff'
                    }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: 13, color: '#111827', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {u.nombre}
                    </span>
                    <small style={{ fontSize: 11, color: '#4b5563' }}>{u.rol}</small>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL DERECHO: ÁREA DE CHAT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {chatActivo ? (
          <>
            <div style={{ paddingBottom: 8, borderBottom: '1px solid #b0b5b9' }}>
              <strong style={{ color: '#111827', fontSize: 14 }}>{chatActivo.nombre}</strong>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#4b5563', fontSize: 13 }}>
                  Cargando conversación...
                </div>
              ) : mensajes.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', fontSize: 13 }}>
                  Inicia la conversación enviando un mensaje privado.
                </div>
              ) : (
                mensajes.map((m) => {
                  const esMio = m.remitenteId === 'yo';
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        padding: '8px 14px', 
                        borderRadius: '16px', 
                        maxWidth: '75%', 
                        fontSize: 13,
                        // CAMBIADO: El tuyo es azul (#2D6DF6), el de los demás es Verde/Cian (#00AEC7)
                        backgroundColor: esMio ? '#2D6DF6' : '#00AEC7', 
                        color: '#ffffff',
                      }}>
                        {m.texto}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                placeholder={`Enviar mensaje a ${chatActivo.nombre}...`}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && manejarEnvio()}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#ffffff', 
                  color: '#333333', // CAMBIADO: Texto oscuro para poder ver lo que se escribe
                  border: '1px solid #cccccc', 
                  borderRadius: '20px', 
                  padding: '8px 14px',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
              <button 
                onClick={manejarEnvio} 
                disabled={sending}
                style={{
                  backgroundColor: '#2D6DF6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: sending ? 0.6 : 1
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', fontSize: 13 }}>
            Selecciona o busca un colaborador para iniciar un chat privado.
          </div>
        )}
      </div>
    </div>
  );
}
