/* ==========================================================
   views/estacion/subviews/estado/vista.js — Render de ESTADO ACTUAL
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { getBrandLogo } from '../../../../config/marcas.js';

export function renderEstadoActual(container, est) {
  const actorPropio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');

  if (!actorPropio) {
    container.innerHTML = `<div class="empty-state">Sin información de precios propios.</div>`;
    return;
  }

  // Encabezados: Estación (45%) y los 5 combustibles (11% cada uno)
  const theadHTML = `
    <thead>
      <tr>
        <th style="width: 45%;">Estación / Competidor</th>
        ${COMBUSTIBLES.map(c => `<th style="width: 11%; text-align: right;">${c.toUpperCase()}</th>`).join('')}
      </tr>
    </thead>
  `;

  // Fila Propia
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

  // Filas Competidores
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