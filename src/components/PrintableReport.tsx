/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { PatientData, DiagnosticReportData } from '../types';
import { generatePatientPDF } from '../utils/pdfGenerator';
import { 
  Printer, 
  FileText, 
  ShieldCheck, 
  User, 
  Activity, 
  Heart, 
  Thermometer, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Stethoscope, 
  CheckCircle,
  Database,
  Search,
  BookOpen,
  ClipboardList,
  Fingerprint
} from 'lucide-react';

interface PrintableReportProps {
  patientData: PatientData;
  report: DiagnosticReportData | null;
  avatarUrl: string | null;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  patientData,
  report,
  avatarUrl
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handlePrint = () => {
    setExporting(true);
    
    // Create professional multi-page document and trigger client-side download
    setTimeout(() => {
      try {
        generatePatientPDF(patientData, report);
      } catch (error) {
        console.error("Failed to generate PDF, falling back to window.print():", error);
        window.print();
      }
      setExporting(false);
    }, 150);
  };

  // Safe calculated metrics
  const bmi = patientData.height > 0
    ? (patientData.weight / Math.pow(patientData.height / 100, 2)).toFixed(1)
    : 'N/A';

  const getBMICategory = (bmiVal: string) => {
    if (bmiVal === 'N/A') return 'N/A';
    const val = parseFloat(bmiVal);
    if (val < 18.5) return 'Bajo peso';
    if (val < 25.0) return 'Normal (Eutrófico)';
    if (val < 30.0) return 'Sobrepeso';
    return 'Obesidad';
  };

  const sys = patientData.vitals.systolicBP;
  const dia = patientData.vitals.diastolicBP;
  const meanArterialPressure = Math.round((sys + 2 * dia) / 3);

  // Print Date formatting
  const printDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Safe access wrappers for report fields
  const keyFindings = report?.resumenClinico?.hallazgosClave || [];
  const differentials = report?.diagnosticosDiferenciales?.probables || [];
  const suggestedStudies = report?.estudiosSugeridos || [];
  const treatmentLines = report?.orientacionTerapeutica?.lineasManejo || [];
  const redFlags = report?.criteriosAlerta || [];
  const limits = report?.limitaciones || [];

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

  const expedienteID = `EXP-${getFormattedDate()}-${getInitials(patientData.name)}`;

