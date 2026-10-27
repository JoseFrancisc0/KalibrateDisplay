/* ==========================================================
   views/estacion/barra.js — Barra de subvistas en nivel ESTACIÓN
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

      <!--- ESTADO ACTUAL --->
      <button class="view-tab ${sub === 'ESTADO' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="ESTADO">
        ESTADO ACTUAL
      </button>

      <!--- DELTAS --->
      <button class="view-tab ${sub === 'EVOLUCION_DIFF' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="EVOLUCION_DIFF">
        DELTAS
      </button>

      <!--- MARGEN --->
      <button class="view-tab ${sub === 'MARGEN' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="MARGEN">
        MARGEN
      </button>

      <!--- VARIACION --->
      <button class="view-tab ${sub === 'VARIACION' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="VARIACION">
        VARIACIÓN
      </button>

      <!--- VOLUMEN --->
      <button class="view-tab ${sub === 'VOLUMEN' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="VOLUMEN" style="color: #6EE7B7; font-weight:800;">
        VOLUMEN & VENTAS
      </button>

    </div>
    <div class="view-spacer"></div>
    <div class="view-mode" id="view-mode" style="padding-right:14px;">
      SUB-VISTA: ${SUBVISTAS[sub] || 'DETALLE'}
    </div>
  </div>
  `;
}