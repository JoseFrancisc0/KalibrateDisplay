/* ==========================================================
   views/analisis/state.js — estado de la vista Análisis Ponderado.
   ========================================================== */

export const analisisState = {
  producto: 'Diesel',          // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  modo: 'COMPETENCIA',         // 'COESTI' | 'COMPETENCIA' | 'MARCA'

  // filtros avanzados
  corredor: 'TODOS',           // 'TODOS' | Corredor
  departamento: 'TODOS',       // 'TODOS' | Departamento
  gpcGroup: 'TODOS',           // 'TODOS' | GPC Group
  marcasDisponibles: [],       // Lista completa de marcas detectadas en la red
  marcasSeleccionadas: null,   // Set de marcas seleccionadas (null = todas por defecto)
};
