/* ==========================================================
   views/mapa/vista.js — Vista Cobertura y Rentabilidad Nacional
   Split Layout: Mapa Interactivo (65%) + Panel Lateral (35%)
   ========================================================== */

import { mapaState } from './state.js';
import { procesarDatosMapa } from './calculo.js';
import { precargarMapaPeruSVG, componerMapaPeruSVG } from './perumap.js';

let rawSvgCache = null;

export function mapaHTML() {
  return `
  <div id="mapa-shell" class="mapa-shell" style="display:none; flex-direction:column; width:100%; height:100%; padding:12px 16px; box-sizing:border-box;">
    
    <!-- HEADER DE LA VISTA -->
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 8px; flex: 0 0 auto;">
      <div>
        <h2 style="font-family:'Poppins',sans-serif; font-size:1.15rem; font-weight:800; margin:0; color:var(--k-ink);">Cobertura y Rentabilidad Nacional</h2>
        <p id="mapa-header-sub" style="font-size:0.72rem; color:var(--k-muted); margin:2px 0 0 0;">Evaluando presencia en las 12 plazas operativas.</p>
      </div>
      <div id="mapa-header-tag" class="count-badge" style="font-weight:700;">RED NACIONAL</div>
    </div>

    <!-- CONTENEDOR PRINCIPAL SPLIT (65% / 35%) -->
    <div style="flex: 1 1 0; min-height: 0; display: flex; gap: 14px; width: 100%;">
      
      <!-- PANEL IZQUIERDO: MAPA SVG INTERACTIVO (65%) -->
      <div style="flex: 1 1 65%; min-width: 0; height: 100%; background: #16182F; border: 1px solid var(--k-line); border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(22,24,47,0.08);">
        
        <!-- Botón Volver a Red Nacional -->
        <button id="btn-mapa-volver-nacional" 
                type="button" 
                data-click="deseleccionarDeptoMapa"
                style="display: none; position: absolute; top: 14px; left: 16px; z-index: 10; background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 6px 12px; color: #fff; font-family:'Poppins',sans-serif; font-size: 0.68rem; font-weight: 700; cursor: pointer;">
          ← Ver Red Nacional
        </button>

        <!-- BOTONES FLOTANTES DE ZOOM (+, -, Reset) -->
        <div style="position: absolute; top: 14px; right: 16px; z-index: 10; display: flex; flex-direction: column; gap: 4px;">
          <button id="btn-zoom-in" type="button" title="Acercar (+)" style="width: 30px; height: 30px; border-radius: 4px; background: rgba(22,24,47,0.85); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-weight: 800; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">+</button>
          <button id="btn-zoom-out" type="button" title="Alejar (-)" style="width: 30px; height: 30px; border-radius: 4px; background: rgba(22,24,47,0.85); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-weight: 800; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">−</button>
          <button id="btn-zoom-reset" type="button" title="Restablecer vista" style="width: 30px; height: 30px; border-radius: 4px; background: rgba(22,24,47,0.85); border: 1px solid rgba(255,255,255,0.2); color: #00D58A; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">↺</button>
        </div>

        <!-- Leyenda Flotante -->
        <div style="position: absolute; bottom: 12px; left: 16px; z-index: 5; display: flex; gap: 10px; font-size: 0.65rem; color: var(--k-muted); pointer-events: none;">
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 2px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.4);"></span> Plazas con Red
          </span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 2px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);"></span> Sin Presencia
          </span>
        </div>

        <!-- CONTENEDOR PAN & ZOOM DIRECTO -->
        <div id="mapa-viewport-container" style="width: 100%; height: 100%; overflow: hidden; cursor: grab; position: relative;">
          <div id="mapa-svg-wrapper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
        </div>

      </div>

      <!-- PANEL DERECHO: FICHA DE INTELIGENCIA DEPARTAMENTAL (35%) -->
      <div style="flex: 0 0 35%; width: 35%; min-width: 320px; height: 100%; background: #fff; border: 1px solid var(--k-line); border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden; box-shadow: 0 2px 10px rgba(22,24,47,0.04);">
        
        <div style="border-bottom: 1px solid var(--k-line); padding-bottom: 8px; margin-bottom: 10px; flex-shrink: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 id="mapa-ficha-titulo" style="font-family:'Poppins',sans-serif; font-size: 1.05rem; font-weight: 800; color: var(--k-ink); margin: 0;">
              RED NACIONAL
            </h3>
            <span id="mapa-ficha-badge-eess" class="count-badge" style="font-weight: 700;">0 EESS</span>
          </div>
          <p id="mapa-ficha-subtitulo" style="font-size: 0.68rem; color: var(--k-muted); margin: 2px 0 0 0;">
            Diagnóstico consolidado de las 12 plazas operativas.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 12px; flex-shrink: 0;">
          <div style="background: #F8FAFC; border: 1px solid var(--k-line); border-radius: 6px; padding: 6px 10px;">
            <span style="font-size: 0.58rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Promedio COESTI</span>
            <div id="kpi-mapa-precio" style="font-size: 1.05rem; font-weight: 800; color: #00D58A;">—</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--k-line); border-radius: 6px; padding: 6px 10px;">
            <span style="font-size: 0.58rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Costo Propio</span>
            <div id="kpi-mapa-costo" style="font-size: 1.05rem; font-weight: 800; color: var(--k-ink);">—</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--k-line); border-radius: 6px; padding: 6px 10px;">
            <span style="font-size: 0.58rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Margen Propio</span>
            <div id="kpi-mapa-margen" style="font-size: 1.05rem; font-weight: 800; color: var(--k-ink);">—</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--k-line); border-radius: 6px; padding: 6px 10px;">
            <span style="font-size: 0.58rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Promedio Comp.</span>
            <div id="kpi-mapa-comp" style="font-size: 1.05rem; font-weight: 800; color: #0284C7;">—</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--k-line); border-radius: 6px; padding: 6px 10px;">
            <span style="font-size: 0.58rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Delta Mercado</span>
            <div id="kpi-mapa-delta" style="font-size: 1.05rem; font-weight: 800;">—</div>
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--k-line); border-radius: 6px; padding: 6px 10px;">
            <span style="font-size: 0.58rem; font-weight: 700; color: var(--k-muted); text-transform: uppercase;">Rivales Físicos</span>
            <div id="kpi-mapa-rivales" style="font-size: 1.05rem; font-weight: 800; color: var(--k-ink);">—</div>
          </div>
        </div>

        <div style="flex: 1 1 0; min-height: 0; display: flex; flex-direction: column;">
          <div style="font-family:'Poppins',sans-serif; font-size: 0.72rem; font-weight: 700; color: var(--k-ink); margin-bottom: 6px; flex-shrink: 0;">
            Estaciones Propias en la Zona
          </div>
          <div id="mapa-lateral-lista-eess" style="flex: 1 1 0; overflow-y: auto; display: flex; flex-direction: column; padding-right: 4px;"></div>
        </div>

      </div>

    </div>

  </div>
  `;
}

