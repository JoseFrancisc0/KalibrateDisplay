/* ==========================================================
   views/variacion/rail.js — panel de filtros de Variación Histórica.
   ========================================================== */

import { variacionState } from './state.js';

export function railHTML() {
  const abierto = variacionState.drawerAbierto;

  return `
    <!-- PANEL 4: VARIACIÓN HISTÓRICA -->
    <div id="rail-panel-variacion" class="rail-panel" style="display: none;">

      <!-- FECHAS -->
      <div class="rail-section">
        <div class="rail-label">Rango de Evaluación</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div>
            <input type="date" id="txt-var-f1" class="search-input" style="width:100%; cursor:pointer;" data-change="cambiarFechaF1">
          </div>
          <div>
            <input type="date" id="txt-var-f2" class="search-input" style="width:100%; cursor:pointer;" data-change="cambiarFechaF2">
          </div>
        </div>
      </div>

      <!-- PRODUCTO -->
      <div class="rail-section">
        <div class="rail-label">Producto</div>
        <div class="select-wrap">
          <select id="sel-var-prod" data-change="cambiarProductoVariacion">
            <option value="Diesel">Diesel</option>
            <option value="Regular">Regular</option>
            <option value="Premium">Premium</option>
            <option value="GNV">GNV</option>
            <option value="GLP">GLP</option>
          </select>
        </div>
      </div>

      <!-- CAJÓN DESPLEGABLE DE FILTROS -->
      <div class="rail-section" style="margin-bottom: 8px;">
        <button type="button" class="k-drawer-toggle-btn" data-click="toggleDrawerVariacion"
                style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:rgba(255,255,255,0.05); border:1px solid var(--k-line); border-radius:4px; color:#fff; cursor:pointer;">
          <span style="font-family:'Poppins',sans-serif; font-size:0.68rem; font-weight:700; text-transform:uppercase;">Segmentación</span>
          <span id="badge-var-filtros" style="font-size:0.65rem; color:var(--k-muted);">${abierto ? '▲ Ocultar' : '▼ Configurar'}</span>
        </button>

        <div id="drawer-panel-var" style="display:${abierto ? 'block' : 'none'}; margin-top:8px; padding:10px; border:1px solid var(--k-line); border-radius:4px; background:rgba(0,0,0,0.15);">
          
          <!-- JERARQUÍA OPERATIVA -->
          <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">OPERACIÓN</span>
          <div class="select-stack" style="margin-bottom:10px;">
            <div class="select-wrap">
              <select id="sel-var-gpc" data-change="cambiarGPCVariacion">
                <option value="TODOS">GPC Group (Todos)</option>
              </select>
            </div>
            <div class="select-row-2">
              <div class="select-wrap">
                <select id="sel-var-gop" data-change="cambiarGOPVariacion">
                  <option value="TODOS">GOP (Todos)</option>
                </select>
              </div>
              <div class="select-wrap">
                <select id="sel-var-jop" data-change="cambiarJOPVariacion">
                  <option value="TODOS">JOP (Todos)</option>
                </select>
              </div>
            </div>
            <div class="select-wrap">
              <select id="sel-var-corredor" data-change="cambiarCorredorVariacion">
                <option value="TODOS">Todos los corredores</option>
              </select>
            </div>
          </div>

          <!-- CASCADA GEOGRÁFICA -->
          <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">UBICACIÓN</span>
          <div class="select-stack">
            <div class="select-wrap">
              <select id="sel-var-depto" data-change="cambiarDeptoVariacion">
                <option value="TODOS">Todos los departamentos</option>
              </select>
            </div>
            <div class="select-row-2">
              <div class="select-wrap">
                <select id="sel-var-provincia" data-change="cambiarProvinciaVariacion">
                  <option value="TODOS">Provincia</option>
                </select>
              </div>
              <div class="select-wrap">
                <select id="sel-var-distrito" data-change="cambiarDistritoVariacion">
                  <option value="TODOS">Distrito</option>
                </select>
              </div>
            </div>
          </div>

          <!-- LIMPIAR -->
          <button type="button" data-click="limpiarFiltrosVariacion" 
                  style="width:100%; margin-top:10px; padding:5px; font-size:0.65rem; background:transparent; border:1px dashed var(--k-line); color:var(--k-muted); border-radius:3px; cursor:pointer;">
            Limpiar Segmentación
          </button>
        </div>
      </div>

      <!-- SELECTOR DE MARCAS -->
      <div class="rail-section" id="section-var-marcas">
        <div class="rail-label">Filtrar Marcas</div>
        <div class="multiselect-wrap">
          <button type="button" class="multiselect-btn" id="btn-toggle-var-marcas" data-click="toggleDropdownVarMarcas">
            <span id="label-var-marcas-count">BRANDS</span>
            <span class="multiselect-arrow">▾</span>
          </button>
          <div class="multiselect-dropdown" id="dropdown-var-marcas-content" style="display:none;">
            <div class="multiselect-actions">
              <button type="button" data-click="marcarTodasVarMarcas" data-arg="true">Todas</button>
              <button type="button" data-click="marcarTodasVarMarcas" data-arg="false">Ninguna</button>
            </div>
            <div class="multiselect-list" id="checklist-var-marcas-items"></div>
          </div>
        </div>
      </div>
    </div>`;
}
