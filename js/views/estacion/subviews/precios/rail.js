/* ==========================================================
   views/estacion/subviews/evolucion_precios/rail.js
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { estacionState } from '../../state.js';
import { evolucionState } from './state.js';

export function railEvolucionHTML() {
  const est = estacionState.dataActiva;
  if (!est) return '';

  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');

  if (!evolucionState.competidoresSeleccionados) {
    evolucionState.competidoresSeleccionados = new Set(competidores.map(c => c.site_id));
  }

  const seleccionadosCount = evolucionState.competidoresSeleccionados.size;

  return `
    <!-- PRODUCTO -->
    <div class="rail-section" style="margin-top: 10px;">
      <span class="rail-label">Producto</span>
      <div class="select-wrap">
        <select id="sel-evo-prod" data-change="cambiarProductoEvolucion">
          ${COMBUSTIBLES.map(p => `
            <option value="${p}" ${p === evolucionState.producto ? 'selected' : ''}>${p}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- FECHAS DE EVALUACIÓN -->
    <div class="rail-section">
      <span class="rail-label">Rango Histórico</span>
      <div style="display:flex; flex-direction:column; gap:5px;">
        <input type="date" id="txt-evo-f1" class="search-input" value="${evolucionState.fechaInicio}" data-change="cambiarF1Evolucion" style="width:100%; cursor:pointer;">
        <input type="date" id="txt-evo-f2" class="search-input" value="${evolucionState.fechaFin}" data-change="cambiarF2Evolucion" style="width:100%; cursor:pointer;">
      </div>
    </div>

    <!-- CHECKLIST DE COMPETIDORAS -->
    <div class="rail-section" id="section-evo-rivales">
      <span class="rail-label">Filtrar Rivales</span>
      <div class="multiselect-wrap">
        <button type="button" class="multiselect-btn" data-click="toggleDropdownEvoRivales">
          <span>RIVALES (${seleccionadosCount}/${competidores.length})</span>
          <span class="multiselect-arrow">▾</span>
        </button>
        <div class="multiselect-dropdown" id="dropdown-evo-rivales" style="display:none;">
          <div class="multiselect-actions">
            <button type="button" data-click="marcarTodasRivalesEvo" data-arg="true">Todas</button>
            <button type="button" data-click="marcarTodasRivalesEvo" data-arg="false">Ninguna</button>
          </div>
          <div class="multiselect-list">
            ${competidores.map(c => {
              const checked = evolucionState.competidoresSeleccionados.has(c.site_id);
              return `
                <label class="multiselect-item">
                  <input type="checkbox" value="${c.site_id}" ${checked ? 'checked' : ''} data-change="onToggleRivalCheckEvo">
                  <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.nombre_linea}">
                    ${c.nombre_linea} (${c.distancia_km !== undefined ? c.distancia_km.toFixed(1) + 'km' : c.marca})
                  </span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}