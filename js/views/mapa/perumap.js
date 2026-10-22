/* ==========================================================
   views/mapa/perumap.js — Motor de integración del SVG Oficial
   Mapeo de IDs UBIGEO/ISO y extracción de centroides dinámicos.
   ========================================================== */

export const MAPEO_ID_A_DEPTO = {
  "PEANC": "ANCASH",
  "PEARE": "AREQUIPA",
  "PECUS": "CUZCO",
  "PEICA": "ICA",
  "PEJUN": "JUNIN",
  "PELAL": "LA LIBERTAD",
  "PELAM": "LAMBAYEQUE",
  "PELMA": "LIMA",
  "PELIM": "LIMA",
  "PECAL": "LIMA",
  "PELOR": "LORETO",
  "PEPIU": "PIURA",
  "PETAC": "TACNA",
  "PEUCA": "UCAYALI"
};

// ID preferente para obtener el centroide del badge
const ID_CENTROIDE_DEPTO = {
  "ANCASH": "PEANC",
  "AREQUIPA": "PEARE",
  "CUZCO": "PECUS",
  "ICA": "PEICA",
  "JUNIN": "PEJUN",
  "LA LIBERTAD": "PELAL",
  "LAMBAYEQUE": "PELAM",
  "LIMA": "PELMA",
  "LORETO": "PELOR",
  "PIURA": "PEPIU",
  "TACNA": "PETAC",
  "UCAYALI": "PEUCA"
};

let svgRawCache = null;
let centroidesCache = null;

/**
 * Descarga y cachea el archivo SVG oficial del Perú
 */
