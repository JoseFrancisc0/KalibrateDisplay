/* ==========================================================
   views/competencia/rail.js
   ========================================================== */
import { COMBUSTIBLES } from '../../config/productos.js';
import { competenciaSemanalState } from './state.js';

export function railCompetenciaSemanalHTML() {
    const cs = competenciaSemanalState;
    return `
    <div class="rail-panel" id="rail-panel-competencia-semanal" style="display:none;">
        <div class="rail-section">
            <div class="rail-label">Modo de Agrupación</div>
            <div class="cs-mode-group">
                <button class="cs-mode-btn ${cs.modoVista === 'ESTACIONES' ? 'active' : ''}" 
                        id="btn-cs-modo-est" 
                        data-click="setModoVistaCS" 
                        data-arg="ESTACIONES">
                    ESTACIONES
                </button>
                <button class="cs-mode-btn ${cs.modoVista === 'MARCAS' ? 'active' : ''}" 
                        id="btn-cs-modo-marcas" 
                        data-click="setModoVistaCS" 
                        data-arg="MARCAS">
                    MARCAS
                </button>
            </div>
        </div>

        <div class="rail-section">
            <div class="rail-label">Período de Análisis</div>
            <div class="btn-group-vertical">
                <button class="${cs.periodoActivo === 'ACTUAL' ? 'active' : ''}" 
                        id="btn-cs-actual" 
                        data-click="setPeriodoSemanal" 
                        data-arg="ACTUAL">
                    SEMANA EN CURSO
                </button>
                <button class="${cs.periodoActivo === 'PASADA' ? 'active' : ''}" 
                        id="btn-cs-pasada" 
                        data-click="setPeriodoSemanal" 
                        data-arg="PASADA">
                    SEMANA PASADA
                </button>
            </div>
        </div>

        <div class="rail-section">
            <div class="rail-label">Producto</div>
            <div class="select-wrap">
                <select id="sel-cs-prod" data-change="cambiarProductoCS">
                    ${COMBUSTIBLES.map(p => `
                        <option value="${p}" ${p === cs.producto ? 'selected' : ''}>${p}</option>
                    `).join('')}
                </select>
            </div>
        </div>

        <div class="rail-section">
            <div class="rail-label">Ubicación Política</div>
            <div class="select-stack">
                <div class="select-wrap">
                    <select id="sel-cs-depto" data-change="cambiarDeptoCS">
                        <option value="TODOS">Todos los departamentos</option>
                    </select>
                </div>
                <div class="select-row-2">
                    <div class="select-wrap">
                        <select id="sel-cs-provincia" data-change="cambiarProvinciaCS">
                            <option value="TODOS">Provincia</option>
                        </select>
                    </div>
                    <div class="select-wrap">
                        <select id="sel-cs-distrito" data-change="cambiarDistritoCS">
                            <option value="TODOS">Distrito</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="rail-section">
            <div class="rail-label">Leyenda</div>
            <div class="rail-legend">
                <div class="legend-item">
                    <span style="color: var(--diff-pos); font-weight:800;">▲</span>
                    <span>Subió respecto al día anterior</span>
                </div>
                <div class="legend-item">
                    <span style="color: var(--diff-neg); font-weight:800;">▼</span>
                    <span>Bajó respecto al día anterior</span>
                </div>
                <div class="legend-item">
                    <span style="color: var(--k-muted); font-weight:700;">—</span>
                    <span>Sin variación / Sin dato</span>
                </div>
            </div>
        </div>
    </div>
    `;
}