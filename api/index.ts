export default async function handler(req: any, res: any) {
  try {
    // Dynamic import to catch load-time or runtime errors on Vercel
    const { default: app } = await import("../server");
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Serverless Function Initialization Failure:", error);
    
    // We return the error details inside the "error" field.
    // The frontend throws errorMsg = errData.error, so putting the details there
    // will render the exact stack/reason directly in the red error box.
    const errorMessage = error?.message || String(error);
    const errorStack = error?.stack || "No stack trace available";
    
    return res.status(500).json({
      error: `Error de Inicialización en Vercel: ${errorMessage}\n\nStack:\n${errorStack}`,
      message: errorMessage,
      stack: errorStack
    });
  }
}
