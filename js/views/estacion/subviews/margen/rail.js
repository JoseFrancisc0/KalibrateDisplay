import { COMBUSTIBLES } from '../../../../config/productos.js';
import { estacionState } from '../../state.js';

export function railMargenHTML() {
  const est = estacionState.dataActiva;
  if (!est) return '';

  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');
  const m = estacionState.margen;

  if (!m.competidorId && competidores.length > 0) {
    m.competidorId = competidores[0].site_id;
  }

  return `
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

    <div class="rail-section">
      <span class="rail-label">Competidor a Comparar</span>
      <div class="select-wrap">
        <select id="sel-margen-rival" data-change="cambiarRivalMargen">
          ${competidores.map(c => {
            const dist = c.distancia_km !== undefined ? ` (${c.distancia_km.toFixed(1)} km)` : '';
            return `
              <option value="${c.site_id}" ${c.site_id === m.competidorId ? 'selected' : ''}>
                ${c.nombre_linea}${dist}
              </option>
            `;
          }).join('')}
        </select>
      </div>
    </div>

    <div class="rail-section">
      <span class="rail-label">Rango Histórico</span>
      <div style="display:flex; flex-direction:column; gap:5px;">
        <input type="date" id="txt-margen-f1" class="search-input" value="${m.fechaInicio}" data-change="cambiarF1Margen" style="width:100%; cursor:pointer;">
        <input type="date" id="txt-margen-f2" class="search-input" value="${m.fechaFin}" data-change="cambiarF2Margen" style="width:100%; cursor:pointer;">
      </div>
    </div>
  `;
}