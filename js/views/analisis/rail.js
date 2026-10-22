/* ==========================================================
   views/analisis/rail.js — panel de filtros del Análisis Ponderado.
   ========================================================== */

import { analisisState } from './state.js';

export function railHTML() {
  const abierto = analisisState.drawerAbierto;

  return `
  <!-- PANEL 2: ANÁLISIS PONDERADO -->
  <div id="rail-panel-analisis" class="rail-panel" style="display:none;">

    <!-- PRODUCTO -->
    <div class="rail-section">
      <div class="rail-label">Producto</div>
      <div class="select-wrap">
        <select id="sel-analisis-prod" data-change="cambiarProductoAnalisis">
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
      <button type="button" class="k-drawer-toggle-btn" data-click="toggleDrawerAnalisis"
              style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:rgba(255,255,255,0.05); border:1px solid var(--k-line); border-radius:4px; color:#fff; cursor:pointer;">
        <span style="font-family:'Poppins',sans-serif; font-size:0.68rem; font-weight:700; text-transform:uppercase;">Segmentación</span>
        <span id="badge-analisis-filtros" style="font-size:0.65rem; color:var(--k-muted);">${abierto ? '▲ Ocultar' : '▼ Configurar'}</span>
      </button>

      <div id="drawer-panel-analisis" style="display:${abierto ? 'block' : 'none'}; margin-top:8px; padding:10px; border:1px solid var(--k-line); border-radius:4px; background:rgba(0,0,0,0.15);">
        
        <!-- JERARQUÍA OPERATIVA -->
        <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">OPERACIÓN</span>
        <div class="select-stack" style="margin-bottom:10px;">
          <div class="select-wrap">
            <select id="sel-analisis-gpc" data-change="cambiarGPCAnalisis">
              <option value="TODOS">GPC Group (Todos)</option>
            </select>
          </div>
          <div class="select-row-2">
            <div class="select-wrap">
              <select id="sel-analisis-gop" data-change="cambiarGOPAnalisis">
                <option value="TODOS">GOP (Todos)</option>
              </select>
            </div>
            <div class="select-wrap">
              <select id="sel-analisis-jop" data-change="cambiarJOPAnalisis">
                <option value="TODOS">JOP (Todos)</option>
              </select>
            </div>
          </div>
          <div class="select-wrap">
            <select id="sel-analisis-corredor" data-change="cambiarCorredorAnalisis">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
        </div>

        <!-- CASCADA GEOGRÁFICA -->
        <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">UBICACIÓN</span>
        <div class="select-stack">
          <div class="select-wrap">
            <select id="sel-analisis-depto" data-change="cambiarDeptoAnalisis">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>
          <div class="select-row-2">
            <div class="select-wrap">
              <select id="sel-analisis-provincia" data-change="cambiarProvinciaAnalisis">
                <option value="TODOS">Provincia</option>
              </select>
            </div>
            <div class="select-wrap">
              <select id="sel-analisis-distrito" data-change="cambiarDistritoAnalisis">
                <option value="TODOS">Distrito</option>
              </select>
            </div>
          </div>
        </div>

        <!-- LIMPIAR -->
        <button type="button" data-click="limpiarFiltrosAnalisis" 
                style="width:100%; margin-top:10px; padding:5px; font-size:0.65rem; background:transparent; border:1px dashed var(--k-line); color:var(--k-muted); border-radius:3px; cursor:pointer;">
          Limpiar Segmentación
        </button>
      </div>
    </div>

    <!-- FILTRAR MARCAS -->
    <div class="rail-section" id="section-filtro-marcas">
      <div class="rail-label">Filtrar Marcas</div>
      <div class="multiselect-wrap">
        <button type="button" class="multiselect-btn" id="btn-toggle-marcas" data-click="toggleDropdownMarcas">
          <span id="label-marcas-count">BRANDS</span>
          <span class="multiselect-arrow">▾</span>
        </button>
        <div class="multiselect-dropdown" id="dropdown-marcas-content" style="display:none;">
          <div class="multiselect-actions">
            <button type="button" data-click="marcarTodasMarcas" data-arg="true">Todas</button>
            <button type="button" data-click="marcarTodasMarcas" data-arg="false">Ninguna</button>
          </div>
          <div class="multiselect-list" id="checklist-marcas-items"></div>
        </div>
      </div>
    </div>

    <!-- ALCANCE / NIVEL -->
    <div class="rail-section">
      <div class="rail-label">Alcance / Nivel</div>
      <div class="btn-group-vertical">
        <button id="btn-scope-dist" class="active" data-click="cambiarModoAnalisis" data-arg="DISTRIBUCION">DISTRIBUCIÓN</button>
        <button id="btn-scope-marca" data-click="cambiarModoAnalisis" data-arg="MARCA">PROMEDIO MARCAS</button>
      </div>
    </div>

  </div>`;
}