/* ==========================================================
   rail.js — Panel lateral izquierdo (hijo directo de #cmp-rail)
   ========================================================== */

export function railHTML() {
  return `
    <!-- PANEL 1: MATRIZ COMPETITIVA -->
    <div id="rail-panel-matriz" class="rail-panel">
      <div class="rail-section">
        <div class="rail-label">Métrica</div>
        <div class="btn-group-vertical">
          <button id="btn-precios" class="active" onclick="setModo('PRECIOS')">PRECIOS</button>
          <button id="btn-diferencial" onclick="setModo('DIFERENCIAL')">DIFERENCIAL</button>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Buscar</div>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/>
          </svg>
          <input type="text" id="txt-search" class="search-input"
                 placeholder="Estación propia..." oninput="filtrarEstaciones()">
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Filtro Main Marker</div>
        <div class="select-wrap">
          <select id="sel-marker" onchange="cambiarFiltroMarker()">
            <option value="TODOS">Todos los competidores</option>
            <option value="CUALQUIERA">Solo Main Marker (Cualquiera)</option>
            <option value="UNLEADED">Main Marker: Unleaded</option>
            <option value="DIESEL">Main Marker: Diesel</option>
            <option value="GLP">Main Marker: GLP</option>
            <option value="GNV">Main Marker: GNV</option>
          </select>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Filtro Marca Competidor</div>
        <div class="select-wrap">
          <select id="sel-matriz-marca" onchange="window.cambiarFiltroMarcaMatriz()">
            <option value="TODAS">Todas las marcas</option>
          </select>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Simbología Marker</div>
        <div class="rail-legend">
          <div class="legend-item">
            <svg class="drop-marker" viewBox="0 0 10 14" style="width:9px; height:12px;"><path d="M5 0C5 0 0 6 0 9.5C0 12 2.2 14 5 14C7.8 14 10 12 10 9.5C10 6 5 0 5 0Z" fill="var(--drop-unleaded)"/></svg>
            <span>Unleaded (Reg/Prem)</span>
          </div>
          <div class="legend-item">
            <svg class="drop-marker" viewBox="0 0 10 14" style="width:9px; height:12px;"><path d="M5 0C5 0 0 6 0 9.5C0 12 2.2 14 5 14C7.8 14 10 12 10 9.5C10 6 5 0 5 0Z" fill="var(--drop-diesel)"/></svg>
            <span>Diesel</span>
          </div>
          <div class="legend-item">
            <svg class="drop-marker" viewBox="0 0 10 14" style="width:9px; height:12px;"><path d="M5 0C5 0 0 6 0 9.5C0 12 2.2 14 5 14C7.8 14 10 12 10 9.5C10 6 5 0 5 0Z" fill="var(--drop-glp)"/></svg>
            <span>GLP</span>
          </div>
          <div class="legend-item">
            <svg class="drop-marker" viewBox="0 0 10 14" style="width:9px; height:12px;"><path d="M5 0C5 0 0 6 0 9.5C0 12 2.2 14 5 14C7.8 14 10 12 10 9.5C10 6 5 0 5 0Z" fill="var(--drop-gnv)"/></svg>
            <span>GNV</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL 2: ANÁLISIS PONDERADO -->
    <div id="rail-panel-analisis" class="rail-panel" style="display:none;">
      <div class="rail-section">
        <div class="rail-label">Producto</div>
        <div class="select-wrap">
          <select id="sel-analisis-prod" onchange="cambiarProductoAnalisis()">
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
            <select id="sel-analisis-corredor" onchange="cambiarCorredorAnalisis()">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
          <div class="select-wrap">
            <select id="sel-analisis-depto" onchange="cambiarDeptoAnalisis()">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">GPC Group</div>
        <div class="select-wrap">
          <select id="sel-analisis-gpc" onchange="cambiarGpcAnalisis()">
            <option value="TODOS">Todos los GPC Groups</option>
          </select>
        </div>
      </div>

      <div class="rail-section" id="section-filtro-marcas">
        <div class="rail-label">Filtrar Marcas</div>
        <div class="multiselect-wrap">
          <button type="button" class="multiselect-btn" id="btn-toggle-marcas" onclick="toggleDropdownMarcas()">
            <span id="label-marcas-count">BRANDS</span>
            <span class="multiselect-arrow">▾</span>
          </button>
          <div class="multiselect-dropdown" id="dropdown-marcas-content" style="display:none;">
            <div class="multiselect-actions">
              <button type="button" onclick="marcarTodasMarcas(true)">Todas</button>
              <button type="button" onclick="marcarTodasMarcas(false)">Ninguna</button>
            </div>
            <div class="multiselect-list" id="checklist-marcas-items"></div>
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Alcance / Nivel</div>
        <div class="btn-group-vertical">
          <button id="btn-scope-comp" class="active" onclick="cambiarModoAnalisis('COMPETENCIA')">COMPETENCIA</button>
          <button id="btn-scope-coesti" onclick="cambiarModoAnalisis('COESTI')">COESTI (PROPIAS)</button>
          <button id="btn-scope-marca" onclick="cambiarModoAnalisis('MARCA')">PROMEDIO MARCAS</button>
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
    </div>

    <!-- PANEL 3: ALINEACIÓN COMPETITIVA -->
    <div id="rail-panel-alineacion" class="rail-panel" style="display: none;">
      <div class="rail-section">
        <div class="rail-label">Marca Competidora</div>
        <div class="select-wrap">
          <select id="sel-alineacion-marca" onchange="window.cambiarMarcaAlineacion()">
            <option value="TODAS">TODAS LAS MARCAS (MERCADO)</option>
          </select>
        </div>
      </div>

      <div class="rail-section" id="section-alineacion-criterio" style="opacity: 0.45; pointer-events: none;">
        <div class="rail-label">Criterio de Rival</div>
        <div class="btn-group-vertical">
          <button id="btn-alineacion-cercano" class="active" onclick="window.cambiarCriterioAlineacion('CERCANO')">MÁS CERCANO</button>
          <button id="btn-alineacion-promedio" onclick="window.cambiarCriterioAlineacion('PROMEDIO')">PROMEDIO DE LA MARCA</button>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Segmentación Geográfica</div>
        <div class="select-stack">
          <div class="select-wrap">
            <select id="sel-alineacion-corredor" onchange="window.cambiarCorredorAlineacion()">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
          <div class="select-wrap">
            <select id="sel-alineacion-depto" onchange="window.cambiarDeptoAlineacion()">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">GPC Group</div>
        <div class="select-wrap">
          <select id="sel-alineacion-gpc" onchange="window.cambiarGpcAlineacion()">
            <option value="TODOS">Todos los GPC Groups</option>
          </select>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Guía de Referencia</div>
        <div class="rail-legend">
          <div class="legend-item">
            <span style="color: var(--k-emerald); font-weight: 700;">Local Market:</span>
            <span>Competidor con Main Marker asignado.</span>
          </div>
          <div class="legend-item">
            <span style="color: var(--k-lime); font-weight: 700;">Promedio Zona:</span>
            <span>Media de competidores directos en el radio.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL 4: VARIACIÓN HISTÓRICA -->
    <div id="rail-panel-variacion" class="rail-panel" style="display: none;">
      <div class="rail-section">
        <div class="rail-label">Rango de Evaluación (f1 → f2)</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div>
            <span style="font-size:0.6rem; color:#A08FA6; text-transform:uppercase;">Fecha Base (f1)</span>
            <input type="date" id="txt-var-f1" class="search-input" style="width:100%; cursor:pointer;" onchange="window.cambiarFechaF1(this.value)">
          </div>
          <div>
            <span style="font-size:0.6rem; color:#A08FA6; text-transform:uppercase;">Fecha Corte (f2)</span>
            <input type="date" id="txt-var-f2" class="search-input" style="width:100%; cursor:pointer;" onchange="window.cambiarFechaF2(this.value)">
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Producto</div>
        <div class="select-wrap">
          <select id="sel-var-prod" onchange="window.cambiarProductoVariacion()">
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
            <select id="sel-var-corredor" onchange="window.cambiarCorredorVariacion()">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
          <div class="select-wrap">
            <select id="sel-var-depto" onchange="window.cambiarDeptoVariacion()">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">GPC Group</div>
        <div class="select-wrap">
          <select id="sel-var-gpc" onchange="window.cambiarGpcVariacion()">
            <option value="TODOS">Todos los GPC Groups</option>
          </select>
        </div>
      </div>

      <div class="rail-section" id="section-var-marcas">
        <div class="rail-label">Filtrar Marcas</div>
        <div class="multiselect-wrap">
          <button type="button" class="multiselect-btn" id="btn-toggle-var-marcas" onclick="window.toggleDropdownVarMarcas()">
            <span id="label-var-marcas-count">BRANDS</span>
            <span class="multiselect-arrow">▾</span>
          </button>
          <div class="multiselect-dropdown" id="dropdown-var-marcas-content" style="display:none;">
            <div class="multiselect-actions">
              <button type="button" onclick="window.marcarTodasVarMarcas(true)">Todas</button>
              <button type="button" onclick="window.marcarTodasVarMarcas(false)">Ninguna</button>
            </div>
            <div class="multiselect-list" id="checklist-var-marcas-items"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- MARCA DE AGUA KALIBRATE -->
    <div class="rail-watermark" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <polygon points="0,0 100,0 0,100" fill="#FFFFFF" opacity="0.055"/>
        <polygon points="56,44 100,100 0,100" fill="#FFFFFF" opacity="0.10"/>
      </svg>
    </div>

    <!-- FOOTER DEL RAIL -->
    <div class="rail-foot">
      Fuente de datos: <b>Kalibrate API</b>
    </div>
  `;
}