/* ==========================================================
   app.js — arranque y orquestación
   ========================================================== */

import { state } from './state.js';
import { cargarMatriz } from './data.js';
import { estacionesFiltradas } from './filters.js';
import { recalcularCapacidad, construirTabs } from './paginacion.js';

import { navHTML }      from './components/nav.js';
import { railHTML }     from './components/rail.js';
import { viewBarHTML }  from './components/view-bar.js';
import { tableHTML }    from './components/table.js';
import { tabbarHTML }   from './components/tabbar.js';

import { renderFilas }   from './views/matriz-competitiva.js';
import { analyticsHTML, renderAnalisis } from './views/analisis-ponderado.js';

function montar(selector, html) {
  const nodo = document.querySelector(selector);
  if (nodo) nodo.innerHTML = html;
}

// 1. Montaje estático
montar('#cmp-nav',    navHTML());
montar('#cmp-rail',   railHTML());
montar('#cmp-main',   viewBarHTML() + tableHTML() + analyticsHTML());
montar('#cmp-tabbar', tabbarHTML());

// 2. Control de Vistas
function setVista(vista) {
  state.vistaActiva = vista;

  const btnMatriz = document.getElementById('tab-view-matriz');
  const btnAnalisis = document.getElementById('tab-view-analisis');
  if (btnMatriz) btnMatriz.classList.toggle('active', vista === 'MATRIZ');
  if (btnAnalisis) btnAnalisis.classList.toggle('active', vista === 'ANALISIS');

  const tableShell = document.querySelector('.table-shell');
  const analyticsShell = document.getElementById('analytics-shell');
  const tabbar = document.getElementById('cmp-tabbar');
  const railMatriz = document.getElementById('rail-panel-matriz');
  const railAnalisis = document.getElementById('rail-panel-analisis');

  if (vista === 'MATRIZ') {
    if (tableShell) tableShell.style.display = 'flex';
    if (analyticsShell) analyticsShell.style.display = 'none';
    if (tabbar) tabbar.style.display = 'flex';
    if (railMatriz) railMatriz.style.display = 'flex';
    if (railAnalisis) railAnalisis.style.display = 'none';
  } else {
    if (tableShell) tableShell.style.display = 'none';
    if (analyticsShell) analyticsShell.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    if (railMatriz) railMatriz.style.display = 'none';
    if (railAnalisis) railAnalisis.style.display = 'flex';
    poblarSelectorCorredoresAnalisis();
  }

  actualizarIndicadorModo();
  render();
}

function actualizarIndicadorModo() {
  const modeLabel = document.getElementById('view-mode');
  if (!modeLabel) return;

  if (state.vistaActiva === 'MATRIZ') {
    modeLabel.innerText = (state.modoActual === 'PRECIOS')
      ? 'MÉTRICA ACTIVA: PRECIOS'
      : 'MÉTRICA ACTIVA: DIFERENCIALES';
  } else {
    modeLabel.innerText = `PRODUCTO: ${(state.analisisProducto || 'DIESEL').toUpperCase()}`;
  }
}

// Poblar el dropdown de corredores en la vista de análisis
function poblarSelectorCorredoresAnalisis() {
  const sel = document.getElementById('sel-analisis-corredor');
  if (!sel || !state.corredores || state.corredores.length === 0) return;

  const valorActual = state.analisisCorredor || 'TODOS';
  sel.innerHTML = `<option value="TODOS">Todos los corredores</option>`;

  state.corredores.forEach(corr => {
    const opt = document.createElement('option');
    opt.value = corr;
    opt.textContent = corr;
    if (corr === valorActual) opt.selected = true;
    sel.appendChild(opt);
  });
}

// 3. Controles de Análisis Ponderado
function cambiarProductoAnalisis() {
  const sel = document.getElementById('sel-analisis-prod');
  if (sel) state.analisisProducto = sel.value;
  actualizarIndicadorModo();
  render();
}

function cambiarCorredorAnalisis() {
  const sel = document.getElementById('sel-analisis-corredor');
  if (sel) state.analisisCorredor = sel.value;
  render();
}

