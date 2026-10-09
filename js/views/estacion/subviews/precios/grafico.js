/* ==========================================================
   views/estacion/subviews/precios/grafico.js
   ========================================================== */
import { evolucionState } from './state.js';

const COLORES_RIVALES = ['#2563EB', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#059669', '#4B5563', '#0891B2'];

export function renderEvolucionPrecios(container, est) {
  const prod = evolucionState.producto;
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist) {
    container.innerHTML = `<div class="empty-state">Sin historial disponible para ${prod}.</div>`;
    return;
  }

  const f1 = evolucionState.fechaInicio;
  const f2 = evolucionState.fechaFin;

  // 1. Serie propia
  const seriePropia = (hist.propio || [])
    .filter(d => d.t.slice(0, 10) >= f1 && d.t.slice(0, 10) <= f2)
    .sort((a, b) => a.t.localeCompare(b.t));

  // 2. Series de competidores seleccionados
  const actoresMap = new Map((est.actores || []).map(a => [a.site_id, a]));
  const rivalesSeleccionados = evolucionState.competidoresSeleccionados || new Set();

  const seriesCompetidores = [];
  Object.entries(hist.competidores || {}).forEach(([siteId, puntos]) => {
    if (!rivalesSeleccionados.has(siteId)) return;
    const actor = actoresMap.get(siteId);
    const puntosRango = (puntos || [])
      .filter(d => d.t.slice(0, 10) >= f1 && d.t.slice(0, 10) <= f2)
      .sort((a, b) => a.t.localeCompare(b.t));

    if (puntosRango.length > 0) {
      seriesCompetidores.push({
        siteId,
        nombre: actor ? actor.nombre_linea : 'Competidor',
        marca: actor ? actor.marca : '—',
        distancia: actor?.distancia_km,
        puntos: puntosRango
      });
    }
  });

  if (seriePropia.length === 0 && seriesCompetidores.length === 0) {
    container.innerHTML = `<div class="empty-state">No se registraron cambios de precio para ${prod} entre ${f1} y ${f2}.</div>`;
    return;
  }

  // Dimensiones del lienzo SVG
  const W = 1100, H = 500;
  const padL = 75, padR = 40, padT = 35, padB = 60;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  // Rango de escala Y (precios)
  const todosPrecios = [
    ...seriePropia.map(d => d.p),
    ...seriesCompetidores.flatMap(s => s.puntos.map(d => d.p))
  ];
  const minP = Math.floor(Math.min(...todosPrecios) * 10) / 10 - 0.20;
  const maxP = Math.ceil(Math.max(...todosPrecios) * 10) / 10 + 0.20;

  // Escala X (tiempo)
  const tMin = new Date(f1).getTime();
  const tMax = new Date(f2).getTime();
  const scaleX = (tStr) => padL + ((new Date(tStr).getTime() - tMin) / (tMax - tMin || 1)) * cW;
  const scaleY = (p) => padT + (1 - (p - minP) / (maxP - minP || 1)) * cH;

  // Trazado escalonado: mantiene el precio horizontalmente hasta el siguiente cambio
  function crearPathStep(puntos) {
    if (puntos.length === 0) return '';
    let d = `M ${scaleX(puntos[0].t)} ${scaleY(puntos[0].p)}`;
    for (let i = 1; i < puntos.length; i++) {
      const prevY = scaleY(puntos[i - 1].p);
      const curX = scaleX(puntos[i].t);
      const curY = scaleY(puntos[i].p);
      d += ` H ${curX} V ${curY}`;
    }
    // Extiende la última vigencia hasta el extremo derecho del gráfico
    d += ` H ${padL + cW}`;
    return d;
  }

  // Grilla de líneas horizontales Y
  const numPasosY = 5;
  const gridY = [];
  for (let i = 0; i <= numPasosY; i++) {
    const val = minP + (i / numPasosY) * (maxP - minP);
    const y = scaleY(val);
    gridY.push(`
      <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="3 3"/>
      <text x="${padL - 10}" y="${y + 4}" font-size="11" fill="#64748B" font-family="'Poppins', sans-serif" font-weight="600" text-anchor="end">
        S/ ${val.toFixed(2)}
      </text>
    `);
  }

  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; background:#fff; border-radius:6px; border:1px solid var(--k-line); padding:16px; min-height:0; box-sizing:border-box;">
      
      <!-- CABECERA DE LA VISTA -->
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px;">
        <div>
          <h3 style="font-family:'Poppins',sans-serif; font-size:1.05rem; font-weight:800; color:var(--k-ink); margin:0;">
            Evolución de Precios: ${prod.toUpperCase()}
          </h3>
          <p style="font-size:0.75rem; color:var(--k-muted); margin:2px 0 0 0;">
            Curvas temporales de precios de venta al público en el radio competitivo.
          </p>
        </div>
        <div style="display:flex; gap:12px; font-size:0.72rem; font-weight:700;">
          <span style="color:var(--k-emerald); display:flex; align-items:center; gap:5px;">
            <span style="width:14px; height:3px; background:var(--k-emerald); display:inline-block;"></span> ${est.estacion} (PROPIA)
          </span>
        </div>
      </div>

      <!-- LIENZO SVG -->
      <div style="flex:1; width:100%; min-height:0; position:relative; overflow:hidden;">
        <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:100%; display:block;" preserveAspectRatio="none">
          <!-- Grilla -->
          ${gridY.join('')}

          <!-- Curvas Competidores -->
          ${seriesCompetidores.map((s, idx) => {
            const color = COLORES_RIVALES[idx % COLORES_RIVALES.length];
            return `
              <path d="${crearPathStep(s.puntos)}" fill="none" stroke="${color}" stroke-width="2" opacity="0.85"/>
              ${s.puntos.map(p => `
                <circle cx="${scaleX(p.t)}" cy="${scaleY(p.p)}" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.5">
                  <title>${s.nombre}: S/ ${p.p.toFixed(2)} (${p.t})</title>
                </circle>
              `).join('')}
            `;
          }).join('')}

          <!-- Curva Estación Propia (Gruesa y destacada) -->
          ${seriePropia.length > 0 ? `
            <path d="${crearPathStep(seriePropia)}" fill="none" stroke="var(--k-emerald, #00D58A)" stroke-width="3.5"/>
            ${seriePropia.map(p => `
              <circle cx="${scaleX(p.t)}" cy="${scaleY(p.p)}" r="5" fill="var(--k-emerald, #00D58A)" stroke="#16182F" stroke-width="2">
                <title>${est.estacion}: S/ ${p.p.toFixed(2)} (${p.t})</title>
              </circle>
            `).join('')}
          ` : ''}
        </svg>
      </div>

      <!-- LEYENDA INFERIOR DE ESTACIONES -->
      <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:8px; padding-top:8px; border-top:1px solid #E2E8F0;">
        <div style="display:flex; align-items:center; gap:6px; font-size:0.70rem; font-weight:700; color:var(--k-ink);">
          <span style="width:10px; height:10px; border-radius:50%; background:var(--k-emerald); display:inline-block;"></span>
          ${est.estacion} (PROPIA)
        </div>
        ${seriesCompetidores.map((s, idx) => {
          const color = COLORES_RIVALES[idx % COLORES_RIVALES.length];
          return `
            <div style="display:flex; align-items:center; gap:6px; font-size:0.68rem; color:#475569; font-weight:600;">
              <span style="width:10px; height:10px; border-radius:50%; background:${color}; display:inline-block;"></span>
              ${s.nombre} (${s.distancia !== undefined ? s.distancia.toFixed(1) + 'km' : s.marca})
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}