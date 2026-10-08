/* ==========================================================
   shared/segmentacion.js — filtros geográficos comunes
   (corredor, departamento, GPC group).
   ========================================================== */

import { poblarSelect } from './dom.js';

function clave(valor, sinValor) {
  return (valor && valor.trim()) ? valor.trim().toUpperCase() : sinValor;
}

/**
 * ¿La estación cumple la segmentación seleccionada?
 * filtro = { gpc, corredor, zona, departamento, provincia, distrito } con 'TODOS' como comodín.
 */
export function cumpleSegmentacion(est, filtro = {}) {
  const g = clave(est.gpc_group, 'SIN GPC');
  const c = clave(est.corredor, 'SIN CORREDOR');
  const z = clave(est.zona, 'SIN ZONA');
  const d = clave(est.departamento, 'SIN DEPARTAMENTO');
  const pv = clave(est.provincia, 'SIN PROVINCIA');
  const dt = clave(est.distrito, 'SIN DISTRITO');

  return (
    (!filtro.gpc || filtro.gpc === 'TODOS' || g === filtro.gpc) &&
    (!filtro.corredor || filtro.corredor === 'TODOS' || c === filtro.corredor) &&
    (!filtro.zona || filtro.zona === 'TODOS' || z === filtro.zona) &&
    (!filtro.departamento || filtro.departamento === 'TODOS' || d === filtro.departamento) &&
    (!filtro.provincia || filtro.provincia === 'TODOS' || pv === filtro.provincia) &&
    (!filtro.distrito || filtro.distrito === 'TODOS' || dt === filtro.distrito)
  );
}

/** Valores distintos (trim + mayúsculas, ordenados) de un campo de las estaciones. */
export function valoresUnicos(estaciones, campo) {
  const set = new Set();
  estaciones.forEach(e => {
    const v = e[campo];
    if (v && v.trim()) set.add(v.trim().toUpperCase());
  });
  return Array.from(set).sort();
}

/** Rellena selects de segmentación pasados en un mapa clave -> id */
export function poblarSelectsSegmentacion(estaciones, ids) {
  if (ids.gpc) poblarSelect(ids.gpc, () => valoresUnicos(estaciones, 'gpc_group'));
  if (ids.corredor) poblarSelect(ids.corredor, () => valoresUnicos(estaciones, 'corredor'));
  if (ids.zona) poblarSelect(ids.zona, () => valoresUnicos(estaciones, 'zona'));
  if (ids.departamento) poblarSelect(ids.departamento, () => valoresUnicos(estaciones, 'departamento'));
  if (ids.provincia) poblarSelect(ids.provincia, () => valoresUnicos(estaciones, 'provincia'));
  if (ids.distrito) poblarSelect(ids.distrito, () => valoresUnicos(estaciones, 'distrito'));
}
