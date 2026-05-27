/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PatientData, DiagnosticReportData } from './types';
import { PatientForm } from './components/PatientForm';
import { HologramStand } from './components/HologramStand';
import { PrintableReport } from './components/PrintableReport';
import { 
  FileText, 
  Activity, 
  Info, 
  AlertTriangle, 
  Clipboard, 
  Heart, 
  CheckCircle, 
  ClipboardCheck, 
  Flame, 
  HelpCircle, 
  TrendingUp, 
  BookOpen, 
  Copy, 
  Check, 
  Sparkles,
  Stethoscope
} from 'lucide-react';

const INITIAL_PATIENT: PatientData = {
  name: 'Paciente Piloto',
  age: 45,
  gender: 'Masculino',
  bloodType: 'O+',
  weight: 78,
  height: 174,
  vitals: {
    heartRate: 72,
    systolicBP: 120,
    diastolicBP: 80,
    respiratoryRate: 16,
    temperature: 36.6,
    oxygenSaturation: 98,
    glucose: 104,
    painLevel: 6
  },
  symptoms: 'Cefalea pulsátil transitoria de inicio súbito en región frontal lateral, de intensidad 6/10, acompañada de fotofobia y mareo postural leve.',
  congenitalDiseases: 'Migraña familiar episódica.',
  allergies: 'Penicilina y ácido acetilsalicílico.',
  surgicalHistory: 'Apendicectomía laparoscópica realizada hace 20 años sin eventualidades.',
  lifestyleHabits: 'Consumo moderado de café de grano, sedentarismo en horas de programación web, no fumador.',
  currentTreatments: 'Paracetamol 500mg de forma esporádica en crisis.',
  familyHistory: 'Madre con antecedentes de migraña vascular crónica e hipertensión arterial sistémica.',
  occupation: 'Ingeniero de Software',
  pregnancyStatus: 'No aplica',
  files: []
};

