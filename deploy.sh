#!/bin/sh
# Script para inicializar repo y subir a GitHub (Bash/macOS/Linux)
# Uso: edita la URL y luego ejecuta: sh deploy.sh

# Reemplaza <tu-usuario> y <tu-repo> antes de ejecutar
git init
git add .
git commit -m "Primer commit"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
