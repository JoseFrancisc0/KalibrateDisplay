/* ==========================================================
   views/mapa/perumap.js — Geometría vectorial SVG del Perú
   y centroides calibrados para los micro-badges flotantes.
   ========================================================== */

/**
 * Coordenadas (cx, cy) de los badges flotantes sobre el viewBox="0 0 600 800".
 * Posicionadas en los centros visuales óptimos de las 12 plazas operativas.
 */
export const CENTROIDES_DEPTOS = {
  'LORETO':      { cx: 370, cy: 155 },
  'PIURA':       { cx: 95,  cy: 145 },
  'LAMBAYEQUE':  { cx: 90,  cy: 215 },
  'LA LIBERTAD': { cx: 135, cy: 260 },
  'ANCASH':      { cx: 165, cy: 335 },
  'UCAYALI':     { cx: 405, cy: 380 },
  'JUNIN':       { cx: 275, cy: 420 },
  'LIMA':        { cx: 195, cy: 475 },
  'ICA':         { cx: 255, cy: 555 },
  'CUZCO':       { cx: 400, cy: 535 },
  'AREQUIPA':    { cx: 360, cy: 645 },
  'TACNA':       { cx: 470, cy: 745 }
};

/**
 * Polígonos SVG simplificados y optimizados de los 24 departamentos (viewBox: 0 0 600 800).
 */
export const DEPTOS_PATHS = [
  // 12 DEPARTAMENTOS ACTIVOS
  {
    id: 'LORETO',
    nombre: 'LORETO',
    d: 'M 195 105 L 265 40 L 375 25 L 475 75 L 565 140 L 515 220 L 470 240 L 415 235 L 350 280 L 295 240 L 245 250 L 210 200 Z'
  },
  {
    id: 'PIURA',
    nombre: 'PIURA',
    d: 'M 55 120 L 115 105 L 140 145 L 115 185 L 60 180 L 45 145 Z'
  },
  {
    id: 'LAMBAYEQUE',
    nombre: 'LAMBAYEQUE',
    d: 'M 65 190 L 120 185 L 135 225 L 105 245 L 70 230 Z'
  },
  {
    id: 'LA LIBERTAD',
    nombre: 'LA LIBERTAD',
    d: 'M 105 245 L 160 220 L 195 250 L 180 300 L 125 305 L 95 270 Z'
  },
  {
    id: 'ANCASH',
    nombre: 'ANCASH',
    d: 'M 125 310 L 185 300 L 215 345 L 175 390 L 140 375 Z'
  },
  {
    id: 'UCAYALI',
    nombre: 'UCAYALI',
    d: 'M 350 285 L 420 245 L 485 320 L 480 435 L 410 445 L 360 405 L 340 330 Z'
  },
  {
    id: 'JUNIN',
    nombre: 'JUNIN',
    d: 'M 225 385 L 295 375 L 335 425 L 295 465 L 240 445 Z'
  },
  {
    id: 'LIMA',
    nombre: 'LIMA',
    d: 'M 155 405 L 215 390 L 240 455 L 215 520 L 175 490 Z'
  },
  {
    id: 'ICA',
    nombre: 'ICA',
    d: 'M 205 525 L 255 515 L 290 565 L 260 615 L 215 580 Z'
  },
  {
    id: 'CUZCO',
    nombre: 'CUZCO',
    d: 'M 345 470 L 415 450 L 465 520 L 430 600 L 365 580 L 340 520 Z'
  },
  {
    id: 'AREQUIPA',
    nombre: 'AREQUIPA',
    d: 'M 275 615 L 355 585 L 420 620 L 405 690 L 330 685 L 285 645 Z'
  },
  {
    id: 'TACNA',
    nombre: 'TACNA',
    d: 'M 440 710 L 495 720 L 485 770 L 445 765 Z'
  },

  // 12 DEPARTAMENTOS SIN RED PROPIA (FONDO NEUTRO)
  {
    id: 'TUMBES',
    nombre: 'TUMBES',
    d: 'M 55 75 L 85 70 L 80 110 L 50 100 Z'
  },
  {
    id: 'CAJAMARCA',
    nombre: 'CAJAMARCA',
    d: 'M 125 150 L 175 140 L 185 230 L 135 220 Z'
  },
  {
    id: 'AMAZONAS',
    nombre: 'AMAZONAS',
    d: 'M 180 115 L 240 105 L 240 235 L 185 225 Z'
  },
  {
    id: 'SAN MARTIN',
    nombre: 'SAN MARTIN',
    d: 'M 245 205 L 305 195 L 315 285 L 235 285 Z'
  },
  {
    id: 'HUANUCO',
    nombre: 'HUANUCO',
    d: 'M 205 320 L 275 305 L 295 375 L 225 380 Z'
  },
  {
    id: 'PASCO',
    nombre: 'PASCO',
    d: 'M 220 375 L 270 370 L 265 410 L 215 405 Z'
  },
  {
    id: 'HUANCAVELICA',
    nombre: 'HUANCAVELICA',
    d: 'M 245 460 L 295 455 L 285 520 L 240 515 Z'
  },
  {
    id: 'AYACUCHO',
    nombre: 'AYACUCHO',
    d: 'M 290 475 L 340 470 L 335 580 L 280 565 Z'
  },
  {
    id: 'APURIMAC',
    nombre: 'APURIMAC',
    d: 'M 335 525 L 375 520 L 370 585 L 325 580 Z'
  },
  {
    id: 'PUNO',
    nombre: 'PUNO',
    d: 'M 435 545 L 515 540 L 490 680 L 420 645 Z'
  },
  {
    id: 'MOQUEGUA',
    nombre: 'MOQUEGUA',
    d: 'M 410 685 L 455 680 L 440 735 L 395 720 Z'
  },
  {
    id: 'MADRE DE DIOS',
    nombre: 'MADRE DE DIOS',
    d: 'M 445 420 L 555 425 L 530 520 L 440 485 Z'
  }
];

