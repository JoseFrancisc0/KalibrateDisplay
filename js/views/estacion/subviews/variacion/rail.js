/* ==========================================================
   views/estacion/subviews/variacion/rail.js — Rail de Variación
   Usa los filtros comunes persistentes de la estación
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { estacionState } from '../../state.js';

export function railVariacionHTML() {
  const f = estacionState.filtros;

  return `
  <!-- PRODUCTO -->
  <div class="rail-section" style="margin-top: 10px;">
    <span class="rail-label">Producto</span>
    <div class="select-wrap">
      <select id="sel-sub-var-prod" data-change="cambiarProductoComun">
        ${COMBUSTIBLES.map(p => `
          <option value="${p}" ${p === f.producto ? 'selected' : ''}>${p}</option>
        `).join('')}
      </select>
    </div>
  </div>

  <!-- RANGO HISTÓRICO -->
  <div class="rail-section">
    <span class="rail-label">Rango de Variación</span>
    <div style="display:flex; flex-direction:column; gap:5px;">
      <input type="date" id="txt-sub-var-f1" class="search-input" value="${f.fechaInicio}" data-change="cambiarF1Comun" style="width:100%; cursor:pointer;">
      <input type="date" id="txt-sub-var-f2" class="search-input" value="${f.fechaFin}" data-change="cambiarF2Comun" style="width:100%; cursor:pointer;">
    </div>
  </div>
  `;
}