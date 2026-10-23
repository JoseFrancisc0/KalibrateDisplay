/* ==========================================================
   views/heatmap/state.js — Estado reactivo del Heatmap
   ========================================================== */

export const heatmapState = {
  departamento: 'LIMA', // Plaza por defecto
  provincia: 'TODOS',
  distrito: 'TODOS',

  // Segmentación Operativa
  gpc: 'TODOS',
  gop: 'TODOS',
  jop: 'TODOS',
  corredor: 'TODOS',

  // Ordenamiento de tabla
  columnaOrden: 'nombre', // 'nombre' | 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP' | 'deltaMedio'
  ordenAscendente: true,

  drawerAbierto: false
};