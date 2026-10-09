/* ==========================================================
   views/matriz/tabbar.js — cinta inferior de pestañas.
   ========================================================== */
import { AGRUPACIONES } from './config.js';

export function tabbarHTML() {
  const opciones = AGRUPACIONES.map(a => `
    <button class="dropup-item" data-click="cambiarAgrupacion" data-arg="${a.id}">
      <span class="dropup-check">✓</span>
      ${a.label}
    </button>
  `).join('');

  return `
    <div class="tabbar" id="cmp-tabbar">
      <!-- 1. BLOQUE IZQUIERDO: Selector dropUp -->
      <div class="tabbar-head" id="tabbar-group-wrap">
        <button class="tabbar-group-btn" data-click="toggleDropupAgrupacion">
          <span class="tabbar-group-top">
            <span id="tabbar-group-label">Corredores</span>
            <span class="tabbar-group-arrow">▴</span>
          </span>
          <b id="tab-count">—</b>
        </button>

        <div class="tabbar-dropup" id="dropup-agrupacion" style="display:none;">
          <div class="dropup-title">Dividir pestañas por</div>
          ${opciones}
        </div>
      </div>

      <!-- 2. BOTÓN VOLVER DE MIGA DE PAN (Jerárquico) -->
      <div id="tabbar-breadcrumb-wrap" style="display:none; align-items:center; background:#1C203E; border-right:1px solid rgba(255,255,255,0.12); padding:0 8px; flex: 0 0 auto;">
        <button id="btn-back-jerarquia" data-click="retrocederJerarquiaMatriz" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:var(--k-emerald); font-size:0.65rem; font-weight:700; padding:4px 8px; border-radius:3px; cursor:pointer; font-family:'Poppins',sans-serif; text-transform:uppercase;">
          ‹ VOLVER
        </button>
      </div>

      <!-- 3. FLECHA IZQUIERDA FIJA -->
      <button class="tab-scroll-btn tab-scroll-btn-left" data-click="desplazarPestanas" data-arg="-250">‹</button>

      <!-- 4. CONTENEDOR CENTRAL DE PESTAÑAS (Con aislamiento de min-width) -->
      <div class="tabbar-scroll-wrap">
        <div class="tabs" id="tabs"></div>
      </div>

      <!-- 5. FLECHA DERECHA FIJA (Garantizada al extremo derecho) -->
      <button class="tab-scroll-btn tab-scroll-btn-right" data-click="desplazarPestanas" data-arg="250">›</button>
    </div>
  `;
}