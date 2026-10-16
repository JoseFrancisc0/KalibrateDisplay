/* ==========================================================
   views/estacion/subviews/margen/rail.js — Rail de Margen
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { estacionState } from '../../state.js';

export function railMargenHTML() {
  const est = estacionState.dataActiva;
  if (!est) return '';

  const f = estacionState.filtros;
  const m = estacionState.metricasMargen;
  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');

  if (!f.competidoresSeleccionados) {
    f.competidoresSeleccionados = new Set(competidores.map(c => c.site_id));
  }

  const tienePrecios = m.has('PRECIOS');
  const tieneCostos = m.has('COSTOS');
  const tieneMargen = m.has('MARGEN');
  const seleccionadosCount = f.competidoresSeleccionados.size;

  return `
  <!-- PRODUCTO -->
  <div class="rail-section" style="margin-top: 10px;">
    <div class="select-wrap">
      <select id="sel-sub-prod" data-change="cambiarProductoComun">
        ${COMBUSTIBLES.map(p => `
          <option value="${p}" ${p === f.producto ? 'selected' : ''}>${p}</option>
        `).join('')}
      </select>
    </div>
  </div>

  <!-- CHECKLIST DE COMPETIDORES -->
  <div class="rail-section" id="section-margen-rivales">
    <div class="multiselect-wrap">
      <button type="button" class="multiselect-btn" data-click="toggleDropdownRivalCheck">
        <span id="label-rivales-conteo">RIVALES (${seleccionadosCount}/${competidores.length})</span>
        <span class="multiselect-arrow">▾</span>
      </button>
      <div class="multiselect-dropdown" id="dropdown-sub-rivales" style="display:none;">
        <div class="multiselect-actions">
          <button type="button" data-click="marcarTodasRivalesComun" data-arg="true">Todas</button>
          <button type="button" data-click="marcarTodasRivalesComun" data-arg="false">Ninguna</button>
        </div>
        <div class="multiselect-list">
          ${competidores.map(c => {
            const checked = f.competidoresSeleccionados.has(c.site_id);
            return `
            <label class="multiselect-item">
              <input type="checkbox" value="${c.site_id}" ${checked ? 'checked' : ''} data-change="onToggleRivalCheckComun">
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

  <!-- RANGO HISTÓRICO -->
  <div class="rail-section">
    <span class="rail-label">Rango Histórico</span>
    <div style="display:flex; flex-direction:column; gap:5px;">
      <input type="date" id="txt-sub-f1" class="search-input" value="${f.fechaInicio}" data-change="cambiarF1Comun" style="width:100%; cursor:pointer;">
      <input type="date" id="txt-sub-f2" class="search-input" value="${f.fechaFin}" data-change="cambiarF2Comun" style="width:100%; cursor:pointer;">
    </div>
  </div>

  <!-- SELECTOR DE MÉTRICAS (PRECIO | COSTO | MARGEN) -->
  <div class="rail-section">
    <div class="rail-label">Métricas en Gráfica</div>
    <div style="display: flex; gap: 4px; width: 100%; box-sizing: border-box;">
      <button type="button" data-click="togglePillMargen" data-arg="PRECIOS"
              class="mm-metric-pill ${tienePrecios ? 'active' : ''}"
              style="flex: 1; padding: 7px 2px; font-family: 'Poppins', sans-serif; font-size: 0.65rem; font-weight: 700; border-radius: 4px; cursor: pointer; border: 1px solid ${tienePrecios ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.18)'}; background: ${tienePrecios ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.06)'}; color: ${tienePrecios ? 'var(--k-plum, #16182F)' : '#D6CBD9'};">
        PRECIO
      </button>
      <button type="button" data-click="togglePillMargen" data-arg="COSTOS"
              class="mm-metric-pill ${tieneCostos ? 'active' : ''}"
              style="flex: 1; padding: 7px 2px; font-family: 'Poppins', sans-serif; font-size: 0.65rem; font-weight: 700; border-radius: 4px; cursor: pointer; border: 1px solid ${tieneCostos ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.18)'}; background: ${tieneCostos ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.06)'}; color: ${tieneCostos ? 'var(--k-plum, #16182F)' : '#D6CBD9'};">
        COSTO
      </button>
      <button type="button" data-click="togglePillMargen" data-arg="MARGEN"
              class="mm-metric-pill ${tieneMargen ? 'active' : ''}"
              style="flex: 1; padding: 7px 2px; font-family: 'Poppins', sans-serif; font-size: 0.65rem; font-weight: 700; border-radius: 4px; cursor: pointer; border: 1px solid ${tieneMargen ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.18)'}; background: ${tieneMargen ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.06)'}; color: ${tieneMargen ? 'var(--k-plum, #16182F)' : '#D6CBD9'};">
        MARGEN
      </button>
    </div>
  </div>
  `;
}