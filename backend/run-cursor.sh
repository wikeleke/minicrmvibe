#!/usr/bin/env bash
# Script para ejecutar el backend desde Cursor con conexión a MongoDB.
# Libera el puerto 3000 si está en uso y arranca el servidor.

set -e
PORT=3000

if lsof -ti :$PORT >/dev/null 2>&1; then
  echo "Liberando puerto $PORT..."
  lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
  sleep 2
fi

echo "Iniciando backend..."
node src/index.js
