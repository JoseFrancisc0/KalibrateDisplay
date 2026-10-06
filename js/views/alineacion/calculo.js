/* ==========================================================
   views/alineacion/calculo.js — diagnóstico de alineación:
   EESS propias bajo Local Market y bajo Zona de Influencia.
   Lógica pura (sin DOM). Soporta filtrado general y por
   marca competidora específica.
   ========================================================== */
import { COMBUSTIBLES } from '../../config/productos.js';
import { normalizarMarca, esCompetenciaExterna } from '../../shared/marcas.js';
import { cumpleSegmentacion } from '../../shared/segmentacion.js';
import { alineacionState } from './state.js';


/**
 * Procesa todas las estaciones y calcula los diagnósticos
 */
export function procesarDatosAlineacion(estaciones) {
  const corrSel = alineacionState.corredor || 'TODOS';
  const deptoSel = alineacionState.departamento || 'TODOS';
  const gpcSel = alineacionState.gpcGroup || 'TODOS';
  const marcaFiltro = alineacionState.marcaCompetidora || 'TODAS';
  const criterioRival = alineacionState.criterioRival || 'CERCANO';

  // 1. Filtrado geográfico base
  const estacionesFiltradasBase = estaciones.filter(e => {
    const tienePropio = e.actores && e.actores.some(a => a.tipo_actor === 'PROPIO');
    if (!tienePropio || e.gpc_group === 'INACTIVAS') return false;

    return cumpleSegmentacion(e, { corredor: corrSel, departamento: deptoSel, gpc: gpcSel });
  });

  // 2. Diagnóstico por producto
  const resumenPorProd = {};
  COMBUSTIBLES.forEach(prod => {
    resumenPorProd[prod] = {
      producto: prod,
      totalEESS: 0,
      bajoLocalMarket: 0,
      conLocalMarket: 0,
      bajoZona: 0,
      conZona: 0,
      items: []
    };
  });

  estacionesFiltradasBase.forEach(est => {
    const propio = est.actores.find(a => a.tipo_actor === 'PROPIO');
    if (!propio || !propio.combustibles) return;

    // Competencia externa total
    const competidoresTodos = est.actores.filter(esCompetenciaExterna);

    // Competidores evaluados (filtrados por marca si aplica)
    const competidoresEvaluados = competidoresTodos.filter(a => {
      if (marcaFiltro === 'TODAS') return true;
      return normalizarMarca(a.marca) === marcaFiltro;
    });

    COMBUSTIBLES.forEach(prod => {
      const fuelPropio = propio.combustibles[prod];
      if (!fuelPropio || !fuelPropio.precio || fuelPropio.precio <= 0) return;

      const pPropio = fuelPropio.precio;

      // Si hay filtro de marca, la estación debe tener al menos un competidor de esa marca vendiendo ese producto
      const rivalesConProd = competidoresEvaluados.filter(c => c.combustibles?.[prod]?.precio > 0);
      if (marcaFiltro !== 'TODAS' && rivalesConProd.length === 0) return;

      const res = resumenPorProd[prod];
      res.totalEESS++;

      // A. Evaluación Local Market
      let lmData = null;
      let lmActor = null;

      if (marcaFiltro === 'TODAS') {
        // En modo general: el Main Marker oficial de cualquier marca
        lmActor = competidoresTodos.find(c => c.combustibles?.[prod]?.main_marker);
      } else {
        // En modo marca:
        // Prioridad 1: si algún rival de esa marca es Local Market
        // Prioridad 2: si no lo es, tomar el más cercano de esa marca
        rivalesConProd.sort((a, b) => (a.distancia_km ?? 99) - (b.distancia_km ?? 99));
        lmActor = rivalesConProd.find(r => r.combustibles[prod].main_marker) || rivalesConProd[0];
      }

      if (lmActor && lmActor.combustibles[prod].precio > 0) {
        res.conLocalMarket++;
        const pLM = lmActor.combustibles[prod].precio;
        const diffLM = pPropio - pLM;
        const estaBajoLM = diffLM < -0.001;
        if (estaBajoLM) res.bajoLocalMarket++;

        lmData = {
          nombre: lmActor.nombre_linea,
          marca: lmActor.marca,
          precio: pLM,
          diff: diffLM,
          estaBajo: estaBajoLM,
          esOficialLM: !!lmActor.combustibles[prod].main_marker
        };
      }

      // B. Evaluación Zona de Influencia
      let zonaData = null;
      if (rivalesConProd.length > 0) {
        res.conZona++;
        let refPrecioZona = 0;
        let etiquetaZona = '';

        if (marcaFiltro !== 'TODAS' && criterioRival === 'CERCANO') {
          // Criterio Más Cercano
          rivalesConProd.sort((a, b) => (a.distancia_km ?? 99) - (b.distancia_km ?? 99));
          const masCercano = rivalesConProd[0];
          refPrecioZona = masCercano.combustibles[prod].precio;
          etiquetaZona = `${masCercano.distancia_km ? masCercano.distancia_km.toFixed(1) + ' km' : 'Más cercano'}`;
        } else {
          // Promedio simple (general o zonal de la marca)
          const suma = rivalesConProd.reduce((acc, c) => acc + c.combustibles[prod].precio, 0);
          refPrecioZona = suma / rivalesConProd.length;
          etiquetaZona = `${rivalesConProd.length} competidor${rivalesConProd.length === 1 ? '' : 'es'}`;
        }

        const diffZona = pPropio - refPrecioZona;
        const estaBajoZona = diffZona < -0.001;
        if (estaBajoZona) res.bajoZona++;

        zonaData = {
          promedio: refPrecioZona,
          diff: diffZona,
          etiqueta: etiquetaZona,
          conteoCompetidores: rivalesConProd.length,
          estaBajo: estaBajoZona
        };
      }

      res.items.push({
        siteId: est.own_site_id,
        nombre: est.estacion_cabecera,
        corredor: est.corredor || 'SIN CORREDOR',
        departamento: est.departamento || 'SIN DEPTO',
        gpcGroup: est.gpc_group || 'SIN GPC',
        precioPropio: pPropio,
        localMarket: lmData,
        zona: zonaData
      });
    });
  });

  return { estacionesFiltradasBase, resumenPorProd, marcaFiltro, criterioRival };
}
