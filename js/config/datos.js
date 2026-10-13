/* ==========================================================
   config/datos.js — rutas de los JSON generados por el notebook.
   ========================================================== */

export const DATA_URL           = './data/matriz_precios.json';
export const HISTORICO_URL      = './data/historico_marcas.json.gz';
export const DETALLE_ESTACION_URL = (siteId) => `./data/detalle_estaciones/${siteId}.json`;
export const CAMBIOS_SEMANALES_URL = './data/cambios_semanales_competencia.json';