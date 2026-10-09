/* ==========================================================
   views/margen/state.js — Estado de Análisis de Mercado
   ========================================================== */

export const margenMercadoState = {
  historicoMarcasData: null,
  costoReferenciaData: null, // Serie diaria real de costos
  cargandoHistorico: false,

  modoMetrica: 'PRECIOS', // 'PRECIOS' | 'MARGEN'
  producto: 'Diesel',
  fechaInicio: '2026-08-01',
  fechaFin: '2026-10-08',

  // Filtros territoriales / comerciales
  gpcGroup: 'TODOS',
  corredor: 'TODOS',
  zona: 'TODOS',
  departamento: 'TODOS',
  provincia: 'TODOS',
  distrito: 'TODOS',

  // Checklist de marcas
  marcasDisponibles: [],
  marcasSeleccionadas: null,
};