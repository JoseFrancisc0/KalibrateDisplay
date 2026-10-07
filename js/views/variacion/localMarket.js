/* ==========================================================
   views/variacion/localMarket.js — precios de las competidoras
   Local Market para el modo "LOCAL MARKET" de la vista.

   - QUIÉN es Local Market: matriz_precios.json, igual que en
     Matriz y Alineación → competidor externo con main_marker
     en ese producto para alguna estación propia (activa).
   - SU HISTÓRICO: series por site_id de detalle_estaciones/
     {own_site_id}.json (historico_m2.<producto>.competidores).
   - Regla de precio (la misma que historico_marcas.json):
     último precio conocido a la fecha; un precio por estación.
   ========================================================== */

import { state } from '../../core/state.js';
import { cargarDetalleEstacion } from '../../core/data.js';
import { esCompetenciaExterna } from '../../shared/marcas.js';
import { variacionState } from './state.js';

const DESCARGAS_EN_PARALELO = 6;

const clave = (v) => (v || '').trim().toUpperCase();

/** Marca del competidor con el mismo nombre que usa historico_marcas.json */
function marcaComoHistorico(marca) {
  const m = clave(marca);
  return m === 'PRIMAX' ? 'PRIMAX (DEALERS)' : m;
}

let relacionesCache = null;

/**
 * Pares (estación propia, competidor LM, producto) según matriz_precios.json.
 * Se excluyen las estaciones propias INACTIVAS (como en Alineación).
 */
function relacionesLM() {
  if (relacionesCache) return relacionesCache;
  const out = [];
  (state.rawData?.estaciones || []).forEach(est => {
    if (est.gpc_group === 'INACTIVAS') return;
    (est.actores || []).filter(esCompetenciaExterna).forEach(comp => {
      Object.entries(comp.combustibles || {}).forEach(([prod, c]) => {
        if (!c || !c.main_marker) return;
        out.push({
          ownId: est.own_site_id,
          corredor: clave(est.corredor),
          departamento: clave(est.departamento),
          gpc: clave(est.gpc_group),
          prod,
          siteId: comp.site_id,
          marca: marcaComoHistorico(comp.marca)
        });
      });
    });
  });
  relacionesCache = out;
  return out;
}

/**
 * Descarga solo los detalles de estación necesarios para cubrir a todas
 * las competidoras LM (de todos los productos) y arma sus series.
 * Resultado: { 'Producto|site_id': [{t, p}, ...] } ordenado por fecha.
 */
export async function cargarSeriesLM(onProgreso) {
  const rel = relacionesLM();

  // Pares LM que aporta cada estación propia
  const paresPorEstacion = new Map();
  rel.forEach(r => {
    if (!paresPorEstacion.has(r.ownId)) paresPorEstacion.set(r.ownId, new Set());
    paresPorEstacion.get(r.ownId).add(`${r.prod}|${r.siteId}`);
  });

  // Cobertura voraz: el menor número de archivos que cubre todos los pares
  const pendientes = new Set(rel.map(r => `${r.prod}|${r.siteId}`));
  const archivos = [];
  const candidatas = [...paresPorEstacion.entries()].sort((a, b) => b[1].size - a[1].size);
  candidatas.forEach(([ownId, pares]) => {
    const aporta = [...pares].filter(k => pendientes.has(k));
    if (aporta.length === 0) return;
    archivos.push(ownId);
    aporta.forEach(k => pendientes.delete(k));
  });

  const series = {};
  const cola = [...archivos];
  let hechos = 0;

  async function trabajador() {
    while (cola.length) {
      const ownId = cola.shift();
      const detalle = await cargarDetalleEstacion(ownId);
      hechos++;
      if (onProgreso) onProgreso(hechos, archivos.length);
      if (!detalle) continue;

      const pares = paresPorEstacion.get(ownId);
      Object.entries(detalle.historico_m2 || {}).forEach(([prod, hist]) => {
        Object.entries(hist?.competidores || {}).forEach(([siteId, puntos]) => {
          const k = `${prod}|${siteId}`;
          if (series[k] || !pares.has(k)) return;
          series[k] = (puntos || [])
            .filter(x => x && x.p > 0)
            .sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
        });
      });
    }
  }

  await Promise.all(Array.from({ length: DESCARGAS_EN_PARALELO }, trabajador));
  return series;
}

/** Último precio conocido con fecha ≤ f (YYYY-MM-DD). */
function precioAl(puntos, f) {
  let precio = null;
  for (const x of puntos) {
    if (x.t.slice(0, 10) > f) break;
    precio = x.p;
  }
  return precio;
}

/**
 * Precio promedio por marca de las competidoras LM en f1 y f2.
 * Devuelve { [marca]: { p1, p2, pesoF2 } } con el mismo formato
 * que usa calculo.js para las marcas del histórico.
 */
export function preciosLocalMarket(prod, { corredor, departamento, gpc }, f1, f2) {
  const series = variacionState.seriesLM || {};

  // Competidoras LM del producto dentro de la segmentación (una vez cada una)
  const sitios = new Map();
  relacionesLM().forEach(r => {
    if (r.prod !== prod) return;
    if (corredor !== 'TODOS' && r.corredor !== corredor) return;
    if (departamento !== 'TODOS' && r.departamento !== departamento) return;
    if (gpc !== 'TODOS' && r.gpc !== gpc) return;
    sitios.set(r.siteId, r.marca);
  });

  const acc = {};
  sitios.forEach((marca, siteId) => {
    const puntos = series[`${prod}|${siteId}`];
    if (!puntos || puntos.length === 0) return;
    if (!acc[marca]) acc[marca] = { s1: 0, n1: 0, s2: 0, n2: 0 };
    const p1 = precioAl(puntos, f1);
    const p2 = precioAl(puntos, f2);
    if (p1 !== null) { acc[marca].s1 += p1; acc[marca].n1++; }
    if (p2 !== null) { acc[marca].s2 += p2; acc[marca].n2++; }
  });

  const out = {};
  Object.entries(acc).forEach(([marca, a]) => {
    if (a.n1 === 0 || a.n2 === 0) return;
    out[marca] = { p1: a.s1 / a.n1, p2: a.s2 / a.n2, pesoF2: a.n2 };
  });
  return out;
}
