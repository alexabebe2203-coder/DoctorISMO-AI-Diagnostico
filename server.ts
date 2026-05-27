import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI server-side with user-agent header as indicated in SKILL
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Clave de API GEMINI_API_KEY no encontrada en las variables de entorno. Por favor, asegúrese de agregarla a Vercel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Middleware to parse large JSON (since user could upload multiple base64 files)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Express v4 route handler safely wrapped
const systemInstruction = `
Eres DOCTORISMO, un Agente Médico Inteligente de apoyo clínico avanzado de alta precisión a la altura de ADA Health, Amboss, PathAI y Glass Health.
Tu función es organizar el razonamiento de forma estructurada, con rigor científico y ética médica.
No sustituyes el juicio de un doctor real, actúas de apoyo.

Debes responder estrictamente en formato JSON válido respetando el siguiente esquema JSON:
{
  "resumenClinico": {
    "sintesis": "string (resumen general estructurado)",
    "problemaPrincipal": "string (definición clara)",
    "hallazgosClave": ["string"]
  },
  "analisisFisiopatologico": {
    "mecanismos": "string (mecanismos biológicos)",
    "relaciones": "string (relación de síntomas con sistemas)",
    "procesos": "string (procesos inflamatorios, infeccioso, metabólico, etc. Con explicación simple entre paréntesis)"
  },
  "correlacionClinica": {
    "correlacion": "string (explicar patrones de síntomas)",
    "patrones": "string (identificación de patrones)",
    "senalesAlarma": ["string"]
  },
  "diagnosticosDiferenciales": {
    "probables": [
      {
        "categoria": "Principal o Secundario o Otras Consideraciones",
        "diagnostico": "string",
        "favor": "string",
        "contra": "string",
        "explicacion": "string"
      }
    ]
  },
  "estudiosSugeridos": [
    {
      "nombre": "string",
      "justificacion": "string",
      "prioridad": "Alta o Media o Baja"
    }
  ],
  "orientacionTerapeutica": {
    "lineasManejo": ["string (lineas de manejo general sin prescribir dosis específicas)"],
    "opcionesEstandar": "string",
    "seguridad": "string (consideraciones críticas y advertencias)",
    "referenciaSegundoNivel": "string"
  },
  "criteriosAlerta": [
    {
      "indicador": "string",
      "parametroCritico": "string",
      "accionInmediata": "string"
    }
  ],
  "pronosticoSeguimiento": {
    "evolucionEsperada": "string",
    "factoresModificantes": "string",
    "vigilanciaRecomendada": "string"
  },
  "limitaciones": ["string (datos faltantes, sesgos, necesidad de examen directo)"]
}
`;

