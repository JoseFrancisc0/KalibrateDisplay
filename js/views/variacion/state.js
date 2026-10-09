/* ==========================================================
   views/variacion/state.js — estado de la vista Variación Histórica.
   ========================================================== */

export const variacionState = {
  // datos (historico_marcas.json se descarga al entrar por primera vez)
  historicoMarcasData: null,
  cargandoHistorico: false,
  seriesLM: null,              // series de competidoras Local Market (se descargan al activar el modo)
  cargandoLM: false,

  // filtros
  producto: 'Diesel',          // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  
  fechaInicio: '2026-10-01',   // f1 por defecto (inicio de agosto)
  fechaFin: '2026-10-07',      // f2 por defecto
  
  gpcGroup: 'TODOS',
  corredor: 'TODOS',
  zona: 'TODOS',
  departamento: 'TODOS',
  provincia: 'TODOS',
  distrito: 'TODOS',
  
  marcasDisponibles: [],       // Lista de marcas en el historico
  marcasSeleccionadas: null,   // Set de marcas activas (null = todas)
};
