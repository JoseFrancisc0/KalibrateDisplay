/* ==========================================================
   views/alineacion/state.js — estado de la vista Alineación Competitiva.
   ========================================================== */

export const alineacionState = {
  marcaCompetidora: 'TODAS',        // 'TODAS' | 'REPSOL' | 'PETROPERU' | 'WP' | ...
  criterioRival: 'CERCANO',         // 'CERCANO' | 'PROMEDIO'
  productoSeleccionado: 'Diesel',

  gpc: 'TODOS',
  gop: 'TODOS',
  jop: 'TODOS',
  corredor: 'TODOS',
  departamento: 'TODOS',
  provincia: 'TODOS',
  distrito: 'TODOS',

  drawerAbierto: false,

  filtroDetalle: 'TODOS',           // 'TODOS' | 'BAJO_LM' | 'BAJO_ZONA' | 'BAJO_AMBOS'
};
