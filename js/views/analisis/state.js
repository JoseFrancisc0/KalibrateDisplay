/* ==========================================================
   views/analisis/state.js — estado de la vista Análisis Ponderado.
   ========================================================== */

export const analisisState = {
  producto: 'Diesel',          // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  modo: 'COMPETENCIA',         // 'COESTI' | 'COMPETENCIA' | 'MARCA'

  // filtros avanzados
  gpcGroup: 'TODOS',
  corredor: 'TODOS',
  zona: 'TODOS',
  departamento: 'TODOS',
  provincia: 'TODOS',
  distrito: 'TODOS',

  marcasDisponibles: [],       // Lista completa de marcas detectadas en la red
  marcasSeleccionadas: null,   // Set de marcas seleccionadas (null = todas por defecto)
};
