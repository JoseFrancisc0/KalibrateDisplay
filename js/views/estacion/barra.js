/* ==========================================================
   views/estacion/barra.js — barra superior en nivel ESTACIÓN
   (botón Volver + pestañas internas de la estación).
   Estructura 100% compatible con css/layout/view-bar.css
   ========================================================== */
import { estacionState } from './state.js';

export function barraEstacionHTML() {
  const estNombre = estacionState.dataActiva?.estacion || 'ESTACIÓN';
  const sub = estacionState.subVista || 'ESTADO';

  return `
      <div class="view-bar">
        <!-- Botón Volver con la clase original view-lead para heredar el corte diagonal verde -->
        <button class="view-lead" data-click="volverAMacro" style="border: none; cursor: pointer;" title="Regresar al listado general">
          ‹ VOLVER
        </button>

        <div class="view-tabs">
          <!-- Badge con el nombre de la estación propia -->
          <span style="display: flex; align-items: center; padding: 0 14px; color: var(--k-lime); font-family: 'Poppins', sans-serif; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
            ${estNombre}
          </span>

          <div style="width: 1px; height: 18px; background: rgba(255,255,255,0.18); margin: 0 4px;"></div>

          <!-- Pestañas internas de la estación -->
          <button id="tab-sub-estado" class="view-tab ${sub === 'ESTADO' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="ESTADO">ESTADO ACTUAL</button>
          <button id="tab-sub-precios" class="view-tab ${sub === 'EVOLUCION_PRECIOS' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="EVOLUCION_PRECIOS">EVOLUCIÓN PRECIOS</button>
          <button id="tab-sub-diff" class="view-tab ${sub === 'EVOLUCION_DIFF' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="EVOLUCION_DIFF">EVOLUCIÓN DIFERENCIALES</button>
          <button id="tab-sub-var" class="view-tab ${sub === 'VARIACION' ? 'active' : ''}" data-click="setSubVistaEstacion" data-arg="VARIACION">VARIACIÓN DE PRECIOS</button>
        </div>

        <!-- Espaciador flexible que empuja el modo al extremo derecho -->
        <div class="view-spacer"></div>
        <div class="view-mode" id="view-mode">DETALLE QUIRÚRGICO</div>
      </div>
    `;
}
