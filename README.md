# JobRadar Perú - Monitor Automatizado de Empleos Remotos

Sistema integral de monitoreo, scraping y consolidación de ofertas de empleo para Perú enfocado en perfiles estratégicos:
* **Product Manager**
* **Jefe de Compras**
* **Jefe de Categoría**
* **Jefe de Línea**
* **Jefe de Abastecimiento**
* **Jefe de Comex**
* **Jefe de Importaciones**

---

## 🚀 Despliegue en Vercel

Este proyecto está preconfigurado para ejecutarse en **Vercel** como aplicación Full-Stack:
* **Frontend**: React 19 + Vite (compilado a `dist/`)
* **Backend API**: Express Serverless (`api/index.ts`)
* **Cron Jobs**: Programado a las 8:00 PM (hora Perú) vía `vercel.json` (`schedule: "0 1 * * *"`)

### Variables de Entorno en Vercel
Configura en **Project Settings > Environment Variables**:
* `GEMINI_API_KEY`: Clave de API de Google Gemini (para análisis de mercado y generación del boletín ejecutivo).

---

## 🛠️ Tecnologías y Portales Integrados

1. **Computrabajo Perú (`pe.computrabajo.com`)**:
   * Scraper con selectores DOM especializados y decodificación de entidades.
   * Generación de **enlaces canónicos directos** (`https://pe.computrabajo.com/ofertas-de-trabajo/...`).

2. **Bumeran Perú (`bumeran.com.pe`)**:
   * Conexión a la API oficial v2 (`BMPE`).
   * Extracción de **enlaces directos canónicos** (`https://www.bumeran.com.pe/empleos/...`).

3. **LinkedIn Perú**:
   * API de reclutamiento público para Perú con filtro de trabajo remoto.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor local
npm run dev

# Compilar para producción
npm run build
```
