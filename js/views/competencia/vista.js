/* ==========================================================
   views/competencia/vista.js
   ========================================================== */
import { getBrandLogo } from '../../config/marcas.js';
import { competenciaSemanalState } from './state.js';

const DIAS_SEMANA = [
    { key: 'lunes', label: 'LUNES' },
    { key: 'martes', label: 'MARTES' },
    { key: 'miercoles', label: 'MIÉRCOLES' },
    { key: 'jueves', label: 'JUEVES' },
    { key: 'viernes', label: 'VIERNES' },
    { key: 'sabado', label: 'SÁBADO' },
    { key: 'domingo', label: 'DOMINGO' }
];

export function competenciaSemanalHTML() {
    return `
    <div class="cs-shell" id="competencia-semanal-shell" style="display:none;">
        <div class="cs-header">
            <div>
                <h2 id="cs-titulo-principal">Dinámica Semanal de Precios</h2>
                <p id="cs-subtitulo">Evaluando actividad interdiaria de mercado</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="cs-meta-pill" id="cs-periodo-tag" style="background: var(--k-indigo); color: #fff;">SEMANA EN CURSO</div>
                <div class="cs-meta-pill" id="cs-rango-semana">Semana: —</div>
            </div>
        </div>

        <div class="cs-table-wrap">
            <table class="cs-table">
                <thead>
                    <tr>
                        <th id="cs-th-primera" style="width: 30%;">Estación Competidora</th>
                        ${DIAS_SEMANA.map(d => `<th class="col-num" style="width: 10%;">${d.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody id="cs-table-body">
                    <tr><td colspan="8" class="cs-empty">Cargando datos semanales...</td></tr>
                </tbody>
                <tfoot id="cs-table-foot"></tfoot>
            </table>
        </div>
    </div>
    `;
}

export function renderCompetenciaSemanal() {
    const shell = document.getElementById('competencia-semanal-shell');
    if (!shell) return;

    const tbody = document.getElementById('cs-table-body');
    const tfoot = document.getElementById('cs-table-foot');
    const subtitulo = document.getElementById('cs-subtitulo');
    const tituloPrincipal = document.getElementById('cs-titulo-principal');
    const thPrimera = document.getElementById('cs-th-primera');
    const rangoBadge = document.getElementById('cs-rango-semana');
    const periodoTag = document.getElementById('cs-periodo-tag');

    const cs = competenciaSemanalState;

    if (cs.cargando) {
        tbody.innerHTML = `<tr><td colspan="8" class="cs-empty">Descargando datos semanales...</td></tr>`;
        return;
    }

    if (!cs.datosCrudos || cs.datosCrudos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="cs-empty">No hay registros disponibles.</td></tr>`;
        tfoot.innerHTML = '';
        return;
    }

    const periodoActual = cs.periodoActivo || 'ACTUAL';
    const esModoMarcas = cs.modoVista === 'MARCAS';

    if (periodoTag) {
        periodoTag.innerText = periodoActual === 'ACTUAL' ? 'SEMANA EN CURSO' : 'SEMANA PASADA';
    }

    if (cs.rangos && cs.rangos[periodoActual] && rangoBadge) {
        const r = cs.rangos[periodoActual];
        rangoBadge.innerText = `Semana: ${r.desde} ➔ ${r.hasta}`;
    }

    if (thPrimera) {
        thPrimera.innerText = esModoMarcas ? 'Bandera / Marca' : 'Estación Competidora';
    }

    if (tituloPrincipal) {
        tituloPrincipal.innerText = esModoMarcas 
            ? 'Resumen de Precios y Movimientos por Marca' 
            : 'Dinámica Semanal de Precios por Competidor';
    }

    // 1. Filtrar observaciones por producto, período y ubicación normalizada
    const prodSel = (cs.producto || '').trim().toUpperCase();
    const deptoSel = (cs.departamento || 'TODOS').trim().toUpperCase();
    const provSel = (cs.provincia || 'TODOS').trim().toUpperCase();
    const distSel = (cs.distrito || 'TODOS').trim().toUpperCase();

    const baseFiltrada = cs.datosCrudos.filter(item => {
        if (item.periodo && item.periodo !== periodoActual) return false;
        
        const prodItem = (item.producto || '').trim().toUpperCase();
        if (prodItem !== prodSel) return false;

        const d = (item.departamento || '').trim().toUpperCase();
        const pv = (item.provincia || '').trim().toUpperCase();
        const dt = (item.distrito || '').trim().toUpperCase();

        return (deptoSel === 'TODOS' || d === deptoSel) &&
               (provSel === 'TODOS' || pv === provSel) &&
               (distSel === 'TODOS' || dt === distSel);
    });

    if (subtitulo) {
        const ubicacionTexto = deptoSel === 'TODOS' 
            ? 'Red Nacional' 
            : `${deptoSel}${provSel !== 'TODOS' ? ' · ' + provSel : ''}${distSel !== 'TODOS' ? ' · ' + distSel : ''}`;
        subtitulo.innerText = `Producto: ${cs.producto.toUpperCase()} · ${ubicacionTexto}`;
    }

    // =========================================================================
    // MODO A: RESUMEN POR MARCAS
    // =========================================================================
    if (esModoMarcas) {
        const marcasMap = {};

        baseFiltrada.forEach(item => {
            const esPropio = item.es_propio === true || (item.marca || '').trim().toUpperCase() === 'COESTI';
            const marcaKey = esPropio ? 'COESTI' : (item.marca || 'OTRAS').trim().toUpperCase();

            // Filtrar según checklist de marcas (COESTI siempre se procesa para el pie)
            if (!esPropio && cs.marcasSeleccionadas && !cs.marcasSeleccionadas.has(marcaKey)) {
                return;
            }

            if (!marcasMap[marcaKey]) {
                marcasMap[marcaKey] = {
                    marca: marcaKey,
                    es_coesti: esPropio,
                    sitesMap: {},       // site_id -> { competidor, departamento, provincia, distrito, dias: {}, tuvoCambio: false }
                    dias: {}
                };
                DIAS_SEMANA.forEach(d => {
                    marcasMap[marcaKey].dias[d.key] = { precios: [], subieron: 0, bajaron: 0 };
                });
            }

            const sid = item.site_id || item.competidor;
            if (!marcasMap[marcaKey].sitesMap[sid]) {
                marcasMap[marcaKey].sitesMap[sid] = {
                    site_id: sid,
                    competidor: item.competidor,
                    departamento: item.departamento,
                    provincia: item.provincia,
                    distrito: item.distrito,
                    dias: {},
                    tuvoCambio: false
                };
            }

            const diaKey = (item.dia || '').toLowerCase();
            if (item.precio !== null && item.precio > 0) {
                marcasMap[marcaKey].sitesMap[sid].dias[diaKey] = {
                    precio: item.precio,
                    direccion: item.direccion || 'IGUAL'
                };

                if (marcasMap[marcaKey].dias[diaKey]) {
                    marcasMap[marcaKey].dias[diaKey].precios.push(item.precio);
                    if (diaKey !== 'lunes') {
                        if (item.direccion === 'SUBIO') {
                            marcasMap[marcaKey].dias[diaKey].subieron++;
                            marcasMap[marcaKey].sitesMap[sid].tuvoCambio = true;
                        }
                        if (item.direccion === 'BAJO') {
                            marcasMap[marcaKey].dias[diaKey].bajaron++;
                            marcasMap[marcaKey].sitesMap[sid].tuvoCambio = true;
                        }
                    }
                }
            }
        });

        const objetoCoesti = marcasMap['COESTI'] || null;
        const listaCompetidores = Object.values(marcasMap)
            .filter(m => !m.es_coesti)
            .sort((a, b) => Object.keys(b.sitesMap).length - Object.keys(a.sitesMap).length);

        if (listaCompetidores.length === 0 && !objetoCoesti) {
            tbody.innerHTML = `<tr><td colspan="8" class="cs-empty">No se encontraron datos para los filtros y marcas seleccionadas.</td></tr>`;
            tfoot.innerHTML = '';
            return;
        }

        // Función auxiliar para renderizar filas hijas de estaciones que tuvieron cambio
        const renderEstacionesConCambio = (marcaObj) => {
            const estacionesCambiaron = Object.values(marcaObj.sitesMap)
                .filter(s => s.tuvoCambio)
                .sort((a, b) => a.competidor.localeCompare(b.competidor));

            if (estacionesCambiaron.length === 0) {
                return `
                <tr class="cs-child-row open" style="background: #FAFBFD;">
                    <td colspan="8" style="padding-left: 36px; color: var(--k-muted); font-size: 0.72rem; font-style: italic;">
                        Ninguna estación de ${marcaObj.marca} modificó precios esta semana.
                    </td>
                </tr>
                `;
            }

            return estacionesCambiaron.map(est => {
                const ubicacion = `${est.distrito || ''}${est.provincia ? ' · ' + est.provincia : ''}${est.departamento ? ' · ' + est.departamento : ''}`;
                return `
                <tr class="cs-child-row open" style="background: #F8FAFD; border-bottom: 1px solid var(--k-line-soft);">
                    <td style="padding-left: 36px;">
                        <div class="cs-site-info">
                            <b style="font-size: 0.73rem; color: #334155;">${est.competidor}</b>
                            <small style="font-size: 0.58rem; color: #8E7F94;">${ubicacion}</small>
                        </div>
                    </td>
                    ${DIAS_SEMANA.map(dia => {
                        const dInfo = est.dias[dia.key];
                        if (!dInfo || dInfo.precio === null || dInfo.precio <= 0) {
                            return `<td class="col-num cs-celda-vacia" style="font-size: 0.70rem;">—</td>`;
                        }

                        let indHtml = '';
                        if (dia.key !== 'lunes') {
                            if (dInfo.direccion === 'SUBIO') indHtml = `<span style="color: var(--diff-pos); font-weight:800; font-size: 0.75rem;">▲</span>`;
                            if (dInfo.direccion === 'BAJO') indHtml = `<span style="color: var(--diff-neg); font-weight:800; font-size: 0.75rem;">▼</span>`;
                        }

                        return `
                        <td class="col-num" style="font-size: 0.72rem;">
                            <div class="cs-dia-cell" style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                                <span class="cs-precio" style="font-size: 0.74rem;">S/ ${dInfo.precio.toFixed(2)}</span>${indHtml}
                            </div>
                        </td>
                        `;
                    }).join('')}
                </tr>
                `;
            }).join('');
        };

        // Renderizar marcas competidoras en el cuerpo
        tbody.innerHTML = listaCompetidores.map(m => {
            const logoUrl = getBrandLogo(m.marca);
            const totalSites = Object.keys(m.sitesMap).length;
            const estacionesCambiaronCount = Object.values(m.sitesMap).filter(s => s.tuvoCambio).length;
            const isOpen = cs.marcasExpandidas.has(m.marca);

            const filaPadre = `
            <tr style="${isOpen ? 'background: #F1F5F9;' : ''}">
                <td>
                    <div class="cs-site-cell">
                        <button class="btn-toggle ${isOpen ? 'on' : ''}" 
                                data-click="toggleMarcaExpandidaCS" 
                                data-arg="${m.marca}" 
                                title="${isOpen ? 'Colapsar estaciones' : `Ver ${estacionesCambiaronCount} estaciones con cambios`}"
                                style="width: 19px; height: 19px; flex: 0 0 19px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">
                            ${isOpen ? '−' : '+'}
                        </button>
                        <div class="cs-logo-box"><img src="${logoUrl}" alt="${m.marca}"></div>
                        <div class="cs-site-info">
                            <b>${m.marca}</b>
                            <small>${totalSites} estaciones monitoreadas ${estacionesCambiaronCount > 0 ? `(${estacionesCambiaronCount} con cambios)` : ''}</small>
                        </div>
                    </div>
                </td>
                ${DIAS_SEMANA.map(dia => {
                    const diaData = m.dias[dia.key];
                    const count = diaData.precios.length;
                    if (count === 0) {
                        return `<td class="col-num cs-celda-vacia">—</td>`;
                    }

                    const prom = diaData.precios.reduce((acc, p) => acc + p, 0) / count;

                    let tagsDeltas = '';
                    if (dia.key !== 'lunes' && (diaData.subieron > 0 || diaData.bajaron > 0)) {
                        tagsDeltas = `
                        <div style="display: flex; gap: 4px; font-size: 0.60rem; font-weight: 800; margin-top: 1px;">
                            ${diaData.subieron > 0 ? `<span style="color: var(--diff-pos);">▲ ${diaData.subieron}</span>` : ''}
                            ${diaData.bajaron > 0 ? `<span style="color: var(--diff-neg);">▼ ${diaData.bajaron}</span>` : ''}
                        </div>`;
                    }

                    return `
                    <td class="col-num">
                        <div class="cs-dia-cell" style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span class="cs-precio">S/ ${prom.toFixed(2)}</span>${tagsDeltas}
                        </div>
                    </td>
                    `;
                }).join('')}
            </tr>
            `;

            return filaPadre + (isOpen ? renderEstacionesConCambio(m) : '');
        }).join('');

        // Totales de PROMEDIO DE MERCADO (excluye COESTI)
        const metricasPieMercado = DIAS_SEMANA.map(dia => {
            let suma = 0;
            let conteo = 0;
            let subieron = 0;
            let bajaron = 0;

            listaCompetidores.forEach(m => {
                const diaData = m.dias[dia.key];
                diaData.precios.forEach(p => {
                    suma += p;
                    conteo++;
                });
                subieron += diaData.subieron;
                bajaron += diaData.bajaron;
            });

            return {
                dia: dia.key,
                promedio: conteo > 0 ? (suma / conteo) : null,
                subieron,
                bajaron
            };
        });

        // Fila inferior fija para COESTI (benchmark) con soporte de despliegue si se desea auditar
        let htmlFilaCoesti = '';
        if (objetoCoesti) {
            const logoCoesti = getBrandLogo('COESTI');
            const totalSitesCoesti = Object.keys(objetoCoesti.sitesMap).length;
            const estacionesCambiaronCoesti = Object.values(objetoCoesti.sitesMap).filter(s => s.tuvoCambio).length;
            const isOpenCoesti = cs.marcasExpandidas.has('COESTI');

            htmlFilaCoesti = `
            <tr class="cs-foot-coesti-row">
                <td>
                    <div class="cs-site-cell">
                        <button class="btn-toggle ${isOpenCoesti ? 'on' : ''}" 
                                data-click="toggleMarcaExpandidaCS" 
                                data-arg="COESTI" 
                                title="${isOpenCoesti ? 'Colapsar estaciones' : `Ver ${estacionesCambiaronCoesti} estaciones con cambios`}"
                                style="width: 19px; height: 19px; flex: 0 0 19px; border-radius: 3px; font-size: 0.75rem; cursor: pointer; background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color: #fff;">
                            ${isOpenCoesti ? '−' : '+'}
                        </button>
                        <div class="cs-logo-box" style="background:#fff;"><img src="${logoCoesti}" alt="COESTI"></div>
                        <div class="cs-site-info">
                            <b style="color: #6EE7B7; font-size: 0.78rem;">COESTI (PROPIA)</b>
                            <small style="color: #A08FA6;">${totalSitesCoesti} estaciones monitoreadas ${estacionesCambiaronCoesti > 0 ? `(${estacionesCambiaronCoesti} con cambios)` : ''}</small>
                        </div>
                    </div>
                </td>
                ${DIAS_SEMANA.map(dia => {
                    const diaData = objetoCoesti.dias[dia.key];
                    const count = diaData.precios.length;
                    if (count === 0) {
                        return `<td class="col-num cs-celda-vacia" style="color: #64748B;">—</td>`;
                    }

                    const prom = diaData.precios.reduce((acc, p) => acc + p, 0) / count;

                    let tagsDeltas = '';
                    if (dia.key !== 'lunes' && (diaData.subieron > 0 || diaData.bajaron > 0)) {
                        tagsDeltas = `
                        <div style="display: flex; gap: 4px; font-size: 0.60rem; font-weight: 800; margin-top: 1px;">
                            ${diaData.subieron > 0 ? `<span style="color: #F87171;">▲ ${diaData.subieron}</span>` : ''}
                            ${diaData.bajaron > 0 ? `<span style="color: #34D399;">▼ ${diaData.bajaron}</span>` : ''}
                        </div>`;
                    }

                    return `
                    <td class="col-num" style="vertical-align: middle;">
                        <div class="cs-dia-cell" style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span class="cs-precio" style="color: #fff; font-size: 0.82rem;">S/ ${prom.toFixed(2)}</span>${tagsDeltas}
                        </div>
                    </td>
                    `;
                }).join('')}
            </tr>
            ${isOpenCoesti ? renderEstacionesConCambio(objetoCoesti) : ''}
            `;
        }

        tfoot.innerHTML = `
        <tr class="cs-foot-row">
            <td>
                <div class="cs-promedio-label">
                    <b>PROMEDIO DE MERCADO</b>
                    <small>${listaCompetidores.length} marcas competidoras</small>
                </div>
            </td>
            ${metricasPieMercado.map(m => {
                const promHtml = m.promedio !== null ? `<span class="cs-promedio-val">S/ ${m.promedio.toFixed(2)}</span>` : '—';
                let balanceHtml = `<small style="color: #A08FA6; font-size: 0.62rem;">Base semanal</small>`;

                if (m.dia !== 'lunes') {
                    balanceHtml = `
                    <div style="display: flex; gap: 6px; font-size: 0.64rem; font-weight: 700; margin-top: 2px;">
                        <span style="color: var(--diff-pos);">▲ ${m.subieron}</span>
                        <span style="color: var(--diff-neg);">▼ ${m.bajaron}</span>
                    </div>`;
                }

                return `
                <td class="col-num" style="vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        ${promHtml}${balanceHtml}
                    </div>
                </td>
                `;
            }).join('')}
        </tr>
        ${htmlFilaCoesti}
        `;
        return;
    }

    // =========================================================================
    // MODO B: DETALLE DE ESTACIONES (Excluye COESTI)
    // =========================================================================
    const registrosEstaciones = baseFiltrada.filter(item => {
        if (item.es_propio || (item.marca || '').trim().toUpperCase() === 'COESTI') return false;
        const marcaKey = (item.marca || 'OTRAS').trim().toUpperCase();
        if (cs.marcasSeleccionadas && !cs.marcasSeleccionadas.has(marcaKey)) return false;
        return true;
    });

    if (registrosEstaciones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="cs-empty">No se encontraron estaciones competidoras para los filtros seleccionados.</td></tr>`;
        tfoot.innerHTML = '';
        return;
    }

    const matrizEstaciones = {};
    registrosEstaciones.forEach(item => {
        const sid = item.site_id || item.competidor;
        if (!matrizEstaciones[sid]) {
            matrizEstaciones[sid] = {
                site_id: sid,
                competidor: item.competidor,
                marca: item.marca,
                dias: {}
            };
        }
        const diaKey = (item.dia || '').toLowerCase();
        matrizEstaciones[sid].dias[diaKey] = {
            precio: item.precio,
            direccion: item.direccion || 'IGUAL'
        };
    });

    const listaEstaciones = Object.values(matrizEstaciones).sort((a, b) => a.competidor.localeCompare(b.competidor));

    tbody.innerHTML = listaEstaciones.map(est => {
        const logoUrl = getBrandLogo(est.marca);
        return `
        <tr>
            <td>
                <div class="cs-site-cell">
                    <div class="cs-logo-box"><img src="${logoUrl}" alt="${est.marca}"></div>
                    <div class="cs-site-info">
                        <b>${est.competidor}</b>
                        <small>${est.marca}</small>
                    </div>
                </div>
            </td>
            ${DIAS_SEMANA.map(dia => {
                const info = est.dias[dia.key];
                if (!info || info.precio === null || info.precio <= 0) {
                    return `<td class="col-num cs-celda-vacia">—</td>`;
                }

                let indicadorHtml = '';
                if (dia.key !== 'lunes') {
                    if (info.direccion === 'SUBIO') {
                        indicadorHtml = `<span style="color: var(--diff-pos); font-weight:800; font-size: 0.85rem;" title="Subió respecto al día anterior">▲</span>`;
                    } else if (info.direccion === 'BAJO') {
                        indicadorHtml = `<span style="color: var(--diff-neg); font-weight:800; font-size: 0.85rem;" title="Bajó respecto al día anterior">▼</span>`;
                    }
                }

                return `
                <td class="col-num">
                    <div class="cs-dia-cell" style="display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
                        <span class="cs-precio">S/ ${info.precio.toFixed(2)}</span>${indicadorHtml}
                    </div>
                </td>
                `;
            }).join('')}
        </tr>
        `;
    }).join('');

    const metricasPie = DIAS_SEMANA.map(dia => {
        let suma = 0;
        let conteo = 0;
        let subieron = 0;
        let bajaron = 0;

        listaEstaciones.forEach(est => {
            const info = est.dias[dia.key];
            if (info && info.precio > 0) {
                suma += info.precio;
                conteo++;
                if (dia.key !== 'lunes') {
                    if (info.direccion === 'SUBIO') subieron++;
                    if (info.direccion === 'BAJO') bajaron++;
                }
            }
        });

        return {
            dia: dia.key,
            promedio: conteo > 0 ? (suma / conteo) : null,
            subieron,
            bajaron
        };
    });

    tfoot.innerHTML = `
    <tr class="cs-foot-row">
        <td>
            <div class="cs-promedio-label">
                <b>RESUMEN DIARIO INTERDIARIO</b>
                <small>${listaEstaciones.length} estaciones competidoras</small>
            </div>
        </td>
        ${metricasPie.map(m => {
            const promHtml = m.promedio !== null ? `<span class="cs-promedio-val">S/ ${m.promedio.toFixed(2)}</span>` : '—';
            let balanceHtml = `<small style="color: #A08FA6; font-size: 0.62rem;">Base semanal</small>`;

            if (m.dia !== 'lunes') {
                balanceHtml = `
                <div style="display: flex; gap: 6px; font-size: 0.64rem; font-weight: 700; margin-top: 2px;">
                    <span style="color: var(--diff-pos);">▲ ${m.subieron}</span>
                    <span style="color: var(--diff-neg);">▼ ${m.bajaron}</span>
                </div>`;
            }

            return `
            <td class="col-num" style="vertical-align: middle;">
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    ${promHtml}${balanceHtml}
                </div>
            </td>
            `;
        }).join('')}
    </tr>
    `;
}