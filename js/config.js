/* ==========================================================
   config.js — constantes del visor.
   ========================================================== */

export const COMBUSTIBLES = ["Diesel", "Regular", "Premium", "GNV", "GLP"];

// Grupos de producto para colapsar Main Markers
export const GRUPOS_MARKER = [
  { id: 'Diesel',   nombre: 'Diesel',   combustibles: ['Diesel'] },
  { id: 'Unleaded', nombre: 'Unleaded', combustibles: ['Regular', 'Premium'] },
  { id: 'GNV',      nombre: 'GNV',      combustibles: ['GNV'] },
  { id: 'GLP',      nombre: 'GLP',      combustibles: ['GLP'] }
];

// Colores de gotas por combustible y por grupo
export const DROP_COLORS = {
  "Diesel":   "var(--drop-diesel)",
  "Unleaded": "var(--drop-unleaded)",
  "Regular":  "var(--drop-unleaded)",
  "Premium":  "var(--drop-unleaded)",
  "GLP":      "var(--drop-glp)",
  "GNV":      "var(--drop-gnv)"
};

/* ----------------------------------------------------------
   Formas de dividir las pestañas de la cinta inferior.
   Agregar una dimensión nueva = agregar una entrada aquí.
     id       → clave interna (state.agrupacionTabs)
     label    → texto del selector dropUp y del encabezado
     plural   → se usa en el contador "248 · 9 corredores"
     campo    → propiedad de la estación que agrupa
     sinValor → etiqueta para estaciones sin ese dato
     prefijo  → prefijo redundante a limpiar en la pestaña
   ---------------------------------------------------------- */
export const AGRUPACIONES = [
  { id: 'CORREDOR',     label: 'Corredores',    plural: 'corredores',
    campo: 'corredor',     sinValor: 'SIN CORREDOR',     prefijo: 'CORREDOR ' },
  { id: 'DEPARTAMENTO', label: 'Departamentos', plural: 'departamentos',
    campo: 'departamento', sinValor: 'SIN DEPARTAMENTO', prefijo: 'DEPARTAMENTO ' },
  { id: 'GPC',          label: 'GPC Groups',    plural: 'GPC groups',
    campo: 'gpc_group',    sinValor: 'SIN GPC GROUP',    prefijo: '' }
];

export const AGRUPACION_DEFECTO = 'CORREDOR';

export function getAgrupacion(id) {
  return AGRUPACIONES.find(a => a.id === id)
      || AGRUPACIONES.find(a => a.id === AGRUPACION_DEFECTO)
      || AGRUPACIONES[0];
}

export const ROW_H   = 34;
export const THEAD_H = 34;

// Ruta a la carpeta descargada localmente
export const DATA_URL = './data/matriz_precios.json';

export const BRAND_LOGOS = {
  "AVA": "logos/ava.webp",
  "ENERGIGAS": "logos/energigas.webp",
  "GASPETROL": "logos/gaspetrol.jpg",
  "GAZEL": "logos/gazel.webp",
  "GO! COMBUSTIBLES": "logos/gocombustibles.jpg",
  "GO": "logos/gocombustibles.jpg",
  "HERCO": "logos/herco.webp",
  "PECSA": "logos/pecsa.webp",
  "PETROAMERICA": "logos/petroamerica.webp",
  "PETROPERU": "logos/petroperu.png",
  "PRIMAX": "logos/primax.jpg",
  "REPSOL": "logos/repsol.png",
  "TERPEL": "logos/terpel.png"
};

export const LOGO_GENERICO = "logos/generico.png";

export function getBrandLogo(marca) {
  if (!marca) return LOGO_GENERICO;
  const key = marca.trim().toUpperCase();
  return BRAND_LOGOS[key] || LOGO_GENERICO;
}