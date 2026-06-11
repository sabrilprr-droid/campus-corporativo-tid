export { tidApi, tidStorage, TID_MOCK } from './tid.js';
export let URL_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

export let end_points = {
    auth: URL_BASE + "/auth",
    usuarios: URL_BASE + "/users",
    anuncios: URL_BASE + "/announcements",
    categorias: URL_BASE + "/categories",
    cursos: URL_BASE + "/courses",
    inscripciones: URL_BASE + "/enrollments",
    calificaciones: URL_BASE + "/grades",
    asistencias: URL_BASE + "/attendance",
    dashboard: URL_BASE + "/dashboard/metrics",
    foros: URL_BASE + "/forums",
    mensajesdirectos: URL_BASE + "/direct-messages",
};
