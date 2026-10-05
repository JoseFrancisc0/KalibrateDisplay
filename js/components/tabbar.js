/* ==========================================================
   components/tabbar.js — cinta inferior de pestañas.

   El bloque de la izquierda es un selector dropUp que cambia
   la dimensión por la que se dividen las pestañas (corredor,
   departamento, GPC group...). Las opciones salen de
   AGRUPACIONES en config.js.
   ========================================================== */

import { AGRUPACIONES, AGRUPACION_DEFECTO } from '../config.js';

export function tabbarHTML() {
  const opciones = AGRUPACIONES.map(a => `
    <button type="button"
            class="dropup-item${a.id === AGRUPACION_DEFECTO ? ' active' : ''}"
            data-agr="${a.id}"
            onclick="cambiarAgrupacion('${a.id}')">
      <span class="dropup-check">✓</span>
      <span>${a.label}</span>
    </button>`).join('');

  return `
    <div class="tabbar-head" id="tabbar-group-wrap">
      <button type="button" class="tabbar-group-btn" id="btn-agrupacion"
              title="Cambiar la división de las pestañas"
              onclick="toggleDropupAgrupacion(event)">
        <span class="tabbar-group-top">
          <span id="tabbar-group-label">Corredores</span>
          <span class="tabbar-group-arrow">▴</span>
        </span>
        <b id="tab-count">—</b>
      </button>

      <div class="tabbar-dropup" id="dropup-agrupacion" style="display:none;">
        <div class="dropup-title">Dividir pestañas por</div>
        ${opciones}
      </div>
    </div>
    <div class="tabs" id="tabs"></div>
  `;
}
