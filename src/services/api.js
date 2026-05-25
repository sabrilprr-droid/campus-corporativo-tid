export { tidApi, tidStorage, TID_MOCK } from './tid.js';
export let URL_BASE = "http://localhost:8080/";

export let end_points = {
    usuarios: URL_BASE + "usuarios",
    anuncios: URL_BASE + "anuncios",
    categorias: URL_BASE + "categorias",
    comentariosforos: URL_BASE + "comentariosforos",
    cursoetiquetas: URL_BASE + "cursoetiquetas",
    cursos: URL_BASE + "cursos",
    etiquetas: URL_BASE + "etiquetas",
    foros: URL_BASE + "foros",
    inscripciones: URL_BASE + "inscripciones",
    lecciones: URL_BASE + "lecciones",
    mensajesdirectos: URL_BASE + "mensajesdirectos",
    usuarioanuncios: URL_BASE + "usuarioanuncios",
    usuariomensajes: URL_BASE + "usuariomensajes",
};
