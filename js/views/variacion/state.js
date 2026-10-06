/* ==========================================================
   views/variacion/state.js — estado de la vista Variación Histórica.
   ========================================================== */

export const variacionState = {
  // datos (historico_marcas.json se descarga al entrar por primera vez)
  historicoMarcasData: null,
  cargandoHistorico: false,

  // filtros
  alcance: 'AREA',             // 'AREA' (área de influencia) | 'LM' (solo competidoras Local Market)
  producto: 'Diesel',          // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  fechaInicio: '2026-08-01',   // f1 por defecto (inicio de agosto)
  fechaFin: '2026-10-01',      // f2 por defecto
  corredor: 'TODOS',
  departamento: 'TODOS',
  gpcGroup: 'TODOS',
  marcasDisponibles: [],       // Lista de marcas en el historico
  marcasSeleccionadas: null,   // Set de marcas activas (null = todas)
};
