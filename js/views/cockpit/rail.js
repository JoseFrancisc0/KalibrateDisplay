/* ==========================================================
 views/cockpit/rail.js — Filtros contextuales del Cockpit
 ========================================================== */

import { COMBUSTIBLES } from '../../config/productos.js';
import { cockpitState } from './state.js';

export function railCockpitHTML() {
  const pActivo = cockpitState.producto;

  return `
    <div class="rail-panel" id="rail-panel-cockpit" style="display:none;">
      <div class="rail-section">
        <div class="rail-label">Combustible Clave</div>
        <div class="select-wrap">
          <select id="sel-cockpit-prod" data-change="cambiarProductoCockpit">
            ${COMBUSTIBLES.map(p => `
              <option value="${p}" ${p === pActivo ? 'selected' : ''}>${p}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Filtrar por Departamento</div>
        <div class="select-wrap">
          <select id="sel-cockpit-depto" data-change="cambiarDeptoCockpit">
            <option value="TODOS">Red Total Nacional</option>
          </select>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Propósito de la Vista</div>
        <div style="font-size:0.62rem; color:var(--k-muted, #8C92C8); line-height:1.45;">
          Instantánea ejecutiva de mercado: Spread competitivo, cumplimiento de Local Marker e identificación de desvíos para comités de Pricing.
        </div>
      </div>
    </div>
  `;
}