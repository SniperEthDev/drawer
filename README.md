# BULLTECH DRAWER

Sorteador profesional de bingo de 75 bolas, construido bajo una arquitectura moderna *mobile-first* pero 100% responsiva para pantallas grandes y computadoras.

## Características Principales

- **Diseño Tecnológico Neón:** Estética dark y moderna con efectos de vidrio esmerilado y acentos púrpura neón.
- **Sorteo Seguro:** Generador aleatorio basado en `crypto.getRandomValues()` y Fisher-Yates. Excluye el uso de `Math.random()`.
- **Compromiso Criptográfico:** Genera un Order Commitment (SHA-256) del orden de extracción al inicio de la partida para auditoría completa.
- **Control de Voz & Sonido:** Anuncia bolas en español por síntesis de voz (Web Speech API) y genera efectos especiales propios (Web Audio API).
- **Modo Presentador:** Vista limpia de solo lectura para proyectores o pantallas secundarias sincronizada en tiempo real localmente mediante `BroadcastChannel`.
- **PWA Off-line:** Funciona sin conexión a internet tras su primera carga y mantiene la pantalla encendida (Screen Wake Lock API).

## Instalación y Configuración

El proyecto requiere Node.js >= 22.12.0.

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Compilar producción
npm run build

# Ejecutar pruebas unitarias
npm run test
```

## Aviso Regulatorio
BULLTECH DRAWER es una herramienta operativa para sorteos de bingo. La aleatoriedad utiliza las capacidades criptográficas del navegador y mantiene un registro local de auditoría. Esto no implica certificación regulatoria. Para actividades con dinero real, premios regulados o explotación comercial, el operador debe comprobar y cumplir la legislación aplicable y los requisitos de certificación de su jurisdicción.
