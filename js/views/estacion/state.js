/* ==========================================================
   views/estacion/state.js — estado del nivel "detalle de estación".
   (El paso GENERAL ↔ ESTACION lo marca state.modoNivel en core/state.js)
   ========================================================== */

export const estacionState = {
  seleccionadaId: null,      // UUID de la estación abierta
  dataActiva: null,          // Datos de detalle_estaciones/{site_id}.json
  cache: {},                 // Cache en memoria para no repetir fetch
  cargando: false,

  // Sub-vista activa dentro de la estación
  subVista: 'ESTADO',        // 'ESTADO' | 'EVOLUCION_PRECIOS' | 'EVOLUCION_DIFF' | 'VARIACION'
};

export const SUBVISTAS = {
  'ESTADO': 'ESTADO ACTUAL',
  'EVOLUCION_PRECIOS': 'EVOLUCIÓN PRECIOS',
  'EVOLUCION_DIFF': 'EVOLUCIÓN DIFERENCIALES',
  'VARIACION': 'VARIACIÓN DE PRECIOS'
};
