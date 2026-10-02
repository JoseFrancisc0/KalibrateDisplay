/* ==========================================================
   views/matriz-competitiva.js — vista "Matriz Competitiva".
   ========================================================== */

import { state } from '../state.js';
import { COMBUSTIBLES, GRUPOS_MARKER, getBrandLogo, LOGO_GENERICO } from '../config.js';
import { renderDrop } from '../icons.js';
import { cumpleFiltroMarker } from '../filters.js';
import { obtenerEstacionesVisibles } from '../paginacion.js';

function celdasPropio(actorPropio) {
  return COMBUSTIBLES.map(c => {
    const item = actorPropio.combustibles ? actorPropio.combustibles[c] : null;
    if (!item || !item.precio || item.precio <= 0) {
      return `<td class="col-num no-data">—</td>`;
    }

    const vigenciaHtml = item.vigencia 
      ? `<span class="price-timestamp">${item.vigencia}</span>` 
      : '';

    return `
      <td class="col-num">
        <div class="cell-propio-wrap">
          <span class="price-val">${item.precio.toFixed(2)}</span>
          ${vigenciaHtml}
        </div>
      </td>`;
  }).join('');
}

function celdasCompetidor(comp) {
  return COMBUSTIBLES.map(c => {
    const item = comp.combustibles ? comp.combustibles[c] : null;
    if (!item || !item.precio || item.precio <= 0) {
      return `<td class="col-num no-data">—</td>`;
    }

    if (state.modoActual === 'PRECIOS') {
      return `<td class="col-num">${item.precio.toFixed(2)}</td>`;
    } else {
      const diff = item.diferencial;
      if (diff === null || diff === undefined) return `<td class="col-num no-data">—</td>`;

      let claseDiff = 'diff-zero';
      let signo = '';
      if (diff > 0) { claseDiff = 'diff-pos'; signo = '+'; }
      else if (diff < 0) { claseDiff = 'diff-neg'; }

      return `<td class="col-num ${claseDiff}">${signo}${diff.toFixed(2)}</td>`;
    }
  }).join('');
}

export function renderFilas(tbody, listaFiltrada, onRecargarVista) {
  tbody.innerHTML = '';

  const { 
    estaciones, 
    subPaginaActual, 
    totalSubpaginas, 
    tieneAnterior, 
    tieneSiguiente 
  } = obtenerEstacionesVisibles();

  // Renderizar filas de la pantalla activa
  estaciones.forEach(est => {
    const actorPropio  = est.actores.find(a => a.tipo_actor === 'PROPIO');
    const competidores = est.actores.filter(a => a.tipo_actor === 'COMPETENCIA');
    if (!actorPropio) return;

    const isExpanded = state.expandedGroups.has(est.own_site_id);
    const visibles   = competidores.filter(cumpleFiltroMarker);

    /* ---------- FILA PROPIA (Cabecera) ---------- */
    const trParent = document.createElement('tr');
    trParent.className = 'parent-row' + (isExpanded && visibles.length ? ' is-open' : '');
    trParent.dataset.site = est.own_site_id;

    trParent.innerHTML = `
      <td>
        <div class="site-info">
          ${competidores.length > 0
            ? `<button class="btn-toggle${isExpanded ? ' on' : ''}" onclick="toggleGroup('${est.own_site_id}')">${isExpanded ? '−' : '+'}</button>`
            : `<span style="width:17px;flex:0 0 17px;"></span>`}
          <span class="site-name">${est.estacion_cabecera}</span>
          ${competidores.length > 0 ? `<span class="count-tag">${visibles.length}</span>` : ''}
        </div>
      </td>
      ${celdasPropio(actorPropio)}
    `;
    tbody.appendChild(trParent);

    /* ---------- FILAS DE COMPETENCIA ---------- */
    visibles.forEach(comp => {
      const trChild = document.createElement('tr');
      trChild.className = `child-row ${isExpanded ? 'open' : ''}`;

      const logoUrl = getBrandLogo(comp.marca);
      const logoHtml = `
        <span class="brand-logo-wrap" title="${comp.marca || 'Sin marca'}">
          <img src="${logoUrl}" alt="${comp.marca || 'Marca'}" 
               class="brand-logo-img" 
               onerror="this.onerror=null; this.src='${LOGO_GENERICO}';">
        </span>
      `;

      const gruposActivos = GRUPOS_MARKER.filter(g => {
        return g.combustibles.some(c => comp.combustibles && comp.combustibles[c] && comp.combustibles[c].main_marker);
      });

      const clusterGotasHtml = gruposActivos.length > 0 
        ? `<span class="marker-cluster" title="Main Marker en: ${gruposActivos.map(g => g.nombre).join(', ')}">
             ${gruposActivos.map(g => renderDrop(g.id)).join('')}
           </span>`
        : '';

      trChild.innerHTML = `
        <td>
          <div class="site-info">
            ${logoHtml}
            <span class="site-name" title="${comp.nombre_linea}">${comp.nombre_linea}</span>
            ${clusterGotasHtml}
            ${comp.distancia_km !== undefined && comp.distancia_km !== null
                ? `<span class="dist-tag">${comp.distancia_km.toFixed(1)} km</span>` : ''}
          </div>
        </td>
        ${celdasCompetidor(comp)}
      `;
      tbody.appendChild(trChild);
    });
  });

  // Actualizar controles flotantes al terminar de pintar filas
  actualizarControlesLaterales({
    tieneAnterior,
    tieneSiguiente,
    subPaginaActual,
    totalSubpaginas,
    onCambioPagina: (direccion) => {
      state.subPaginaCorredor += direccion;
      if (typeof onRecargarVista === 'function') onRecargarVista();
    }
  });
}

function actualizarControlesLaterales({ tieneAnterior, tieneSiguiente, subPaginaActual, totalSubpaginas, onCambioPagina }) {
  let navWrap = document.getElementById('matrix-nav-arrows');
  const tableShell = document.querySelector('.table-shell');

  if (!tableShell) return;

  if (!navWrap) {
    navWrap = document.createElement('div');
    navWrap.id = 'matrix-nav-arrows';
    navWrap.className = 'matrix-nav-arrows';
    tableShell.style.position = 'relative';
    tableShell.appendChild(navWrap);
  }

  if (totalSubpaginas <= 1) {
    navWrap.style.display = 'none';
    return;
  }

  navWrap.style.display = 'flex';
  navWrap.innerHTML = `
    <button class="nav-arrow nav-arrow-left ${!tieneAnterior ? 'disabled' : ''}" 
            title="Página anterior" ${!tieneAnterior ? 'disabled' : ''}>‹</button>
    <span class="nav-page-indicator">${subPaginaActual} / ${totalSubpaginas}</span>
    <button class="nav-arrow nav-arrow-right ${!tieneSiguiente ? 'disabled' : ''}" 
            title="Siguiente página" ${!tieneSiguiente ? 'disabled' : ''}>›</button>
  `;

  const btnPrev = navWrap.querySelector('.nav-arrow-left');
  const btnNext = navWrap.querySelector('.nav-arrow-right');

  if (tieneAnterior) btnPrev.onclick = (e) => { e.stopPropagation(); onCambioPagina(-1); };
  if (tieneSiguiente) btnNext.onclick = (e) => { e.stopPropagation(); onCambioPagina(1); };
}