export async function precargarMapaPeruSVG() {
  if (svgRawCache) return svgRawCache;
  try {
    const resp = await fetch('assets/pe.svg');
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al cargar assets/pe.svg`);
    svgRawCache = await resp.text();
    return svgRawCache;
  } catch (err) {
    console.error("Error al cargar assets/pe.svg:", err);
    return null;
  }
}

/**
 * Extrae las coordenadas (cx, cy) de cada departamento desde <g id="label_points">
 */
function extraerCentroides(docSVG) {
  if (centroidesCache) return centroidesCache;
  const mapa = {};
  const labelGroup = docSVG.getElementById('label_points');

  if (labelGroup) {
    const circles = labelGroup.querySelectorAll('circle');
    circles.forEach(c => {
      const id = c.getAttribute('id');
      const cx = parseFloat(c.getAttribute('cx'));
      const cy = parseFloat(c.getAttribute('cy'));
      if (id && !isNaN(cx) && !isNaN(cy)) {
        mapa[id] = { cx, cy };
      }
    });
  }
  centroidesCache = mapa;
  return mapa;
}

/**
 * Procesa el SVG oficial: colorea departamentos, agrega data-click y superpone badges
 */
export function componerMapaPeruSVG(rawSVGText, porDepartamento, deptoActivoId) {
  if (!rawSVGText) return '<div class="empty-state">No se pudo cargar el mapa.</div>';

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSVGText, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  if (!svgEl) return rawSVGText;

  // Ajustes del SVG raíz para responsividad y fondo transparente
  svgEl.setAttribute('width', '100%');
  svgEl.setAttribute('height', '100%');
  svgEl.setAttribute('style', 'max-height: 100%; object-fit: contain; overflow: visible;');
  svgEl.removeAttribute('fill');
  svgEl.removeAttribute('stroke');

  // Ocultar capas auxiliares que no deben verse
  const pointsLayer = doc.getElementById('points');
  if (pointsLayer) pointsLayer.style.display = 'none';

  const labelPointsLayer = doc.getElementById('label_points');
  const centroides = extraerCentroides(doc);
  if (labelPointsLayer) labelPointsLayer.style.display = 'none';

  // Inyectar filtro de sombra para los badges flotantes
  let defs = doc.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgEl.insertBefore(defs, svgEl.firstChild);
  }
  defs.innerHTML += `
    <filter id="map-badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.45"/>
    </filter>
  `;

  // Estilizar cada polígono departamental en <g id="features">
  const features = doc.getElementById('features');
  if (features) {
    const paths = features.querySelectorAll('path');
    paths.forEach(p => {
      const id = p.getAttribute('id');
      const deptoNormalizado = MAPEO_ID_A_DEPTO[id];
      const dataDepto = deptoNormalizado ? porDepartamento[deptoNormalizado] : null;
      const esOperativo = !!dataDepto && dataDepto.tienePresencia;
      const esSeleccionado = deptoNormalizado && deptoActivoId === deptoNormalizado;

      if (esOperativo) {
        p.setAttribute('class', `map-depto-poly activo ${esSeleccionado ? 'selected' : ''}`);
        p.setAttribute('data-depto', deptoNormalizado);
        p.setAttribute('data-click', 'seleccionarDepartamentoMapa');
        p.setAttribute('data-arg', deptoNormalizado);
        p.setAttribute('style', `cursor: pointer; transition: all 0.15s ease;`);
        
        // Estilo visual de plaza activa
        p.setAttribute('fill', esSeleccionado ? 'rgba(0, 213, 138, 0.28)' : 'rgba(255, 255, 255, 0.08)');
        p.setAttribute('stroke', esSeleccionado ? '#00D58A' : 'rgba(255, 255, 255, 0.40)');
        p.setAttribute('stroke-width', esSeleccionado ? '2' : '0.8');
      } else {
        p.setAttribute('class', 'map-depto-poly inactivo');
        p.setAttribute('fill', 'rgba(0, 0, 0, 0.28)');
        p.setAttribute('stroke', 'rgba(255, 255, 255, 0.09)');
        p.setAttribute('stroke-width', '0.5');
        p.setAttribute('style', 'pointer-events: none;');
      }
    });
  }

  // Generar capa de Badges interactivos en los centroides oficiales
  const badgesGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  badgesGroup.setAttribute('id', 'map-layer-badges');

  Object.entries(ID_CENTROIDE_DEPTO).forEach(([deptoId, svgId]) => {
    const pos = centroides[svgId];
    const data = porDepartamento[deptoId];
    if (!pos || !data || !data.tienePresencia) return;

    const esSeleccionado = deptoActivoId === deptoId;
    const precioTxt = data.promPrecioPropio !== null ? `S/ ${data.promPrecioPropio.toFixed(2)}` : '—';
    const margenTxt = data.promMargenPropio !== null ? `Mg: S/ ${data.promMargenPropio.toFixed(2)}` : 'Mg: —';

    // Dimensiones en la escala 1000x1000
    const badgeW = 114;
    const badgeH = 38;
    const x = pos.cx - (badgeW / 2);
    const y = pos.cy - (badgeH / 2);

    const strokeColor = esSeleccionado ? '#00D58A' : 'rgba(255, 255, 255, 0.25)';
    const headerColor = esSeleccionado ? '#00D58A' : '#94A3B8';

    const gBadge = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    gBadge.setAttribute('class', `map-depto-badge ${esSeleccionado ? 'selected' : ''}`);
    gBadge.setAttribute('data-click', 'seleccionarDepartamentoMapa');
    gBadge.setAttribute('data-arg', deptoId);
    gBadge.setAttribute('style', 'cursor: pointer;');

    gBadge.innerHTML = `
      <rect 
        x="${x}" y="${y}" width="${badgeW}" height="${badgeH}" rx="6" 
        fill="#16182F" 
        stroke="${strokeColor}" 
        stroke-width="${esSeleccionado ? '2.2' : '1.2'}"
        filter="url(#map-badge-shadow)"
      />
      <text x="${pos.cx}" y="${y + 14}" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="8.5" font-weight="700" fill="${headerColor}">
        ${deptoId} · <tspan fill="#ffffff">${data.totalPropias} EESS</tspan>
      </text>
      <text x="${pos.cx}" y="${y + 28}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9.5" font-weight="800" fill="#ffffff">
        ${precioTxt} <tspan font-size="8.5" font-weight="700" fill="#00D58A">· ${margenTxt}</tspan>
      </text>
    `;
    badgesGroup.appendChild(gBadge);
  });

  svgEl.appendChild(badgesGroup);
  return svgEl.outerHTML;
}