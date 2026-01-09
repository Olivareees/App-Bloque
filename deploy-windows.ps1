# Script PowerShell para inicializar repo y subir a GitHub (Windows)
# Uso: edita la URL y ejecuta en PowerShell desde la carpeta del proyecto

# Reemplaza <tu-usuario> y <tu-repo> antes de ejecutar
git init
git add .
git commit -m "Primer commit"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
