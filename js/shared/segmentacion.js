/* ==========================================================
   shared/segmentacion.js — filtros geográficos y operativos comunes
   ========================================================== */

import { poblarSelect } from './dom.js';

function clave(valor, sinValor) {
  return (valor && valor.trim()) ? valor.trim().toUpperCase() : sinValor;
}

export function cumpleSegmentacion(est, filtro = {}) {
  const gpc = clave(est.gpc_group || est.gpc, 'SIN GPC');
  const gop = clave(est.gop, 'SIN GOP');
  const jop = clave(est.jop, 'SIN JOP');
  const c   = clave(est.corredor, 'SIN CORREDOR');
  const d   = clave(est.departamento, 'SIN DEPARTAMENTO');
  const pv  = clave(est.provincia, 'SIN PROVINCIA');
  const dt  = clave(est.distrito, 'SIN DISTRITO');

  return (
    (!filtro.gpc || filtro.gpc === 'TODOS' || gpc === filtro.gpc) &&
    (!filtro.gop || filtro.gop === 'TODOS' || gop === filtro.gop) &&
    (!filtro.jop || filtro.jop === 'TODOS' || jop === filtro.jop) &&
    (!filtro.corredor || filtro.corredor === 'TODOS' || c === filtro.corredor) &&
    (!filtro.departamento || filtro.departamento === 'TODOS' || d === filtro.departamento) &&
    (!filtro.provincia || filtro.provincia === 'TODOS' || pv === filtro.provincia) &&
    (!filtro.distrito || filtro.distrito === 'TODOS' || dt === filtro.distrito)
  );
}

export function valoresUnicos(estaciones, campo) {
  const set = new Set();
  estaciones.forEach(e => {
    const v = e[campo];
    if (v && v.trim()) set.add(v.trim().toUpperCase());
  });
  return Array.from(set).sort();
}

export function poblarSelectsSegmentacion(estaciones, ids) {
  if (ids.gpc) poblarSelect(ids.gpc, () => valoresUnicos(estaciones, 'gpc_group'));
  if (ids.gop) poblarSelect(ids.gop, () => valoresUnicos(estaciones, 'gop'));
  if (ids.jop) poblarSelect(ids.jop, () => valoresUnicos(estaciones, 'jop'));
  if (ids.corredor) poblarSelect(ids.corredor, () => valoresUnicos(estaciones, 'corredor'));
  if (ids.departamento) poblarSelect(ids.departamento, () => valoresUnicos(estaciones, 'departamento'));
  if (ids.provincia) poblarSelect(ids.provincia, () => valoresUnicos(estaciones, 'provincia'));
  if (ids.distrito) poblarSelect(ids.distrito, () => valoresUnicos(estaciones, 'distrito'));
}