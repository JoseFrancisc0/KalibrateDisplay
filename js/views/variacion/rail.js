/* ==========================================================
   views/variacion/rail.js — panel de filtros de Variación Histórica.
   ========================================================== */

export function railHTML() {
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

      <!-- FILTROS -->
      <div class="rail-section">
        <div class="rail-label">Filtros</div>
        <div class="select-stack">

          <!-- GPC Group -->
          <div class="select-wrap">
            <select id="sel-var-gpc" data-change="cambiarGpcVariacion">
              <option value="TODOS">Todos los GPC Groups</option>
            </select>
          </div>

          <!-- Corredor -->
          <div class="select-wrap">
            <select id="sel-var-corredor" data-change="cambiarCorredorVariacion">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>

          <!-- Zona -->
          <div class="select-wrap">
            <select id="sel-var-zona" data-change="cambiarZonaVariacion">
              <option value="TODOS">Todas las zonas</option>
            </select>
          </div>

          <!-- Departamento -->
          <div class="select-wrap">
            <select id="sel-var-depto" data-change="cambiarDeptoVariacion">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>

          <!-- Provincia | Distrito -->
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
