/* ==========================================================
   views/estacion/subviews/margen/rail.js
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { estacionState } from '../../state.js';

export function railMargenHTML() {
  const est = estacionState.dataActiva;
  if (!est) return '';

  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');
  const m = estacionState.margen;

  // Si es la primera vez, marcar todos los competidores
  if (!m.competidoresSeleccionados) {
    m.competidoresSeleccionados = new Set(competidores.map(c => c.site_id));
  }

  const seleccionadosCount = m.competidoresSeleccionados.size;

  return `
    <!-- PRODUCTO -->
    <div class="rail-section" style="margin-top: 10px;">
      <span class="rail-label">Producto</span>
      <div class="select-wrap">
        <select id="sel-margen-prod" data-change="cambiarProductoMargen">
          ${COMBUSTIBLES.map(p => `
            <option value="${p}" ${p === m.producto ? 'selected' : ''}>${p}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- FECHAS DE EVALUACIÓN -->
    <div class="rail-section">
      <span class="rail-label">Rango Histórico</span>
      <div style="display:flex; flex-direction:column; gap:5px;">
        <input type="date" id="txt-margen-f1" class="search-input" value="${m.fechaInicio}" data-change="cambiarF1Margen" style="width:100%; cursor:pointer;">
        <input type="date" id="txt-margen-f2" class="search-input" value="${m.fechaFin}" data-change="cambiarF2Margen" style="width:100%; cursor:pointer;">
      </div>
    </div>

    <!-- CHECKLIST DE COMPETIDORAS -->
    <div class="rail-section" id="section-margen-rivales">
      <span class="rail-label">Filtrar Rivales</span>
      <div class="multiselect-wrap">
        <button type="button" class="multiselect-btn" data-click="toggleDropdownMargenRivales">
          <span>RIVALES (${seleccionadosCount}/${competidores.length})</span>
          <span class="multiselect-arrow">▾</span>
        </button>
        <div class="multiselect-dropdown" id="dropdown-margen-rivales" style="display:none;">
          <div class="multiselect-actions">
            <button type="button" data-click="marcarTodasRivalesMargen" data-arg="true">Todas</button>
            <button type="button" data-click="marcarTodasRivalesMargen" data-arg="false">Ninguna</button>
          </div>
          <div class="multiselect-list">
            ${competidores.map(c => {
              const checked = m.competidoresSeleccionados.has(c.site_id);
              return `
                <label class="multiselect-item">
                  <input type="checkbox" value="${c.site_id}" ${checked ? 'checked' : ''} data-change="onToggleRivalCheckMargen">
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