# Visor Bitácora Pricing

Visor de la matriz competitiva de precios. Lee `matriz_precios.json` (generado por el
notebook de Fabric) y lo pinta a pantalla completa en los TV 16:9 de oficina.

Sin build, sin dependencias: HTML + CSS + ES Modules nativos.

---

## Estructura

```
index.html                        armazón: <head>, contenedores vacíos, entrada js/app.js
matriz_precios.json               datos (lo genera el notebook)

css/
  tokens.css                      paleta y dimensiones (ÚNICO lugar con colores/medidas)
  base.css                        reset + documento raíz (altura fija, sin scroll de página)
  layout.css                      armazón: .body-grid, .main
  components/
    nav.css                       barra superior
    rail.css                      barra lateral de controles
    markers.css                   gota de Main Marker (compartida rail + tabla)
    kpi.css                       franja del main: sello, pestañas de vista, métrica activa
    table.css                     tabla jerárquica y átomos de fila
    tabbar.css                    barra inferior de paginación

js/
  app.js                          montaje, controles, render, arranque
  config.js                       COMBUSTIBLES, DROP_COLORS, ROW_H, THEAD_H, DATA_URL
  state.js                        estado compartido (un objeto mutable)
  data.js                         fetch del JSON
  icons.js                        SVG reutilizables (gota, isotipo, marca de agua, lupa)
  filters.js                      estacionesFiltradas + cumpleFiltroMarker
  paginacion.js                   capacidad por altura + construcción de pestañas
  components/                     markup estático, uno por componente
    nav.js  rail.js  kpi.js  table.js  tabbar.js
  views/
    matriz-competitiva.js         filas de la vista actual
```

Cada componente tiene su CSS y su markup con el mismo nombre. Si tocas
`components/rail.js`, su estilo está en `css/components/rail.css`.

---

## Cómo se arma la página

1. `index.html` sólo declara los contenedores: `#cmp-nav`, `#cmp-rail`, `#cmp-main`,
   `#cmp-tabbar`. Las clases (`.nav`, `.rail`, `.main`, `.tabbar`) siguen en esos
   contenedores, así que el CSS no cambió.
2. `app.js` los rellena con el markup de cada componente al evaluarse el módulo
   (antes del evento `load`, sin parpadeo).
3. En `window.onload` se carga el JSON, se mide la capacidad y se renderiza.

### Por qué hay funciones en `window`

El markup usa handlers inline (`onclick="setModo('PRECIOS')"`, `onclick="toggleGroup(...)"`),
igual que en el monolito. Como los módulos ES no exponen nada al ámbito global, `app.js`
publica explícitamente los handlers al final:

```js
Object.assign(window, { setModo, cambiarFiltroMarker, toggleGroup,
                        filtrarEstaciones, setPagina, render });
```

Si algún día se pasan los handlers a `addEventListener`, ese bloque se puede eliminar.

---

## Agregar una vista nueva

1. Crear `js/views/mi-vista.js` que exporte una función de render.
2. Crear `css/components/mi-vista.css` si necesita estilos propios, y enlazarlo en
   `index.html` **después** de los componentes existentes.
3. En `js/components/kpi.js` agregar su `<div class="view-tab">`, y en `app.js`
   decidir qué vista se renderiza según la pestaña activa.

El estado compartido (`state.js`) y la paginación (`paginacion.js`) ya son agnósticos
de la vista.

---

## Servir el visor

`fetch` no funciona sobre `file://`. El visor tiene que servirse por HTTP; además,
los ES Modules también lo exigen. En local:

```bash
python3 -m http.server 8000
```

y abrir `http://localhost:8000` en pantalla completa (F11).

---

## Notas

- `ROW_H` y `THEAD_H` en `js/config.js` deben coincidir con `--row-h` y `--thead-h`
  en `css/tokens.css`. De ese par sale el cálculo de cuántas filas caben sin scroll.
- Las pestañas inferiores son `flex: 1 1 0` sobre un ancho fijo: nunca hay scroll
  horizontal, por muchas que sean. La etiqueta se recorta según el ancho disponible.
- El filtro Main Marker depende del campo `main_marker` dentro de cada combustible
  del JSON. Si el JSON no lo trae, el filtro deja la lista vacía (comportamiento
  heredado del visor original).
