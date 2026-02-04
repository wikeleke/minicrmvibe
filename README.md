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

## Uso

1. Arrancar primero el backend (con `MONGODB_URI` válida en `.env`).
2. Arrancar el frontend.
3. En el navegador: listar contactos, crear, editar y eliminar. Estados: lead → contacto → cliente.
