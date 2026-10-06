/* ==========================================================
   config/datos.js — rutas de los JSON generados por el notebook.
   ========================================================== */

export const DATA_URL           = './data/matriz_precios.json';
export const HISTORICO_URL      = './data/historico_marcas.json';
export const DETALLE_ESTACION_URL = (siteId) => `./data/detalle_estaciones/${siteId}.json`;
