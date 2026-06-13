import React from 'react';
import { MessageSquare, ArrowUp, Plus, ArrowLeft, Send } from 'lucide-react';
import { FormField, Modal } from '../../../components/components.jsx';
import { COLORS } from '../../../components/theme.js';
import { toast } from '../../../helpers/alerts.js';
import { tidApi } from '../../../services/tid.js';


const initialDebateForm = {
  titulo: '',
  categoria: '',
  descripcion: '',
};

export default function SeccionForos({ session, foros = [], revalidator }) {
  const [foroSeleccionado, setForoSeleccionado] = React.useState(null);
  const [nuevoComentario, setNuevoComentario] = React.useState('');
  const [crearDebateOpen, setCrearDebateOpen] = React.useState(false);
  const [debateForm, setDebateForm] = React.useState(initialDebateForm);
  const [formError, setFormError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!foroSeleccionado) return;
    const actualizado = foros.find((foro) => foro.id === foroSeleccionado.id);
    if (actualizado) setForoSeleccionado(actualizado);
  }, [foros, foroSeleccionado?.id]);

  const controlarVoto = async (e, id) => {
    e.stopPropagation();
    try {
      const actualizado = await tidApi.voteForo(id);
      if (foroSeleccionado?.id === id) setForoSeleccionado(actualizado);
      revalidator?.revalidate();
    } catch (error) {
      toast.error(error.message || 'No fue posible registrar el voto');
    }
  };

  const agregarComentario = async () => {
    if (!nuevoComentario.trim() || !foroSeleccionado) return;
    setSaving(true);
    try {
      const actualizado = await tidApi.createForoComentario(foroSeleccionado.id, {
        authorId: session.id,
        texto: nuevoComentario.trim(),
      });
      setForoSeleccionado(actualizado);
      setNuevoComentario('');
      revalidator?.revalidate();
    } catch (error) {
      toast.error(error.message || 'No fue posible publicar el comentario');
    } finally {
      setSaving(false);
    }
  };

  const abrirCrearDebate = () => {
    setDebateForm(initialDebateForm);
    setFormError('');
    setCrearDebateOpen(true);
  };

  const crearDebate = async () => {
    const titulo = debateForm.titulo.trim();
    const categoria = debateForm.categoria.trim();
    const descripcion = debateForm.descripcion.trim();

    if (!titulo || !categoria || !descripcion) {
      setFormError('Completa titulo, categoria y descripcion para crear el debate.');
      return;
    }

    setSaving(true);
    try {
      const nuevoHilo = await tidApi.createForo({
        titulo,
        categoria,
        descripcion,
        authorId: session.id,
      });
      setForoSeleccionado(nuevoHilo);
      setCrearDebateOpen(false);
      setDebateForm(initialDebateForm);
      setFormError('');
      revalidator?.revalidate();
    } catch (error) {
      setFormError(error.message || 'No fue posible crear el debate.');
    } finally {
      setSaving(false);
    }
  };

  if (foroSeleccionado) {
    return (
      <div>
        <button className="btn btn-secondary btn-sm" onClick={() => setForoSeleccionado(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, borderRadius: '20px' }}>
          <ArrowLeft size={14} /> Volver a los Foros
        </button>

        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <span className="badge badge-gray" style={{ fontSize: 10 }}>{foroSeleccionado.categoria}</span>
          <h3 style={{ margin: '8px 0', fontSize: 18, color: '#272829' }}>{foroSeleccionado.titulo}</h3>
          <small style={{ color: '#393b3c' }}>Iniciado por {foroSeleccionado.autor}</small>
        </div>

        <h4 style={{ fontSize: 14, color: '#2f2f2f', marginBottom: 12 }}>Respuestas de la Comunidad ({foroSeleccionado.comentarios.length})</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {foroSeleccionado.comentarios.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: 13, padding: 10 }}>Aun no hay comentarios. Se el primero en aportar.</div>
          ) : (
            foroSeleccionado.comentarios.map((c) => (
              <div key={c.id} style={{ backgroundColor: '#393f3fe6', padding: 12, borderRadius: 8, borderLeft: '3px solid #33a3ad' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 12 }}>
                  <strong style={{ fontSize: 12, color: '#ffffff' }}>{c.usuario}</strong>
                  <small style={{ fontSize: 11, color: '#cdcdcd' }}>{c.fecha}</small>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1' }}>{c.texto}</p>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Anade un comentario a la discusion..."
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregarComentario()}
            style={{ flex: 1, backgroundColor: '#e5e5e5', color: '#282424' }}
          />
          <button className="btn btn-primary" onClick={agregarComentario} disabled={saving} style={{ padding: '8px 16px' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Foros de la Comunidad</h3>
        <button className="btn btn-primary btn-sm" onClick={abrirCrearDebate} style={{ borderRadius: '20px' }}>
          <Plus size={14} /> Crear Debate
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {foros.map((hilo) => (
          <div
            key={hilo.id}
            className="card"
            onClick={() => setForoSeleccionado(hilo)}
            style={{ display: 'flex', padding: 12, gap: 14, alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s ease' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#2D6DF6', padding: '6px 10px', borderRadius: 8 }}>
              <ArrowUp size={16} color="#565656" style={{ cursor: 'pointer' }} onClick={(e) => controlarVoto(e, hilo.id)} />
              <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{hilo.votos}</span>
            </div>

            <div style={{ flex: 1 }}>
              <span className="badge badge-gray" style={{ fontSize: 10 }}>{hilo.categoria}</span>
              <h4 style={{ margin: '4px 0', fontSize: 15, color: '#212222', fontWeight: 700 }}>{hilo.titulo}</h4>
              <small style={{ color: '#2c2d2f' }}>Iniciado por {hilo.autor}</small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#373737', fontSize: 13 }}>
              <MessageSquare size={16} />
              <span>{hilo.respuestasCount}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={crearDebateOpen}
        onClose={() => setCrearDebateOpen(false)}
        title="Crear debate"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCrearDebateOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={crearDebate} disabled={saving}>
              {saving ? 'Publicando...' : 'Publicar debate'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Titulo">
            <input className="form-input" value={debateForm.titulo} onChange={(e) => setDebateForm((prev) => ({ ...prev, titulo: e.target.value }))} placeholder="Tema principal de la discusion" />
          </FormField>
          <FormField label="Categoria">
            <input className="form-input" value={debateForm.categoria} onChange={(e) => setDebateForm((prev) => ({ ...prev, categoria: e.target.value }))} placeholder="React, Seguridad, Backend..." />
          </FormField>
          <FormField label="Descripcion">
            <textarea className="form-input" rows={5} value={debateForm.descripcion} onChange={(e) => setDebateForm((prev) => ({ ...prev, descripcion: e.target.value }))} placeholder="Escribe el primer aporte del debate" style={{ resize: 'vertical' }} />
          </FormField>
          {formError && <span style={{ color: COLORS.danger, fontSize: 12 }}>{formError}</span>}
        </div>
      </Modal>
    </div>
  );
}
