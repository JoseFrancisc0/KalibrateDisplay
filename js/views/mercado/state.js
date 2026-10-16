/* ==========================================================
   views/mercado/state.js — Estado de Análisis de Mercado
   ========================================================== */
export const margenMercadoState = {
  historicoMarcasData: null,
  cargandoHistorico: false,
  
  // Checklist de métricas graficables simultáneamente
  metricasActivas: new Set(['PRECIOS']), // 'PRECIOS' | 'COSTOS' | 'MARGEN'
  
  producto: 'Diesel',
  fechaInicio: '2026-10-01',
  fechaFin: '2026-10-07',

  // Filtros territoriales
  corredor: 'TODOS',
  departamento: 'TODOS',
  provincia: 'TODOS',
  distrito: 'TODOS',

  // Checklist de marcas
  marcasDisponibles: [],
  marcasSeleccionadas: null,
};