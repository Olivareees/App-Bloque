# 💾 Guía de Respaldos en iPhone

## ✅ Mejoras Implementadas

### 1. **Botón "Guardar Respaldo Completo"**
- Se encuentra en el menú de Opciones (☰)
- Descarga TODOS tus bloques automáticamente en formato JSON
- Compatible con iOS Safari

### 2. **Selector de Carpeta en iPhone**

Cuando presiones el botón "💾 Guardar Respaldo Completo":

1. **iOS mostrará automáticamente** el diálogo de descarga nativo
2. **Podrás elegir dónde guardar:**
   - 📁 En la app Archivos (local)
   - ☁️ En iCloud Drive
   - 📱 En cualquier carpeta de tu iPhone
   - 📂 En aplicaciones de terceros (Dropbox, Google Drive, etc.)

### 3. **Formato del Archivo**
```
app-bloque-RESPALDO-COMPLETO-[número]-bloques-[fecha].json
```

Ejemplo: `app-bloque-RESPALDO-COMPLETO-25-bloques-2026-02-07.json`

## 📱 Cómo Usar en iPhone

### Hacer Respaldo:
1. Abre la app en Safari en tu iPhone
2. Toca el botón **☰** (menú hamburguesa)
3. Toca **"💾 Guardar Respaldo Completo"**
4. iOS te preguntará **dónde guardar el archivo**
5. Selecciona la carpeta que prefieras
6. ¡Listo! El archivo se guardará ahí

### Restaurar Respaldo:
1. Toca el botón **☰**
2. Toca **"📥 Importar Bloques"**
3. Navega a la carpeta donde guardaste el respaldo
4. Selecciona el archivo `.json`
5. ¡Los bloques se cargarán automáticamente!

## 🔄 Diferencias entre Exportar e Importar

### 📤 Exportar Bloques
- Te permite **seleccionar** qué bloques compartir
- Ideal para compartir con amigos
- Los archivos exportados tienen el formato: `app-bloque-bloques(X)-fecha.json`

### 💾 Guardar Respaldo Completo
- Guarda **TODOS** los bloques automáticamente
- Sin necesidad de seleccionar uno por uno
- Ideal para respaldos completos
- Los archivos tienen el prefijo `RESPALDO-COMPLETO`

### 📥 Importar
- Carga bloques de un archivo JSON
- Los bloques importados **se fusionan** con los existentes (no los reemplazan)
- Funciona tanto con archivos de "Exportar" como de "Respaldo Completo"

## ⚠️ Notas Importantes

### Para iOS:
- ✅ Funciona en **Safari en iPhone/iPad**
- ✅ El selector de carpeta es **nativo de iOS**
- ✅ Puedes guardar en **cualquier carpeta accesible**
- ⚠️ Asegúrate de dar permisos de acceso a la carpeta si es necesario

### Sobre el Almacenamiento:
- Los datos se guardan en **localStorage del navegador**
- Los respaldos JSON son **portátiles** y puedes compartirlos
- **IMPORTANTE**: Si borras los datos del navegador, perderás los bloques (por eso es importante hacer respaldos)

## 🐛 Solución de Problemas

### "No puedo seleccionar carpeta en iPhone"
- iOS Safari **siempre** te permite seleccionar dónde guardar archivos descargados
- Si no aparece el selector, verifica que tienes la última versión de iOS
- Intenta usar Safari (no Chrome u otros navegadores en iOS)

### "Los bloques no se guardan"
- Verifica que Safari no esté en **Modo Privado**
- En Modo Privado, localStorage está limitado
- Usa el modo normal de Safari

### "El archivo descargado tiene nombre genérico"
- Algunos navegadores cambian el nombre al descargar
- El contenido del archivo es correcto aunque el nombre cambie
- Al importar, el contenido es lo que importa, no el nombre

## 📊 Estadísticas

El modal de opciones también muestra:
- **Total de Vías**: Número total de bloques guardados
- **Vías Favoritas**: Bloques marcados como favoritos

## 🔐 Privacidad

- ✅ Todos los datos se almacenan **localmente** en tu dispositivo
- ✅ No se envía nada a servidores externos
- ✅ Tienes control completo sobre tus respaldos
- ✅ Los archivos JSON están en texto plano (puedes abrirlos y verificar su contenido)

---

**Versión**: V5  
**Última actualización**: Febrero 2026  
**Compatible con**: iOS 13+, iPadOS 13+, Safari
