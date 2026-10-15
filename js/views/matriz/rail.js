/* ==========================================================
   views/matriz/rail.js — panel de filtros de la Matriz.
   ========================================================== */

import { dropSVG, searchSVG } from '../../shared/icons.js';

const LEYENDA = [
  ['var(--drop-unleaded)', 'Unleaded (Reg/Prem)'],
  ['var(--drop-diesel)',   'Diesel'],
  ['var(--drop-glp)',      'GLP'],
  ['var(--drop-gnv)',      'GNV']
];

export function railHTML() {
  return `
    <!-- PANEL 1: MATRIZ COMPETITIVA -->
    <div id="rail-panel-matriz" class="rail-panel">
    
      <!-- BUSCADOR -->
      <div class="rail-section">
        <div class="rail-label">Buscar</div>
        <div class="search-wrap">${searchSVG()}
          <input type="text" id="txt-search" class="search-input"
                 placeholder="Estación propia..." data-input="filtrarEstaciones">
        </div>
      </div>

      <!-- FILTRO MAIN MARKER -->
      <div class="rail-section">
        <div class="rail-label">Filtro Main Marker</div>
        <div class="select-wrap">
          <select id="sel-marker" data-change="cambiarFiltroMarker">
            <option value="TODOS">Todos los competidores</option>
            <option value="CUALQUIERA">Solo Main Marker (Cualquiera)</option>
            <option value="UNLEADED">Main Marker: Unleaded</option>
            <option value="DIESEL">Main Marker: Diesel</option>
            <option value="GLP">Main Marker: GLP</option>
            <option value="GNV">Main Marker: GNV</option>
          </select>
        </div>
      </div>

      <!-- FILTRO MARCA COMPETIDOR -->
      <div class="rail-section">
        <div class="rail-label">Filtro Marca Competidor</div>
        <div class="select-wrap">
          <select id="sel-matriz-marca" data-change="cambiarFiltroMarcaMatriz">
            <option value="TODAS">Todas las marcas</option>
          </select>
        </div>
      </div>

      <!-- SIMBOLOGÍA MARKER -->
      <div class="rail-section">
        <div class="rail-label">Simbología Marker</div>
        <div class="rail-legend">${LEYENDA.map(([color, texto]) => `
          <div class="legend-item">
            ${dropSVG(color, '', 'width:9px; height:12px;')}
            <span>${texto}</span>
          </div>`).join('')}
        </div>
      </div>

    </div>`;
}
