/* ==========================================================
   views/estacion/subviews/variacion/rail.js
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { variacionState } from './state.js';

export function railVariacionHTML() {
  return `
    <!-- PRODUCTO -->
    <div class="rail-section" style="margin-top: 10px;">
      <span class="rail-label">Producto</span>
      <div class="select-wrap">
        <select id="sel-est-var-prod" data-change="cambiarProductoVariacionEstacion">
          ${COMBUSTIBLES.map(p => `
            <option value="${p}" ${p === variacionState.producto ? 'selected' : ''}>${p}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- RANGO HISTÓRICO -->
    <div class="rail-section">
      <span class="rail-label">Rango de Variación</span>
      <div style="display:flex; flex-direction:column; gap:5px;">
        <input type="date" id="txt-est-var-f1" class="search-input" value="${variacionState.fechaInicio}" data-change="cambiarF1VariacionEstacion" style="width:100%; cursor:pointer;">
        <input type="date" id="txt-est-var-f2" class="search-input" value="${variacionState.fechaFin}" data-change="cambiarF2VariacionEstacion" style="width:100%; cursor:pointer;">
      </div>
    </div>
  `;
}