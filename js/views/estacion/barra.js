/* ==========================================================
   views/estacion/barra.js — barra superior en nivel ESTACIÓN
   (botón Volver + pestañas internas de la estación).
   Estructura 100% compatible con css/layout/view-bar.css
   ========================================================== */
import { estacionState, SUBVISTAS } from './state.js';

export function barraEstacionHTML() {
  const estNombre = estacionState.dataActiva?.estacion || 'ESTACIÓN';
  const sub = estacionState.subVista || 'ESTADO';

  return `
    <div class="view-bar" style="background:#16182F;">
      <button class="view-tab" data-click="volverAMacro" style="font-weight:700; color:var(--k-lime); border-right:1px solid rgba(255,255,255,0.15);">
        ‹ VOLVER
      </button>
      <div class="view-lead" style="background:var(--k-indigo); color:#fff; clip-path:none; margin-right:8px; padding:0 12px;">
        ${estNombre}
      </div>
      <div class="view-tabs">
        <button class="view-tab ${sub === 'ESTADO' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="ESTADO">
          ESTADO ACTUAL
        </button>
        <button class="view-tab ${sub === 'EVOLUCION_PRECIOS' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="EVOLUCION_PRECIOS">
          PRECIOS
        </button>
        <button class="view-tab ${sub === 'EVOLUCION_DIFF' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="EVOLUCION_DIFF">
          DELTAS
        </button>
        <button class="view-tab ${sub === 'MARGEN' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="MARGEN">
          MARGEN
        </button>
        <button class="view-tab ${sub === 'VARIACION' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="VARIACION">
          VARIACIÓN
        </button>
      </div>
      <div class="view-spacer"></div>
      <div class="view-mode" id="view-mode" style="padding-right:14px;">
        SUB-VISTA: ${SUBVISTAS[sub] || 'DETALLE'}
      </div>
    </div>
  `;
}