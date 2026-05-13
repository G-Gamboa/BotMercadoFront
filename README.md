# Bot Mercado — Mini App

Frontend de la Mini App de Telegram para gestionar el inventario del hogar: compras, consumos, categorías y lista de compras pendientes.

## Descripción

Bot Mercado permite llevar el control de productos en casa registrando entradas (compras) y salidas (consumos). Cuando un producto llega a cero, aparece automáticamente en la lista de compras. Funciona como Mini App dentro de Telegram y se conecta a la API REST [BotMercadoAPI](https://github.com/G-Gamboa/BotMercadoAPI).

## Funcionalidades

| Pestaña | Descripción |
|---|---|
| **Inventario** | Listado actual de productos filtrable por lugar (Mercado / Supermercado) |
| **Compra** | Registro individual o en lote de productos comprados |
| **Consumo** | Registro individual o en lote de productos consumidos |
| **Categorías** | Gestión de categorías (crear / eliminar) |
| **Lista** | Productos con stock agotado que hay que reponer |

### Formato de lote

Tanto compras como consumos en lote aceptan texto con el formato:

```
Papa - 2
Tomate - 5
Cebolla - 1.5
```

Una línea por producto: `Nombre - Cantidad`.

## Stack tecnológico

- HTML5, CSS3, JavaScript (ES2020) — sin frameworks ni bundler
- [Tailwind CSS](https://tailwindcss.com/) vía CDN
- [Telegram Web App JS](https://core.telegram.org/bots/webapps) para la integración con Telegram
- API REST desplegada en [Railway](https://railway.app/)

## Estructura del proyecto

```
BotMercadoFront/
├── index.html      # Estructura y layout de la app
├── app.js          # Lógica completa (estado, llamadas API, eventos)
├── styles.css      # Estilos personalizados sobre Tailwind
└── assets/
    └── logo.png
```

## Desarrollo local

No hay proceso de build. Basta con servir los archivos estáticamente:

```bash
# Con Python
python -m http.server 8080

# Con Node.js (npx)
npx serve .
```

Luego abre `http://localhost:8080` en el navegador.

> La app llama directamente a `https://botmercadoapi-production.up.railway.app`. Para apuntar a otro entorno, cambia la constante `API_BASE` en la primera línea de `app.js`.

## Despliegue

El proyecto se puede alojar en cualquier hosting de archivos estáticos (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.). La URL resultante se configura como **Menu Button URL** del bot en [@BotFather](https://t.me/BotFather).

## Repositorio del backend

[BotMercadoAPI](https://github.com/G-Gamboa/BotMercadoAPI) — FastAPI + Railway