function cambiarModoAnalisis(modo) {
  state.analisisModo = modo;
  
  const bComp = document.getElementById('btn-scope-comp');
  const bCoesti = document.getElementById('btn-scope-coesti');
  const bMarca = document.getElementById('btn-scope-marca');

  if (bComp) bComp.classList.toggle('active', modo === 'COMPETENCIA');
  if (bCoesti) bCoesti.classList.toggle('active', modo === 'COESTI');
  if (bMarca) bMarca.classList.toggle('active', modo === 'MARCA');

  render();
}

// 4. Controles de Matriz Competitiva
function setModo(modo) {
  state.modoActual = modo;
  const btnPrecios = document.getElementById('btn-precios');
  const btnDiff = document.getElementById('btn-diferencial');
  if (btnPrecios) btnPrecios.classList.toggle('active', modo === 'PRECIOS');
  if (btnDiff) btnDiff.classList.toggle('active', modo === 'DIFERENCIAL');
  actualizarIndicadorModo();
  render();
}

function cambiarFiltroMarker() {
  const sel = document.getElementById('sel-marker');
  if (sel) state.filtroMarker = sel.value;
  render();
}

function toggleGroup(siteId) {
  if (state.expandedGroups.has(siteId)) {
    state.expandedGroups.delete(siteId);
  } else {
    state.expandedGroups.add(siteId);
    state.scrollTarget = siteId;
  }
  render();
}

function filtrarEstaciones() {
  state.subPaginaCorredor = 0;
  render();
}

function onSeleccionarCorredor() {
  const scroll = document.getElementById('table-scroll');
  if (scroll) scroll.scrollTop = 0;
  render();
}

// 5. Render
function render() {
  if (!state.rawData || !state.rawData.estaciones) return;

  const txtSearch = document.getElementById('txt-search');
  const query = txtSearch ? txtSearch.value.toLowerCase().trim() : '';
  const lista = estacionesFiltradas(query);

  const navTotal = document.getElementById('nav-total');
  const metaInfo = document.getElementById('meta-info');
  if (navTotal) navTotal.innerText = lista.length;
  if (metaInfo) {
    metaInfo.innerText = `Última actualización: ${state.rawData.actualizado_al} · Estaciones monitoreadas: ${lista.length}`;
  }

  // Si estamos en Análisis Ponderado, renderiza el gráfico
  if (state.vistaActiva === 'ANALISIS') {
    renderAnalisis(state.rawData.estaciones);
    return;
  }

  // Matriz Competitiva
  construirTabs(lista, onSeleccionarCorredor);

  const tbody = document.getElementById('grid-body');
  const emptyState = document.getElementById('empty-state');

  if (emptyState) emptyState.style.display = lista.length ? 'none' : 'block';
  
  if (tbody) {
    renderFilas(tbody, lista, () => render());
  }

  if (state.scrollTarget && tbody) {
    const row = tbody.querySelector(`tr.parent-row[data-site="${state.scrollTarget}"]`);
    if (row) row.scrollIntoView({ block: 'nearest' });
    state.scrollTarget = null;
  }
}

// 6. Arranque
async function iniciar() {
  try {
    state.rawData = await cargarMatriz();
    state.vistaActiva = 'MATRIZ';
    state.analisisProducto = 'Diesel';
    state.analisisModo = 'COMPETENCIA';
    state.analisisCorredor = 'TODOS';

    recalcularCapacidad();
    render();
  } catch (err) {
    console.error("Error cargando JSON:", err);
  }
}

let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    if (state.vistaActiva === 'MATRIZ') recalcularCapacidad();
    render();
  }, 150);
});

document.addEventListener('fullscreenchange', () => {
  if (state.vistaActiva === 'MATRIZ') recalcularCapacidad();
  render();
});

Object.assign(window, {
  setVista,
  setModo,
  cambiarFiltroMarker,
  toggleGroup,
  filtrarEstaciones,
  onSeleccionarCorredor,
  cambiarProductoAnalisis,
  cambiarCorredorAnalisis,
  cambiarModoAnalisis,
  render
});

window.onload = iniciar;