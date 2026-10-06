/* ==========================================================
   data.js — acceso al JSON generado por el notebook.
   ========================================================== */

import { DATA_URL } from './config.js';

export async function cargarMatriz() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`HTTP Error al cargar matriz: ${response.status}`);
  return await response.json();
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

export async function cargarDetalleEstacion(siteId) {
  try {
    const resp = await fetch(`./data/detalle_estaciones/${siteId}.json`);
    if (!resp.ok) {
      throw new Error(`Error cargando detalle de estación ${siteId}: ${resp.status}`);
    }
    return await resp.json();
  } catch (err) {
    console.error(`No se pudo cargar el detalle de la estación ${siteId}:`, err);
    return null;
  }
}