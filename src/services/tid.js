const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export const TID_MOCK = {};

export const tidStorage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('tid_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem('tid_' + key, JSON.stringify(val));
    } catch {
      return;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem('tid_' + key);
    } catch {
      return;
    }
  },
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return true;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'No fue posible completar la solicitud.');
  }

  return data;
}

const splitName = (nombre = '') => {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || nombre || 'Usuario',
    lastName: parts.join(' ') || 'TID',
  };
};

const roleToFront = (role) => {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'ADMIN') return 'Admin';
  if (normalized === 'INSTRUCTOR' || normalized === 'TEACHER') return 'Instructor';
  return 'Estudiante';
};

const statusToFront = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'COMPLETADO') return 'Completado';
  if (normalized === 'CANCELADO') return 'Cancelado';
  return 'Activo';
};

const attendanceToFront = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'LATE' || normalized === 'TARDANZA') return 'Tardanza';
  if (normalized === 'ABSENT' || normalized === 'AUSENTE') return 'Ausente';
  return 'Presente';
};

const toUser = (user) => ({
  id: user.id,
  nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
  email: user.email,
  telefono: user.phone || '',
  area: user.address || '',
  rol: roleToFront(user.role),
  avatar: null,
  firstName: user.firstName,
  lastName: user.lastName,
  document: user.document,
  address: user.address,
  createdAt: user.createdAt,
});

const toCategoria = (category) => ({
  id: category.id,
  nombre: category.name,
  color: '#3b82f6',
  totalCursos: category.courseCount || 0,
});

const toCurso = (course) => ({
  id: course.id,
  titulo: course.title,
  descripcion: course.description,
  categoria_id: course.categoryId,
  categoriaNombre: course.categoryName,
  instructor: course.instructor || 'Por asignar',
  duracion: course.startDate && course.endDate ? `${course.startDate} - ${course.endDate}` : 'Por definir',
  nivel: course.level || 'Básico',
  inscritos: course.enrolledCount || 0,
  max: course.capacity || 0,
  imagen: null,
  active: course.active,
  startDate: course.startDate,
  endDate: course.endDate,
});

const toCursoRequest = (data) => ({
  title: data.titulo,
  description: data.descripcion || 'Sin descripción',
  categoryId: data.categoria_id,
  startDate: data.startDate || null,
  endDate: data.endDate || null,
  capacity: data.max || null,
  active: data.active ?? true,
});

const toInscripcion = (enrollment) => ({
  id: enrollment.id,
  usuario_id: enrollment.userId,
  curso_id: enrollment.courseId,
  cursoTitulo: enrollment.courseTitle,
  fecha: enrollment.enrolledAt ? enrollment.enrolledAt.slice(0, 10) : '',
  estado: statusToFront(enrollment.status),
  progreso: enrollment.status === 'COMPLETADO' ? 100 : 0,
});

const toCalificacion = (grade) => ({
  id: grade.id,
  usuario_id: grade.userId,
  curso_id: grade.courseId,
  actividad: grade.note || 'Evaluación',
  nota: Math.round(Number(grade.score || 0)),
  fecha: grade.date,
  tipo: 'Evaluación',
});

const toAsistencia = (attendance) => ({
  id: attendance.id,
  usuario_id: attendance.userId,
  curso_id: attendance.courseId,
  fecha: attendance.date,
  estado: attendanceToFront(attendance.status),
  sesion: 'Sesión',
});

const toAnuncio = (announcement) => ({
  id: announcement.id,
  titulo: announcement.title,
  contenido: announcement.content,
  fecha: announcement.date || announcement.createdAt?.slice(0, 10),
  autor: announcement.author || 'Administración',
  prioridad: announcement.priority || 'Media',
  enlaceInfo: announcement.infoUrl || '',
  read: Boolean(announcement.read),
  leido: Boolean(announcement.read),
});

const toForo = (thread) => ({
  id: thread.id,
  titulo: thread.title,
  autor: thread.authorName,
  categoria: thread.category,
  respuestasCount: thread.repliesCount,
  votos: thread.votes,
  comentarios: (thread.comments || []).map((comment) => ({
    id: comment.id,
    usuario: comment.authorName,
    texto: comment.content,
    fecha: comment.createdAt ? new Date(comment.createdAt).toLocaleString('es-CO') : '',
  })),
});

const toContacto = (user) => ({
  id: user.id,
  nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
  rol: roleToFront(user.role),
  online: true,
});

const toMensaje = (message, currentUserId) => ({
  id: message.id,
  remitenteId: message.senderId === currentUserId ? 'yo' : message.senderId,
  receptorId: message.receiverId,
  texto: message.content,
  fecha: message.sentAt,
});

const toMetrics = (metrics) => ({
  totalUsuarios: metrics.totalUsuarios ?? metrics.totalUsers ?? 0,
  totalCursos: metrics.totalCursos ?? metrics.totalCourses ?? 0,
  totalInscripciones: metrics.totalInscripciones ?? metrics.totalEnrollments ?? 0,
  inscripcionesActivas: metrics.inscripcionesActivas ?? 0,
  inscripcionesCompletadas: metrics.inscripcionesCompletadas ?? 0,
  categorias: (metrics.categorias || []).map((c) => ({
    id: c.id,
    nombre: c.nombre ?? c.name,
    totalCursos: c.totalCursos ?? c.courseCount ?? 0,
    totalInscritos: c.totalInscritos ?? c.enrollmentCount ?? 0,
  })),
  cursosMasInscritos: (metrics.cursosMasInscritos || []).map(toCurso),
});

