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
    poblarFiltrosAnalisis();
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

// 3. Poblado y Gestión de Filtros de Análisis
function poblarFiltrosAnalisis() {
  if (!state.rawData?.estaciones) return;
  const estaciones = state.rawData.estaciones;

  // A. Corredores
  const selCorr = document.getElementById('sel-analisis-corredor');
  if (selCorr && selCorr.options.length <= 1) {
    const corredoresSet = new Set();
    estaciones.forEach(e => {
      if (e.corredor && e.corredor.trim()) corredoresSet.add(e.corredor.trim().toUpperCase());
    });
    Array.from(corredoresSet).sort().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      selCorr.appendChild(opt);
    });
  }

  // B. Departamentos
  const selDepto = document.getElementById('sel-analisis-depto');
  if (selDepto && selDepto.options.length <= 1) {
    const deptosSet = new Set();
    estaciones.forEach(e => {
      if (e.departamento && e.departamento.trim()) deptosSet.add(e.departamento.trim().toUpperCase());
    });
    Array.from(deptosSet).sort().forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      selDepto.appendChild(opt);
    });
  }

  // C. GPC Groups
  const selGpc = document.getElementById('sel-analisis-gpc');
  if (selGpc && selGpc.options.length <= 1) {
    const gpcSet = new Set();
    estaciones.forEach(e => {
      if (e.gpc_group && e.gpc_group.trim()) gpcSet.add(e.gpc_group.trim().toUpperCase());
    });
    Array.from(gpcSet).sort().forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      selGpc.appendChild(opt);
    });
  }

  // D. Inicialización única del catálogo de marcas
  if (!state.analisisMarcasDisponibles || state.analisisMarcasDisponibles.length === 0) {
    const marcasSet = new Set();
    estaciones.forEach(e => {
      const comps = e.actores?.filter(a => a.tipo_actor === 'COMPETENCIA' && !a.es_competidor_propio) || [];
      comps.forEach(c => {
        let m = (c.marca || '').trim().toUpperCase();
        if (m && m !== 'SIN MARCA') {
          if (m === 'WP' || m === 'WHITE PRODUCTS' || m === 'WHITE PRODUCT') m = 'WP';
          marcasSet.add(m);
        }
      });
    });
    state.analisisMarcasDisponibles = Array.from(marcasSet).sort();
    if (!state.analisisMarcasSeleccionadas) {
      state.analisisMarcasSeleccionadas = new Set(state.analisisMarcasDisponibles);
    }
  }

  construirChecklistMarcasDOM();
}

function construirChecklistMarcasDOM() {
  const container = document.getElementById('checklist-marcas-items');
  if (!container) return;

  container.innerHTML = '';
  state.analisisMarcasDisponibles.forEach(marca => {
    const isChecked = state.analisisMarcasSeleccionadas.has(marca);
    const labelDisplay = (marca === 'PRIMAX') ? 'PRIMAX (DEALERS)' : (marca === 'WP' ? 'WHITE PRODUCTS' : marca);

    const row = document.createElement('label');
    row.className = 'multiselect-item';
    row.innerHTML = `
      <input type="checkbox" value="${marca}" ${isChecked ? 'checked' : ''} onchange="onToggleMarcaCheck('${marca}', this.checked)">
      <span>${labelDisplay}</span>
    `;
    container.appendChild(row);
  });

  actualizarBotonMarcasLabel();
}

function actualizarBotonMarcasLabel() {
  const lbl = document.getElementById('label-marcas-count');
  if (lbl) {
    lbl.textContent = 'BRANDS';
  }
}

// Handlers del Checklist de Marcas
function toggleDropdownMarcas() {
  const drop = document.getElementById('dropdown-marcas-content');
  if (drop) {
    drop.style.display = (drop.style.display === 'none' || !drop.style.display) ? 'block' : 'none';
  }
}

function marcarTodasMarcas(marcar) {
  if (marcar) {
    state.analisisMarcasSeleccionadas = new Set(state.analisisMarcasDisponibles);
  } else {
    state.analisisMarcasSeleccionadas = new Set();
  }
  construirChecklistMarcasDOM();
  render();
}

function onToggleMarcaCheck(marca, isChecked) {
  if (isChecked) {
    state.analisisMarcasSeleccionadas.add(marca);
  } else {
    state.analisisMarcasSeleccionadas.delete(marca);
  }
  actualizarBotonMarcasLabel();
  render();
}

// Cerrar el popup de marcas al hacer click fuera
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('section-filtro-marcas');
  const drop = document.getElementById('dropdown-marcas-content');
  if (wrap && drop && !wrap.contains(e.target)) {
    drop.style.display = 'none';
  }
});

// Handlers de Selectores
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

function cambiarDeptoAnalisis() {
  const sel = document.getElementById('sel-analisis-depto');
  if (sel) state.analisisDepartamento = sel.value;
  render();
}

function cambiarGpcAnalisis() {
  const sel = document.getElementById('sel-analisis-gpc');
  if (sel) state.analisisGpcGroup = sel.value;
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

  // Mostrar el filtro de marcas principalmente para PROMEDIO MARCAS
  const secMarcas = document.getElementById('section-filtro-marcas');
  if (secMarcas) {
    secMarcas.style.opacity = (modo === 'MARCA') ? '1' : '0.45';
  }

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
    state.analisisDepartamento = 'TODOS';
    state.analisisGpcGroup = 'TODOS';

    recalcularCapacidad();
    render();
  } catch (err) {
    console.error("Error cargando JSON:", err);
  }
}

// Reemplaza el bloque de resize al final de js/app.js por este:
let ultAncho = window.innerWidth;
let ultAlto  = window.innerHeight;
let rt;

window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    // Si la dimensión de la ventana no cambió realmente, ignorar (evita loop por scrollbars)
    if (window.innerWidth === ultAncho && window.innerHeight === ultAlto) {
      return;
    }
    ultAncho = window.innerWidth;
    ultAlto  = window.innerHeight;

    if (state.vistaActiva === 'MATRIZ') {
      recalcularCapacidad();
    }
    render();
  }, 120);
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
  cambiarDeptoAnalisis,
  cambiarGpcAnalisis,
  cambiarModoAnalisis,
  toggleDropdownMarcas,
  marcarTodasMarcas,
  onToggleMarcaCheck,
  render
});

window.onload = iniciar;