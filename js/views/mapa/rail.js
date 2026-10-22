/* ==========================================================
   views/mapa/rail.js — Panel de filtros de Cobertura Nacional
   ========================================================== */

import { mapaState } from './state.js';

export function railHTML() {
  const abierto = mapaState.drawerAbierto;

  return `
  <!-- PANEL: COBERTURA NACIONAL (MAPA) -->
  <div id="rail-panel-mapa" class="rail-panel" style="display: none;">

    <!-- PRODUCTO -->
    <div class="rail-section">
      <div class="rail-label">Producto</div>
      <div class="select-wrap">
        <select id="sel-mapa-prod" data-change="cambiarProductoMapa">
          <option value="Diesel">Diesel</option>
          <option value="Regular">Regular</option>
          <option value="Premium">Premium</option>
          <option value="GNV">GNV</option>
          <option value="GLP">GLP</option>
        </select>
      </div>
    </div>

    <!-- CAJÓN DESPLEGABLE DE FILTROS: JERARQUÍA OPERATIVA -->
    <div class="rail-section" style="margin-bottom: 8px;">
      <button type="button" class="k-drawer-toggle-btn" data-click="toggleDrawerMapa"
              style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:rgba(255,255,255,0.05); border:1px solid var(--k-line); border-radius:4px; color:#fff; cursor:pointer;">
        <span style="font-family:'Poppins',sans-serif; font-size:0.68rem; font-weight:700; text-transform:uppercase;">Segmentación</span>
        <span id="badge-mapa-filtros" style="font-size:0.65rem; color:var(--k-muted);">${abierto ? '▲ Ocultar' : '▼ Configurar'}</span>
      </button>

      <div id="drawer-panel-mapa" style="display:${abierto ? 'block' : 'none'}; margin-top:8px; padding:10px; border:1px solid var(--k-line); border-radius:4px; background:rgba(0,0,0,0.15);">
        
        <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">OPERACIÓN</span>
        <div class="select-stack" style="margin-bottom:10px;">
          <div class="select-wrap">
            <select id="sel-mapa-gpc" data-change="cambiarGPCMapa">
              <option value="TODOS">GPC Group (Todos)</option>
            </select>
          </div>
          <div class="select-row-2">
            <div class="select-wrap">
              <select id="sel-mapa-gop" data-change="cambiarGOPMapa">
                <option value="TODOS">GOP (Todos)</option>
              </select>
            </div>
            <div class="select-wrap">
              <select id="sel-mapa-jop" data-change="cambiarJOPMapa">
                <option value="TODOS">JOP (Todos)</option>
              </select>
            </div>
          </div>
          <div class="select-wrap">
            <select id="sel-mapa-corredor" data-change="cambiarCorredorMapa">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
        </div>

        <!-- LIMPIAR SEGMENTACIÓN -->
        <button type="button" data-click="limpiarFiltrosMapa" 
                style="width:100%; margin-top:4px; padding:5px; font-size:0.65rem; background:transparent; border:1px dashed var(--k-line); color:var(--k-muted); border-radius:3px; cursor:pointer;">
          Limpiar Segmentación
        </button>
      </div>
    </div>

  </div>
  `;
}