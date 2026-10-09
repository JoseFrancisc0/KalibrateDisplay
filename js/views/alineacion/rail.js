/* ==========================================================
   views/alineacion/rail.js — panel de filtros de Alineación.
   ========================================================== */

export function railHTML() {
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

      <!-- FILTROS -->
      <div class="rail-section">
        <div class="rail-label">Filtros</div>
        <div class="select-stack">

          <!-- GPC Group -->
          <div class="select-wrap">
            <select id="sel-alineacion-gpc" data-change="cambiarGpcAlineacion">
              <option value="TODOS">Todos los GPC Groups</option>
            </select>
          </div>

          <!-- Corredor -->
          <div class="select-wrap">
            <select id="sel-alineacion-corredor" data-change="cambiarCorredorAlineacion">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>

          <!-- Zona -->
          <div class="select-wrap">
            <select id="sel-alineacion-zona" data-change="cambiarZonaAlineacion">
              <option value="TODOS">Todas las zonas</option>
            </select>
          </div>

          <!-- Departamento -->
          <div class="select-wrap">
            <select id="sel-alineacion-depto" data-change="cambiarDeptoAlineacion">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>

          <!-- Provincia | Distrito -->
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
      </div>

    </div>`;
}
