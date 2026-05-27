# Guía de Resolución de Errores: Despliegue de Aplicaciones Express en Vercel

Este documento detalla los problemas de inicialización y empaquetado del servidor que ocurren al desplegar una aplicación full-stack basada en Node.js, Express y Vite en plataformas serverless como Vercel, y cómo se resolvieron para servir de referencia médica e ingeniería en futuros proyectos.

---

## 1. El Problema Principal: `Cannot find module '/var/task/server'`
### Síntoma
En el entorno de Vercel, se mostraba el siguiente mensaje de error en pantalla bajo una sección de Alerta Clínica o de Procesamiento Diagnóstico:
```text
Error de Inicialización en Vercel: Cannot find module '/var/task/server' imported from /var/task/api/index.js
Stack: Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server'
...
```

### Causa Raíz
1. **Modelado Serverless en Vercel:**  
   Vercel trata todas las rutas ubicadas dentro de la carpeta `/api/` como funciones serverless independientes. Durante la fase de construcción/compilación de la plataforma, Vercel aísla el archivo de entrada `/api/index.js` (o `.ts`) y lo empaqueta individualmente.
2. **Dependencias Circulares y Rutas Relativas:**  
   Si el archivo `/api/index.ts` intenta realizar una importación relativa dinámica tal como `await import("../server")` para arrancar el servidor Express, el compilador de Vercel asume que el archivo externo `server.ts` en la raíz debe estar empaquetado dentro de la función. Sin embargo, en el entorno serverless real en runtime, ese archivo raíz no existe o no sigue la estructura de directorios locales, arrojando el error `ERR_MODULE_NOT_FOUND` al intentar resolver `/var/task/server`.
3. **El Bucle de Ejecución del Puerto:**  
   El archivo `server.ts` raíz normalmente ejecuta un `app.listen(PORT, "0.0.0.0", ...)` para levantar un socket local en el puerto de red. En Vercel, las funciones de la API **no deben llamar a `.listen()`**, ya que la infraestructura serverless de Vercel maneja la conexión HTTP de entrada de forma abstracta y simplemente enruta la solicitud (`req, res`) directamente a nuestra instancia Express exportada.

---

## 2. La Arquitectura Solución Ideal

Para garantizar que el proyecto funcione perfectamente **tanto en desarrollo local (con contenedores o Docker/AI Studio) como en producción Serverless (Vercel)**, implementamos un desacoplamiento de responsabilidades:

### A. La Capa API / Núcleo de Express (`/api/index.ts`)
Este archivo debe ser el **único portal de entrada para Vercel** y el contenedor de toda la lógica clínica, ruteadores y endpoints de la IA.
* **Qué hace:** Crea la instancia Express (`const app = express()`), configura los middlewares globales, declara los endpoints `/api/doctorismo/diagnose` y `/api/doctorismo/generate-avatar`, y **exporta la app por defecto (`export default app`)**.
* **Qué NO hace:** **No llama a `app.listen()`**. Esto evita conflictos de red en plataformas serverless.

```typescript
// /api/index.ts
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Endpoints, lógica de la IA de DoctorISMO...
app.post("/api/doctorismo/diagnose", async (req, res) => {
  // Lógica de procesamiento de diagnóstico con el SDK oficial @google/genai
});

// CLAVE: Exportar la instancia pura del ruteador sin levantar puertos
export default app;
```

### B. La Capa de Entrada Local / Contenedores (`/server.ts`)
Este archivo se ejecuta **únicamente en entornos locales y contenedores autohospedados (como Cloud Run en AI Studio)**.
* **Qué hace:** Importa la instancia empaquetada de Express desde `/api/index.ts` y monta el middleware de Vite (para recarga en caliente en desarrollo) o sirve la carpeta de producción construida (`dist/`). Luego, **ejecuta el comando `app.listen(PORT)`**.
* **Qué NO hace:** Vercel ignora totalmente este archivo en producción, evitando así fallos en la resolución de módulos o bucles redundantes de inicialización de puertos.

```typescript
// /server.ts
import app from "./api/index.ts";
import express from "express";
import path from "path";

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Integra Vite como middleware para desarrollo caliente...
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Sirve archivos estáticos generados por el build
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Solo se levanta el puerto aquí (Ignorado en la ejecución de Vercel Serverless)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DoctorISMO Server] Levantado en puerto http://0.0.0.0:${PORT}`);
  });
}

startServer();
```

---

## 3. Configuración Requerida de Vercel (`vercel.json`)
Para indicarle a Vercel que redirija todas las llamadas a endpoints backend y SPA a nuestro núcleo de la API, se requiere el siguiente archivo bien formateado en la raíz:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "cleanUrls": true
}
```

---

## 4. Prácticas Clave para Evitar Repetición de Errores

1. **Evitar Importaciones Dinámicas Cruzadas (`api/index` -> `server` -> `api/index`):**
   Siempre separa el punto de entrada que levanta un puerto de red (`app.listen()`) de la lógica estructural de enrutamiento de Express.
2. **Utilizar el SDK Correcto y Seguro en el Servidor:**
   Asegurar que la clave `GEMINI_API_KEY` se use exclusivamente en la parte de backend (`/api/index.ts`) y nunca se exponga al cliente con prefijos del tipo `VITE_`.
3. **Controlar el Tamaño de Entrada de Datos:**
   Puesto que la aplicación maneja archivos multimodales (PDF, JPEG, electrocardiogramas, mp4), es crucial declarar middlewares con límites amplios como `express.json({ limit: "50mb" })` en el endpoint de la API para evitar errores de tipo `413 Payload Too Large` de Vercel.
4. **Respuestas de Diagnóstico en JSON Controladas:**
   Utilizar la característica `responseSchema` de Gemini para asegurar que las respuestas de la IA médica sigan de manera estricta el esquema JSON requerido por los componentes frontales, evitando fallos de parseo de sintaxis clínica.
