/* ==========================================================
   state.js — estado compartido del visor.
   ========================================================== */

export const state = {
  // datos
  rawData: null,

  // controles
  vistaActiva: 'MATRIZ',       // 'MATRIZ' | 'ANALISIS'
  analisisProducto: 'Diesel',  // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  analisisModo: 'COMPETENCIA', // 'COESTI' | 'COMPETENCIA' | 'MARCA'
  
  // filtros avanzados de análisis ponderado
  analisisCorredor: 'TODOS',       // 'TODOS' | Corredor
  analisisDepartamento: 'TODOS',   // 'TODOS' | Departamento
  analisisGpcGroup: 'TODOS',       // 'TODOS' | GPC Group
  analisisMarcasDisponibles: [],   // Lista completa de marcas detectadas en la red
  analisisMarcasSeleccionadas: null, // Set de marcas seleccionadas (null = todas por defecto)

  modoActual: 'PRECIOS',       // 'PRECIOS' | 'DIFERENCIAL'
  filtroMarker: 'TODOS',       // TODOS | CUALQUIERA | UNLEADED | DIESEL | GLP | GNV
  expandedGroups: new Set(),

  // paginación y estructura de las pestañas inferiores
  agrupacionTabs: 'CORREDOR',  // Dimensión que divide las pestañas (ver AGRUPACIONES en config.js)
  filasPorPagina: 15,          // Capacidad visible de estaciones en pantalla
  grupos: [],                  // Nombres de los grupos ['LIMA NORTE', 'PIURA', ...]
  gruposMap: {},               // { [grupo]: [estaciones...] }
  grupoActivo: '',             // Grupo seleccionado actualmente
  grupoActivoPorAgrupacion: {},// Recuerda el grupo elegido en cada dimensión
  subPaginaGrupo: 0,           // Índice de página interna dentro del grupo (0, 1, 2...)
  scrollTarget: null
};