/* ==========================================================
   views/alineacion/rail.js — panel de filtros de Alineación.
   ========================================================== */

export function railHTML() {
  return `
    <!-- PANEL 3: ALINEACIÓN COMPETITIVA -->
    <div id="rail-panel-alineacion" class="rail-panel" style="display: none;">
      <div class="rail-section">
        <div class="rail-label">Marca Competidora</div>
        <div class="select-wrap">
          <select id="sel-alineacion-marca" data-change="cambiarMarcaAlineacion">
            <option value="TODAS">TODAS LAS MARCAS (MERCADO)</option>
          </select>
        </div>
      </div>

      <div class="rail-section" id="section-alineacion-criterio" style="opacity: 0.45; pointer-events: none;">
        <div class="rail-label">Criterio de Rival</div>
        <div class="btn-group-vertical">
          <button id="btn-alineacion-cercano" class="active" data-click="cambiarCriterioAlineacion" data-arg="CERCANO">MÁS CERCANO</button>
          <button id="btn-alineacion-promedio" data-click="cambiarCriterioAlineacion" data-arg="PROMEDIO">PROMEDIO DE LA MARCA</button>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">Segmentación Geográfica</div>
        <div class="select-stack">
          <div class="select-wrap">
            <select id="sel-alineacion-corredor" data-change="cambiarCorredorAlineacion">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>
          <div class="select-wrap">
            <select id="sel-alineacion-depto" data-change="cambiarDeptoAlineacion">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>
        </div>
      </div>

      <div class="rail-section">
        <div class="rail-label">GPC Group</div>
        <div class="select-wrap">
          <select id="sel-alineacion-gpc" data-change="cambiarGpcAlineacion">
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
    </div>`;
}
