/* ==========================================================
   views/heatmap/rail.js — Filtros de la vista Heatmap
   ========================================================== */

import { heatmapState } from './state.js';

export function railHTML() {
  const abierto = heatmapState.drawerAbierto;

  return `
  <!-- PANEL: HEATMAP DE DIFERENCIALES -->
  <div id="rail-panel-heatmap" class="rail-panel" style="display: none;">

    <!-- UBICACIÓN GEOGRÁFICA -->
    <div class="rail-section">
      <div class="rail-label">Departamento</div>
      <div class="select-wrap">
        <select id="sel-heatmap-depto" data-change="cambiarDeptoHeatmap">
          <option value="TODOS">Todos los departamentos</option>
        </select>
      </div>
    </div>

    <div class="rail-section">
      <div class="select-row-2">
        <div class="select-wrap">
          <select id="sel-heatmap-provincia" data-change="cambiarProvinciaHeatmap">
            <option value="TODOS">Provincia (Todas)</option>
          </select>
        </div>
        <div class="select-wrap">
          <select id="sel-heatmap-distrito" data-change="cambiarDistritoHeatmap">
            <option value="TODOS">Distrito (Todos)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- CAJÓN DESPLEGABLE: JERARQUÍA OPERATIVA -->
    <div class="rail-section" style="margin-bottom: 8px;">
      <button type="button" class="k-drawer-toggle-btn" data-click="toggleDrawerHeatmap"
              style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:rgba(255,255,255,0.05); border:1px solid var(--k-line); border-radius:4px; color:#fff; cursor:pointer;">
        <span style="font-family:'Poppins',sans-serif; font-size:0.68rem; font-weight:700; text-transform:uppercase;">Segmentación</span>
        <span id="badge-heatmap-filtros" style="font-size:0.65rem; color:var(--k-muted);">${abierto ? '▲ Ocultar' : '▼ Configurar'}</span>
      </button>

      <div id="drawer-panel-heatmap" style="display:${abierto ? 'block' : 'none'}; margin-top:8px; padding:10px; border:1px solid var(--k-line); border-radius:4px; background:rgba(0,0,0,0.15);">
        
        <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">OPERACIÓN</span>
        <div class="select-stack" style="margin-bottom:10px;">
          <div class="select-wrap">
            <select id="sel-heatmap-gpc" data-change="cambiarGPCHeatmap">
              <option value="TODOS">GPC Group (Todos)</option>
            </select>
          </div>
          <div class="select-row-2">
            <div class="select-wrap">
              <select id="sel-heatmap-gop" data-change="cambiarGOPHeatmap">
                <option value="TODOS">GOP (Todos)</option>
              </select>
            </div>
            <div class="select-wrap">
              <select id="sel-heatmap-jop" data-change="cambiarJOPHeatmap">
                <option value="TODOS">JOP (Todos)</option>
              </select>
            </div>
          </div>
          <div class="select-wrap">
            <select id="sel-heatmap-corredor" data-change="cambiarCorredorHeatmap">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
        </div>

        <button type="button" data-click="limpiarFiltrosHeatmap" 
                style="width:100%; margin-top:4px; padding:5px; font-size:0.65rem; background:transparent; border:1px dashed var(--k-line); color:var(--k-muted); border-radius:3px; cursor:pointer;">
          Limpiar Segmentación
        </button>
      </div>
    </div>

  </div>
  `;
}