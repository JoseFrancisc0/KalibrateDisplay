/* ==========================================================
   views/margen/state.js — Estado de Margen de Mercado
   ========================================================== */

export const margenMercadoState = {
  // Datos históricos de marcas
  historicoMarcasData: null,
  cargandoHistorico: false,

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

  // Checklist de marcas (null = todas seleccionadas por defecto)
  marcasDisponibles: [],
  marcasSeleccionadas: null,
};