/* ==========================================================
   views/matriz/filtros.js — reglas de filtrado de la Matriz.
   - estacionesFiltradas: qué estaciones propias se listan
   - cumpleFiltroMarker:  qué competidores se muestran bajo
     cada estación según el selector de Main Marker
   - cumpleFiltroMarca:   ídem según la marca competidora
   ========================================================== */

import { state } from '../../core/state.js';
import { COMBUSTIBLES } from '../../config/productos.js';
import { normalizarMarca } from '../../shared/marcas.js';
import { matrizState } from './state.js';

export function estacionesFiltradas(query) {
  if (!state.rawData || !state.rawData.estaciones) return [];

  return state.rawData.estaciones.filter(est => {
    if (query && !est.estacion_cabecera.toLowerCase().includes(query)) return false;
    return est.actores.some(a => a.tipo_actor === 'PROPIO');
  });
}

/** Estaciones listadas según el texto del buscador del rail. */
export function estacionesListadas() {
  const txtSearch = document.getElementById('txt-search');
  const query = txtSearch ? txtSearch.value.toLowerCase().trim() : '';
  return estacionesFiltradas(query);
}

export function cumpleFiltroMarker(comp) {
  const filtroMarker = matrizState.filtroMarker;

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
  const filtro = matrizState.filtroMarca;
  if (!filtro || filtro === 'TODAS') return true;
  return normalizarMarca(comp.marca) === filtro;
}
