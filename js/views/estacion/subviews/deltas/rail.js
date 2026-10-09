/* ==========================================================
   views/estacion/subviews/deltas/rail.js
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { estacionState } from '../../state.js';
import { diffState } from './state.js';

export function railDiffHTML() {
  const est = estacionState.dataActiva;
  if (!est) return '';

  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');

  // Si no hay competidor seleccionado, fijar el primero por defecto
  if (!diffState.competidorId && competidores.length > 0) {
    diffState.competidorId = competidores[0].site_id;
  }

  return `
    <!-- PRODUCTO -->
    <div class="rail-section" style="margin-top: 10px;">
      <span class="rail-label">Producto</span>
      <div class="select-wrap">
        <select id="sel-diff-prod" data-change="cambiarProductoDiff">
          ${COMBUSTIBLES.map(p => `
            <option value="${p}" ${p === diffState.producto ? 'selected' : ''}>${p}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- COMPETIDOR COMPARADO -->
    <div class="rail-section">
      <span class="rail-label">Competidor a Comparar</span>
      <div class="select-wrap">
        <select id="sel-diff-rival" data-change="cambiarRivalDiff">
          ${competidores.map(c => {
            const dist = c.distancia_km !== undefined ? ` (${c.distancia_km.toFixed(1)} km)` : '';
            return `
              <option value="${c.site_id}" ${c.site_id === diffState.competidorId ? 'selected' : ''}>
                ${c.nombre_linea}${dist}
              </option>
            `;
          }).join('')}
        </select>
      </div>
    </div>

    <!-- FECHAS DE EVALUACIÓN -->
    <div class="rail-section">
      <span class="rail-label">Rango Histórico</span>
      <div style="display:flex; flex-direction:column; gap:5px;">
        <input type="date" id="txt-diff-f1" class="search-input" value="${diffState.fechaInicio}" data-change="cambiarF1Diff" style="width:100%; cursor:pointer;">
        <input type="date" id="txt-diff-f2" class="search-input" value="${diffState.fechaFin}" data-change="cambiarF2Diff" style="width:100%; cursor:pointer;">
      </div>
    </div>
  `;
}