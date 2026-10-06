/* ==========================================================
   state.js — estado compartido del visor.
   ========================================================== */

export const state = {
  // datos
  rawData: null,
  historicoMarcasData: null,
  cargandoHistorico: false,

  // controles
  vistaActiva: 'MATRIZ',       // 'MATRIZ' | 'ANALISIS' | 'ALINEACION'
  analisisProducto: 'Diesel',  // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  analisisModo: 'COMPETENCIA', // 'COESTI' | 'COMPETENCIA' | 'MARCA'
  
  // Control de Navegación Jerárquica (Macro vs Estación)
  modoNivel: 'GENERAL',           // 'GENERAL' | 'ESTACION'
  estacionSeleccionadaId: null,   // UUID de la estación abierta
  estacionDataActiva: null,       // Datos de detalle_estaciones/{site_id}.json
  estacionesCacheadas: {},        // Cache en memoria para no repetir fetch
  cargandoDetalleEstacion: false,

  // Sub-vista activa dentro de la estación
  subVistaEstacion: 'ESTADO',     // 'ESTADO' | 'EVOLUCION_PRECIOS' | 'EVOLUCION_DIFF' | 'VARIACION'

  // filtros avanzados de análisis ponderado
  analisisCorredor: 'TODOS',       // 'TODOS' | Corredor
  analisisDepartamento: 'TODOS',   // 'TODOS' | Departamento
  analisisGpcGroup: 'TODOS',       // 'TODOS' | GPC Group
  analisisMarcasDisponibles: [],   // Lista completa de marcas detectadas en la red
  analisisMarcasSeleccionadas: null, // Set de marcas seleccionadas (null = todas por defecto)

  modoActual: 'PRECIOS',       // 'PRECIOS' | 'DIFERENCIAL'
  filtroMarker: 'TODOS',       // TODOS | CUALQUIERA | UNLEADED | DIESEL | GLP | GNV
  filtroMarcaMatriz: 'TODAS',  // 'TODAS' | 'REPSOL' | 'PETROPERU' | 'WP' | ...
  expandedGroups: new Set(),

  // paginación y estructura de las pestañas inferiores
  agrupacionTabs: 'CORREDOR',  // Dimensión que divide las pestañas (ver AGRUPACIONES en config.js)
  filasPorPagina: 15,          // Capacidad visible de estaciones en pantalla
  grupos: [],                  // Nombres de los grupos ['LIMA NORTE', 'PIURA', ...]
  gruposMap: {},               // { [grupo]: [estaciones...] }
  grupoActivo: '',             // Grupo seleccionado actualmente
  grupoActivoPorAgrupacion: {},// Recuerda el grupo elegido en cada dimensión
  subPaginaGrupo: 0,           // Índice de página interna dentro del grupo (0, 1, 2...)
  scrollTarget: null,

  // Filtros de la vista Alineación Competitiva
  alineacionMarcaCompetidora: 'TODAS', // 'TODAS' | 'REPSOL' | 'PETROPERU' | 'WP' | ...
  alineacionCriterioRival: 'CERCANO',  // 'CERCANO' | 'PROMEDIO'
  alineacionProductoSeleccionado: 'Diesel',
  alineacionCorredor: 'TODOS',
  alineacionDepartamento: 'TODOS',
  alineacionGpcGroup: 'TODOS',
  alineacionFiltroDetalle: 'TODOS',    // 'TODOS' | 'BAJO_LM' | 'BAJO_ZONA' | 'BAJO_AMBOS'

  // Filtros de la vista Variación Histórica
  variacionProducto: 'Diesel',        // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  variacionFechaInicio: '2026-08-01', // f1 por defecto (inicio de agosto)
  variacionFechaFin: '2026-10-01',    // f2 por defecto
  variacionCorredor: 'TODOS',
  variacionDepartamento: 'TODOS',
  variacionGpcGroup: 'TODOS',
  variacionMarcasDisponibles: [],     // Lista de marcas en el historico
  variacionMarcasSeleccionadas: null, // Set de marcas activas (null = todas)
};