// Diagnostico endpoint
app.post("/api/doctorismo/diagnose", async (req, res) => {
  try {
    const { patientData } = req.body;
    if (!patientData) {
      return res.status(400).json({ error: "Faltan datos del paciente." });
    }

    const {
      name,
      age,
      gender,
      bloodType,
      weight,
      height,
      vitals,
      symptoms,
      congenitalDiseases,
      allergies,
      surgicalHistory,
      lifestyleHabits,
      currentTreatments,
      familyHistory,
      occupation,
      pregnancyStatus,
      files
    } = patientData;

    // Build parts for multimodal analysis
    const parts: any[] = [];
    
    // Core clinical prompt
    const promptText = `
    POR FAVOR ANALIZA EL CASO CLÍNICO INTEGRAL DEL SIGUIENTE PACIENTE:
    Nombre: ${name}
    Edad: ${age} años
    Género: ${gender}
    Ocupación: ${occupation || 'No especificada'}
    Estado de Embarazo: ${pregnancyStatus || 'No aplica'}
    
    Ficha Antropométrica y Genética:
       - Peso: ${weight} kg
       - Estatura: ${height} cm
       - Tipo de sangre: ${bloodType || 'No especificado'}
       
    Signos Vitales y Parámetros Metabólicos:
       - Frecuencia Cardíaca: ${vitals.heartRate} bpm
       - Presión Arterial: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
       - Frecuencia Respiratoria: ${vitals.respiratoryRate} rpm
       - Temperatura: ${vitals.temperature} °C
       - Saturación de Oxígeno (SpO2): ${vitals.oxygenSaturation}%
       - Glucosa Capilar: ${vitals.glucose} mg/dL
       - Nivel de Dolor (EVA 0-10): ${vitals.painLevel}/10
       
    Cuadro de Síntomas: ${symptoms}
    Antecedentes Clínicos:
       - Enfermedades Crónicas/Congénitas: ${congenitalDiseases || 'Ninguna'}
       - Alergias detectadas: ${allergies || 'Ninguna conocida'}
       - Antecedentes Quirúrgicos: ${surgicalHistory || 'Ninguno'}
       - Hábitos de vida / Tóxicos: ${lifestyleHabits || 'Ninguno relevado'}
       - Tratamientos farmacológicos actuales: ${currentTreatments || 'Ninguno'}
       - Historia Familiar relevante: ${familyHistory || 'No aportada'}

    Archivos/Estudios adjuntos proporcionados por el usuario: ${files && files.length > 0 ? `${files.length} archivos.` : 'Ninguno.'}
    Analiza este caso a profundidad basándote en la evidencia, de forma objetiva, siguiendo referencias (como AMBOSS, guías clínicas e internacionales) y prácticas de control clínica.
    Genera tu diagnóstico estructurado en formato JSON cumpliendo exactamente las propiedades del esquema.
    `;

    parts.push({ text: promptText });

    // Attach base64 files
    if (files && files.length > 0) {
      for (const file of files) {
        // Safe check for valid base64 and mime type
        if (file.data && file.mimeType) {
          parts.push({
            inlineData: {
              data: file.data.includes(",") ? file.data.split(",")[1] : file.data,
              mimeType: file.mimeType
            }
          });
        }
      }
    }

    // Call Gemini using 'gemini-3.5-flash'
    const response = await getAI().models.generateContent({
      model: 'gemini-3.5-flash',
      contents: parts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumenClinico: {
              type: Type.OBJECT,
              properties: {
                sintesis: { type: Type.STRING },
                problemaPrincipal: { type: Type.STRING },
                hallazgosClave: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["sintesis", "problemaPrincipal", "hallazgosClave"]
            },
            analisisFisiopatologico: {
              type: Type.OBJECT,
              properties: {
                mecanismos: { type: Type.STRING },
                relaciones: { type: Type.STRING },
                procesos: { type: Type.STRING }
              },
              required: ["mecanismos", "relaciones", "procesos"]
            },
            correlacionClinica: {
              type: Type.OBJECT,
              properties: {
                correlacion: { type: Type.STRING },
                patrones: { type: Type.STRING },
                senalesAlarma: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["correlacion", "patrones", "senalesAlarma"]
            },
            diagnosticosDiferenciales: {
              type: Type.OBJECT,
              properties: {
                probables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      categoria: { type: Type.STRING },
                      diagnostico: { type: Type.STRING },
                      favor: { type: Type.STRING },
                      contra: { type: Type.STRING },
                      explicacion: { type: Type.STRING }
                    },
                    required: ["categoria", "diagnostico", "favor", "contra", "explicacion"]
                  }
                }
              },
              required: ["probables"]
            },
            estudiosSugeridos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING },
                  justificacion: { type: Type.STRING },
                  prioridad: { type: Type.STRING }
                },
                required: ["nombre", "justificacion", "prioridad"]
              }
            },
            orientacionTerapeutica: {
              type: Type.OBJECT,
              properties: {
                lineasManejo: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                opcionesEstandar: { type: Type.STRING },
                seguridad: { type: Type.STRING },
                referenciaSegundoNivel: { type: Type.STRING }
              },
              required: ["lineasManejo", "opcionesEstandar", "seguridad", "referenciaSegundoNivel"]
            },
            criteriosAlerta: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  indicador: { type: Type.STRING },
                  parametroCritico: { type: Type.STRING },
                  accionInmediata: { type: Type.STRING }
                },
                required: ["indicador", "parametroCritico", "accionInmediata"]
              }
            },
            pronosticoSeguimiento: {
              type: Type.OBJECT,
              properties: {
                evolucionEsperada: { type: Type.STRING },
                factoresModificantes: { type: Type.STRING },
                vigilanciaRecomendada: { type: Type.STRING }
              },
              required: ["evolucionEsperada", "factoresModificantes", "vigilanciaRecomendada"]
            },
            limitaciones: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "resumenClinico",
            "analisisFisiopatologico",
            "correlacionClinica",
            "diagnosticosDiferenciales",
            "estudiosSugeridos",
            "orientacionTerapeutica",
            "criteriosAlerta",
            "pronosticoSeguimiento",
            "limitaciones"
          ]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response text returned by the model.");
    }

    const reportData = JSON.parse(outputText.trim());
    res.json({ report: reportData });

  } catch (error: any) {
    console.error("Error in diagnose endpoint:", error);
    res.status(500).json({ error: error?.message || "Algo salió mal durante el diagnóstico con IA." });
  }
});

