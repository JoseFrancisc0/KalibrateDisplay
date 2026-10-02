/* ==========================================================
   state.js — estado compartido del visor.
   ========================================================== */

export const state = {
  // datos
  rawData: null,

  // controles
  vistaActiva: 'MATRIZ',       // 'MATRIZ' | 'ANALISIS'
  analisisProducto: 'Diesel',  // 'Diesel' | 'Regular' | 'Premium' | 'GNV' | 'GLP'
  analisisModo: 'COMPETENCIA', // 'COESTI' | 'COMPETENCIA' | 'MARCA'
  analisisCorredor: 'TODOS',   // 'TODOS' | 'LIMA NORTE' | etc.
  modoActual: 'PRECIOS',       // 'PRECIOS' | 'DIFERENCIAL'
  filtroMarker: 'TODOS',       // TODOS | CUALQUIERA | UNLEADED | DIESEL | GLP | GNV
  expandedGroups: new Set(),

  // paginación y estructura por corredor
  filasPorPagina: 15,          // Capacidad visible de estaciones en pantalla
  corredores: [],              // Lista de nombres de corredores ['LIMA NORTE', 'JAVIER PRADO', ...]
  corredoresMap: {},           // { [corredor]: [estaciones...] }
  corredorActivo: '',          // Corredor seleccionado actualmente
  subPaginaCorredor: 0,        // Índice de página interna dentro del corredor (0, 1, 2...)
  scrollTarget: null
};