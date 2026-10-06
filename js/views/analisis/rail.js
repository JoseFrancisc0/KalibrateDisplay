/* ==========================================================
   views/analisis/rail.js — panel de filtros del Análisis Ponderado.
   ========================================================== */

export function railHTML() {
  return `
    <!-- PANEL 2: ANÁLISIS PONDERADO -->
    <div id="rail-panel-analisis" class="rail-panel" style="display:none;">
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

      <div class="rail-section">
        <div class="rail-label">Segmentación Geográfica</div>
        <div class="select-stack">
          <div class="select-wrap">
            <select id="sel-analisis-corredor" data-change="cambiarCorredorAnalisis">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
          <div class="select-wrap">
            <select id="sel-analisis-depto" data-change="cambiarDeptoAnalisis">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">GPC Group</div>
        <div class="select-wrap">
          <select id="sel-analisis-gpc" data-change="cambiarGpcAnalisis">
            <option value="TODOS">Todos los GPC Groups</option>
          </select>
        </div>
      </div>

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

      <div class="rail-section">
        <div class="rail-label">Alcance / Nivel</div>
        <div class="btn-group-vertical">
          <button id="btn-scope-comp" class="active" data-click="cambiarModoAnalisis" data-arg="COMPETENCIA">COMPETENCIA</button>
          <button id="btn-scope-coesti" data-click="cambiarModoAnalisis" data-arg="COESTI">COESTI (PROPIAS)</button>
          <button id="btn-scope-marca" data-click="cambiarModoAnalisis" data-arg="MARCA">PROMEDIO MARCAS</button>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-legend">
          <div style="font-size:0.62rem; color:#A08FA6; text-transform:uppercase; letter-spacing:0.08em; font-weight:700; margin-bottom:2px;">Guía de lectura</div>
          <div style="font-size:0.66rem; color:#D6CBD9; line-height:1.4;">
            Línea roja central = <b>Promedio Primax</b>.<br>
            Puntos arriba = más caros.<br>
            Puntos abajo = más baratos.
          </div>
        </div>
      </div>
    </div>`;
}
