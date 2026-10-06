/* ==========================================================
   filters.js — reglas de filtrado.
   - estacionesFiltradas: qué estaciones propias se listan
   - cumpleFiltroMarker:  qué competidores se muestran bajo
     cada estación según el selector de Main Marker
   ========================================================== */

import { state } from './state.js';
import { COMBUSTIBLES } from './config.js';

export function estacionesFiltradas(query) {
  if (!state.rawData || !state.rawData.estaciones) return [];

  return state.rawData.estaciones.filter(est => {
    if (query && !est.estacion_cabecera.toLowerCase().includes(query)) return false;
    return est.actores.some(a => a.tipo_actor === 'PROPIO');
  });
}

export function cumpleFiltroMarker(comp) {
  const filtroMarker = state.filtroMarker;

  if (filtroMarker === 'TODOS') return true;
  if (!comp.combustibles) return false;

  const c = comp.combustibles;
  const esMarker = (nombre) => c[nombre] && c[nombre].main_marker;

  if (filtroMarker === 'CUALQUIERA') {
    return COMBUSTIBLES.some(f => esMarker(f));
  }
  if (filtroMarker === 'UNLEADED') {
    return esMarker('Regular') || esMarker('Premium');
  }
  if (filtroMarker === 'DIESEL') {
    return esMarker('Diesel');
  }
  if (filtroMarker === 'GLP') {
    return esMarker('GLP');
  }
  if (filtroMarker === 'GNV') {
    return esMarker('GNV');
  }
  return true;
}

export function cumpleFiltroMarca(comp) {
  const filtro = state.filtroMarcaMatriz;
  if (!filtro || filtro === 'TODAS') return true;

  let m = (comp.marca || '').trim().toUpperCase();
  if (m === 'WHITE PRODUCTS' || m === 'WHITE PRODUCT') m = 'WP';
  return m === filtro;
}