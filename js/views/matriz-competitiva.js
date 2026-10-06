/* ==========================================================
   views/matriz-competitiva.js — vista "Matriz Competitiva".
   ========================================================== */

import { state } from '../state.js';
import { COMBUSTIBLES, GRUPOS_MARKER, getBrandLogo, LOGO_GENERICO } from '../config.js';
import { renderDrop } from '../icons.js';
import { cumpleFiltroMarker, cumpleFiltroMarca } from '../filters.js';
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
    tieneSiguiente,
    totalEstacionesGrupo
  } = obtenerEstacionesVisibles();

  // Renderizar filas de la pantalla activa
  estaciones.forEach(est => {
    const actorPropio  = est.actores.find(a => a.tipo_actor === 'PROPIO');
    const competidores = est.actores.filter(a => a.tipo_actor === 'COMPETENCIA');
    if (!actorPropio) return;

    const isExpanded = state.expandedGroups.has(est.own_site_id);
    const visibles   = competidores.filter(c => cumpleFiltroMarker(c) && cumpleFiltroMarca(c));

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

  // Actualizar la barra fija de paginación
  actualizarControlesLaterales({
    tieneAnterior,
    tieneSiguiente,
    subPaginaActual,
    totalSubpaginas,
    totalEstacionesGrupo,
    onCambioPagina: (direccion) => {
      state.subPaginaGrupo += direccion;
      if (typeof onRecargarVista === 'function') onRecargarVista();
    }
  });

  // Habilitar soporte de desplazamiento con rueda del ratón en la cinta de pestañas
  iniciarScrollRuedaPestanas();
}

function actualizarControlesLaterales({ tieneAnterior, tieneSiguiente, subPaginaActual, totalSubpaginas, totalEstacionesGrupo, onCambioPagina }) {
  const tableShell = document.querySelector('.table-shell');
  if (!tableShell) return;

  // Remover si existía el antiguo contenedor flotante
  const antiguoFlotante = document.getElementById('matrix-nav-arrows');
  if (antiguoFlotante) antiguoFlotante.remove();

  let footer = document.getElementById('table-footer-pagination');
  if (!footer) {
    footer = document.createElement('div');
    footer.id = 'table-footer-pagination';
    footer.className = 'table-footer';
    tableShell.appendChild(footer);
  }

  if (totalSubpaginas <= 1) {
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'flex';
  footer.innerHTML = `
    <div class="table-footer-info">
      Mostrando página ${subPaginaActual} de ${totalSubpaginas} (${totalEstacionesGrupo} estaciones en el grupo)
    </div>
    <div class="table-footer-nav">
      <button type="button" class="table-footer-btn nav-btn-prev" 
              title="Página anterior" ${!tieneAnterior ? 'disabled' : ''}>‹</button>
      <span class="table-footer-counter">${subPaginaActual} / ${totalSubpaginas}</span>
      <button type="button" class="table-footer-btn nav-btn-next" 
              title="Página siguiente" ${!tieneSiguiente ? 'disabled' : ''}>›</button>
    </div>
  `;

  const btnPrev = footer.querySelector('.nav-btn-prev');
  const btnNext = footer.querySelector('.nav-btn-next');

  if (tieneAnterior) btnPrev.onclick = (e) => { e.stopPropagation(); onCambioPagina(-1); };
  if (tieneSiguiente) btnNext.onclick = (e) => { e.stopPropagation(); onCambioPagina(1); };
}

// Desplazamiento horizontal con botones
window.desplazarPestanas = function(offset) {
  const tabs = document.getElementById('tabs');
  if (tabs) tabs.scrollLeft += offset;
};

// Soporte de desplazamiento horizontal con rueda del ratón
let ruedaConfigurada = false;
function iniciarScrollRuedaPestanas() {
  if (ruedaConfigurada) return;
  const tabs = document.getElementById('tabs');
  if (tabs) {
    tabs.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        tabs.scrollLeft += e.deltaY;
      }
    }, { passive: false });
    ruedaConfigurada = true;
  }
}