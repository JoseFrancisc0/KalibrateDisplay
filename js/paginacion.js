/* ==========================================================
   paginacion.js — reparto de estaciones por Corredor
   ========================================================== */

import { state } from './state.js';
import { ROW_H, THEAD_H } from './config.js';

export function recalcularCapacidad() {
  const shell = document.getElementById('table-scroll');
  const h = shell ? shell.clientHeight : 600;
  const n = Math.floor((h - THEAD_H - 2) / ROW_H);
  state.filasPorPagina = Math.max(5, n);
}

// Limpia el prefijo repetitivo "CORREDOR " si existe
export function formatearNombreCorredor(corr) {
  const c = (corr || '').trim().toUpperCase();
  if (c.startsWith('CORREDOR ')) {
    return c.replace('CORREDOR ', '').trim();
  }
  return c;
}

export function construirTabs(lista, onSelect) {
  const grupos = {};
  lista.forEach(est => {
    let corr = (est.corredor && est.corredor.trim()) 
      ? est.corredor.trim().toUpperCase() 
      : 'SIN CORREDOR';
    if (!grupos[corr]) grupos[corr] = [];
    grupos[corr].push(est);
  });

  state.corredoresMap = grupos;
  state.corredores = Object.keys(grupos).sort((a, b) => {
    if (a === 'SIN CORREDOR') return 1;
    if (b === 'SIN CORREDOR') return -1;
    return a.localeCompare(b);
  });

  if (!state.corredores.includes(state.corredorActivo)) {
    state.corredorActivo = state.corredores[0] || '';
    state.subPaginaCorredor = 0;
  }

  const cont = document.getElementById('tabs');
  if (!cont) return;

  cont.innerHTML = '';
  state.corredores.forEach((corr) => {
    const count = grupos[corr].length;
    const btn = document.createElement('button');
    btn.className = 'tab' + (corr === state.corredorActivo ? ' active' : '');
    
    // Etiqueta limpia + Badge de cantidad
    btn.innerHTML = `
      <span>${formatearNombreCorredor(corr)}</span>
      <span class="tab-badge">${count}</span>
    `;
    btn.title = `${corr} (${count} estación${count === 1 ? '' : 'es'})`;

    btn.onclick = () => {
      if (state.corredorActivo === corr) return;
      state.corredorActivo = corr;
      state.subPaginaCorredor = 0;
      onSelect();
    };
    cont.appendChild(btn);
  });

  const tabCountEl = document.getElementById('tab-count');
  if (tabCountEl) {
    tabCountEl.innerText = `${lista.length} · ${state.corredores.length} corredores`;
  }
}

export function obtenerEstacionesVisibles() {
  const ests = state.corredoresMap[state.corredorActivo] || [];
  const totalSubpaginas = Math.ceil(ests.length / state.filasPorPagina) || 1;

  if (state.subPaginaCorredor >= totalSubpaginas) {
    state.subPaginaCorredor = totalSubpaginas - 1;
  }
  if (state.subPaginaCorredor < 0) {
    state.subPaginaCorredor = 0;
  }

  const inicio = state.subPaginaCorredor * state.filasPorPagina;
  const fin = inicio + state.filasPorPagina;

  return {
    estaciones: ests.slice(inicio, fin),
    totalEstacionesCorredor: ests.length,
    subPaginaActual: state.subPaginaCorredor + 1,
    totalSubpaginas: totalSubpaginas,
    tieneAnterior: state.subPaginaCorredor > 0,
    tieneSiguiente: state.subPaginaCorredor < totalSubpaginas - 1
  };
}