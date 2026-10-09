/* ==========================================================
   views/estacion/state.js — estado del nivel "detalle de estación".
   (El paso GENERAL ↔ ESTACION lo marca state.modoNivel en core/state.js)
   ========================================================== */

export const estacionState = {
  seleccionadaId: null,      // UUID de la estación abierta[cite: 9]
  dataActiva: null,          // Datos de detalle_estaciones/{site_id}.json[cite: 9]
  cache: {},                 // Cache en memoria para no repetir fetch[cite: 9]
  cargando: false,

  // Sub-vista activa dentro de la estación
  subVista: 'ESTADO',        // 'ESTADO' | 'EVOLUCION_PRECIOS' | 'EVOLUCION_DIFF' | 'MARGEN' | 'VARIACION'[cite: 9]

  // Filtros reactivos para la subvista MARGEN
  margen: {
    producto: 'Diesel',
    fechaInicio: '2026-08-01',
    fechaFin: '2026-10-08',
    competidoresSeleccionados: null,      // site_id del competidor seleccionado en el <select>
  }
};

export const SUBVISTAS = {
  'ESTADO': 'ESTADO ACTUAL',
  'EVOLUCION_PRECIOS': 'EVOLUCIÓN PRECIOS',
  'EVOLUCION_DIFF': 'EVOLUCIÓN DIFERENCIALES',
  'MARGEN': 'ANÁLISIS DE MARGEN',
  'VARIACION': 'VARIACIÓN DE PRECIOS'
};