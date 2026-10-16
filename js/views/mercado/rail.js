/* ==========================================================
   views/mercado/rail.js — Panel de filtros de Análisis de Mercado
   ========================================================== */
import { searchSVG } from '../../shared/icons.js';
import { margenMercadoState } from './state.js';

export function railMargenMercadoHTML() {
  const m = margenMercadoState.metricasActivas;
  const tienePrecios = m.has('PRECIOS');
  const tieneCostos = m.has('COSTOS');
  const tieneMargen = m.has('MARGEN');

  return `
  <!-- PANEL: ANÁLISIS DE MERCADO -->
  <div id="rail-panel-margen-mercado" class="rail-panel" style="display:none;">

    <!-- RANGO DE EVALUACIÓN -->
    <div class="rail-section">
      <div class="rail-label">Rango de Evaluación</div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <input type="date" id="txt-mm-f1" class="search-input" data-change="cambiarF1MM" style="font-size:0.75rem; padding:4px 8px;">
        <input type="date" id="txt-mm-f2" class="search-input" data-change="cambiarF2MM" style="font-size:0.75rem; padding:4px 8px;">
      </div>
    </div>

    <!-- PRODUCTO -->
    <div class="rail-section">
      <div class="rail-label">Producto</div>
      <div class="select-wrap">
        <select id="sel-mm-prod" data-change="cambiarProductoMM">
          <option value="Diesel">Diesel</option>
          <option value="Regular">Regular</option>
          <option value="Premium">Premium</option>
          <option value="GNV">GNV</option>
          <option value="GLP">GLP</option>
        </select>
      </div>
    </div>

    <!-- CHECKLIST DE MÉTRICAS VISIBLES (DARK THEME INTEGRADO) -->
    <div class="rail-section">
      <div class="rail-label">Métricas en Gráfica</div>
      <div style="display: flex; flex-direction: column; gap: 4px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 6px 8px;">
        
        <!-- Precios -->
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 600; cursor: pointer; color: #E2E8F0; padding: 3px 2px; user-select: none;">
          <input type="checkbox" value="PRECIOS" ${tienePrecios ? 'checked' : ''} data-change="onToggleMetricaMM"
                 style="accent-color: var(--k-emerald, #00D58A); width: 14px; height: 14px; cursor: pointer;">
          <span>Precios de Venta</span>
        </label>

        <!-- Costo COESTI -->
        <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; font-weight: 600; cursor: pointer; color: #E2E8F0; padding: 3px 2px; user-select: none;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" value="COSTOS" ${tieneCostos ? 'checked' : ''} data-change="onToggleMetricaMM"
                   style="accent-color: var(--k-emerald, #00D58A); width: 14px; height: 14px; cursor: pointer;">
            <span>Costo COESTI</span>
          </div>
          <!-- Indicador visual del trazo punteado de la curva -->
          <span style="display: inline-block; width: 18px; height: 0; border-top: 2px dashed #94A3B8;"></span>
        </label>

        <!-- Margen -->
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 600; cursor: pointer; color: #E2E8F0; padding: 3px 2px; user-select: none;">
          <input type="checkbox" value="MARGEN" ${tieneMargen ? 'checked' : ''} data-change="onToggleMetricaMM"
                 style="accent-color: var(--k-emerald, #00D58A); width: 14px; height: 14px; cursor: pointer;">
          <span>Margen Unitario (P - C)</span>
        </label>

      </div>
    </div>

    <!-- FILTRO CORREDOR -->
    <div class="rail-section">
      <div class="rail-label">Corredor</div>
      <div class="select-wrap">
        <select id="sel-mm-corredor" data-change="cambiarCorredorMM">
          <option value="TODOS">Todos los corredores</option>
        </select>
      </div>
    </div>

    <!-- CASCADA GEOGRÁFICA -->
    <div class="rail-section">
      <div class="rail-label">Ubicación Geográfica</div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div class="select-wrap">
          <select id="sel-mm-depto" data-change="cambiarDeptoMM">
            <option value="TODOS">Todos los departamentos</option>
          </select>
        </div>
        <div class="select-wrap">
          <select id="sel-mm-provincia" data-change="cambiarProvinciaMM">
            <option value="TODOS">Todas las provincias</option>
          </select>
        </div>
        <div class="select-wrap">
          <select id="sel-mm-distrito" data-change="cambiarDistritoMM">
            <option value="TODOS">Todos los distritos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- CHECKLIST DE MARCAS (CLASES NATIVAS DEL RAIL) -->
    <div class="rail-section" id="section-mm-marcas">
      <div class="rail-label">Filtrar Marcas</div>
      <div class="multiselect-wrap">
        <button type="button" class="multiselect-btn" data-click="toggleDropdownMMMarcas" id="btn-mm-marcas-toggle">
          <span>Marcas (<span id="mm-marcas-conteo">Todas</span>)</span>
          <span class="multiselect-arrow">▾</span>
        </button>
        <div class="multiselect-dropdown" id="dropdown-mm-marcas-content" style="display:none;">
          <div class="multiselect-actions">
            <button type="button" data-click="marcarTodasMMMarcas" data-arg="true">Todas</button>
            <button type="button" data-click="marcarTodasMMMarcas" data-arg="false">Ninguna</button>
          </div>
          <div class="multiselect-list" id="checklist-mm-marcas-items"></div>
        </div>
      </div>
    </div>

  </div>
  `;
}