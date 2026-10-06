/* ==========================================================
   data.js — acceso al JSON generado por el notebook.
   ========================================================== */

import { DATA_URL } from './config.js';

// Caché para no releer del disco/servidor estaciones ya abiertas
const cacheDetalleEstaciones = new Map();

/**
 * 1. Carga inicial: Matriz general y análisis ponderado
 */
export async function cargarMatriz() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`HTTP Error al cargar matriz: ${response.status}`);
  return await response.json();
}

/**
 * 2. Carga bajo demanda: Detalle para las 4 vistas de la estación seleccionada
 */
export async function cargarDetalleEstacion(ownSiteId) {
  if (cacheDetalleEstaciones.has(ownSiteId)) {
    return cacheDetalleEstaciones.get(ownSiteId);
  }

  const baseDir = DATA_URL.substring(0, DATA_URL.lastIndexOf('/'));
  const urlEstacion = `${baseDir}/detalle_estaciones/${ownSiteId}.json`;

  const response = await fetch(urlEstacion);
  if (!response.ok) {
    throw new Error(`HTTP Error (${response.status}) cargando estación ${ownSiteId}`);
  }

  const data = await response.json();
  cacheDetalleEstaciones.set(ownSiteId, data);
  return data;
}

export async function cargarHistoricoMarcas() {
  try {
    const resp = await fetch('./data/historico_marcas.json');
    if (!resp.ok) {
      throw new Error(`Error cargando historico_marcas.json: ${resp.status}`);
    }
    return await resp.json();
  } catch (err) {
    console.error("No se pudo cargar el archivo historico_marcas.json:", err);
    return null;
  }
}