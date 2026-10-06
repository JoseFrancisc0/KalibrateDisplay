/* ==========================================================
   views/matriz/vista.js — render completo de la Matriz:
   pestañas inferiores + filas + scroll a la estación abierta.
   ========================================================== */

import { render } from '../../core/router.js';
import { matrizState } from './state.js';
import { estacionesListadas } from './filtros.js';
import { construirTabs } from './paginacion.js';
import { renderFilas } from './filas.js';

function onSeleccionarGrupo() {
  const scroll = document.getElementById('table-scroll');
  if (scroll) scroll.scrollTop = 0;
  render();
}

export function renderMatriz() {
  const lista = estacionesListadas();

  const tableShell = document.querySelector('.table-shell');
  const tabbar     = document.getElementById('cmp-tabbar');

  if (tabbar) tabbar.style.display = 'flex';
  if (tableShell) tableShell.style.display = 'flex';
  construirTabs(lista, onSeleccionarGrupo);

  const tbody = document.getElementById('grid-body');
  const emptyState = document.getElementById('empty-state');

  if (emptyState) emptyState.style.display = lista.length ? 'none' : 'block';
  
  if (tbody) {
    renderFilas(tbody, lista, () => render());
  }

  if (matrizState.scrollTarget && tbody) {
    const row = tbody.querySelector(`tr.parent-row[data-site="${matrizState.scrollTarget}"]`);
    if (row) row.scrollIntoView({ block: 'nearest' });
    matrizState.scrollTarget = null;
  }
}
