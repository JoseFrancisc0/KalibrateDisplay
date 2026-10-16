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

    <!-- SELECTOR DE MÉTRICAS: BOTONES HORIZONTALES (PRECIO | COSTO | MARGEN) -->
    <div class="rail-section">
      <div class="rail-label">Métricas en Gráfica</div>
      <div style="display: flex; gap: 4px; width: 100%; box-sizing: border-box;">
        
        <!-- Botón PRECIOS -->
        <button type="button" 
                data-click="togglePillMetricaMM" 
                data-arg="PRECIOS"
                class="mm-metric-pill ${tienePrecios ? 'active' : ''}"
                style="flex: 1; padding: 7px 2px; font-family: 'Poppins', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; text-align: center; border: 1px solid ${tienePrecios ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.18)'}; background: ${tienePrecios ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.06)'}; color: ${tienePrecios ? 'var(--k-plum, #16182F)' : '#D6CBD9'};">
          PRECIO
        </button>

        <!-- Botón COSTOS -->
        <button type="button" 
                data-click="togglePillMetricaMM" 
                data-arg="COSTOS"
                class="mm-metric-pill ${tieneCostos ? 'active' : ''}"
                style="flex: 1; padding: 7px 2px; font-family: 'Poppins', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; text-align: center; border: 1px solid ${tieneCostos ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.18)'}; background: ${tieneCostos ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.06)'}; color: ${tieneCostos ? 'var(--k-plum, #16182F)' : '#D6CBD9'};">
          COSTO
        </button>

        <!-- Botón MARGEN -->
        <button type="button" 
                data-click="togglePillMetricaMM" 
                data-arg="MARGEN"
                class="mm-metric-pill ${tieneMargen ? 'active' : ''}"
                style="flex: 1; padding: 7px 2px; font-family: 'Poppins', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; text-align: center; border: 1px solid ${tieneMargen ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.18)'}; background: ${tieneMargen ? 'var(--k-emerald, #00D58A)' : 'rgba(255,255,255,0.06)'}; color: ${tieneMargen ? 'var(--k-plum, #16182F)' : '#D6CBD9'};">
          MARGEN
        </button>

      </div>
    </div>

    <!-- FILTROS -->
    <div class="rail-section">
      <div class="rail-label">Filtros</div>
      <div class="select-stack">

        <!-- Corredor -->
        <div class="select-wrap">
          <select id="sel-mm-corredor" data-change="cambiarCorredorMM">
            <option value="TODOS">Todos los corredores</option>
          </select>
        </div>

        <!-- Departamento -->
        <div class="select-wrap">
          <select id="sel-mm-depto" data-change="cambiarDeptoMM">
            <option value="TODOS">Todos los departamentos</option>
          </select>
        </div>

        <!-- Provincia | Distrito -->
        <div class="select-row-2">
          <div class="select-wrap">
            <select id="sel-mm-provincia" data-change="cambiarProvinciaMM">
              <option value="TODOS">Provincia</option>
            </select>
          </div>
          <div class="select-wrap">
            <select id="sel-mm-distrito" data-change="cambiarDistritoMM">
              <option value="TODOS">Distrito</option>
            </select>
          </div>
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