export const tidApi = {
  API_BASE,
  async login(email, password) {
    const data = await request(`/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    const session = toUser(data.user);
    tidStorage.set('session', session);
    return session;
  },
  async registro(data) {
    const { firstName, lastName } = splitName(data.nombre);
    const user = await request('/users', {
      method: 'POST',
      body: JSON.stringify({
        firstName,
        lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.password,
        phone: data.telefono || '',
        address: data.area || '',
      }),
    });
    return toUser(user);
  },
  async recuperar(email) {
    return request('/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  getSession() {
    return tidStorage.get('session', null);
  },
  logout() {
    tidStorage.remove('session');
  },
  async getCursos() {
    const courses = await request('/courses');
    return courses.map(toCurso);
  },
  async getCurso(id) {
    return toCurso(await request(`/courses/${id}`));
  },
  async createCurso(data) {
    return toCurso(await request('/courses', {
      method: 'POST',
      body: JSON.stringify(toCursoRequest(data)),
    }));
  },
  async updateCurso(id, data) {
    return toCurso(await request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toCursoRequest(data)),
    }));
  },
  async deleteCurso(id) {
    return request(`/courses/${id}`, { method: 'DELETE' });
  },
  async getCategorias() {
    const categories = await request('/categories?withCounts=true');
    return categories.map(toCategoria);
  },
  async getInscripciones(usuario_id) {
    const enrollments = await request(`/enrollments?userId=${usuario_id}`);
    return enrollments.map(toInscripcion);
  },
  async createInscripcion(data) {
    return toInscripcion(await request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ userId: data.usuario_id, courseId: data.curso_id }),
    }));
  },
  async deleteInscripcion(id) {
    return request(`/enrollments/${id}`, { method: 'DELETE' });
  },
  async getCalificaciones(usuario_id) {
    const grades = await request(`/grades?userId=${usuario_id}`);
    return grades.map(toCalificacion);
  },
  async getAsistencias(usuario_id) {
    const attendances = await request(`/attendance?userId=${usuario_id}`);
    return attendances.map(toAsistencia);
  },
  async getPerfil(id) {
    return toUser(await request(`/users/${id}`));
  },
  async updatePerfil(id, data) {
    const { firstName, lastName } = splitName(data.nombre);
    const user = await request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        firstName,
        lastName,
        phone: data.telefono,
        address: data.area,
        role: data.rol,
      }),
    });
    const session = tidStorage.get('session', null);
    const updated = toUser(user);
    if (session?.id === id) tidStorage.set('session', updated);
    return updated;
  },
  async updatePassword(id, actual, nueva) {
    await request(`/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: actual,
        newPassword: nueva,
        confirmNewPassword: nueva,
      }),
    });
    return true;
  },
  async getAnuncios(userId) {
    const qs = userId ? `?userId=${userId}` : '';
    const announcements = await request(`/announcements${qs}`);
    return announcements.map(toAnuncio);
  },
  async createAnuncio(data) {
    return toAnuncio(await request('/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: data.titulo,
        content: data.contenido,
        date: data.fecha || new Date().toISOString().slice(0, 10),
        priority: data.prioridad || 'Media',
        author: data.autor || 'Administración',
        infoUrl: data.enlaceInfo || null,
      }),
    }));
  },
  async deleteAnuncio(id) {
    return request(`/announcements/${id}`, { method: 'DELETE' });
  },
  async markAnuncioRead(id, userId) {
    return request(`/announcements/${id}/read?userId=${userId}`, { method: 'POST' });
  },
  async getForos() {
    const threads = await request('/forums');
    return threads.map(toForo);
  },
  async createForo(data) {
    return toForo(await request('/forums', {
      method: 'POST',
      body: JSON.stringify({
        title: data.titulo,
        category: data.categoria,
        content: data.descripcion,
        authorId: data.authorId,
      }),
    }));
  },
  async voteForo(id) {
    return toForo(await request(`/forums/${id}/vote`, { method: 'POST' }));
  },
  async createForoComentario(id, data) {
    return toForo(await request(`/forums/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        authorId: data.authorId,
        content: data.texto,
      }),
    }));
  },
  async getContactos(userId) {
    const users = await request(`/direct-messages/contacts?userId=${userId}`);
    return users.map(toContacto);
  },
  async getMensajes(userId, contactId) {
    const messages = await request(`/direct-messages?userId=${userId}&contactId=${contactId}`);
    return messages.map((message) => toMensaje(message, userId));
  },
  async sendMensaje(data) {
    const message = await request('/direct-messages', {
      method: 'POST',
      body: JSON.stringify({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.texto,
      }),
    });
    return toMensaje(message, data.senderId);
  },
  async getDashboardMetrics() {
    return toMetrics(await request('/dashboard/metrics'));
  },
};
