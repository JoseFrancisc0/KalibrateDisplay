/* ==========================================================
   views/matriz/state.js — estado de la vista Matriz Competitiva.
   ========================================================== */

export const matrizState = {
  // controles del rail
  modoActual: 'PRECIOS',       // 'PRECIOS' | 'DIFERENCIAL'
  filtroMarker: 'TODOS',       // TODOS | CUALQUIERA | UNLEADED | DIESEL | GLP | GNV
  filtroMarca: 'TODAS',        // 'TODAS' | 'REPSOL' | 'PETROPERU' | 'WP' | ...
  expandedGroups: new Set(),   // own_site_id de las estaciones desplegadas

  // paginación y estructura de las pestañas inferiores
  agrupacionTabs: 'CORREDOR',  // Dimensión que divide las pestañas (ver AGRUPACIONES en config.js)
  filasPorPagina: 15,          // Capacidad visible de estaciones en pantalla
  grupos: [],                  // Nombres de los grupos ['LIMA NORTE', 'PIURA', ...]
  gruposMap: {},               // { [grupo]: [estaciones...] }
  grupoActivo: '',             // Grupo seleccionado actualmente
  grupoActivoPorAgrupacion: {},// Recuerda el grupo elegido en cada dimensión
  subPaginaGrupo: 0,           // Índice de página interna dentro del grupo (0, 1, 2...)
  scrollTarget: null,
};
