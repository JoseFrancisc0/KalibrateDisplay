/* ==========================================================
   views/mapa/state.js — Estado reactivo de la vista Cobertura
   ========================================================== */

export const mapaState = {
  producto: 'Diesel', // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  deptoSeleccionado: null, // null = Vista Nacional Consolidada | 'LIMA', 'LORETO', etc.
  
  // Segmentación Operativa
  gpc: 'TODOS',
  gop: 'TODOS',
  jop: 'TODOS',
  corredor: 'TODOS',

  drawerAbierto: false
};

// Los 12 departamentos oficiales con presencia de red propia
export const DEPARTAMENTOS_OPERATIVOS = [
  'ANCASH',
  'AREQUIPA',
  'CUZCO',
  'ICA',
  'JUNIN',
  'LA LIBERTAD',
  'LAMBAYEQUE',
  'LIMA',
  'LORETO',
  'PIURA',
  'TACNA',
  'UCAYALI'
];