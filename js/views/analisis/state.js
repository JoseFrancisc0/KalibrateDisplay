/* ==========================================================
   views/analisis/state.js — estado de la vista Análisis Ponderado.
   ========================================================== */

export const analisisState = {
  producto: 'Diesel',          // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  modo: 'DISTRIBUCION',         // 'DISTRIBUCION' | 'MARCA'

  // filtros avanzados
  gpc: 'TODOS',
  gop: 'TODOS',
  jop: 'TODOS',
  corredor: 'TODOS',
  departamento: 'TODOS',
  provincia: 'TODOS',
  distrito: 'TODOS',

  drawerAbierto: false,

  marcasDisponibles: [],       // Lista completa de marcas detectadas en la red
  marcasSeleccionadas: null,   // Set de marcas seleccionadas (null = todas por defecto)
};
