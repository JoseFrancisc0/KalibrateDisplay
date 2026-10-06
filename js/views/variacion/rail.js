/* ==========================================================
   views/variacion/rail.js — panel de filtros de Variación Histórica.
   ========================================================== */

export function railHTML() {
  return `
    <!-- PANEL 4: VARIACIÓN HISTÓRICA -->
    <div id="rail-panel-variacion" class="rail-panel" style="display: none;">
      <div class="rail-section">
        <div class="rail-label">Rango de Evaluación (f1 → f2)</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div>
            <span style="font-size:0.6rem; color:#A08FA6; text-transform:uppercase;">Fecha Base (f1)</span>
            <input type="date" id="txt-var-f1" class="search-input" style="width:100%; cursor:pointer;" data-change="cambiarFechaF1">
          </div>
          <div>
            <span style="font-size:0.6rem; color:#A08FA6; text-transform:uppercase;">Fecha Corte (f2)</span>
            <input type="date" id="txt-var-f2" class="search-input" style="width:100%; cursor:pointer;" data-change="cambiarFechaF2">
          </div>
        </div>
      </div>

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

      <div class="rail-section">
        <div class="rail-label">Estaciones Mapeadas</div>
        <div class="btn-group-vertical">
          <button id="btn-var-area" class="active" data-click="cambiarAlcanceVariacion" data-arg="AREA">ÁREA DE INFLUENCIA</button>
          <button id="btn-var-lm" data-click="cambiarAlcanceVariacion" data-arg="LM">LOCAL MARKET</button>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Segmentación Geográfica</div>
        <div class="select-stack">
          <div class="select-wrap">
            <select id="sel-var-corredor" data-change="cambiarCorredorVariacion">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
          <div class="select-wrap">
            <select id="sel-var-depto" data-change="cambiarDeptoVariacion">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">GPC Group</div>
        <div class="select-wrap">
          <select id="sel-var-gpc" data-change="cambiarGpcVariacion">
            <option value="TODOS">Todos los GPC Groups</option>
          </select>
        </div>
      </div>

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
