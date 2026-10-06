/* ==========================================================
   config/marcas.js — logos de marcas.
   ========================================================== */

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
