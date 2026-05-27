/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VitalSigns {
  heartRate: number;      // bpm
  systolicBP: number;     // mmHg
  diastolicBP: number;    // mmHg
  respiratoryRate: number;// rpm
  temperature: number;    // °C
  oxygenSaturation: number;// SpO2 %
  glucose: number;        // mg/dL
  painLevel: number;      // 0 - 10
}

export interface PatientFile {
  name: string;
  size: number;
  mimeType: string;
  data: string; // Base64 encoded string
  description?: string;
}

export interface PatientData {
  name: string;
  age: number;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  bloodType: string;
  weight: number; // kg
  height: number; // cm
  vitals: VitalSigns;
  symptoms: string;
  congenitalDiseases: string;
  allergies: string;
  surgicalHistory: string;
  lifestyleHabits: string;
  currentTreatments: string;
  familyHistory: string;
  occupation: string;
  pregnancyStatus: 'No aplica' | 'No' | 'Sí' | 'No lo sabe';
  files: PatientFile[];
}

export interface DiagnosticReportData {
  resumenClinico: {
    sintesis: string;
    problemaPrincipal: string;
    hallazgosClave: string[];
  };
  analisisFisiopatologico: {
    mecanismos: string;
    relaciones: string;
    procesos: string;
  };
  correlacionClinica: {
    correlacion: string;
    patrones: string;
    senalesAlarma: string[];
  };
  diagnosticosDiferenciales: {
    probables: Array<{
      categoria: 'Principal' | 'Secundario' | 'Otras Consideraciones';
      diagnostico: string;
      favor: string;
      contra: string;
      explicacion: string;
    }>;
  };
  estudiosSugeridos: Array<{
    nombre: string;
    justificacion: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
  }>;
  orientacionTerapeutica: {
    lineasManejo: string[];
    opcionesEstandar: string;
    seguridad: string;
    referenciaSegundoNivel: string;
  };
  criteriosAlerta: Array<{
    indicador: string;
    parametroCritico: string;
    accionInmediata: string;
  }>;
  pronosticoSeguimiento: {
    evolucionEsperada: string;
    factoresModificantes: string;
    vigilanciaRecomendada: string;
  };
  limitaciones: string[];
}
