import React from 'react';
import { MessageSquare, ArrowUp, Plus, ArrowLeft, Send } from 'lucide-react';
import { COLORS } from '../../../components/theme.js';

export default function SeccionForos() {
  const [foroSeleccionado, setForoSeleccionado] = React.useState(null);
  const [nuevoComentario, setNuevoComentario] = React.useState('');
  
  const [hilos, setHilos] = React.useState([
    { id: 1, titulo: '¿Cómo estructurar rutas complejas en React Router v6?', autor: 'Juan Docente', categoria: 'React', respuestasCount: 2, votos: 24, comentarios: [
      { id: 1, usuario: 'Ana María Silva', texto: 'Yo utilizo el hook useRoutes, se me hace más ordenado.', fecha: 'Hace 2 horas' },
      { id: 2, usuario: 'Pedro Pérez', texto: '¡Totalmente! Además ayuda mucho a separar las rutas de autenticación.', fecha: 'Hace 1 hora' }
    ]},
    { id: 2, titulo: 'Mejores prácticas para asegurar microservicios en Java Spring Boot', autor: 'Camilo Andres', categoria: 'Seguridad', respuestasCount: 0, votos: 18, comentarios: [] }
  ]);

  const controlarVoto = (e, id) => {
    e.stopPropagation();
    setHilos(hilos.map(h => h.id === id ? { ...h, votos: h.votos + 1 } : h));
    if(foroSeleccionado?.id === id) {
      setForoSeleccionado(prev => ({ ...prev, votos: prev.votos + 1 }));
    }
  };

  const agregarComentario = () => {
    if (!nuevoComentario.trim()) return;
    
    const comment = {
      id: Date.now(),
      usuario: 'Tú (Mi Perfil)',
      texto: nuevoComentario,
      fecha: 'Ahora mismo'
    };

    const hilosActualizados = hilos.map(h => {
      if (h.id === foroSeleccionado.id) {
        const nuevosComments = [...h.comentarios, comment];
        const updated = { ...h, comentarios: nuevosComments, respuestasCount: nuevosComments.length };
        setForoSeleccionado(updated); // Actualiza la vista activa
        return updated;
      }
      return h;
    });

    setHilos(hilosActualizados);
    setNuevoComentario('');
  };

  // VISTA DETALLE DEL FORO (HILO ABIERTO)
  if (foroSeleccionado) {
    return (
      <div>
        <button className="btn btn-secondary btn-sm" onClick={() => setForoSeleccionado(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, borderRadius: '20px' }}>
          <ArrowLeft size={14} /> Volver a los Foros
        </button>

        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <span className="badge badge-gray" style={{ fontSize: 10 }}>{foroSeleccionado.categoria}</span>
          <h3 style={{ margin: '8px 0', fontSize: 18, color: '#f8fafc' }}>{foroSeleccionado.titulo}</h3>
          <small style={{ color: '#94a3b8' }}>Iniciado por {foroSeleccionado.autor}</small>
        </div>

        {/* Sección de aportes / comentarios */}
        <h4 style={{ fontSize: 14, color: '#f8fafc', marginBottom: 12 }}>Respuestas de la Comunidad ({foroSeleccionado.comentarios.length})</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {foroSeleccionado.comentarios.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: 13, padding: 10 }}>Aún no hay comentarios. ¡Sé el primero en aportar!</div>
          ) : (
            foroSeleccionado.comentarios.map(c => (
              <div key={c.id} style={{ backgroundColor: '#1e293b', padding: 12, borderRadius: 8, borderLeft: '3px solid #475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 12, color: '#10b981' }}>{c.usuario}</strong>
                  <small style={{ fontSize: 11, color: '#6b7280' }}>{c.fecha}</small>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1' }}>{c.texto}</p>
              </div>
            ))
          )}
        </div>

        {/* Formulario para comentar */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Añade un comentario a la discusión..." 
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregarComentario()}
            style={{ flex: 1, backgroundColor: '#1f2937', color: '#fff' }}
          />
          <button className="btn btn-primary" onClick={agregarComentario} style={{ padding: '8px 16px' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // VISTA LISTADO GENERAL DE FOROS
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Foros de la Comunidad</h3>
        <button className="btn btn-primary btn-sm" style={{ borderRadius: '20px' }}>
          <Plus size={14} /> Crear Debate
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hilos.map((hilo) => (
          <div 
            key={hilo.id} 
            className="card" 
            onClick={() => setForoSeleccionado(hilo)}
            style={{ display: 'flex', padding: 12, gap: 14, alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s ease' }}
          >
            {/* Sistema de Votos */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1e293b', padding: '6px 10px', borderRadius: 8 }}>
              <ArrowUp 
                size={16} 
                color="#10b981" 
                style={{ cursor: 'pointer' }} 
                onClick={(e) => controlarVoto(e, hilo.id)} 
              />
              <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{hilo.votos}</span>
            </div>

            {/* Datos del Hilo */}
            <div style={{ flex: 1 }}>
              <span className="badge badge-gray" style={{ fontSize: 10 }}>{hilo.categoria}</span>
              <h4 style={{ margin: '4px 0', fontSize: 15, color: '#f8fafc', fontWeight: 700 }}>{hilo.titulo}</h4>
              <small style={{ color: '#94a3b8' }}>Iniciado por {hilo.autor}</small>
            </div>

            {/* Contador de respuestas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 13 }}>
              <MessageSquare size={16} />
              <span>{hilo.respuestasCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
