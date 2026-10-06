/* ==========================================================
   components/view-bar.js — Barra de navegación superior
   Estructura 100% compatible con css/components/view-bar.css
   ========================================================== */
import { state } from '../state.js';

export function viewBarHTML() {
  if (state.modoNivel === 'ESTACION') {
    const estNombre = state.estacionDataActiva?.estacion || 'ESTACIÓN';
    const sub = state.subVistaEstacion || 'ESTADO';

    return `
      <div class="view-bar">
        <!-- Botón Volver con la clase original view-lead para heredar el corte diagonal verde -->
        <button class="view-lead" onclick="window.volverAMacro()" style="border: none; cursor: pointer;" title="Regresar al listado general">
          ‹ VOLVER
        </button>

        <div class="view-tabs">
          <!-- Badge con el nombre de la estación propia -->
          <span style="display: flex; align-items: center; padding: 0 14px; color: var(--k-lime); font-family: 'Poppins', sans-serif; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
            ${estNombre}
          </span>

          <div style="width: 1px; height: 18px; background: rgba(255,255,255,0.18); margin: 0 4px;"></div>

          <!-- Pestañas internas de la estación -->
          <button id="tab-sub-estado" class="view-tab ${sub === 'ESTADO' ? 'active' : ''}" onclick="window.setSubVistaEstacion('ESTADO')">ESTADO ACTUAL</button>
          <button id="tab-sub-precios" class="view-tab ${sub === 'EVOLUCION_PRECIOS' ? 'active' : ''}" onclick="window.setSubVistaEstacion('EVOLUCION_PRECIOS')">EVOLUCIÓN PRECIOS</button>
          <button id="tab-sub-diff" class="view-tab ${sub === 'EVOLUCION_DIFF' ? 'active' : ''}" onclick="window.setSubVistaEstacion('EVOLUCION_DIFF')">EVOLUCIÓN DIFERENCIALES</button>
          <button id="tab-sub-var" class="view-tab ${sub === 'VARIACION' ? 'active' : ''}" onclick="window.setSubVistaEstacion('VARIACION')">VARIACIÓN DE PRECIOS</button>
        </div>

        <!-- Espaciador flexible que empuja el modo al extremo derecho -->
        <div class="view-spacer"></div>
        <div class="view-mode" id="view-mode">DETALLE QUIRÚRGICO</div>
      </div>
    `;
  }

  // MODO GENERAL (Macro)
  const v = state.vistaActiva || 'MATRIZ';

  return `
    <div class="view-bar">
      <!-- Pestaña verde diagonal VISTAS -->
      <div class="view-lead">VISTAS</div>

      <div class="view-tabs">
        <button id="tab-view-matriz" class="view-tab ${v === 'MATRIZ' ? 'active' : ''}" onclick="window.setVista('MATRIZ')">MATRIZ COMPETITIVA</button>
        <button id="tab-view-analisis" class="view-tab ${v === 'ANALISIS' ? 'active' : ''}" onclick="window.setVista('ANALISIS')">ANÁLISIS PONDERADO</button>
        <button id="tab-view-alineacion" class="view-tab ${v === 'ALINEACION' ? 'active' : ''}" onclick="window.setVista('ALINEACION')">ALINEACIÓN COMPETITIVA</button>
        <button id="tab-view-variacion" class="view-tab ${v === 'VARIACION' ? 'active' : ''}" onclick="window.setVista('VARIACION')">VARIACIÓN HISTÓRICA</button>
      </div>

      <!-- Espaciador flexible que empuja el modo al extremo derecho -->
      <div class="view-spacer"></div>
      <div class="view-mode" id="view-mode">MÉTRICA ACTIVA: PRECIOS</div>
    </div>
  `;
}