/* ==========================================================
   views/analisis/rail.js — panel de filtros del Análisis Ponderado.
   ========================================================== */

export function railHTML() {
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

      <!-- SECCIÓN ÚNICA: FILTROS -->
      <div class="rail-section">
        <span class="rail-label">Filtros</span>
        <div class="select-stack">

          <!-- 1. GPC Group -->
          <div class="select-wrap">
            <select id="sel-analisis-gpc" data-change="cambiarGpcAnalisis">
              <option value="TODOS">Todos los GPC Groups</option>
            </select>
          </div>

          <!-- 2. Corredor -->
          <div class="select-wrap">
            <select id="sel-analisis-corredor" data-change="cambiarCorredorAnalisis">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>

          <!-- 3. Zona -->
          <div class="select-wrap">
            <select id="sel-analisis-zona" data-change="cambiarZonaAnalisis">
              <option value="TODOS">Todas las zonas</option>
            </select>
          </div>

          <!-- 4. Departamento -->
          <div class="select-wrap">
            <select id="sel-analisis-depto" data-change="cambiarDeptoAnalisis">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>

          <!-- 5. Provincia | Distrito (lado a lado) -->
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
          <button id="btn-scope-comp" class="active" data-click="cambiarModoAnalisis" data-arg="COMPETENCIA">COMPETENCIA</button>
          <button id="btn-scope-coesti" data-click="cambiarModoAnalisis" data-arg="COESTI">COESTI (PROPIAS)</button>
          <button id="btn-scope-marca" data-click="cambiarModoAnalisis" data-arg="MARCA">PROMEDIO MARCAS</button>
        </div>
      </div>

    </div>`;
}