/* ---------- Motor de Pan & Zoom Vectorial Puro (viewBox) ---------- */
const VB_BASE = { x: 0, y: 0, w: 1000, h: 1000 };
let currentVB = { ...VB_BASE };

let pzState = {
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  hasMoved: false,
  initialized: false
};

function aplicarViewBox() {
  const svgEl = document.querySelector('#mapa-svg-wrapper svg');
  if (svgEl) {
    svgEl.setAttribute('viewBox', `${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}`);
  }
}

export function resetearZoomMapa() {
  currentVB = { ...VB_BASE };
  aplicarViewBox();
}

function inicializarEventosPanZoom() {
  if (pzState.initialized) return;
  const container = document.getElementById('mapa-viewport-container');
  if (!container) return;

  pzState.initialized = true;

  // Zoom enfocado en el puntero usando viewBox
  container.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Coordenada del mouse proyectada en el espacio geométrico SVG
    const svgX = currentVB.x + (mouseX / rect.width) * currentVB.w;
    const svgY = currentVB.y + (mouseY / rect.height) * currentVB.h;

    // Factor: acerca al girar hacia arriba, aleja al girar hacia abajo
    const factor = e.deltaY < 0 ? 0.82 : 1.22;
    const newW = Math.min(Math.max(currentVB.w * factor, 180), 1250); // Límite: de 180 (zoom ~5.5x) a 1250
    const newH = newW; // Mantener relación de aspecto 1:1

    // Reubicar origen para fijar el punto bajo el mouse
    currentVB.x = svgX - (mouseX / rect.width) * newW;
    currentVB.y = svgY - (mouseY / rect.height) * newH;
    currentVB.w = newW;
    currentVB.h = newH;

    aplicarViewBox();
  }, { passive: false });

  // Iniciar Arrastre (MouseDown)
  container.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;

    pzState.isDragging = true;
    pzState.hasMoved = false;
    pzState.dragStartX = e.clientX;
    pzState.dragStartY = e.clientY;
    container.style.cursor = 'grabbing';
  });

  // Mover Vista (MouseMove)
  window.addEventListener('mousemove', e => {
    if (!pzState.isDragging) return;

    const dx = e.clientX - pzState.dragStartX;
    const dy = e.clientY - pzState.dragStartY;

    if (!pzState.hasMoved && Math.hypot(dx, dy) > 4) {
      pzState.hasMoved = true;
    }

    const rect = container.getBoundingClientRect();
    // Convertir desplazamiento de pantalla a unidades del SVG
    currentVB.x -= dx * (currentVB.w / rect.width);
    currentVB.y -= dy * (currentVB.h / rect.height);

    pzState.dragStartX = e.clientX;
    pzState.dragStartY = e.clientY;
    aplicarViewBox();
  });

  // Soltar Arrastre (MouseUp)
  window.addEventListener('mouseup', () => {
    if (!pzState.isDragging) return;
    pzState.isDragging = false;
    if (container) container.style.cursor = 'grab';
  });

  // Prevenir click accidental en departamentos al arrastrar
  container.addEventListener('click', e => {
    if (pzState.hasMoved) {
      e.stopPropagation();
      e.preventDefault();
      pzState.hasMoved = false;
    }
  }, true);

  // Botones flotantes (+, -, Reset)
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    const factor = 0.75;
    const newW = Math.max(currentVB.w * factor, 180);
    const newH = newW;
    currentVB.x += (currentVB.w - newW) / 2;
    currentVB.y += (currentVB.h - newH) / 2;
    currentVB.w = newW;
    currentVB.h = newH;
    aplicarViewBox();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    const factor = 1.30;
    const newW = Math.min(currentVB.w * factor, 1250);
    const newH = newW;
    currentVB.x += (currentVB.w - newW) / 2;
    currentVB.y += (currentVB.h - newH) / 2;
    currentVB.w = newW;
    currentVB.h = newH;
    aplicarViewBox();
  });

  document.getElementById('btn-zoom-reset')?.addEventListener('click', resetearZoomMapa);
}

