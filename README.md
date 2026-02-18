# MiniCRM

CRM mínimo: contactos/leads con backend en Node.js y frontend en JavaScript moderno (Vite + Tailwind).

## Estructura

- **backend/** — API REST (Express, Mongoose), base de datos MongoDB Atlas
- **frontend/** — SPA con Vite, JS vanilla y Tailwind CSS

## Requisitos

- Node.js 18+
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y URL de conexión

## Configuración

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env y definir:
#   PORT=3000
#   MONGODB_URI=mongodb+srv://...
#   (alternativa sin SRV) MONGODB_URI_STD=mongodb://host1,host2,host3/...
npm install
npm run dev
```

La API quedará en `http://localhost:3000`. Rutas: `GET/POST /api/contacts`, `GET/PATCH/DELETE /api/contacts/:id`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app se abre en `http://localhost:5173` y usa el proxy hacia el backend.

## Despliegue en Vercel (frontend)

Para que el frontend no muestre "NOT_FOUND" en Vercel:

1. En el proyecto de Vercel: **Settings → General → Root Directory** → pon `frontend` y guarda.
2. Vuelve a desplegar (Redeploy).

El `frontend/vercel.json` ya incluye las reglas para que la SPA sirva bien. En producción necesitas un backend desplegado en otro servicio (Railway, Render, etc.) y definir la variable de entorno `VITE_API_URL` en Vercel con la URL de esa API.

## Uso

1. Arrancar primero el backend (con `MONGODB_URI` válida o `MONGODB_URI_STD`).
2. Arrancar el frontend.
3. En el navegador: listar contactos, crear, editar y eliminar. Estados: lead → contacto → cliente.
