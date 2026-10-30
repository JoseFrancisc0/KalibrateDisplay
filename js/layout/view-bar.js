/* ==========================================================
 layout/view-bar.js — Barra jerárquica por CAPAS y SUBVISTAS.
 Nivel GENERAL: 2 niveles visuales sincronizados.
 Nivel ESTACIÓN: controlado por views/estacion/barra.js.
 ========================================================== */

import { CAPAS } from '../views/index.js';
import { state } from '../core/state.js';

export function viewBarGeneralHTML(vistas, vistaActiva) {
  // 1. Determinar capa activa a partir del state o de la vista activa
  let capaActiva = CAPAS.find(c => c.id === state.capaActiva);
  if (!capaActiva) {
    capaActiva = CAPAS.find(c => c.vistas.some(v => v.id === vistaActiva)) || CAPAS[0];
    state.capaActiva = capaActiva.id;
  }

  // 2. Render de pestañas de Nivel 1 (Capas)
  const capasTabsHTML = CAPAS.map(capa => {
    const esActiva = capa.id === capaActiva.id;
    return `
      <button 
        class="capa-tab ${esActiva ? 'active' : ''}" 
        data-click="setCapa" 
        data-arg="${capa.id}">
        <span class="capa-indicator"></span>
        ${capa.label}
      </button>
    `;
  }).join('');

  // 3. Render de pestañas de Nivel 2 (Subvistas de la Capa Activa)
  const subVistasHTML = capaActiva.vistas.map(vista => {
    const esActiva = vistaActiva === vista.id;
    return `
      <button 
        id="${vista.tabId}" 
        class="view-tab ${esActiva ? 'active' : ''}" 
        data-click="setVista" 
        data-arg="${vista.id}">
        ${vista.label}
      </button>
    `;
  }).join('');

  return `
    <div class="view-bar-container view-bar">
      <!-- NIVEL 1: CAPAS ESTRATÉGICAS -->
      <div class="view-bar-capas">
        <div class="capas-lead">ÁMBITO</div>
        <div class="capas-tabs">
          ${capasTabsHTML}
        </div>
      </div>

      <!-- NIVEL 2: VISTAS OPERATIVAS -->
      <div class="view-bar-subviews">
        <div class="view-lead">VISTAS</div>
        <div class="view-tabs">
          ${subVistasHTML}
        </div>
        <div class="view-spacer"></div>
        <div class="view-mode" id="view-mode">MATRIZ: PRECIOS VIGENTES</div>
      </div>
    </div>
  `;
}