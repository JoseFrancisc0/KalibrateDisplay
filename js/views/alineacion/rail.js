/* ==========================================================
   views/alineacion/rail.js — panel de filtros de Alineación.
   ========================================================== */

import { alineacionState } from './state.js';

export function railHTML() {
  const abierto = alineacionState.drawerAbierto;

  return `
    <!-- PANEL 3: ALINEACIÓN COMPETITIVA -->
    <div id="rail-panel-alineacion" class="rail-panel" style="display: none;">

      <!-- MARCA COMPETIDORA -->
      <div class="rail-section">
        <div class="rail-label">Marca Competidora</div>
        <div class="select-wrap">
          <select id="sel-alineacion-marca" data-change="cambiarMarcaAlineacion">
            <option value="TODAS">TODAS LAS MARCAS (MERCADO)</option>
          </select>
        </div>
      </div>

      <!-- CRITERIO DEL RIVAL -->
      <div class="rail-section" id="section-alineacion-criterio" style="opacity: 0.45; pointer-events: none;">
        <div class="rail-label">Criterio de Rival</div>
        <div class="btn-group-vertical">
          <button id="btn-alineacion-cercano" class="active" data-click="cambiarCriterioAlineacion" data-arg="CERCANO">MÁS CERCANO</button>
          <button id="btn-alineacion-promedio" data-click="cambiarCriterioAlineacion" data-arg="PROMEDIO">PROMEDIO DE LA MARCA</button>
        </div>
      </div>

      <!-- CAJÓN DESPLEGABLE DE FILTROS -->
      <div class="rail-section" style="margin-bottom: 8px;">
        <button type="button" class="k-drawer-toggle-btn" data-click="toggleDrawerAlineacion"
                style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:rgba(255,255,255,0.05); border:1px solid var(--k-line); border-radius:4px; color:#fff; cursor:pointer;">
          <span style="font-family:'Poppins',sans-serif; font-size:0.68rem; font-weight:700; text-transform:uppercase;">Segmentación</span>
          <span id="badge-alineacion-filtros" style="font-size:0.65rem; color:var(--k-muted);">${abierto ? '▲ Ocultar' : '▼ Configurar'}</span>
        </button>

        <div id="drawer-panel-alineacion" style="display:${abierto ? 'block' : 'none'}; margin-top:8px; padding:10px; border:1px solid var(--k-line); border-radius:4px; background:rgba(0,0,0,0.15);">
          
          <!-- JERARQUÍA OPERATIVA -->
          <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">OPERACIÓN</span>
          <div class="select-stack" style="margin-bottom:10px;">
            <div class="select-wrap">
              <select id="sel-alineacion-gpc" data-change="cambiarGPCAlineacion">
                <option value="TODOS">GPC Group (Todos)</option>
              </select>
            </div>
            <div class="select-row-2">
              <div class="select-wrap">
                <select id="sel-alineacion-gop" data-change="cambiarGOPAlineacion">
                  <option value="TODOS">GOP (Todos)</option>
                </select>
              </div>
              <div class="select-wrap">
                <select id="sel-alineacion-jop" data-change="cambiarJOPAlineacion">
                  <option value="TODOS">JOP (Todos)</option>
                </select>
              </div>
            </div>
            <div class="select-wrap">
              <select id="sel-alineacion-corredor" data-change="cambiarCorredorAlineacion">
                <option value="TODOS">Todos los corredores</option>
              </select>
            </div>
          </div>

          <!-- CASCADA GEOGRÁFICA -->
          <span class="rail-label" style="margin-bottom:4px; color:var(--k-muted); font-size:0.62rem;">UBICACIÓN</span>
          <div class="select-stack">
            <div class="select-wrap">
              <select id="sel-alineacion-depto" data-change="cambiarDeptoAlineacion">
                <option value="TODOS">Todos los departamentos</option>
              </select>
            </div>
            <div class="select-row-2">
              <div class="select-wrap">
                <select id="sel-alineacion-provincia" data-change="cambiarProvinciaAlineacion">
                  <option value="TODOS">Provincia</option>
                </select>
              </div>
              <div class="select-wrap">
                <select id="sel-alineacion-distrito" data-change="cambiarDistritoAlineacion">
                  <option value="TODOS">Distrito</option>
                </select>
              </div>
            </div>
          </div>

          <!-- LIMPIAR -->
          <button type="button" data-click="limpiarFiltrosAlineacion" 
                  style="width:100%; margin-top:10px; padding:5px; font-size:0.65rem; background:transparent; border:1px dashed var(--k-line); color:var(--k-muted); border-radius:3px; cursor:pointer;">
            Limpiar Segmentación
          </button>
        </div>
      </div>

    </div>`;
}
