# Guía de Despliegue en Vercel

Sigue estos sencillos pasos para desplegar **BULLTECH DRAWER** en la nube de Vercel.

## Método 1: GitHub Integration (Recomendado)

1. Crea un repositorio en tu cuenta de GitHub (público o privado).
2. Sube la carpeta del proyecto a tu repositorio:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-url-del-repositorio>
   git branch -M main
   git push -u origin main
   ```
3. Entra a tu panel de control de Vercel y haz clic en **Add New** > **Project**.
4. Importa tu repositorio recién creado.
5. Vercel autodetectará el preset del framework como **Vite**.
6. Deja la configuración predeterminada:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
7. Haz clic en **Deploy**. ¡Listo!

## Método 2: Vercel CLI

Si tienes instalada la herramienta de línea de comandos de Vercel, puedes desplegar la aplicación directamente:

```bash
# Instalar CLI
npm install -g vercel

# Desplegar a entorno staging/preview
vercel

# Desplegar directamente a producción
vercel --prod
```

## Pruebas post-despliegue

Una vez completado el despliegue, comprueba los siguientes puntos:
1. Las rutas directas (como `/game`, `/presenter`) deben cargar correctamente al recargar el navegador (gracias a las reglas de reescritura en `vercel.json`).
2. Verifica el soporte offline instalando la PWA en tu smartphone.
3. Asegúrate de dar los permisos correspondientes de voz y Wake Lock en dispositivos reales.
