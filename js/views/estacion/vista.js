/* ==========================================================
   views/estacion/vista.js — Render de sub-vistas de Estación
   ========================================================== */
import { COMBUSTIBLES } from '../../config/productos.js';
import { getBrandLogo } from '../../config/marcas.js';
import { estacionState } from './state.js';

export function detalleEstacionHTML() {
  return `
    <div id="detalle-estacion-shell" class="estacion-shell" style="display: none;">
      <div id="estacion-subview-content" style="flex:1; display:flex; flex-direction:column; min-height:0;"></div>
    </div>
  `;
}

export function renderDetalleEstacion() {
  const contentBox = document.getElementById('estacion-subview-content');
  if (!contentBox) return;

  if (estacionState.cargando) {
    contentBox.innerHTML = `<div class="empty-state">Descargando datos de la estación...</div>`;
    return;
  }

  const est = estacionState.dataActiva;
  if (!est) {
    contentBox.innerHTML = `<div class="empty-state">No se pudo cargar la información de la estación.</div>`;
    return;
  }

  if (estacionState.subVista === 'ESTADO') {
    renderEstadoActual(contentBox, est);
  } else {
    contentBox.innerHTML = `
      <div class="empty-state">
        <h3>${estacionState.subVista}</h3>
        <p>Próximamente disponible.</p>
      </div>
    `;
  }
}

function renderEstadoActual(container, est) {
  const actorPropio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');

  if (!actorPropio) {
    container.innerHTML = `<div class="empty-state">Sin información de precios propios.</div>`;
    return;
  }

  // Columnas: Estación / Competidor (45%) y los 5 combustibles (11% cada uno)
  const theadHTML = `
    <thead>
      <tr>
        <th style="width: 45%;">Estación / Competidor</th>
        ${COMBUSTIBLES.map(c => `<th style="width: 11%; text-align: right;">${c.toUpperCase()}</th>`).join('')}
      </tr>
    </thead>
  `;

  // FILA 1: ESTACIÓN PROPIA
  const filaPropiaHTML = `
    <tr class="row-own">
      <td>
        <div class="actor-info-cell">
          <div class="actor-logo-box">
            <img src="${getBrandLogo('PRIMAX')}" alt="PRIMAX">
          </div>
          <div class="actor-name-box">
            <b>${est.estacion}</b>
            <span class="tag-own-badge">ESTACIÓN PROPIA</span>
          </div>
        </div>
      </td>
      ${COMBUSTIBLES.map(prod => {
        const item = actorPropio.combustibles?.[prod];
        if (!item || !item.precio || item.precio <= 0) {
          return `<td class="col-num" style="color:#C7D0DA;">—</td>`;
        }
        return `
          <td class="col-num">
            <div class="cell-price-big">S/ ${item.precio.toFixed(2)}</div>${item.vigencia ? `<div class="cell-sub-date">${item.vigencia}</div>` : ''}
          </td>
        `;
      }).join('')}
    </tr>
  `;

  // FILAS DE COMPETIDORES
  const filasCompetidoresHTML = competidores.map(comp => {
    return `
      <tr class="row-comp">
        <td>
          <div class="actor-info-cell">
            <div class="actor-logo-box">
              <img src="${getBrandLogo(comp.marca)}" alt="${comp.marca}">
            </div>
            <div class="actor-name-box">
              <b>${comp.nombre_linea}</b>
              <span class="actor-sub-text">
                ${comp.distancia_km !== undefined ? comp.distancia_km.toFixed(1) + ' km' : comp.marca}
              </span>
            </div>
          </div>
        </td>
        ${COMBUSTIBLES.map(prod => {
          const itemComp = comp.combustibles?.[prod];
          const itemPropio = actorPropio.combustibles?.[prod];

          if (!itemComp || !itemComp.precio || itemComp.precio <= 0) {
            return `<td class="col-num" style="color:#C7D0DA;">—</td>`;
          }

          const pComp = itemComp.precio;
          const pPropio = itemPropio?.precio || null;
          const diff = pPropio ? (pPropio - pComp) : null;
          const esLM = itemComp.main_marker === true;

          let diffHTML = '';
          if (diff !== null) {
            let claseDiff = 'diff-zero';
            let signo = '';
            if (diff > 0.001) {
              claseDiff = 'diff-alert';
              signo = '+';
            } else if (diff < -0.001) {
              claseDiff = 'diff-ok';
            }
            diffHTML = `<div class="cell-sub-diff ${claseDiff}">(${signo}${diff.toFixed(2)})</div>`;
          }

          return `
            <td class="col-num ${esLM ? 'is-lm' : ''}">
              <div class="cell-price-big">S/ ${pComp.toFixed(2)}</div>
              ${diffHTML}${esLM ? `<div class="lm-tag">LOCAL MARKET</div>` : ''}
            </td>
          `;
        }).join('')}
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="table-transposed-wrap">
      <table class="table-transposed">
        ${theadHTML}
        <tbody>
          ${filaPropiaHTML}
          ${filasCompetidoresHTML}
        </tbody>
      </table>
    </div>
  `;
}