const getInitials = (name: string) => {
  if (!name) return 'PX';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getFormattedDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

export default function App() {
  const [patientData, setPatientData] = useState<PatientData>(INITIAL_PATIENT);
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosed, setDiagnosed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('diff'); // diff, physio, tests, rx
  
  const [report, setReport] = useState<DiagnosticReportData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registroID = `EXP-${getFormattedDate()}-${getInitials(patientData.name)}`;

  const runDiagnosis = async () => {
    setLoading(true);
    setDiagnosed(false);
    setErrorMsg(null);
    setReport(null);
    setAvatarUrl(null);

    try {
      // 1. Diagnostics extraction request
      const diagResponse = await fetch('/api/doctorismo/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientData })
      });

      if (!diagResponse.ok) {
        const errData = await diagResponse.json();
        throw new Error(errData.error || "Fallo en la comunicación con el motor de IA de DoctorISMO.");
      }

      const diagJson = await diagResponse.json();
      setReport(diagJson.report);

      // 2. Avatar modeling request with Paid high performance preview
      const avatarResponse = await fetch('/api/doctorismo/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientData })
      });

      if (avatarResponse.ok) {
        const avatarJson = await avatarResponse.json();
        setAvatarUrl(avatarJson.image);
      } else {
        console.warn("Avatar server generation fell back; displaying virtual biological diagram.");
      }

      setDiagnosed(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Ocurrió un error inesperado al procesar los datos clínicos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="doctorismo-app">
      {/* Clinica Banner Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative z-30 print:hidden" id="main-header">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/25">
            <Stethoscope className="w-6 h-6" id="brand-logo" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
              DoctorISMO 
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-200">Suite Clínica IA</span>
              <a 
                href="https://ismo-landing-page.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-purple-200 transition-all flex items-center gap-1 cursor-pointer"
                id="btn-sistemas-ismo"
              >
                SISTEMAS ISMO ↗
              </a>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Motor de Inteligencia Diagnóstica Multimodal Avanzada</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl font-mono shadow-sm">
            <span className="font-extrabold text-slate-400">EXPEDIENTE ID:</span>
            <span className="font-black text-blue-700 tracking-wider text-[11px] bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">{registroID}</span>
          </div>
        </div>
      </header>

      {/* Main clinical split visualizer */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:p-0 print:m-0" id="workspace-grid">
        {/* Patient form module panel */}
        <div className="lg:col-span-5 xl:col-span-4 h-full print:hidden" id="left-column">
          <PatientForm 
            patientData={patientData}
            onChange={setPatientData}
            onDiagnose={runDiagnosis}
            loading={loading}
            report={report}
          />
        </div>

        {/* Hologram stage visualization & Dynamic detailed report */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 flex flex-col h-full print:w-full print:p-0 print:m-0" id="right-column">
          
          {/* Hologram virtual screen */}
          <div className="print:hidden">
            <HologramStand 
              patientData={patientData}
              imageUrl={avatarUrl}
              loading={loading}
              diagnosed={diagnosed}
              diagnoses={report?.resumenClinico?.problemaPrincipal}
            />
          </div>

          {/* Ficha Holográfica del Avatar en Tiempo Real al Diagnosticar */}
          {diagnosed && avatarUrl && (
            <div className="bg-slate-950 text-white rounded-2xl border border-blue-900/40 p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 animate-fade-in print:hidden" id="biometric-id-badge-container">
              {/* Sci-fi background decorative grids & glow spots */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[60px] pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              {/* Left edge solid gradient neon bar */}
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-cyan-400 to-purple-600 rounded-l" />

              {/* Column 1: Captured Photorealistic Anatomy Avatar Viewport */}
              <div className="w-full md:w-56 shrink-0 flex flex-col items-center justify-center space-y-4" id="avatar-col">
                <div className="relative group overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/60 p-1.5 shadow-[0_0_25px_rgba(34,211,238,0.25)] w-full max-w-[210px] mx-auto">
                  <img 
                    src={avatarUrl} 
                    alt="Biometric Avatar" 
                    className="w-full aspect-square object-cover rounded-lg relative z-10"
                    referrerPolicy="no-referrer"
                    id="avatar-full-img"
                  />
                  {/* Sweep scan guideline */}
                  <div className="absolute inset-x-0 w-full h-0.5 bg-cyan-400 opacity-60 z-20 animate-scan-line shadow-[0_0_8px_rgba(34,211,238,1)]" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] bg-cyan-950/80 text-cyan-300 font-bold font-mono py-1.5 px-3 rounded-md border border-cyan-800 uppercase tracking-widest">
                    AVATAR FOTORREALISTA
                  </span>
                </div>
              </div>

              {/* Column 2: Comprehensive Patient Data Printout */}
              <div className="flex-1 flex flex-col justify-between space-y-4 text-left" id="badge-data-col">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 mb-4 gap-2">
                    <div>
                      <h4 className="text-[10px] font-black tracking-widest text-slate-400 font-mono uppercase">EXPEDIENTE BIOMÉTRICO HOLOGRÁFICO</h4>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-sans">{patientData.name}</h3>
                    </div>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 font-mono font-bold px-2.5 py-1 rounded max-w-fit">
                      REGISTRO: PX-{patientData.age}{patientData.gender[0]}
                    </span>
                  </div>

                  {/* Vitals Bento grid & Personal Data */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-4" id="badge-metrics-grid">
                    <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 font-bold block">EDAD / SEXO</span>
                      <span className="text-slate-200 font-bold">{patientData.age} AÑOS | {patientData.gender === 'Masculino' ? 'M' : patientData.gender === 'Femenino' ? 'F' : 'OTRO'}</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 font-bold block">PESO / ESTATURA</span>
                      <span className="text-slate-200 font-bold">{patientData.weight} KG | {patientData.height} CM</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 font-bold block">TIPO SANGRE</span>
                      <span className="text-slate-300 font-bold uppercase">{patientData.bloodType || 'A+'}</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 font-bold block">PROFESIÓN</span>
                      <span className="text-slate-350 font-bold uppercase truncate block" title={patientData.occupation}>{patientData.occupation || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Vitals status bars */}
                  <div className="space-y-2 text-xs font-mono" id="badge-vitals-bars">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">MÉTRICAS CLÍNICAS DIGITALIZADAS EMITIDAS</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded px-3 border border-slate-950">
                        <span className="text-slate-400">🔥 Frec. Cardíaca:</span>
                        <span className="text-slate-200 font-bold">{patientData.vitals.heartRate} LPM</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded px-3 border border-slate-950">
                        <span className="text-slate-400">⚡ Presión Arterial:</span>
                        <span className="text-slate-200 font-bold">{patientData.vitals.systolicBP}/{patientData.vitals.diastolicBP} mmHg</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded px-3 border border-slate-950">
                        <span className="text-slate-400">💧 Saturación O₂:</span>
                        <span className="text-slate-200 font-bold">{patientData.vitals.oxygenSaturation}% SpO2</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded px-3 border border-slate-950">
                        <span className="text-slate-400">🌡️ Temperatura:</span>
                        <span className="text-slate-200 font-bold">{patientData.vitals.temperature}°C</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded px-3 border border-slate-950">
                        <span className="text-slate-400">🧪 Glucosa Capilar:</span>
                        <span className="text-purple-300 font-bold">{patientData.vitals.glucose} mg/dL</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded px-3 border border-slate-950">
                        <span className="text-slate-400">🤕 Escala del Dolor:</span>
                        <span className="text-rose-400 font-bold">{patientData.vitals.painLevel}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-950/30 border border-cyan-900/30 p-3 rounded-xl mt-2 text-xs" id="badge-diagnosis-desc">
                  <span className="text-[9px] text-cyan-400 font-bold font-mono tracking-widest block mb-1">REPLICACIÓN DE DIAGNÓSTICO INTEGRADO</span>
                  <p className="text-slate-300 font-mono font-medium leading-relaxed">
                    Paciente {patientData.name}, género biológico {patientData.gender === 'Femenino' ? 'Femenino' : 'Masculino'}, presenta sintomatología primaria con sospecha diagnóstica de <strong className="text-cyan-400">{report?.resumenClinico.problemaPrincipal.toUpperCase() || 'CUADRO MÉDICO AGUDO'}</strong>. Sincronización fotorrealista de biomarcadores renderizada exitosamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-xs flex items-start gap-2.5 animate-fade-in print:hidden" id="error-banner">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-bold">Error de Procesamiento Diagnóstico</p>
                <p className="mt-1 font-mono text-[10px] bg-red-100/50 p-2 rounded-md">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Report Viewer Section */}
          {diagnosed && report && (
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xl space-y-6 animate-fade-in text-left print:hidden" id="report-view-card">
              
              {/* Header with quick facts */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100" id="report-card-heading">
                <div>
                  <h3 className="text-md font-extrabold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    REPORTE DIAGNÓSTICO ESTIMADO DoctorISMO
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Resultado generado con rigor clínico automatizado</p>
                </div>
                <div className="text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-mono font-bold flex items-center gap-1.5" id="verified-doctorismo-badge">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ANALIZANTE: COMPLETO
                </div>
              </div>

              {/* Patient brief summary intro */}
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-2 text-xs" id="summary-section">
                <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest block">1️⃣ Resumen Clínico Estructurado</span>
                <p className="text-slate-800 font-semibold leading-relaxed">{report.resumenClinico.sintesis}</p>
                <p className="text-slate-700 font-medium">
                  <strong className="text-semibold text-slate-900 border-b border-dotted pb-0.5 inline-block">Problema principal detectado:</strong> {report.resumenClinico.problemaPrincipal}
                </p>
                
                {report.resumenClinico.hallazgosClave.length > 0 && (
                  <div className="mt-2.5" id="key-pathologies">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Hallazgos Fisiológicos de Alarma:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.resumenClinico.hallazgosClave.map((item, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
                          📌 {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Report Navigation Tabs */}
              <div className="flex border-b border-slate-200" id="report-tabs">
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                    activeTab === 'diff' ? 'border-primary-600 text-blue-600 border-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  id="tab-diff"
                >
                  Diferenciales (ADA & AMBOSS)
                </button>
                <button
                  onClick={() => setActiveTab('physio')}
                  className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                    activeTab === 'physio' ? 'border-primary-600 text-blue-600 border-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  id="tab-physio"
                >
                  Cascada Fisiopatológica
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                    activeTab === 'tests' ? 'border-primary-600 text-blue-600 border-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  id="tab-tests"
                >
                  Estudios Clave
                </button>
                <button
                  onClick={() => setActiveTab('rx')}
                  className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                    activeTab === 'rx' ? 'border-primary-600 text-blue-600 border-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  id="tab-rx"
                >
                  Líneas de Tratamiento
                </button>
              </div>

              {/* Tab Contents */}
              <div className="py-2" id="report-tab-content">
                {/* 1. Diferenciales */}
                {activeTab === 'diff' && (
                  <div className="space-y-4 animate-fade-in" id="content-diff">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">4️⃣ Diagnósticos Diferenciales Estimados</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4" id="differential-cards">
                      {report.diagnosticosDiferenciales.probables.map((item, idx) => {
                        const isMain = item.categoria === 'Principal';
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border transition-all ${
                              isMain ? 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-200' : 'bg-slate-50 border-slate-100'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="text-xs font-bold text-slate-800">
                                {isMain && <span className="inline-block mr-1">🥇</span>}
                                {item.diagnostico}
                              </h4>
                              <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                                isMain ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {item.categoria}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">{item.explicacion}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-emerald-50/55 p-2 rounded-lg border border-emerald-100">
                                <span className="text-[9px] font-bold text-emerald-800 uppercase block mb-0.5">A favor (Clínica concordante)</span>
                                <p className="text-emerald-950 font-medium">{item.favor}</p>
                              </div>
                              <div className="bg-rose-50/55 p-2 rounded-lg border border-rose-100">
                                <span className="text-[9px] font-bold text-rose-800 uppercase block mb-0.5">En contra (Incoherencia de cuadro)</span>
                                <p className="text-rose-950 font-medium">{item.contra}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Fisiopatologia y Correlacion */}
                {activeTab === 'physio' && (
                  <div className="space-y-4 animate-fade-in" id="content-physio">
                    <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl" id="cascade-mechanism">
                      <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest block">2️⃣ Análisis Fisiopatológico Detallado</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {report.analisisFisiopatologico.mecanismos}
                      </p>
                      <div className="border-t border-slate-200/60 my-2 pt-2">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">Propagación y Relación de Sistemas Afectados:</span>
                        <p className="text-xs text-slate-600">{report.analisisFisiopatologico.relaciones}</p>
                      </div>
                      <div className="bg-purple-100/40 p-2.5 rounded-lg border border-purple-200 text-xs">
                        <span className="text-[9px] font-bold text-purple-900 block uppercase">Procesos inflamatorios / etiológicos:</span>
                        <p className="text-purple-950 font-semibold italic mt-0.5">{report.analisisFisiopatologico.procesos}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2" id="correlacion-details">
                      <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest block">3️⃣ Correlación Clínico-Sintomática</span>
                      <p className="text-xs text-slate-700">{report.correlacionClinica.correlacion}</p>
                      <p className="text-xs text-slate-600 italic"><strong>Identificación de patrones:</strong> {report.correlacionClinica.patrones}</p>
                    </div>
                  </div>
                )}

                {/* 3. Estudios sugeridos */}
                {activeTab === 'tests' && (
                  <div className="space-y-4 animate-fade-in" id="content-tests">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">5️⃣ Estudios Complementarios de Laboratorio e Imagen</span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="studi-sugg-cards">
                      {report.estudiosSugeridos.map((std, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 hover:shadow-md transition-all">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                            std.prioridad === 'Alta' ? 'bg-red-100 text-red-800 border border-red-200' :
                            std.prioridad === 'Media' ? 'bg-orange-100 text-orange-850 border border-orange-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {std.prioridad}
                          </span>
                          <div className="text-xs">
                            <h5 className="font-extrabold text-slate-800 leading-snug">{std.nombre}</h5>
                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">{std.justificacion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Lineas de manejo estandar */}
                {activeTab === 'rx' && (
                  <div className="space-y-4 animate-fade-in" id="content-rx">
                    <div className="p-4 bg-emerald-50/45 border border-emerald-100 rounded-xl space-y-3" id="rx-card-main">
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">6️⃣ Orientación Terapéutica General</span>
                      
                      <div className="space-y-1.5" id="rx-lines">
                        <span className="text-[10px] text-emerald-900 font-bold uppercase block">Líneas de Manejo Convencional:</span>
                        <ul className="list-disc pl-4 text-xs space-y-1 text-slate-700">
                          {report.orientacionTerapeutica.lineasManejo.map((line, idx) => (
                            <li key={idx} className="font-medium">{line}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-xs text-slate-700 pt-1 pb-1">
                        <strong>Opciones estándar:</strong> {report.orientacionTerapeutica.opcionesEstandar}
                      </p>
                      
                      <div className="bg-yellow-50 p-2.5 rounded-lg border border-yellow-200 text-xs text-yellow-900 flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[10px] uppercase">Consideraciones de Seguridad Clínica:</span>
                          <p className="leading-snug mt-0.5 text-yellow-950 font-medium">{report.orientacionTerapeutica.seguridad}</p>
                        </div>
                      </div>

                      <div className="border-t border-emerald-200 pt-2 text-xs text-slate-600">
                        <strong>Criterio de referencia:</strong> {report.orientacionTerapeutica.referenciaSegundoNivel}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Red Flags / emergency markers */}
              {report.criteriosAlerta.length > 0 && (
                <div className="bg-red-950 border border-red-800 p-4 rounded-xl text-red-200 space-y-3" id="red-flags-panel">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">7️⃣ Criterios de Alerta de Urgencia Crítica (Red Flags)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="alerts-grid">
                    {report.criteriosAlerta.map((alert, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/40 border border-red-900/50 rounded-lg text-xs space-y-1 text-left">
                        <p className="font-bold text-red-300">🚨 {alert.indicador}</p>
                        <p className="text-[11px] text-slate-400"><strong>Parámetro gatillante:</strong> {alert.parametroCritico}</p>
                        <p className="text-[11px] text-red-400 font-semibold"><strong>Acción de emergencia:</strong> {alert.accionInmediata}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pronosticos y Limitaciones del diagnostico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs text-left" id="prognosis-warnings">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl" id="prog-card">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">8️⃣ Pronóstico y Vigilancia</span>
                  </div>
                  <p className="text-slate-700 leading-normal">{report.pronosticoSeguimiento.evolucionEsperada}</p>
                  <p className="text-slate-600 mt-2"><strong>Factores modificantes:</strong> {report.pronosticoSeguimiento.factoresModificantes}</p>
                  <p className="text-slate-500 mt-1"><strong>Vigilancia médica:</strong> {report.pronosticoSeguimiento.vigilanciaRecomendada}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl" id="limitation-card">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">9️⃣ Limitaciones de Presición</span>
                  </div>
                  <ul className="list-disc pl-4 text-slate-600 space-y-1">
                    {report.limitaciones.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* Printable Navy Blue Report PDF Section */}
          {diagnosed && (
            <PrintableReport 
              patientData={patientData}
              report={report}
              avatarUrl={avatarUrl}
            />
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-[10px] text-slate-400 space-y-1 relative z-10 print:hidden" id="main-footer">
        <p className="font-semibold text-slate-500">DoctorISMO IA © Todos los derechos reservados.</p>
        <p className="max-w-md mx-auto leading-relaxed">
          Este sistema es puramente para fines de apoyo clínico e interactivo. No prescribe dosis específicas ni reemplaza el diagnóstico oficial de un facultativo médico colegiado.
        </p>
      </footer>
    </div>
  );
}
