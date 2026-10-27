/* ==========================================================
   views/estacion/state.js — Estado centralizado y persistente
   ========================================================== */
export const estacionState = {
  seleccionadaId: null,
  dataActiva: null,
  cache: {},
  cargando: false,
  subVista: 'ESTADO', // 'ESTADO' | 'EVOLUCION_DIFF' | 'MARGEN' | 'VARIACION'

  // Filtros compartidos persistentes en todas las subvistas
  filtros: {
    producto: 'Diesel',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-10-07',
    competidoresSeleccionados: null, // Set de site_ids seleccionados
  },

  // Toggles de métricas independientes por subvista
  metricasMargen: new Set(['MARGEN']),
  metricasDeltas: new Set(['DELTAS'])
};

export const SUBVISTAS = {
  'ESTADO': 'ESTADO ACTUAL',
  'EVOLUCION_DIFF': 'EVOLUCIÓN DIFERENCIALES',
  'MARGEN': 'ANÁLISIS DE MARGEN',
  'VARIACION': 'VARIACIÓN DE PRECIOS',
  'VOLUMEN': 'VOLUMEN & VENTAS'
};