export default async function handler(req: any, res: any) {
  try {
    // Dynamically import to catch any load-time or compilation failures on Vercel
    const { default: app } = await import("../server");
    
    // Hand over the request to the Express application
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Serverless Function Initialization Failure:", error);
    res.status(500).json({
      error: "Error de Inicialización de DoctorISMO en Vercel",
      message: error?.message || String(error),
      stack: error?.stack || "No stack trace available",
      hint: "Verifique que ha configurado la variable de entorno GEMINI_API_KEY en la consola de Vercel."
    });
  }
}
