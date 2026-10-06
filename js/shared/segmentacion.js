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
 * filtro = { corredor, departamento, gpc } con 'TODOS' como comodín.
 */
export function cumpleSegmentacion(est, { corredor, departamento, gpc }) {
  const c = clave(est.corredor, 'SIN CORREDOR');
  const d = clave(est.departamento, 'SIN DEPARTAMENTO');
  const g = clave(est.gpc_group, 'SIN GPC');

  return (corredor === 'TODOS' || c === corredor) &&
         (departamento === 'TODOS' || d === departamento) &&
         (gpc === 'TODOS' || g === gpc);
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

/** Rellena (una sola vez) los tres selects de segmentación de una vista. */
export function poblarSelectsSegmentacion(estaciones, ids) {
  poblarSelect(ids.corredor,     () => valoresUnicos(estaciones, 'corredor'));
  poblarSelect(ids.departamento, () => valoresUnicos(estaciones, 'departamento'));
  poblarSelect(ids.gpc,          () => valoresUnicos(estaciones, 'gpc_group'));
}
