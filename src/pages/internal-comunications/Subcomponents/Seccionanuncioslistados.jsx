import React from 'react';
import { EmptyState, FormField, Modal } from '../../../components/components.jsx';
import { COLORS } from '../../../components/theme.js';
import { confirm, toast } from '../../../helpers/alerts.js';
import { tidApi } from '../../../services/tid.js';
import { Megaphone, Plus, Trash2, CheckCheck, ExternalLink } from 'lucide-react';

export default function SeccionAnunciosListados({ anuncios, session, revalidator }) {
  const [open, setOpen] = React.useState(false);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = React.useState(null);
  const canCreateAnnouncement = session?.rol === 'Admin' || session?.rol === 'Instructor';
  
  const [form, setForm] = React.useState({ 
    titulo: '', 
    contenido: '', 
    prioridad: 'Media',
    enlaceInfo: '' 
  });
  const [saving, setSaving] = React.useState(false);
  
  const marcarLeido = async (id) => {
    if (!session?.id) return;
    try {
      await tidApi.markAnuncioRead(id, session.id);
      revalidator.revalidate();
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  // CORREGIDO: Separamos la apertura del modal de la revalidación inmediata
  const verDetalleAnuncio = (e, a) => {
    e.stopPropagation(); // Evita el click del card padre
    setSelectedAnuncio(a);
    setOpenDetail(true);
    
    // Si el anuncio no está leído, lo marcamos en segundo plano sin bloquear el modal
    const estaLeido = a.leido || a.read;
    if (!estaLeido) {
      marcarLeido(a.id);
    }
  };

  const handleCreate = async () => {
    if (!form.titulo || !form.contenido) return toast.warning('Completa título y contenido');
    setSaving(true);
    try {
      await tidApi.createAnuncio({ 
        ...form, 
        autor: session?.rol || 'Usuario', 
        fecha: new Date().toISOString().split('T')[0] 
      });
      toast.success('Anuncio creado');
      setOpen(false);
      setForm({ titulo: '', contenido: '', prioridad: 'Media', enlaceInfo: '' });
      revalidator.revalidate();
    } catch {
      toast.error('Error al crear anuncio');
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (e, a) => {
    e.stopPropagation();
    const ok = await confirm({ 
      title: 'Eliminar anuncio', 
      message: a.titulo, 
      okText: 'Eliminar', 
      cancelText: 'Cancelar', 
      color: COLORS.danger 
    });
    if (!ok) return;
    await tidApi.deleteAnuncio(a.id);
    toast.success('Anuncio eliminado');
    revalidator.revalidate();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <span style={{ color: COLORS.textMuted, fontSize: '14px' }}>Últimos anuncios publicados</span>
        {canCreateAnnouncement && (
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)} style={{ borderRadius: '20px' }}>
            <Plus size={14} /> Nuevo Anuncio
          </button>
        )}
      </div>

      {!anuncios?.length ? (
        <EmptyState icon={<Megaphone size={44} color={COLORS.textMuted} />} title="Sin anuncios" subtitle="Aún no hay comunicaciones publicadas" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {anuncios.map((a) => {
            const estaLeido = a.leido || a.read;
            return (
              <div 
                key={a.id} 
                className="card" 
                onClick={() => !estaLeido && marcarLeido(a.id)} 
                style={{ 
                  borderLeft: estaLeido ? '4px solid #94a3b8' : '4px solid #2D6DF6', 
                  cursor: 'pointer', 
                  opacity: estaLeido ? 0.85 : 1,
                  transition: 'all 0.2s ease',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      {a.titulo} {estaLeido && <CheckCheck size={16} color="#2D6DF6" />}
                    </h3>
                    <div style={{ marginTop: 6, fontSize: 12, color: COLORS.textMuted, display: 'flex', gap: 10 }}>
                      <span>{a.fecha}</span>
                      <span>{a.autor}</span>
                      <span className={`badge ${a.prioridad === 'Alta' ? 'badge-red' : a.prioridad === 'Media' ? 'badge-yellow' : 'badge-gray'}`}>{a.prioridad}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => verDetalleAnuncio(e, a)} style={{ borderRadius: '15px', fontSize: '12px' }}>
                      Leer más
                    </button>
                    {session?.rol === 'Admin' && (
                      <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(e, a)} style={{ padding: '6px 10px' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <p style={{ color: COLORS.textSecondary, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.contenido}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CREAR ANUNCIO */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo anuncio" footer={<><button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Guardando...' : 'Publicar'}</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Título"><input className="form-input" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} /></FormField>
          <FormField label="Prioridad">
            <select className="form-input" value={form.prioridad} onChange={(e) => setForm((p) => ({ ...p, prioridad: e.target.value }))}>
              {['Baja', 'Media', 'Alta'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Enlace de más información (Opcional URL)"><input className="form-input" placeholder="https://..." value={form.enlaceInfo} onChange={(e) => setForm((p) => ({ ...p, enlaceInfo: e.target.value }))} /></FormField>
          <FormField label="Contenido"><textarea className="form-input" rows={4} value={form.contenido} onChange={(e) => setForm((p) => ({ ...p, contenido: e.target.value }))} style={{ resize: 'vertical' }} /></FormField>
        </div>
      </Modal>

      {/* MODAL 2: VENTANA EMERGENTE LEER MÁS */}
      <Modal open={openDetail} onClose={() => setOpenDetail(false)} title={selectedAnuncio?.titulo || "Detalle del Anuncio"} footer={<button className="btn btn-secondary" onClick={() => setOpenDetail(false)}>Cerrar</button>}>
        {selectedAnuncio && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
              Publicado el <strong>{selectedAnuncio.fecha}</strong> por <strong>{selectedAnuncio.autor}</strong>
            </div>
            <p style={{ color: COLORS.textSecondary, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
              {selectedAnuncio.contenido}
            </p>
            {selectedAnuncio.enlaceInfo && (
              <div style={{ marginTop: 10, padding: 12, backgroundColor: '#1e293b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#f8fafc' }}>¿Quieres profundizar en este tema o curso?</span>
                <a href={selectedAnuncio.enlaceInfo} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', borderRadius: '15px' }}>
                  Ir al sitio <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
