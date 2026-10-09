/* ==========================================================
   views/matriz/state.js — estado de la vista Matriz Competitiva.
   ========================================================== */

export const matrizState = {
  // controles del rail
  modoActual: 'PRECIOS', // 'PRECIOS' | 'DIFERENCIAL'
  filtroMarker: 'TODOS',
  filtroMarca: 'TODAS',
  expandedGroups: new Set(),

  // paginación y estructura de las pestañas inferiores
  agrupacionTabs: 'CORREDOR',
  filasPorPagina: 15,
  grupos: [],
  gruposMap: {},
  grupoActivo: '',
  grupoActivoPorAgrupacion: {},
  subPaginaGrupo: 0,
  scrollTarget: null,

  // Drill-down jerárquico (para agrupación UBICACION)
  jerarquiaNivel: 'DEPTO',     // 'DEPTO' | 'PROVINCIA' | 'DISTRITO'
  deptoActivo: null,           // p.ej. 'LIMA'
  provinciaActiva: null,       // p.ej. 'LIMA'
  distritoActivo: null,        // p.ej. 'SANTIAGO DE SURCO'
};