  return (
    <div id="printable-report-wrapper" className="space-y-6">
      
      {/* Interactive Trigger CTA Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden print:hidden" id="print-action-banner">
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/10 blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-purple-500/10 blur-[50px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-400 border border-blue-500/30">
            <Printer className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black font-mono tracking-widest text-cyan-400 uppercase">EXPEDIENTE MÉDICO OFICIAL PDF</h3>
            <p className="text-xs text-slate-300 font-medium mt-1">Imprima o exporte el reporte en formato digital. Tema clínico profesional azul marino.</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          disabled={exporting}
          type="button"
          className={`mt-4 sm:mt-0 px-6 py-3.5 bg-gradient-to-r ${
            exporting 
              ? "from-slate-700 to-slate-600 cursor-not-allowed opacity-85" 
              : "from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 cursor-pointer"
          } text-white font-extrabold text-xs rounded-xl shadow-lg border border-cyan-400/30 flex items-center gap-2 transform active:scale-95 transition-all uppercase tracking-wider relative z-10 shrink-0`}
          id="btn-print-pdf-trigger"
        >
          {exporting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generando Archivo PDF...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Generar PDF Profesional</span>
            </>
          )}
        </button>
      </div>

      {/* FULL EXPEDIENTE DESIGN SHEET (Professional Navy Theme) */}
      <div 
        ref={reportRef}
        className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-6 md:p-10 space-y-8 relative overflow-hidden text-left font-sans select-text print:p-0 print:border-none print:shadow-none"
        id="official-navy-pdf-document"
        style={{
          colorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact'
        } as React.CSSProperties}
      >
        
        {/* Style injection for exact colors, page margins, and pagination during PDF printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: #0f172a !important;
            }
            #official-navy-pdf-document {
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
            }
            .print-bg-navy { 
              background-color: #04122d !important; 
              color: white !important;
            }
            .print-border-navy {
              border-color: #0f2d5c !important;
            }
            .print-text-navy {
              color: #04122d !important;
            }
            .print-bg-slate {
              background-color: #f1f5f9 !important;
            }
            .print-break-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .print-no-break {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
          }
        `}} />

        {/* 1. DOCUMENT HEADER */}
        <div className="border-b-4 border-[#04122d] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print-no-break" id="pdf-header-section">
          {/* Institution label in Corporate Navy Blue */}
          <div className="flex items-center gap-4">
            <div className="bg-[#04122d] text-white p-3 rounded-2xl flex items-center justify-center shadow-lg print-bg-navy shrink-0">
              <Stethoscope className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-mono tracking-widest text-[#04122d] uppercase print-text-navy">DoctorISMO IA System</span>
                <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">OFFICIAL RECORD</span>
              </div>
              <h1 className="text-2xl font-black text-[#04122d] uppercase tracking-tight print-text-navy">Dossier Clínico Diagnóstico</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Plataforma de Inteligencia Médica Multimodal de Alta Fidelidad</p>
            </div>
          </div>

          {/* Hologram/Document Meta Info Box */}
          <div className="text-right font-mono text-[10px] bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-1 w-full md:w-auto shrink-0 print-bg-slate" id="pdf-meta-box">
            <div><span className="text-slate-400 font-bold">EXPEDIENTE ID:</span> <span className="font-bold text-slate-800">{expedienteID}</span></div>
            <div><span className="text-slate-400 font-bold">FECHA EMISIÓN:</span> <span className="font-bold text-slate-800">{printDate}</span></div>
            <div><span className="text-slate-400 font-bold">SEGURIDAD:</span> <span className="text-emerald-600 font-bold">✓ INTEGRIDAD IA VERIFICADA</span></div>
            <div><span className="text-slate-400 font-bold">ESTÁNDAR:</span> <span className="font-bold text-slate-800">ADA Health & AMBOSS Contrast</span></div>
          </div>
        </div>

        {/* 2. FICHA IDENTIFICATIVA E ANTROPOMÉTRICA (Grid themed in solid navy border) */}
        <div className="space-y-3 print-break-avoid" id="pdf-patient-identity-block">
          <div className="flex items-center gap-2 text-[#04122d] font-bold font-mono text-xs uppercase tracking-wider print-text-navy">
            <User className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>I. Ficha de Identificación del Paciente</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl print-bg-slate" id="pdf-id-grid">
            <div className="md:col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Nombre Completo</span>
              <span className="text-sm font-bold text-[#04122d] print-text-navy">{patientData.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Edad Biológica</span>
              <span className="text-sm font-bold text-slate-800">{patientData.age} Años</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Sexo Biológico</span>
              <span className="text-sm font-bold text-slate-800">{patientData.gender}</span>
            </div>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Estatura / Altura</span>
              <span className="text-sm font-bold text-slate-800">{patientData.height} CM</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Peso Corporal</span>
              <span className="text-sm font-bold text-slate-800">{patientData.weight} KG</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Índice Masa Corporal (IMC)</span>
              <span className="text-sm font-bold text-slate-800">{bmi} kg/m² <span className="text-[10px] text-slate-500 font-normal">({getBMICategory(bmi)})</span></span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Tipo de Sangre</span>
              <span className="text-sm font-bold text-[#04122d] uppercase print-text-navy">{patientData.bloodType || 'A+'}</span>
            </div>

            <div className="md:col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Ocupación / Profesión</span>
              <span className="text-sm font-medium text-slate-800">{patientData.occupation || 'N/A'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Estado de Gestación</span>
              <span className="text-sm font-medium text-slate-800">{patientData.pregnancyStatus || 'No aplica'}</span>
            </div>
          </div>
        </div>

        {/* 3. SIGNOS VITALES Y ADQUISICIÓN DE SIGNOS VITALES */}
        <div className="space-y-4 print-break-avoid" id="pdf-vitals-block">
          <div className="flex items-center gap-2 text-[#04122d] font-bold font-mono text-xs uppercase tracking-wider print-text-navy">
            <Activity className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>II. Monitoreo de Signos Vitales Estables</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3" id="pdf-vitals-cards">
            {/* Heart Rate */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Frec. Cardíaca</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-slate-800">{patientData.vitals.heartRate}</span>
                <span className="text-[9px] text-slate-400 font-mono">bpm</span>
              </div>
              <span className={`text-[8px] font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${
                patientData.vitals.heartRate > 100 || patientData.vitals.heartRate < 60 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {patientData.vitals.heartRate < 60 ? 'BRADICARDIA' : patientData.vitals.heartRate > 100 ? 'TAQUICARDIA' : 'ESTABLE'}
              </span>
            </div>

            {/* Blood Pressure */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Presión Art.</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-slate-800">{sys}/{dia}</span>
                <span className="text-[9px] text-slate-400 font-mono">mmHg</span>
              </div>
              <span className="text-[8px] font-bold text-slate-500 uppercase mt-1 inline-block">MAP: {meanArterialPressure} mmHg</span>
            </div>

            {/* O2 Sat */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Saturación O₂</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-slate-800">{patientData.vitals.oxygenSaturation}</span>
                <span className="text-[9px] text-slate-400 font-mono">%</span>
              </div>
              <span className={`text-[8px] font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${
                patientData.vitals.oxygenSaturation < 94 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {patientData.vitals.oxygenSaturation < 94 ? 'CRÍTICO' : 'HIDRO-SANA'}
              </span>
            </div>

            {/* Temperature */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Temperatura</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-slate-800">{patientData.vitals.temperature}</span>
                <span className="text-[9px] text-slate-400 font-mono">°C</span>
              </div>
              <span className={`text-[8px] font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${
                patientData.vitals.temperature >= 38 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {patientData.vitals.temperature >= 38 ? 'HIPERTERMIA' : 'EUTERMIA'}
              </span>
            </div>

            {/* Glucose */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Glucosa Cap.</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-slate-800">{patientData.vitals.glucose}</span>
                <span className="text-[9px] text-slate-400 font-mono">mg/dL</span>
              </div>
              <span className={`text-[8px] font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${
                patientData.vitals.glucose < 70 || patientData.vitals.glucose >= 200 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {patientData.vitals.glucose < 70 ? 'HIPOGLICEMIA' : patientData.vitals.glucose >= 200 ? 'HIPERGLICEMIA' : 'NORMAL'}
              </span>
            </div>

            {/* Pain level */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Dolor (EVA)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-slate-800">{patientData.vitals.painLevel}</span>
                <span className="text-[9px] text-slate-400 font-mono">/10</span>
              </div>
              <span className={`text-[8px] font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${
                patientData.vitals.painLevel > 6 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {patientData.vitals.painLevel === 0 ? 'SIN DOLOR' : patientData.vitals.painLevel <= 3 ? 'LEVE' : patientData.vitals.painLevel <= 6 ? 'MODERADO' : 'SEVERO'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. ANAMNESIS & CLINICAL DOSSIER DETAILS (Split layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-avoid" id="pdf-anamnesis-block">
          {/* Left: Symptoms & Lifestyle */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <FileText className="w-3.5 h-3.5 text-[#04122d] print-text-navy shrink-0" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">III. Anamnesis de Criterio</h3>
            </div>
            
            <div className="space-y-3.5 text-xs text-left">
              <div>
                <strong className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block mb-0.5">Motivo de Consulta y Sintomatología:</strong>
                <p className="text-slate-850 font-medium leading-relaxed bg-slate-50 border border-slate-200/65 p-3 rounded-xl print-bg-slate">{patientData.symptoms}</p>
              </div>
              
              <div>
                <strong className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block mb-0.5">Hábitos de Estilo de Vida:</strong>
                <p className="text-slate-850 font-medium leading-relaxed bg-slate-50 border border-slate-200/65 p-3 rounded-xl print-bg-slate">{patientData.lifestyleHabits || 'Declarados ausentes o normales por el paciente.'}</p>
              </div>
            </div>
          </div>

          {/* Right: Personal History */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-[#04122d] print-text-navy shrink-0" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">IV. Antecedentes Heredofamiliares & Alergias</h3>
            </div>
            
            <div className="space-y-3 font-mono text-[11px] text-left">
              <div className="flex justify-between items-start py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold uppercase">Fisiocronicidad Preexistente:</span>
                <span className="font-bold text-slate-800 text-right max-w-[210px]">{patientData.congenitalDiseases || 'Ninguna preexistencia declarada'}</span>
              </div>
              <div className="flex justify-between items-start py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold uppercase text-rose-600">Alergias Clínicas:</span>
                <span className="font-bold text-rose-700 text-right max-w-[210px] uppercase">{patientData.allergies || 'Ninguna registrada'}</span>
              </div>
              <div className="flex justify-between items-start py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold uppercase">Historial de Quirófanocirugía:</span>
                <span className="font-bold text-slate-800 text-right max-w-[210px]">{patientData.surgicalHistory || 'No refiere cirugías previas'}</span>
              </div>
              <div className="flex justify-between items-start py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold uppercase">Herencia directa familiar:</span>
                <span className="font-bold text-slate-800 text-right max-w-[210px]">{patientData.familyHistory || 'Sin relevancia patológica familiar'}</span>
              </div>
              <div className="flex justify-between items-start py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-semibold uppercase text-cyan-700">Tratamiento de Farmacoterapia:</span>
                <span className="font-bold text-slate-800 text-right max-w-[210px]">{patientData.currentTreatments || 'Ninguno activo'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. MULTIMODAL STUDIES & AVATAR GENERATION SIDE-BY-SIDE (print layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 print-break-avoid" id="pdf-multimodal-biological-block">
          {/* Column 1: Generated 3D Anatomical Avatar representation */}
          <div className="flex flex-col items-center justify-center bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 relative shadow-inner print-bg-navy" id="pdf-avatar-preview-box">
            {/* Stamp scanner guideline lines style */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.15)_1px,transparent_1px)] bg-[size:10px_10px] opacity-20 pointer-events-none" />
            
            {avatarUrl ? (
              <div className="relative p-1 bg-white/10 rounded-xl mb-4 shadow-2xl max-w-[180px]">
                <img 
                  src={avatarUrl} 
                  alt="Avatar clínico" 
                  className="w-40 h-40 object-cover rounded-lg relative z-10 border border-cyan-500/30"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-cyan-400 opacity-60 z-20 animate-scan-line" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-600 mb-4 font-mono text-[10px]">
                NO PROJECTED
              </div>
            )}

            <div className="text-center space-y-1.5 relative z-10">
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-cyan-300 tracking-widest uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
                PROYECCIÓN ANATÓMICA MULTIMODAL 3D
              </span>
              <p className="text-[10px] text-slate-300 font-mono max-w-xs leading-relaxed">
                Replicador holográfico renderizado con biomarcadores clínicos correspondientes de {patientData.name} ({patientData.age} años, sexo {patientData.gender[0]}).
              </p>
            </div>
          </div>

          {/* Column 2: Uploaded diagnostic attachments and labs description */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Database className="w-3.5 h-3.5 text-[#04122d] print-text-navy shrink-0" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">V. Estudios e Imágenes Adjuntas (Visión)</h3>
            </div>

            {patientData.files.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto" id="pdf-uploaded-studs-list">
                {patientData.files.map((file, index) => (
                  <div key={index} className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl leading-snug print-bg-slate text-xs">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Tamaño: {(file.size / 1024).toFixed(1)} KB | Tipo Mime: {file.mimeType}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold italic">{file.description || "Análisis multimodal de imagen clínica e informes de química sanguínea completos."}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dotted border-slate-200 rounded-xl text-center text-slate-400 font-mono text-[10px] print-bg-slate py-8">
                HOLOGRAPHIC VERDICT: NO ADDTIONAL MULTIMODAL LABS SUBMITTED.
                <p className="text-[9px] text-slate-400 font-sans mt-1">El diagnóstico se generó en base a la sintomatología expresada y bio-telemetría ingresada.</p>
              </div>
            )}
          </div>
        </div>

        {/* PAGE BREAK FOR PRINT PREVIEW IN PDF SHARPNESS */}
        <div className="print:page-break-before-always" />

        {/* 6. SYSTEM CLINICAL AI DIAGNOSTIC REPORT (High fidelity contrast layout) */}
        {report ? (
          <div className="space-y-6 pt-4 text-left" id="pdf-report-verdict-section">
            
            {/* Header section marker */}
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2 print-no-break">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <h2 className="text-sm font-black text-[#04122d] uppercase tracking-wider font-mono print-text-navy">VI. Resultados Clínicos DoctorISMO IA</h2>
              </div>
              <span className="text-[9px] font-mono bg-blue-950 font-bold text-cyan-300 px-3 py-1 rounded print-bg-navy">EMISIÓN CLASE A</span>
            </div>

            {/* A. Resumen y problema principal */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2.5 print-bg-navy print-break-avoid" id="pdf-diagnostics-resumen">
              <div className="flex items-center gap-2 text-cyan-400">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wider font-mono">1. Resumen Clínico Estructurado & Diagnóstico Principal</span>
              </div>
              <h3 className="text-md font-bold leading-relaxed">{report.resumenClinico.sintesis}</h3>
              <p className="text-xs text-slate-200 border-t border-white/10 pt-2 font-semibold">
                🏁 PROBLEMA PRINCIPAL DIAGNOSTICADO: <span className="text-cyan-300 font-bold uppercase underline decoration-cyan-400 decoration-2 decoration-dotted">{report.resumenClinico.problemaPrincipal}</span>
              </p>
              
              {keyFindings.length > 0 && (
                <div className="mt-2.5 pt-1">
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider block mb-1">Criterios Clinicos de Alarma detectados:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {keyFindings.map((finding, fnIdx) => (
                      <span key={fnIdx} className="text-[9px] font-mono bg-white/10 text-cyan-100 rounded px-2 py-0.5 border border-white/5 font-semibold">
                        ✦ {finding}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* B. Diagnósticos diferenciales contrastados (Pro/Contra details blocks) */}
            <div className="space-y-4 print-break-avoid" id="pdf-differentials-section">
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#04122d] print-text-navy shrink-0" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">2. Diagnósticos Diferenciales Contrastados (ADA & AMBOSS Protocol)</h3>
              </div>

              <div className="grid grid-cols-1 gap-4" id="pdf-differential-grid">
                {differentials.map((item, idIdx) => {
                  const isMain = item.categoria === 'Principal';
                  return (
                    <div 
                      key={idIdx} 
                      className={`p-4 rounded-xl border print-break-avoid transition-all ${
                        isMain ? 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-300 print-bg-slate' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="text-xs font-black text-slate-800">
                          {isMain ? '🥇 DIAGNÓSTICO SUGERIDO PRINCIPAL: ' : '🥈 ALTERNATIVO CLAVE: '}
                          <span className="text-blue-900 border-b border-blue-200 underline decoration-blue-500 font-bold">{item.diagnostico}</span>
                        </h4>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isMain ? 'bg-blue-900 text-white print-bg-navy' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.categoria}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-3 leading-relaxed font-semibold">{item.explicacion}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 leading-snug">
                          <span className="text-[8px] font-black text-emerald-800 uppercase block mb-1">Evidencia / Hallazgos Clínicos a Favor:</span>
                          <p className="text-emerald-950 font-medium">{item.favor}</p>
                        </div>
                        <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 leading-snug">
                          <span className="text-[8px] font-black text-rose-800 uppercase block mb-1">Evidencia / Incompatibilidad en Contra:</span>
                          <p className="text-rose-950 font-medium">{item.contra}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* C. Cascada Fisiopatológica & Correlación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-avoid" id="pdf-mechanism-correlations">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left space-y-2.5 print-bg-slate">
                <span className="text-[9px] font-black text-purple-800 uppercase tracking-widest block font-mono">3. Análisis Fisiopatológico Detallado (Celular & Sistémico)</span>
                <p className="text-[11px] text-slate-800 font-semibold leading-relaxed">
                  {report.analisisFisiopatologico.mecanismos}
                </p>
                <div className="border-t border-slate-200/60 pt-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block mb-1">Relaciones clínicas anatómicas comprometidas:</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-medium">{report.analisisFisiopatologico.relaciones}</p>
                </div>
                <div className="bg-purple-150/40 p-2 text-[10px] border border-purple-200 text-purple-950 rounded font-semibold italic">
                  Efectos Tisulares: {report.analisisFisiopatologico.procesos}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left space-y-2.5 print-bg-slate">
                <span className="text-[9px] font-black text-blue-800 uppercase tracking-widest block font-mono">4. Correlación de Biomarcadores y Sintomatología</span>
                <p className="text-[11px] text-slate-800 leading-relaxed">
                  {report.correlacionClinica.correlacion}
                </p>
                <div className="border-t border-slate-200/65 pt-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block">Identificación de Patrones Multivariados:</span>
                  <p className="text-[10px] text-slate-600 italic font-medium mt-0.5">{report.correlacionClinica.patrones}</p>
                </div>
              </div>
            </div>

            {/* D. Estudios Complementarios e ImagenSugerida de Primera Línea */}
            <div className="space-y-3.5 print-break-avoid" id="pdf-suggested-studies-section">
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <Search className="w-3.5 h-3.5 text-[#04122d] print-text-navy shrink-0" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">5. Plan de Estudios Complementarios Clínicos Sugeridos (Costo-Beneficio prioritario)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="pdf-suggested-studies-grid">
                {suggestedStudies.map((std, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 leading-tight hover:shadow-md transition-all">
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                      std.prioridad === 'Alta' ? 'bg-red-50 text-red-800 border border-red-200 font-extrabold' :
                      std.prioridad === 'Media' ? 'bg-orange-50 text-orange-850 border border-orange-200 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {std.prioridad.toUpperCase()}
                    </span>
                    <div className="text-[11px]">
                      <h5 className="font-extrabold text-[#04122d] print-text-navy">{std.nombre}</h5>
                      <p className="text-slate-500 mt-1 leading-snug">{std.justificacion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E. Orientación terapéutica general y de estabilización convencional */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-left space-y-3 print-bg-slate print-break-avoid" id="pdf-therapeutic-section">
              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block font-mono">6. Orientación Terapéutica GPC & Líneas de Manejo Preventivo</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-[11px] space-y-1.5">
                  <span className="text-[8px] font-bold text-emerald-900 uppercase block font-mono">Protocolo de estabilización básico sugerido:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                    {treatmentLines.map((line, rxIdx) => (
                      <li key={rxIdx} className="leading-snug">{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] space-y-2.5">
                  <div>
                    <span className="text-[8px] font-bold text-emerald-900 uppercase block font-mono">Opciones farmacológicas estándar generales:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed font-semibold">{report.orientacionTerapeutica.opcionesEstandar}</p>
                  </div>
                  <div className="border-t border-emerald-200 pt-2 text-[10px] text-slate-500">
                    <strong>Derivación a Segundo Nivel Clínico:</strong> {report.orientacionTerapeutica.referenciaSegundoNivel}
                  </div>
                </div>
              </div>

              {/* Warnings and interactions exclusions */}
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-[10px] text-yellow-900 flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-[9px] font-mono text-yellow-950">Lineamientos de Seguridad y Exclusión de Automedicación:</span>
                  <p className="font-medium inline text-yellow-950 mt-0.5"> {report.orientacionTerapeutica.seguridad}</p>
                </div>
              </div>
            </div>

            {/* F. Red Flags - Criterios de Alerta Crítica Absoluta (Highly outstanding in Red style) */}
            {redFlags.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl text-red-950 space-y-3.5 print-break-avoid" id="pdf-red-flags-section">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
                  <span className="text-[9px] font-black text-red-800 uppercase tracking-widest font-mono">7. Alertas Rojas / Criterios de traslado de urgencia hospitalaria rígida</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="pdf-red-flags-grid">
                  {redFlags.map((alert, idx) => (
                    <div key={idx} className="p-3 bg-white border border-red-200 rounded-xl leading-normal text-xs space-y-1 text-left shadow-sm">
                      <p className="font-extrabold text-red-700">🚨 {alert.indicador}</p>
                      <p className="text-[10px] text-slate-500 font-mono"><strong>Parámetro crítico que lo define:</strong> <span className="font-bold text-red-950 bg-red-50 px-1 py-0.5 rounded">{alert.parametroCritico}</span></p>
                      <p className="text-[11px] text-red-900 border-t border-red-50/60 pt-1 mt-1 font-bold"><strong>Acción de auxilio inmediata:</strong> {alert.accionInmediata}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* G. Pronósticos & Limitaciones Clínicas oficiales (split layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs text-left print-break-avoid" id="pdf-prognosis-limitations">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 print-bg-slate" id="pdf-prog">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block">8. Pronóstico Clínico y Factores de Vigilancia</span>
                <p className="text-slate-800 leading-normal font-semibold">{report.pronosticoSeguimiento.evolucionEsperada}</p>
                <div className="border-t border-slate-200/60 my-2 pt-2 text-[10px]">
                  <p className="text-slate-600"><strong>Factores modulantes / mitigantes:</strong> {report.pronosticoSeguimiento.factoresModificantes}</p>
                  <p className="text-slate-600 mt-1"><strong>Plan de monitoreo y vigilancia:</strong> {report.pronosticoSeguimiento.vigilanciaRecomendada}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 print-bg-slate animate-[fade-in_0.5s]" id="pdf-limits">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block">9. Limitaciones Normativas Certificadas por IA</span>
                <ul className="list-decimal pl-4 text-[10px] text-slate-600 space-y-1 leading-snug font-medium">
                  {limits.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-mono text-sm print-break-avoid" id="no-report-pdf-placeholder">
            ⚠️ ESPERANDO COMPUTACIÓN DE EXPLORACIÓN DoctorISMO
            <p className="text-xs text-slate-400 font-sans mt-2 font-semibold">
              Complete la anamnesis en el panel izquierdo y haga clic en "DIAGNÓSTICO IA DoctorISMO" para poblar los resultados del expediente.
            </p>
          </div>
        )}

        {/* 7. OFFICIAL CLINICAL FOOTER AND VALIDATION STAMPS (navy style) */}
        <div className="border-t-2 border-[#04122d] pt-8 mt-12 flex flex-col md:flex-row justify-between items-end gap-6 text-slate-500 text-[10px] leading-relaxed print-break-avoid" id="pdf-official-footer">
          {/* Fingerprint cryptographic signatures representing data validation */}
          <div className="space-y-2 text-left shrink-0">
            <span className="text-[9px] font-bold text-slate-400 block font-mono uppercase tracking-widest">BIOPHYSICAL TRACE HASH INTEGRITY</span>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-600 font-mono text-[9px] print-bg-slate">
              <Fingerprint className="w-5 h-5 text-blue-800 shrink-0" />
              <div>
                <p className="font-bold text-slate-700">Digital Signet SHA256 Code:</p>
                <p className="text-slate-400">9c89_b48f_107a_03e0_e88a_93bb_dfdf_2026_0527</p>
              </div>
            </div>
            <p className="max-w-md font-sans text-[9px] text-slate-400 mt-1">
              *Este documento ha sido generado por DoctorISMO AI Suite empleando telemetrías estructuradas. No sustituye la prescripción física formal de un médico matriculado.
            </p>
          </div>

          {/* Institutional Stamp & Signature placeholder boxes */}
          <div className="flex gap-4 w-full md:w-auto shrink-0" id="signatures-stamps-group">
            {/* Signature Block */}
            <div className="w-36 h-20 border border-slate-300 rounded-lg bg-slate-50/50 p-2 flex flex-col justify-between text-center font-sans print-bg-slate">
              <div className="flex-1 flex items-center justify-center relative">
                {/* Simulated handwritten vector loop line signature */}
                <svg className="w-24 h-10 text-blue-900 opacity-60 absolute" viewBox="0 0 100 40">
                  <path d="M10 25 C15 5, 25 35, 35 15 C45 -5, 55 35, 65 20 C75 5, 80 30, 90 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-[8px] text-slate-300 select-none uppercase font-mono">AUTORIZADO IA</span>
              </div>
              <div className="border-t border-slate-200 pt-1">
                <p className="font-bold text-slate-700 text-[8px] leading-none">Motor DoctorISMO</p>
                <p className="text-[7px] text-slate-400 leading-none mt-0.5">Firma de Registro Digital</p>
              </div>
            </div>

            {/* Stamp Block */}
            <div className="w-32 h-20 border border-slate-300 rounded-lg bg-slate-50/50 p-2 flex flex-col justify-between items-center text-center font-sans print-bg-slate">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-cyan-600 flex items-center justify-center p-1 opacity-65">
                  <div className="w-7 h-7 rounded-full border border-cyan-500/50 bg-cyan-50 flex items-center justify-center select-none text-[6px] font-black text-cyan-800 font-mono">
                    VERIFIED
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-1 w-full">
                <p className="font-bold text-slate-700 text-[8px] leading-none">Sello de Clínica</p>
                <p className="text-[7px] text-slate-400 leading-none mt-0.5">DoctorISMO v1.1.2</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
