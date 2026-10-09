/* ==========================================================
   views/margen/rail.js — Riel de Margen de Mercado
   ========================================================== */
import { COMBUSTIBLES } from '../../config/productos.js';
import { margenMercadoState } from './state.js';

export function railMargenMercadoHTML() {
  const mm = margenMercadoState;

  return `
    <div id="rail-panel-margen-mercado" class="rail-panel" style="display:none;">
      
      <!-- RANGO HISTÓRICO -->
      <div class="rail-section">
        <span class="rail-label">Rango Histórico</span>
        <div style="display:flex; flex-direction:column; gap:5px;">
          <input type="date" id="txt-mm-f1" class="search-input" value="${mm.fechaInicio}" data-change="cambiarF1MargenMercado" style="width:100%; cursor:pointer;">
          <input type="date" id="txt-mm-f2" class="search-input" value="${mm.fechaFin}" data-change="cambiarF2MargenMercado" style="width:100%; cursor:pointer;">
        </div>
      </div>

      <!-- PRODUCTO -->
      <div class="rail-section">
        <span class="rail-label">Producto</span>
        <div class="select-wrap">
          <select id="sel-mm-prod" data-change="cambiarProductoMargenMercado">
            ${COMBUSTIBLES.map(p => `
              <option value="${p}" ${p === mm.producto ? 'selected' : ''}>${p}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- FILTROS COMERCIALES Y TERRITORIALES -->
      <div class="rail-section">
        <span class="rail-label">Filtros</span>
        <div style="display:flex; flex-direction:column; gap:6px;">
          
          <div class="select-wrap">
            <select id="sel-mm-gpc" data-change="cambiarGpcMargenMercado">
              <option value="TODOS">Todos los GPC Groups</option>
            </select>
          </div>

          <div class="select-wrap">
            <select id="sel-mm-corredor" data-change="cambiarCorredorMargenMercado">
              <option value="TODOS">Todos los corredores</option>
            </select>
          </div>

          <div class="select-wrap">
            <select id="sel-mm-zona" data-change="cambiarZonaMargenMercado">
              <option value="TODOS">Todas las zonas</option>
            </select>
          </div>

          <div class="select-wrap">
            <select id="sel-mm-depto" data-change="cambiarDeptoMargenMercado">
              <option value="TODOS">Todos los departamentos</option>
            </select>
          </div>

          <div class="select-row-2">
            <div class="select-wrap">
              <select id="sel-mm-provincia" data-change="cambiarProvinciaMargenMercado">
                <option value="TODOS">Provincia</option>
              </select>
            </div>
            <div class="select-wrap">
              <select id="sel-mm-distrito" data-change="cambiarDistritoMargenMercado">
                <option value="TODOS">Distrito</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      <!-- CHECKLIST DE MARCAS -->
      <div class="rail-section" id="section-mm-marcas">
        <span class="rail-label">Filtrar Marcas</span>
        <div class="multiselect-wrap">
          <button type="button" class="multiselect-btn" data-click="toggleDropdownMarcasMargenMercado">
            <span id="label-mm-marcas-count">BRANDS</span>
            <span class="multiselect-arrow">▾</span>
          </button>
          <div class="multiselect-dropdown" id="dropdown-mm-marcas" style="display:none;">
            <div class="multiselect-actions">
              <button type="button" data-click="marcarTodasMarcasMargenMercado" data-arg="true">Todas</button>
              <button type="button" data-click="marcarTodasMarcasMargenMercado" data-arg="false">Ninguna</button>
            </div>
            <div class="multiselect-list" id="checklist-mm-marcas-items"></div>
          </div>
        </div>
      </div>

    </div>
  `;
}