/**
 * Renderizador principal de la vista
 */
export async function renderMapa(todasLasEstaciones) {
  const shell = document.getElementById('mapa-shell');
  if (!shell) return;

  if (!rawSvgCache) {
    rawSvgCache = await precargarMapaPeruSVG();
  }

  const { porDepartamento, resumenNacional, deptoActivoData } = procesarDatosMapa(todasLasEstaciones);
  const combustible = mapaState.producto || 'Diesel';
  const deptoActivo = mapaState.deptoSeleccionado;

  // 1. Subtítulos y tags
  const headerSub = document.getElementById('mapa-header-sub');
  const headerTag = document.getElementById('mapa-header-tag');
  if (headerSub) headerSub.innerText = `Evaluando ${combustible.toUpperCase()} en las 12 plazas operativas.`;
  if (headerTag) headerTag.innerText = deptoActivo ? deptoActivo : 'RED NACIONAL';

  // 2. Botón Volver a Red Nacional
  const btnVolver = document.getElementById('btn-mapa-volver-nacional');
  if (btnVolver) btnVolver.style.display = deptoActivo ? 'block' : 'none';

  // 3. Inyección del SVG Oficial enriquecido
  const svgWrapper = document.getElementById('mapa-svg-wrapper');
  if (svgWrapper && rawSvgCache) {
    svgWrapper.innerHTML = componerMapaPeruSVG(rawSvgCache, porDepartamento, deptoActivo);
    aplicarViewBox();
  }

  inicializarEventosPanZoom();

  // 4. Actualizar Ficha Lateral
  const tituloFicha = document.getElementById('mapa-ficha-titulo');
  const badgeEessFicha = document.getElementById('mapa-ficha-badge-eess');
  const subFicha = document.getElementById('mapa-ficha-subtitulo');

  if (tituloFicha) tituloFicha.innerText = deptoActivo ? deptoActivo : 'RED NACIONAL';
  if (badgeEessFicha) badgeEessFicha.innerText = `${deptoActivoData.totalPropias} EESS`;
  if (subFicha) {
    subFicha.innerText = deptoActivo 
      ? `Plaza operativa de ${deptoActivo} · ${deptoActivoData.totalPropias} estaciones evaluadas.`
      : `Diagnóstico consolidado de las 12 plazas operativas (${resumenNacional.totalPropias} estaciones).`;
  }

  // KPIs
  const elP = document.getElementById('kpi-mapa-precio');
  const elC = document.getElementById('kpi-mapa-costo');
  const elMg = document.getElementById('kpi-mapa-margen');
  const elComp = document.getElementById('kpi-mapa-comp');
  const elDelta = document.getElementById('kpi-mapa-delta');
  const elRiv = document.getElementById('kpi-mapa-rivales');

  if (elP) elP.innerText = deptoActivoData.promPrecioPropio !== null ? `S/ ${deptoActivoData.promPrecioPropio.toFixed(2)}` : '—';
  if (elC) elC.innerText = deptoActivoData.promCostoPropio !== null ? `S/ ${deptoActivoData.promCostoPropio.toFixed(2)}` : '—';
  
  if (elMg) {
    if (deptoActivoData.promMargenPropio !== null) {
      elMg.innerText = `S/ ${deptoActivoData.promMargenPropio.toFixed(2)}`;
      elMg.style.color = deptoActivoData.promMargenPropio >= 1.50 ? '#00D58A' : 'var(--k-ink)';
    } else {
      elMg.innerText = '—';
      elMg.style.color = 'var(--k-ink)';
    }
  }

  if (elComp) elComp.innerText = deptoActivoData.promPrecioComp !== null ? `S/ ${deptoActivoData.promPrecioComp.toFixed(2)}` : '—';

  if (elDelta) {
    if (deptoActivoData.deltaMercado !== null) {
      const d = deptoActivoData.deltaMercado;
      elDelta.innerText = `${d >= 0 ? '+' : ''}S/ ${d.toFixed(2)}`;
      elDelta.style.color = d > 0.05 ? 'var(--diff-neg, #D92D4E)' : (d < -0.05 ? 'var(--diff-pos, #00D58A)' : 'var(--k-muted)');
    } else {
      elDelta.innerText = '—';
      elDelta.style.color = 'var(--k-ink)';
    }
  }

  if (elRiv) elRiv.innerText = `${deptoActivoData.totalCompetidores} Rivales`;

  // 5. Lista de Estaciones en el Panel Lateral
  const listaContainer = document.getElementById('mapa-lateral-lista-eess');
  if (listaContainer) {
    if (deptoActivoData.estaciones.length === 0) {
      listaContainer.innerHTML = '<div style="margin:auto; font-size:0.75rem; color:var(--k-muted); padding:12px;">Sin estaciones en esta selección.</div>';
      return;
    }

    listaContainer.innerHTML = deptoActivoData.estaciones.map(est => {
      const margenTxt = est.margen !== null ? `Mg: S/ ${est.margen.toFixed(2)}` : 'Mg: —';
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 7px 4px; border-bottom: 1px solid rgba(226, 232, 240, 0.7); gap: 8px;">
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 0.76rem; font-weight: 700; color: var(--k-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${est.nombre}
            </div>
            <div style="font-size: 0.64rem; color: var(--k-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">
              ${est.distrito} · ${est.provincia}
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-size: 0.88rem; font-weight: 800; color: var(--k-ink); font-variant-numeric: tabular-nums;">
              S/ ${est.precio.toFixed(2)}
            </div>
            <div style="font-size: 0.65rem; font-weight: 700; color: #00D58A; margin-top: 1px;">
              ${margenTxt}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}