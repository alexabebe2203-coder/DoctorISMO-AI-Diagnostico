import app from "./api/index.ts";
import path from "path";
import express from "express";

const PORT = 3000;

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const viteModule = "vite";
    const { createServer: createViteServer } = await import(viteModule);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DoctorISMO Server] Running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
