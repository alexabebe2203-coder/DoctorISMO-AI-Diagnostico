/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PatientData, PatientFile, VitalSigns, DiagnosticReportData } from '../types';
import { ALL_COMMON_DISEASES_100 } from '../commonDiseases';
import { Upload, Activity, Heart, Thermometer, ShieldAlert, FileText, Sparkles, User, Database, Dumbbell, AlignLeft, BarChart2, Search, Video, Users, Trash2, Save, FileDown } from 'lucide-react';
import { generatePatientPDF } from '../utils/pdfGenerator';

interface PatientFormProps {
  patientData: PatientData;
  onChange: (data: PatientData) => void;
  onDiagnose: () => void;
  loading: boolean;
  report: DiagnosticReportData | null;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patientData,
  onChange,
  onDiagnose,
  loading,
  report
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'id' | 'anamnesis' | 'vitals' | 'habits' | 'patients'>('id');
  const [presetSearch, setPresetSearch] = useState('');

  const [savedPatients, setSavedPatients] = useState<PatientData[]>(() => {
    try {
      const data = localStorage.getItem('doctorismo_patients');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }
    // Pre-populate with our current patient data so they have a guide
    return [
      {
        name: 'Héctor Galdames',
        age: 69,
        gender: 'Masculino',
        bloodType: 'A-',
        weight: 87,
        height: 174,
        vitals: {
          heartRate: 142,
          systolicBP: 138,
          diastolicBP: 84,
          respiratoryRate: 20,
          temperature: 36.4,
          oxygenSaturation: 95,
          glucose: 104,
          painLevel: 6
        },
        symptoms: 'Fiebre persistente de 3 días acompañada de escalofríos intensos y disuria severa descrita de forma característica como "orinar fuego"...',
        congenitalDiseases: 'Diabetes Mellitus Tipo 2 diagnosticada hace 8 años en tratamiento activo con Metformina y Glibenclamida.',
        allergies: 'Sin alergias conocidas.',
        surgicalHistory: 'Colecistectomía abierta realizada hace 5 años sin complicaciones reportadas.',
        lifestyleHabits: 'Sedentarismo moderado, no fumador, consumo de alcohol ocasional social.',
        currentTreatments: 'Metformina 850mg c/12 horas y Glibenclamida 5mg c/24 horas.',
        familyHistory: 'Padre con antecedentes de Infarto Agudo al Miocardio a los 62 años e Hipertensión Arterial.',
        occupation: 'Contador de Oficina Jubilado',
        pregnancyStatus: 'No aplica',
        files: []
      }
    ];
  });

