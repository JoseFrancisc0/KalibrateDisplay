/* ==========================================================
   shared/marcas.js — reglas de negocio sobre marcas y actores.
   ========================================================== */

/** Mayúsculas + trim, y unifica las variantes de White Products en 'WP'. */
export function normalizarMarca(marca) {
  let m = (marca || '').trim().toUpperCase();
  if (m === 'WHITE PRODUCTS' || m === 'WHITE PRODUCT') m = 'WP';
  return m;
}

/** Etiqueta visible de una marca normalizada en selectores y checklists. */
export function etiquetaMarca(m) {
  return m === 'PRIMAX' ? 'PRIMAX (DEALERS)' : (m === 'WP' ? 'WHITE PRODUCTS' : m);
}

/** Competidor externo (excluye la competencia interna COESTI). */
export function esCompetenciaExterna(actor) {
  return actor.tipo_actor === 'COMPETENCIA' && !actor.es_competidor_propio;
}

export function actorPropio(est) {
  return est.actores?.find(a => a.tipo_actor === 'PROPIO');
}

/** Marcas de competencia externa presentes en la red, normalizadas y ordenadas. */
export function marcasCompetencia(estaciones) {
  const marcasSet = new Set();
  estaciones.forEach(e => {
    const comps = e.actores?.filter(esCompetenciaExterna) || [];
    comps.forEach(c => {
      const m = normalizarMarca(c.marca);
      if (m && m !== 'SIN MARCA') marcasSet.add(m);
    });
  });
  return Array.from(marcasSet).sort();
}