/**
 * Genera la estructura vectorial SVG del mapa completo.
 * Aplica estilos neutros a los departamentos inactivos y habilita
 * interacción por clic y hover sobre los 12 departamentos operativos.
 */
export function generarMapaPeruSVG(porDepartamento, deptoActivoId) {
  let svgPaths = '';

  DEPTOS_PATHS.forEach(dep => {
    const dataDepto = porDepartamento[dep.id];
    const esOperativo = !!dataDepto && dataDepto.tienePresencia;
    const esSeleccionado = deptoActivoId === dep.id;

    if (esOperativo) {
      // Color base uniforme para departamentos activos
      const colorFill = esSeleccionado ? 'rgba(0, 213, 138, 0.22)' : 'rgba(255, 255, 255, 0.07)';
      const colorStroke = esSeleccionado ? '#00D58A' : 'rgba(255, 255, 255, 0.35)';
      const strokeWidth = esSeleccionado ? '2.5' : '1.2';

      svgPaths += `
        <path
          id="poly-depto-${dep.id}"
          d="${dep.d}"
          class="map-depto-poly activo ${esSeleccionado ? 'selected' : ''}"
          data-depto="${dep.id}"
          data-click="seleccionarDepartamentoMapa"
          data-arg="${dep.id}"
          fill="${colorFill}"
          stroke="${colorStroke}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
          style="cursor: pointer; transition: all 0.15s ease;"
        >
          <title>${dep.nombre} (${dataDepto.totalPropias} EESS)</title>
        </path>
      `;
    } else {
      // Estilo neutro para departamentos sin estaciones
      svgPaths += `
        <path
          id="poly-depto-${dep.id}"
          d="${dep.d}"
          class="map-depto-poly inactivo"
          data-depto="${dep.id}"
          fill="rgba(0, 0, 0, 0.25)"
          stroke="rgba(255, 255, 255, 0.08)"
          stroke-width="0.8"
          stroke-linejoin="round"
          style="pointer-events: none;"
        >
          <title>${dep.nombre} (Sin presencia)</title>
        </path>
      `;
    }
  });

  return svgPaths;
}

/**
 * Genera los micro-badges flotantes con precio, margen y volumen
 * ubicados en los centroides de los 12 departamentos con red propia.
 */
export function generarBadgesCentroidesSVG(porDepartamento, deptoActivoId) {
  let badgesSvg = '';

  Object.entries(CENTROIDES_DEPTOS).forEach(([deptoId, pos]) => {
    const data = porDepartamento[deptoId];
    if (!data || !data.tienePresencia) return;

    const esSeleccionado = deptoActivoId === deptoId;
    const precioTxt = data.promPrecioPropio !== null ? `S/ ${data.promPrecioPropio.toFixed(2)}` : '—';
    const margenTxt = data.promMargenPropio !== null ? `Mg: S/ ${data.promMargenPropio.toFixed(2)}` : 'Mg: —';

    // Dimensiones compactas del badge flotante
    const badgeW = 100;
    const badgeH = 34;
    const x = pos.cx - (badgeW / 2);
    const y = pos.cy - (badgeH / 2);

    const strokeColor = esSeleccionado ? '#00D58A' : 'rgba(255, 255, 255, 0.2)';
    const headerColor = esSeleccionado ? '#00D58A' : 'var(--k-muted, #94A3B8)';

    badgesSvg += `
      <g 
        class="map-depto-badge ${esSeleccionado ? 'selected' : ''}" 
        data-click="seleccionarDepartamentoMapa"
        data-arg="${deptoId}"
        style="cursor: pointer;"
      >
        <!-- Tarjeta del Badge con filtro de sombra -->
        <rect 
          x="${x}" y="${y}" width="${badgeW}" height="${badgeH}" rx="5" 
          fill="#16182F" 
          stroke="${strokeColor}" 
          stroke-width="${esSeleccionado ? '2' : '1'}"
          filter="url(#map-badge-shadow)"
        />
        
        <!-- Fila 1: Departamento + EESS -->
        <text x="${pos.cx}" y="${y + 12}" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="7.5" font-weight="700" fill="${headerColor}">
          ${deptoId} · <tspan fill="#ffffff">${data.totalPropias} EESS</tspan>
        </text>

        <!-- Fila 2: Precio Promedio + Margen -->
        <text x="${pos.cx}" y="${y + 25}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="8.2" font-weight="800" fill="#ffffff">
          ${precioTxt} <tspan font-size="7.5" font-weight="700" fill="#00D58A">· ${margenTxt}</tspan>
        </text>
      </g>
    `;
  });

  return badgesSvg;
}