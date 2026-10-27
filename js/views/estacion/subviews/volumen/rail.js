/* ==========================================================
   views/estacion/subviews/volumen/rail.js
   ========================================================== */
import { COMBUSTIBLES } from '../../../../config/productos.js';
import { volumenSubViewState } from './state.js';

export function railVolumenHTML() {
  const esEvolutivo = volumenSubViewState.tabInterna === 'EVOLUTIVO';

  return `
  <div class="rail-section">
    <div class="rail-label">Vista de Volumen</div>
    <div style="display: flex; gap: 4px; margin-top: 4px;">
      <button type="button" data-click="cambiarTabInternaVolumen" data-arg="FOTO" 
              class="k-btn-pill ${!esEvolutivo ? 'active' : ''}" 
              style="flex: 1; padding: 6px; font-size: 0.65rem; font-weight: 700; border-radius: 4px; cursor: pointer; border: 1px solid var(--k-line); background: ${!esEvolutivo ? 'var(--k-lime)' : 'transparent'}; color: ${!esEvolutivo ? '#16182F' : '#fff'};">
        Foto Comercial
      </button>
      <button type="button" data-click="cambiarTabInternaVolumen" data-arg="EVOLUTIVO" 
              class="k-btn-pill ${esEvolutivo ? 'active' : ''}" 
              style="flex: 1; padding: 6px; font-size: 0.65rem; font-weight: 700; border-radius: 4px; cursor: pointer; border: 1px solid var(--k-line); background: ${esEvolutivo ? 'var(--k-lime)' : 'transparent'}; color: ${esEvolutivo ? '#16182F' : '#fff'};">
        Evolutivos
      </button>
    </div>
  </div>

  ${esEvolutivo ? `
  <div class="rail-section">
    <div class="rail-label">Producto en Análisis</div>
    <div class="select-wrap">
      <select id="sel-volumen-producto" data-change="cambiarProductoEvolutivoVolumen">
        ${COMBUSTIBLES.map(p => `
          <option value="${p}" ${volumenSubViewState.productoEvolutivo.toUpperCase() === p.toUpperCase() ? 'selected' : ''}>
            ${p.toUpperCase()}
          </option>
        `).join('')}
      </select>
    </div>
    <small style="font-size: 0.62rem; color: var(--k-muted); margin-top: 4px; display: block;">
      Analiza la sensibilidad del combustible seleccionado frente a su demanda.
    </small>
  </div>
  ` : `
  <div class="rail-section">
    <div class="rail-label">Unidad de Análisis Semanal</div>
    <div style="display: flex; gap: 4px; margin-top: 4px;">
      <button type="button" data-click="cambiarMetricaSemanalVolumen" data-arg="VOLUMEN"
              style="flex: 1; padding: 5px; font-size: 0.62rem; font-weight: 700; border-radius: 4px; cursor: pointer; border: 1px solid var(--k-line); background: ${volumenSubViewState.metricaSemanal === 'VOLUMEN' ? '#00D58A' : 'transparent'}; color: ${volumenSubViewState.metricaSemanal === 'VOLUMEN' ? '#16182F' : '#fff'};">
        Volumen (gal)
      </button>
      <button type="button" data-click="cambiarMetricaSemanalVolumen" data-arg="VENTAS"
              style="flex: 1; padding: 5px; font-size: 0.62rem; font-weight: 700; border-radius: 4px; cursor: pointer; border: 1px solid var(--k-line); background: ${volumenSubViewState.metricaSemanal === 'VENTAS' ? '#0284C7' : 'transparent'}; color: #fff;">
        Ventas (S/)
      </button>
    </div>
  </div>
  `}
  `;
}