// Avatar generation endpoint
app.post("/api/doctorismo/generate-avatar", async (req, res) => {
  try {
    const { patientData } = req.body;
    if (!patientData) {
      return res.status(400).json({ error: "Faltan datos del paciente." });
    }

    const { age, gender, weight, height, bloodType, vitals, symptoms } = patientData;

    // Calculate clinical status for illustration prompt to interpret patient's actual state
    const pulse = vitals.heartRate;
    const oxygen = vitals.oxygenSaturation;
    const bodyTemp = vitals.temperature;
    const glyc = vitals.glucose;
    
    let stateLabel = "buena salud (estable)";
    let styleAtmosphere = "balanced pulsing blue and cyan neon biomechanical circuits";
    
    if (oxygen < 90 || pulse > 125 || pulse < 48 || glyc >= 200 || bodyTemp >= 39.0 || bodyTemp < 35.0) {
      stateLabel = "ESTADO CRÍTICO (severe clinical warning state, urgent emergency scan)";
      styleAtmosphere = "alarmed retro pulsating red and alert intense orange biomechanical emergency circuits flashing warning lights";
    } else if (oxygen < 94 || pulse > 100 || pulse < 60 || glyc >= 140 || bodyTemp >= 38.0) {
      stateLabel = "ESTADO DE RIESGO / ALERTA (vulnerable patient state, dynamic clinical indicators warning)";
      styleAtmosphere = "warning amber and amber-orange glowing reactive analytical biosegment circuits";
    } else if (oxygen >= 97 && pulse >= 60 && pulse <= 80 && bodyTemp >= 36.3 && bodyTemp <= 37.0 && glyc >= 75 && glyc <= 100) {
      stateLabel = "EXCELENTE SALUD (perfect homeostasis clinical state)";
      styleAtmosphere = "balanced optimal emerald-green and bright gold glowing bio-cybernetic circuits simulating absolute cellular perfection";
    }

    const isMale = gender === 'Masculino';
    const avatarType = isMale ? 'male character' : 'female character';
    
    // Construct premium prompt integrating nano banana SUPER AVATAR REALISTA representing patient's true state
    const prompt = `A highly detailed futuristic 3D render of a "nano banana SUPER AVATAR REALISTA CON TODOS LOS DATOS DEL PACIENTE", a photorealistic translucent biomechanical anatomical avatar model representing a ${gender} patient (${age} years old). The avatar's biomechanics are interpreting the patient's actual current estimated physiological state: "${stateLabel.toUpperCase()}". The body is covered with delicate, highly realistic nano-banana glowing bio-circuits and light nodes. The glowing elements present ${styleAtmosphere}, overlaying clinical metrics: HR ${vitals.heartRate} bpm, SpO2 ${vitals.oxygenSaturation}%, glucose ${vitals.glucose}mg/dL, Temp ${vitals.temperature}°C. Standing centered on top of a bright blue glowing circular futuristic holographic diagnostic stand projector base. Pure flat deep black background, cinematic clinical high-contrast lighting, beautiful high fidelity medical virtual graphics, isolated on black, unreal engine 5 style.`;

    // Note that we must use gemini-3.1-flash-image-preview for high quality images as specified in gemini-api SKILL.
    // Also, gemini-3.1-flash-image-preview is a PAID model, we'll let the user know, and use gemini-3.1-flash-image-preview.
    const response = await getAI().models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [{ text: prompt }],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image was returned from the modal parts.");
    }

    res.json({ image: `data:image/png;base64,${base64Image}` });

  } catch (error: any) {
    console.error("Error in generate-avatar endpoint:", error);
    res.status(500).json({ error: error?.message || "Algo falló al modelar el Avatar Holográfico de IA." });
  }
});

// Global Express Error Handler Middleware to prevent unhandled rejections from returning raw HTML error pages
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Global Server Error:", err);
  res.status(500).json({
    error: "Error interno en el servidor de soporte DoctorISMO",
    message: err?.message || String(err)
  });
});

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

// Export the app instance for Serverless platform hosting (Vercel)
export default app;

// Only execute startServer if not in a Vercel serverless environment
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer();
}
