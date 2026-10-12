/* ==========================================================
   core/data.js — único punto de acceso a los JSON.
   ========================================================== */

import { DATA_URL, HISTORICO_URL, DETALLE_ESTACION_URL } from '../config/datos.js';

export async function cargarMatriz() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`HTTP Error al cargar matriz: ${response.status}`);
  return await response.json();
}

export async function cargarHistoricoMarcas() {
  try {
    const resp = await fetch(HISTORICO_URL);
    if (!resp.ok) {
      throw new Error(`Error cargando historico_marcas.json.gz: ${resp.status}`);
    }

    // Descompresión en streaming soportada nativamente por todos los navegadores
    const stream = resp.body.pipeThrough(new DecompressionStream('gzip'));
    const responseDescomprimida = new Response(stream);
    return await responseDescomprimida.json();
  } catch (err) {
    console.error("No se pudo cargar el archivo historico_marcas.json.gz:", err);
    return null;
  }
}

export async function cargarDetalleEstacion(siteId) {
  try {
    const resp = await fetch(DETALLE_ESTACION_URL(siteId));
    if (!resp.ok) {
      throw new Error(`Error cargando detalle de estación ${siteId}: ${resp.status}`);
    }
    return await resp.json();
  } catch (err) {
    console.error(`No se pudo cargar el detalle de la estación ${siteId}:`, err);
    return null;
  }
}