  const saveCurrentPatient = (dataToSave: PatientData) => {
    if (!dataToSave.name || !dataToSave.name.trim()) return;
    
    setSavedPatients((prev) => {
      const filtered = prev.filter(p => p.name.trim().toLowerCase() !== dataToSave.name.trim().toLowerCase());
      const updated = [dataToSave, ...filtered];
      try {
        localStorage.setItem('doctorismo_patients', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const deletePatient = (nameToDelete: string) => {
    setSavedPatients((prev) => {
      const updated = prev.filter(p => p.name.trim().toLowerCase() !== nameToDelete.trim().toLowerCase());
      try {
        localStorage.setItem('doctorismo_patients', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updateField = (field: keyof PatientData, value: any) => {
    onChange({
      ...patientData,
      [field]: value
    });
  };

  const updateVital = (vital: keyof VitalSigns, value: number) => {
    onChange({
      ...patientData,
      vitals: {
        ...patientData.vitals,
        [vital]: value
      }
    });
  };

  // Convert uploaded files to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = reader.result as string;
        const newFile: PatientFile = {
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
          description: `Estudio clínico adjunto. Tipo: ${file.name.split('.').pop()?.toUpperCase()}`
        };
        updateField('files', [...patientData.files, newFile]);
      };
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = patientData.files.filter((_, i) => i !== index);
    updateField('files', updatedFiles);
  };

  const loadPreset = (presetData: Partial<PatientData>) => {
    onChange({
      ...patientData,
      ...presetData,
      vitals: {
        ...patientData.vitals,
        ...(presetData.vitals || {})
      },
      files: [...patientData.files] // preserve current files
    });
  };

  // Helper function to dynamically evaluate clinical risk levels for sliders
  const getVitalsLevel = (vital: string, val: number) => {
    if (vital === 'heartRate') {
      if (val < 48 || val > 120) return { label: '🚨 Crítico', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500', barBg: 'bg-rose-500' };
      if (val < 60 || val > 100) return { label: '⚠️ Alerta', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500', barBg: 'bg-amber-500' };
      return { label: '✓ Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500', barBg: 'bg-emerald-500' };
    }
    if (vital === 'oxygenSaturation') {
      if (val < 90) return { label: '🚨 Crítico', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500', barBg: 'bg-rose-500' };
      if (val < 95) return { label: '⚠️ Alerta', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500', barBg: 'bg-amber-500' };
      return { label: '✓ Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500', barBg: 'bg-emerald-500' };
    }
    if (vital === 'temperature') {
      if (val < 35.5 || val >= 38.0) return { label: '🚨 Crítico', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500', barBg: 'bg-rose-500' };
      if (val < 36.1 || val > 37.2) return { label: '⚠️ Alerta', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500', barBg: 'bg-amber-500' };
      return { label: '✓ Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500', barBg: 'bg-emerald-500' };
    }
    if (vital === 'respiratoryRate') {
      if (val < 10 || val > 24) return { label: '🚨 Crítico', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500', barBg: 'bg-rose-500' };
      if (val < 12 || val > 20) return { label: '⚠️ Alerta', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500', barBg: 'bg-amber-500' };
      return { label: '✓ Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500', barBg: 'bg-emerald-500' };
    }
    if (vital === 'glucose') {
      if (val < 55 || val > 150) return { label: '🚨 Crítico', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500', barBg: 'bg-rose-500' };
      if (val < 70 || val > 105) return { label: '⚠️ Alerta', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500', barBg: 'bg-amber-500' };
      return { label: '✓ Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500', barBg: 'bg-emerald-500' };
    }
    if (vital === 'painLevel') {
      if (val >= 7) return { label: '🚨 Severo', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500', barBg: 'bg-rose-500' };
      if (val >= 4) return { label: '⚠️ Moderado', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500', barBg: 'bg-amber-500' };
      return { label: '✓ Leve / Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500', barBg: 'bg-emerald-500' };
    }
    return { label: '✓ Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500', barBg: 'bg-emerald-500' };
  };

  const getBPLevel = (systolic: number, diastolic: number) => {
    if (systolic >= 160 || diastolic >= 100 || systolic < 85 || diastolic < 55) {
      return { label: '🚨 Tensión Crítica', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
    if (systolic >= 140 || diastolic >= 90 || systolic < 95 || diastolic < 60) {
      return { label: '⚠️ Tensión Alterada', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    return { label: '✓ Tensión Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  // Filter 100 cases
  const filteredPresets = ALL_COMMON_DISEASES_100.filter((preset) =>
    preset.label.toLowerCase().includes(presetSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full select-none" id="patient-form-container">
      
      {/* 100 CLINICAL CASE PRESETS EXPLORER PANEL - WITH DYNAMIC SEARCH, SCROLL AND STATUS BARS */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-blue-100 flex flex-col shrink-0" id="presets-panel">
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-purple-600 animate-pulse" id="presets-icon" />
            <h3 className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider">PREAJUSTES CLÍNICOS GLOBALES (100 MÁS TRATADOS)</h3>
          </div>
          <span className="text-[10px] bg-purple-100 text-purple-700 font-extrabold py-0.5 px-2 rounded-full">A-Z</span>
        </div>

        {/* Real-time search engine input */}
        <div className="relative mb-2.5">
          <input
            type="text"
            placeholder="Buscar entre los 100 padecimientos clínicos más comunes..."
            value={presetSearch}
            onChange={(e) => setPresetSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 rounded-xl transition-all font-medium text-slate-800 placeholder-slate-400"
            id="preset-search-input"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Scroller list with custom stylized bars */}
        <div className="max-h-[140px] overflow-y-auto pr-1 flex flex-col gap-1 text-left custom-scrollbar scrollbar-thin scrollbar-thumb-purple-200" id="presets-scroller-catalog">
          {filteredPresets.length > 0 ? (
            filteredPresets.map((preset) => {
              // Read key indicators of the case to show colored bars in preset buttons
              const hrate = preset.data.vitals?.heartRate || 80;
              const o2 = preset.data.vitals?.oxygenSaturation || 98;
              const pain = preset.data.vitals?.painLevel || 0;
              const sys = preset.data.vitals?.systolicBP || 120;
              const isCrit = hrate > 120 || hrate < 48 || o2 < 90 || pain >= 8 || sys >= 160;
              const isAlert = hrate > 100 || hrate < 60 || o2 < 95 || pain >= 4 || sys >= 140;

              let statusColor = "bg-emerald-500";
              let statusLabel = "Saludable";
              if (isCrit) {
                statusColor = "bg-rose-500";
                statusLabel = "Estado Crítico";
              } else if (isAlert) {
                statusColor = "bg-amber-500";
                statusLabel = "Riesgo";
              }

              return (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.data)}
                  type="button"
                  className="w-full text-left text-xs p-2.5 bg-white hover:bg-purple-600 hover:text-white text-slate-755 font-bold rounded-xl border border-slate-200/85 hover:border-purple-600 shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-between gap-2"
                >
                  <span className="truncate flex items-center gap-1.5">
                    <span className="text-[11px]">🩺</span>
                    <span className="truncate">{preset.label}</span>
                  </span>
                  
                  {/* Dynamic miniature status visualizer bar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] text-slate-400 group-hover:text-purple-100 font-semibold">{statusLabel}</span>
                    <span className={`w-2 h-2 rounded-full ${statusColor} shadow-sm animate-pulse`} />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center text-[10px] text-slate-400 py-4 font-bold uppercase">
              No se encontraron padecimientos coincidentes.
            </div>
          )}
        </div>
      </div>

      {/* Categories Tabs Navigator */}
      <div className="flex border-b border-slate-150 bg-slate-50/50 p-1 gap-1" id="form-categories-navigator">
        <button
          type="button"
          onClick={() => setActiveTab('id')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'id' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span className="truncate flex items-center gap-1">Identidad</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('anamnesis')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'anamnesis' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span className="truncate flex items-center gap-1">Anamnesis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vitals')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'vitals' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="truncate flex items-center gap-1">Signos Vitales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('habits')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'habits' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span className="truncate flex items-center gap-1">Hábitos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('patients')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'patients' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-patients"
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate flex items-center gap-1">PACIENTES</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 text-left custom-scrollbar">
        
        {/* TAB 1: IDENTIFICACIÓN & ANTROPOMETRÍA */}
        {activeTab === 'id' && (
          <div className="space-y-4 animate-fade-in" id="panel-id">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ficha de Identidad & Antropometría</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo</label>
                <textarea
                  rows={1}
                  value={patientData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ej. Sofía Jiménez"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[44px]"
                  id="textarea-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Edad (Años)</label>
                  <input
                    type="number"
                    value={patientData.age || ''}
                    onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                    placeholder="Ej. 26"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sexo Biológico</label>
                  <select
                    value={patientData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="w-full text-xs px-3.5 py-3 h-[44px] bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 animate-fade-in"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ocupación o Profesión</label>
                <textarea
                  rows={1}
                  value={patientData.occupation || ''}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  placeholder="Ej. Estudiante de Doctorado, Taxista..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Estatura (cm)</label>
                  <input
                    type="number"
                    value={patientData.height || ''}
                    onChange={(e) => updateField('height', parseInt(e.target.value) || 0)}
                    placeholder="Ej. 175"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Peso Corporal (kg)</label>
                  <input
                    type="number"
                    value={patientData.weight || ''}
                    onChange={(e) => updateField('weight', parseFloat(e.target.value) || 0)}
                    placeholder="Ej. 70"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Sangre</label>
                  <textarea
                    rows={1}
                    value={patientData.bloodType || ''}
                    onChange={(e) => updateField('bloodType', e.target.value)}
                    placeholder="Ej. O+, AB-"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Estado Gestacional</label>
                  <select
                    value={patientData.pregnancyStatus || 'No aplica'}
                    onChange={(e) => updateField('pregnancyStatus', e.target.value)}
                    className="w-full text-xs px-3.5 py-3 h-[44px] bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800"
                  >
                    <option value="No aplica">No aplica</option>
                    <option value="No">No gestando</option>
                    <option value="Sí">Gestando de forma activa</option>
                    <option value="No lo sabe">No sabe / Sin verificar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANAMNESIS DE CRITERIO CON MEDICAMENTOS ACTUALES INTEGRADO */}
        {activeTab === 'anamnesis' && (
          <div className="space-y-4 animate-fade-in" id="panel-anamnesis">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans flex items-center gap-2">
                <span>Anamnesis & Antecedentes Clínicos Completos</span>
                <span className="text-[9px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">CRÍTICO PARA DIAGNÓSTICO</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Motivo de consulta y síntomas detallados</label>
                <textarea
                  rows={3}
                  value={patientData.symptoms}
                  onChange={(e) => updateField('symptoms', e.target.value)}
                  placeholder="Por favor, introduzca dolores, localización exacta, irradiación, factores de progresión..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[80px]"
                  id="textarea-symptoms"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                  <span>💊 MEDICAMENTOS ACTUALES / TRATAMIENTO DIARIO</span>
                </label>
                <textarea
                  rows={2}
                  value={patientData.currentTreatments}
                  onChange={(e) => updateField('currentTreatments', e.target.value)}
                  placeholder="Ej. Enalapril 20mg c/12h, Insulina asparta 6UI, omitió u olvidó dosis..."
                  className="w-full text-xs p-3 bg-amber-50 h-[68px] border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-slate-800 resize-y-none min-h-[60px]"
                  id="anamnesis-current-meds"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Enfermedades Preexistentes o Crónicas</label>
                <textarea
                  rows={2}
                  value={patientData.congenitalDiseases}
                  onChange={(e) => updateField('congenitalDiseases', e.target.value)}
                  placeholder="Ej. Diabetes Mellitus Tipo 1 diagnosticada hace 8 años, Asma..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Alergias Clínicas</label>
                <textarea
                  rows={2}
                  value={patientData.allergies || ''}
                  onChange={(e) => updateField('allergies', e.target.value)}
                  placeholder="Alergias a medicamentos, penicilinas, alimentos, polen..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Historial Quirúrgico / Quirófano</label>
                <textarea
                  rows={2}
                  value={patientData.surgicalHistory || ''}
                  onChange={(e) => updateField('surgicalHistory', e.target.value)}
                  placeholder="Escriba cirugías previas, años, si hubo incidentes de anestesia..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Antecedentes Heredofamiliares directos</label>
                <textarea
                  rows={2}
                  value={patientData.familyHistory}
                  onChange={(e) => updateField('familyHistory', e.target.value)}
                  placeholder="Madre con Hipotiroidismo, Abuelo paterno con Diabetes..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[60px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIGNOS VITALES INTERACTIVOS CON COLORIMETRÍA DINÁMICA */}
        {activeTab === 'vitals' && (
          <div className="space-y-4 animate-fade-in" id="panel-vitals">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Signos Vitales & Biometría Activa</h2>
            </div>

            <div className="grid grid-cols-1 gap-4" id="vitals-sliders-list">
              
              {/* Heart Rate */}
              {(() => {
                const level = getVitalsLevel('heartRate', patientData.vitals.heartRate);
                return (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" /> Frec. Cardíaca
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${level.color}`}>{level.label}</span>
                        <span className="text-xs font-extrabold text-slate-800">{patientData.vitals.heartRate} <span className="text-[10px] text-slate-450 font-normal">bpm</span></span>
                      </div>
                    </div>
                    
                    {/* Graphical colored bar indicator display background */}
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={patientData.vitals.heartRate}
                      onChange={(e) => updateVital('heartRate', parseInt(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${level.accent}`}
                    />
                  </div>
                );
              })()}

              {/* O2 Saturation */}
              {(() => {
                const level = getVitalsLevel('oxygenSaturation', patientData.vitals.oxygenSaturation);
                return (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Saturación O₂
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${level.color}`}>{level.label}</span>
                        <span className="text-xs font-extrabold text-slate-800">{patientData.vitals.oxygenSaturation} <span className="text-[10px] text-slate-450 font-normal">%</span></span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="100"
                      value={patientData.vitals.oxygenSaturation}
                      onChange={(e) => updateVital('oxygenSaturation', parseInt(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${level.accent}`}
                    />
                  </div>
                );
              })()}

              {/* Temperature */}
              {(() => {
                const level = getVitalsLevel('temperature', patientData.vitals.temperature);
                return (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Temperatura
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${level.color}`}>{level.label}</span>
                        <span className="text-xs font-extrabold text-slate-800">{patientData.vitals.temperature} <span className="text-[10px] text-slate-450 font-normal">°C</span></span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="34"
                      max="42"
                      step="0.1"
                      value={patientData.vitals.temperature}
                      onChange={(e) => updateVital('temperature', parseFloat(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${level.accent}`}
                    />
                  </div>
                );
              })()}

              {/* Respiratory Rate */}
              {(() => {
                const level = getVitalsLevel('respiratoryRate', patientData.vitals.respiratoryRate);
                return (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-teal-500 shrink-0" /> Frec. Respiratoria
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${level.color}`}>{level.label}</span>
                        <span className="text-xs font-extrabold text-slate-800">{patientData.vitals.respiratoryRate} <span className="text-[10px] text-slate-450 font-normal">rpm</span></span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="45"
                      value={patientData.vitals.respiratoryRate}
                      onChange={(e) => updateVital('respiratoryRate', parseInt(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${level.accent}`}
                    />
                  </div>
                );
              })()}

              {/* Glucose slider */}
              {(() => {
                const level = getVitalsLevel('glucose', patientData.vitals.glucose);
                return (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 font-sans">
                        <BarChart2 className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Glucosa Capilar
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${level.color}`}>{level.label}</span>
                        <span className="text-xs font-extrabold text-slate-800">
                          <input 
                            type="number"
                            value={patientData.vitals.glucose} 
                            onChange={(e) => updateVital('glucose', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-12 bg-white border border-slate-205 rounded px-1 text-center text-[11px] font-bold mr-1"
                          /> 
                          <span className="text-[10px] text-slate-450 font-normal">mg/dL</span>
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="450"
                      value={patientData.vitals.glucose}
                      onChange={(e) => updateVital('glucose', parseInt(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${level.accent}`}
                    />
                  </div>
                );
              })()}

              {/* Pain Level slider */}
              {(() => {
                const level = getVitalsLevel('painLevel', patientData.vitals.painLevel);
                return (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Nivel de Dolor (EVA 0-10)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${level.color}`}>{level.label}</span>
                        <span className="text-xs font-extrabold text-rose-650 bg-rose-50 py-0.5 px-2 rounded border border-rose-100">{patientData.vitals.painLevel} / 10</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={patientData.vitals.painLevel}
                      onChange={(e) => updateVital('painLevel', parseInt(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${level.accent}`}
                    />
                  </div>
                );
              })()}

            </div>

            {/* Blood Pressure Inputs with range bars & easy choose options */}
            {(() => {
              const systolic = patientData.vitals.systolicBP;
              const diastolic = patientData.vitals.diastolicBP;
              const bplevel = getBPLevel(systolic, diastolic);

              const getSysColorStyle = (val: number) => {
                if (val < 85 || val >= 160) return { label: '🚨 Crítica', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500' };
                if (val < 95 || val >= 140) return { label: '⚠️ Alterada', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500' };
                return { label: '✓ Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500' };
              };

              const getDiaColorStyle = (val: number) => {
                if (val < 55 || val >= 100) return { label: '🚨 Crítica', color: 'text-rose-700 bg-rose-50 border-rose-200', accent: 'accent-rose-500' };
                if (val < 60 || val >= 90) return { label: '⚠️ Alterada', color: 'text-amber-700 bg-amber-50 border-amber-200', accent: 'accent-amber-500' };
                return { label: '✓ Estable', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', accent: 'accent-emerald-500' };
              };

              const sysStyle = getSysColorStyle(systolic);
              const diaStyle = getDiaColorStyle(diastolic);

              return (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-sm space-y-4 transition-all duration-200" id="pressure-vitals">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2 mb-1">
                    <span className="text-xs font-bold text-slate-700 block font-sans">Presión Arterial</span>
                    <span className={`text-[9px] font-extrabold py-0.5 px-2.5 rounded-full border ${bplevel.color}`}>{bplevel.label}</span>
                  </div>

                  {/* SISTOLIC LINE SLIDER */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-550 flex items-center gap-1">
                        Sistólica (mmHg)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${sysStyle.color}`}>{sysStyle.label}</span>
                        <input
                          type="number"
                          min="70"
                          max="220"
                          value={systolic}
                          onChange={(e) => updateVital('systolicBP', Math.min(250, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-14 bg-white border border-slate-205 rounded-lg px-1.5 py-1 text-center text-xs font-black text-slate-800"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="220"
                      value={systolic}
                      onChange={(e) => updateVital('systolicBP', parseInt(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${sysStyle.accent}`}
                    />
                  </div>

                  {/* DIASTOLIC LINE SLIDER */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-550 flex items-center gap-1">
                        Diastólica (mmHg)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${diaStyle.color}`}>{diaStyle.label}</span>
                        <input
                          type="number"
                          min="40"
                          max="130"
                          value={diastolic}
                          onChange={(e) => updateVital('diastolicBP', Math.min(180, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-14 bg-white border border-slate-205 rounded-lg px-1.5 py-1 text-center text-xs font-black text-slate-800"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="130"
                      value={diastolic}
                      onChange={(e) => updateVital('diastolicBP', parseInt(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer transition-all duration-300 ${diaStyle.accent}`}
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 4: HÁBITOS DE VIDA */}
        {activeTab === 'habits' && (
          <div className="space-y-4 animate-fade-in" id="panel-habits">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
              <Dumbbell className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hábitos de Estilo de Vida</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Hábitos de Estilo de Vida y Tóxicos</label>
                <textarea
                  rows={4}
                  value={patientData.lifestyleHabits || ''}
                  onChange={(e) => updateField('lifestyleHabits', e.target.value)}
                  placeholder="Ej. Tabaquismo activo, sedentarismo, dieta copiosa..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 resize-y min-h-[100px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PACIENTES GUARDADOS */}
        {activeTab === 'patients' && (
          <div className="space-y-4 animate-fade-in" id="panel-patients">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base de Datos de Pacientes Guardados</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  saveCurrentPatient(patientData);
                }}
                disabled={!patientData.name.trim()}
                className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1 px-2.5 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                Guardar Ficha Actual
              </button>
            </div>

            {savedPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-xs space-y-2">
                <p>No hay pacientes guardados en este navegador.</p>
                <p className="text-[10px] text-slate-400">Los datos ingresados se guardarán automáticamente aquí al presionar "Generar Diagnóstico" o manualmente arriba.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {savedPatients.map((p, idx) => {
                  const isCurrent = patientData.name.trim().toLowerCase() === p.name.trim().toLowerCase();
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isCurrent 
                          ? "bg-blue-50/60 border-blue-200 shadow-sm" 
                          : "bg-white hover:bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 flex-wrap">
                            {p.name}
                            {isCurrent && (
                              <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider">
                                Cargado Activo
                              </span>
                            )}
                          </h3>
                          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-500 font-semibold">
                            <span>Edad: {p.age} años</span>
                            <span>•</span>
                            <span>Sexo: {p.gender}</span>
                            <span>•</span>
                            <span>Grupo: {p.bloodType}</span>
                            <span>•</span>
                            <span>{p.weight} kg / {p.height} cm</span>
                          </div>
                          {p.symptoms && (
                            <p className="text-[10px] text-slate-400 italic leading-relaxed line-clamp-2">
                              📝 {p.symptoms}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onChange(p);
                              setActiveTab('id');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                          >
                            Cargar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              generatePatientPDF(p, isCurrent ? report : null);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                            title="Descargar Expediente PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deletePatient(p.name);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition-all border border-rose-100 cursor-pointer"
                            title="Eliminar paciente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ALWAYS VISIBLE FILE UPLOAD & LIST SECTION */}
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-3" id="always-visible-uploader-section">
          <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">Estudios de Laboratorio & Archivos de Apoyo</span>
          </div>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
              dragActive ? "border-purple-600 bg-purple-50" : "border-slate-200 hover:border-blue-500 hover:bg-slate-50/50"
            }`}
            id="drag-drop-area"
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt,video/mp4"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-1 block">
              <div className="flex justify-center">
                <Upload className="w-7 h-7 text-purple-500" />
              </div>
              <div className="text-[11px] text-slate-700 font-bold leading-normal">
                Arrastre o examine imágenes, electrocardiogramas, laboratorios e informes.
              </div>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Formatos soportados: PDF, JPEG, PNG, DOC y Videos MP4</p>
            </label>
          </div>

          {/* List of uploaded files with professional inline viewers including custom MP4 video previewer */}
          {patientData.files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1" id="uploaded-files-list">
              {patientData.files.map((file, idx) => {
                const isMP4 = file.mimeType.toLowerCase() === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
                const isImage = file.mimeType.toLowerCase().startsWith('image/');
                
                return (
                  <div key={idx} className="flex flex-col text-[11px] p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl transition-all">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        {isMP4 ? (
                          <Video className="w-4 h-4 text-purple-650 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-650 shrink-0" />
                        )}
                        <div className="truncate text-left">
                          <p className="font-bold text-slate-800 truncate leading-snug">{file.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold uppercase">
                            {(file.size / 1024).toFixed(1)} KB • {isMP4 ? "Video MP4" : (isImage ? "Imagen" : "Documento")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        type="button"
                        className="text-red-500 hover:text-red-700 font-extrabold hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer border border-slate-100 text-sm"
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </div>

                    {/* INLINE MEDIA VIEWER PREVIEWS FOR ABSOLUTE COMPLETENESS */}
                    {isImage && (
                      <div className="mt-2 text-center bg-white border border-slate-100 rounded-lg p-1">
                        <img src={file.data} alt={file.name} className="max-h-24 mx-auto rounded object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {isMP4 && (
                      <div className="mt-2 text-center bg-black border border-slate-205 rounded-xl p-1 overflow-hidden">
                        <video 
                          src={file.data} 
                          controls 
                          className="max-h-36 w-full mx-auto rounded-lg" 
                          preload="metadata"
                          id={`video-${idx}`}
                        >
                          Su navegador no soporta el reproductor de video.
                        </video>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTION PANEL: DOCTORISMO IA CLINICAL BUTTON */}
      <div className="p-4 border-t border-slate-100 bg-slate-50" id="form-action-footer">
        <button
          onClick={() => {
            saveCurrentPatient(patientData);
            onDiagnose();
          }}
          disabled={loading || !patientData.name.trim()}
          type="button"
          className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-305 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          id="btn-diagnose"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>DIAGNÓSTICO IA DoctorISMO</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
