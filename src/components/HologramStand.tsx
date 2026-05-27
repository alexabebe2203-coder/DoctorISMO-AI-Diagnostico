/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PatientData } from '../types';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Radio, 
  Heart, 
  Thermometer, 
  Flame, 
  Wind, 
  AlertTriangle, 
  Gauge,
  Fingerprint
} from 'lucide-react';

interface HologramStandProps {
  patientData: PatientData;
  imageUrl: string | null;
  loading: boolean;
  diagnosed: boolean;
  diagnoses?: string;
}

const LOADING_STEPS = [
  "Iniciando secuencia de modelado holográfico de alta definición...",
  "Mapeando bioseñales polifásicas y signos vitales...",
  "Sincronizando nanosensores y matriz anatómica multimodal...",
  "Modelando cyber-avatar nano banana en tiempo real...",
  "Correlacionando clínica con protocolos ADA Health y AMBOSS...",
  "Compilando diagnóstico diferencial y proyecciones biológicas..."
];

export const HologramStand: React.FC<HologramStandProps> = ({
  patientData,
  imageUrl,
  loading,
  diagnosed,
  diagnoses
}) => {
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Read raw values from patient data
  const hr = patientData.vitals.heartRate;
  const sys = patientData.vitals.systolicBP;
  const dia = patientData.vitals.diastolicBP;
  const rr = patientData.vitals.respiratoryRate || 16;
  const o2 = patientData.vitals.oxygenSaturation;
  const temp = patientData.vitals.temperature;
  const gluc = patientData.vitals.glucose;
  const pain = patientData.vitals.painLevel;

  // Calculable parameters
  const meanArterialPressure = Math.round((sys + 2 * dia) / 3);
  const pulsePressure = sys - dia;
  const shockIndex = parseFloat((hr / sys).toFixed(2));
  const bmi = patientData.height > 0 
    ? parseFloat((patientData.weight / Math.pow(patientData.height / 100, 2)).toFixed(1))
    : 22.5;

  // Dynamic 3-tier classification helper for exact matching (excellent/normal to critical)
  const getVitalStatus = (vital: string, val: number) => {
    if (vital === 'hr') {
      if (val < 48 || val > 120) return { label: 'FC CRÍTICA', isCrit: true, isAlert: false, barBg: 'bg-rose-500', text: 'text-rose-450' };
      if (val < 60 || val > 100) return { label: 'FC ALTERADA', isCrit: false, isAlert: true, barBg: 'bg-amber-550', text: 'text-amber-450' };
      return { label: 'SINUSAL ESTABLE', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
    }
    if (vital === 'bp') {
      if (sys >= 160 || dia >= 100 || sys < 85 || dia < 55) return { label: 'TENSION CRÍTICA', isCrit: true, isAlert: false, barBg: 'bg-rose-500', text: 'text-rose-450' };
      if (sys >= 140 || dia >= 90 || sys < 95 || dia < 60) return { label: 'TENSION ALTERADA', isCrit: false, isAlert: true, barBg: 'bg-amber-550', text: 'text-amber-450' };
      return { label: 'TENSION NORMAL', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
    }
    if (vital === 'o2') {
      if (val < 90) return { label: 'HIPOXIA DIRECTA', isCrit: true, isAlert: false, barBg: 'bg-rose-500', text: 'text-rose-450' };
      if (val < 95) return { label: 'HIPOXIA LEVE', isCrit: false, isAlert: true, barBg: 'bg-amber-550', text: 'text-amber-450' };
      return { label: 'SAT EXCELENTE', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
    }
    if (vital === 'rr') {
      if (val < 10 || val > 24) return { label: 'TAQUIPNEA CRÍTICA', isCrit: true, isAlert: false, barBg: 'bg-rose-500', text: 'text-rose-450' };
      if (val < 12 || val > 20) return { label: 'TAQUIPNEA SEÑAL', isCrit: false, isAlert: true, barBg: 'bg-amber-550', text: 'text-amber-450' };
      return { label: 'FREC. VENT. NORMAL', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
    }
    if (vital === 'temp') {
      if (val < 35.5 || val >= 38.0) return { label: 'TEMPERATURA ALTA', isCrit: true, isAlert: false, barBg: 'bg-rose-500', text: 'text-rose-450' };
      if (val < 36.1 || val > 37.2) return { label: 'TEMPERATURA LEVE', isCrit: false, isAlert: true, barBg: 'bg-amber-550', text: 'text-amber-450' };
      return { label: 'EUTERMIA NORMAL', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
    }
    if (vital === 'gluc') {
      if (val < 55 || val > 150) return { label: 'GLUCEMIA REBOTE', isCrit: true, isAlert: false, barBg: 'bg-rose-500', text: 'text-rose-450' };
      if (val < 70 || val > 105) return { label: 'METABÓLICO DESVío', isCrit: false, isAlert: true, barBg: 'bg-amber-550', text: 'text-amber-450' };
      return { label: 'GLUCOSA NORMAL', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
    }
    if (vital === 'pain') {
      if (val >= 7) return { label: 'DOLOR SEVERO', isCrit: true, isAlert: false, barBg: 'bg-rose-500', text: 'text-rose-450' };
      if (val >= 4) return { label: 'DOLOR MODERADO', isCrit: false, isAlert: true, barBg: 'bg-amber-550', text: 'text-amber-450' };
      return { label: 'SENSACIÓN MÍNIMA', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
    }
    return { label: 'NORMAL', isCrit: false, isAlert: false, barBg: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  // Evaluate general health status combining all criticals and alerts
  const getPatientHealthState = () => {
    let criticals = [];
    let warnings = [];

    if (o2 < 90) criticals.push("SatO2 Severa");
    else if (o2 < 94) warnings.push("SatO2 Limítrofe");

    if (hr > 120 || hr < 48) criticals.push("Ritmo Crítico");
    else if (hr > 100 || hr < 60) warnings.push("Inestabilidad de Pulso");

    if (sys >= 160 || sys < 85 || dia >= 100 || dia < 55) criticals.push("Crisis de Presión");
    else if (sys >= 140 || sys < 95 || dia >= 90 || dia < 60) warnings.push("Desvío de Tensión");

    if (temp >= 38.0 || temp < 35.5) criticals.push("Distermia Crítica");
    else if (temp >= 37.3 || temp < 36.1) warnings.push("Distermia Reactiva");

    if (gluc >= 150 || gluc < 55) criticals.push("Glucemia Crítica");
    else if (gluc >= 106 || gluc < 70) warnings.push("Alteración de Glucemia");

    if (rr >= 24 || rr < 10) criticals.push("Límite Ventilatorio");
    else if (rr > 20 || rr < 12) warnings.push("Patrón Respiratorio Irregular");

    if (pain >= 7) criticals.push("Dolor Agudo Severo");
    else if (pain >= 4) warnings.push("Dolor Moderado Activo");

    if (criticals.length > 0) {
      return {
        status: 'CRÍTICO',
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30',
        glowColor: 'shadow-[0_0_35px_rgba(244,63,94,0.4)]',
        bezelColor: 'border-rose-500/40 bg-rose-950/20',
        badge: '🚨 CRÍTICO',
        action: `Estabilizar parámetro urgente: ${criticals[0]}.`,
        desc: `Paciente en estado crítico de descompensación orgánica. Trastornos activos encontrados: ${criticals.join(', ')}.`,
        avatarBorder: 'ring-4 ring-rose-500/50 animate-pulse',
        scanStyle: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
      };
    }

    if (warnings.length > 0) {
      return {
        status: 'RIESGO / INESTABLE',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        glowColor: 'shadow-[0_0_35px_rgba(245,158,11,0.4)]',
        bezelColor: 'border-amber-500/40 bg-amber-950/20',
        badge: '⚠️ RIESGO / ALERTA',
        action: `Monitorear continuamente: ${warnings[0]}.`,
        desc: `Se registran desvíos fisiológicos moderados: ${warnings.join(', ')}. Estrecha vigilancia terapéutica.`,
        avatarBorder: 'ring-2 ring-amber-500/40 animate-pulse',
        scanStyle: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
      };
    }

    const isExcellent = (
      o2 >= 97 &&
      hr >= 60 && hr <= 80 &&
      sys >= 115 && sys <= 125 &&
      temp >= 36.3 && temp <= 37.0 &&
      gluc >= 75 && gluc <= 100 &&
      pain <= 2 &&
      rr >= 12 && rr <= 18
    );

    if (isExcellent) {
      return {
        status: 'EXCELENTE SALUD',
        color: 'text-emerald-450',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        glowColor: 'shadow-[0_0_35px_rgba(16,185,129,0.4)]',
        bezelColor: 'border-emerald-500/40 bg-emerald-950/20',
        badge: '💎 EXCELENTE SALUD',
        action: 'Continuar con el régimen preventivo óptimo actual de salud y nutrición.',
        desc: "Metabolismo y homeostasis celular óptimos. Todos los signos vitales estables.",
        avatarBorder: 'ring-2 ring-emerald-500/40',
        scanStyle: 'bg-emerald-450 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
      };
    }

    return {
      status: 'BUENA SALUD',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      glowColor: 'shadow-[0_0_35px_rgba(6,182,212,0.4)]',
      bezelColor: 'border-cyan-500/40 bg-cyan-950/20',
      badge: '✓ BUENA SALUD',
      action: 'Conservar reposo relativo y vigilancia periódica rutinaria de bioseñales.',
      desc: "Biología funcional compensable de forma robusta. Sin descompensación celular detectada.",
      avatarBorder: 'ring-2 ring-cyan-500/40',
      scanStyle: 'bg-cyan-405 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
    };
  };

  const currentStatus = getPatientHealthState();

  // Dynamic signal wave color evaluation (Rojo, Naranja, Amarilla, Verde, Verde Fuerte, Verde Lima)
  const getEcgColor = () => {
    if (currentStatus.status === 'CRÍTICO') {
      return {
        textColor: 'text-rose-500',
        glowFilter: 'drop-shadow(0px 0px 8px rgba(244, 63, 94, 0.95))',
        accentBg: 'bg-rose-500/10'
      };
    }
    if (currentStatus.status === 'RIESGO / INESTABLE') {
      // Differentiate between Orange (Naranja) and Yellow (Amarilla) based on danger level
      const isHigherRisk = hr > 110 || hr < 52 || sys >= 150 || sys < 90 || o2 < 93 || gluc >= 135 || gluc < 60;
      if (isHigherRisk) {
        return {
          textColor: 'text-orange-500',
          glowFilter: 'drop-shadow(0px 0px 8px rgba(249, 115, 22, 0.95))',
          accentBg: 'bg-orange-500/10'
        };
      }
      return {
        textColor: 'text-yellow-405',
        glowFilter: 'drop-shadow(0px 0px 8px rgba(234, 179, 8, 0.95))',
        accentBg: 'bg-yellow-500/10'
      };
    }
    if (currentStatus.status === 'EXCELENTE SALUD') {
      return {
        textColor: 'text-lime-400',
        glowFilter: 'drop-shadow(0px 0px 10px rgba(163, 230, 53, 1.0))',
        accentBg: 'bg-lime-500/10'
      };
    }
    // BUENA SALUD (Standard green / deep green)
    const isVeryStable = o2 >= 96 && hr >= 60 && hr <= 85 && sys >= 110 && sys <= 130;
    if (isVeryStable) {
      return {
        textColor: 'text-emerald-400',
        glowFilter: 'drop-shadow(0px 0px 8px rgba(52, 211, 153, 0.90))',
        accentBg: 'bg-emerald-500/10'
      };
    }
    return {
      textColor: 'text-green-500',
      glowFilter: 'drop-shadow(0px 0px 8px rgba(34, 197, 94, 0.85))',
      accentBg: 'bg-green-550/10'
    };
  };

  const ecgWaveStyle = getEcgColor();

  // Color mapping evaluations
  const v_hr = getVitalStatus('hr', hr);
  const v_bp = getVitalStatus('bp', sys);
  const v_o2 = getVitalStatus('o2', o2);
  const v_rr = getVitalStatus('rr', rr);
  const v_temp = getVitalStatus('temp', temp);
  const v_gluc = getVitalStatus('gluc', gluc);
  const v_pain = getVitalStatus('pain', pain);

  return (
    <div className="flex flex-col bg-[#030a16] rounded-2xl border border-slate-800 text-white min-h-[720px] relative overflow-hidden shadow-[0_0_60px_rgba(15,23,42,0.85)] select-none" id="holographic-monitor-panel">
      {/* HUD Scanner Scanlines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.15)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04122d]/60 via-[#030a16] to-[#04122d]/40 pointer-events-none" />
      
      {/* 1. Sci-Fi Dashboard Tech Header */}
      <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-300 border-b border-blue-950/85 px-6 py-4 bg-slate-950/80 backdrop-blur z-25" id="monitor-heading-bar">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              currentStatus.status === 'CRÍTICO' ? 'bg-rose-500' : 'bg-cyan-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              currentStatus.status === 'CRÍTICO' ? 'bg-rose-600' : 'bg-cyan-500'
            }`}></span>
          </span>
          <span className="font-extrabold text-cyan-455 tracking-wider font-sans">MONITOR BIOMÉTRICO DoctorISMO</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-900/40 px-3 py-1.5 rounded-full text-[9px] text-cyan-400 font-bold tracking-wider" id="biometric-sync-pill">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-450 animate-pulse" />
          <span>EXPEDIENTE CONECTADO ACTIVO</span>
        </div>
      </div>

      {/* 2. DYNAMICAL CLINICAL FOCUS CONTROL BOX (Indicates focus attention points immediately) */}
      <div className={`mx-6 mt-4 p-4 rounded-xl border ${currentStatus.bgColor} ${currentStatus.borderColor} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs z-25 shadow-md`} id="clinical-focus-alert-banner">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-black/60 shrink-0 ${currentStatus.color}`}>
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="font-extrabold flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">EVALUACIÓN FISIOLÓGICA:</span> 
              <span className={`font-black text-xs tracking-wider animate-bounce px-2.5 py-0.5 rounded ${currentStatus.color} bg-black/40`}>
                {currentStatus.badge}
              </span>
            </p>
            <p className="text-slate-200 mt-1 leading-relaxed font-sans text-[11px] font-semibold">{currentStatus.desc}</p>
          </div>
        </div>
        <div className="shrink-0 font-sans text-right hidden md:block max-w-[240px]">
          <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-wider">RESPUESTA RECOMENDADA</span>
          <span className="font-extrabold text-slate-100 text-[11px] leading-snug mt-0.5 block">{currentStatus.action}</span>
        </div>
      </div>

      {/* 3. Main Monitor workspace layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 p-6 relative z-10" id="monitor-workspace-layout">
        
        {/* COLUMN A: LEFT SIDE BIO-TELEMETRY (4 Vitals with Dynamic Colors) */}
        <div className="md:col-span-3 flex flex-col justify-between space-y-4" id="left-monitor-widgets">
          
          {/* Card 1: FC PULSO (Heart Rate) */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md">
            <div className="absolute top-0 right-0 p-2 opacity-[0.08] pointer-events-none">
              <Heart className="w-14 h-14 text-rose-500 animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">1/8 FREC. CARDÍACA (FC)</span>
              <Heart className={`w-3.5 h-3.5 ${v_hr.isCrit ? 'text-rose-500 animate-ping' : v_hr.isAlert ? 'text-amber-500' : 'text-emerald-500 animate-pulse'}`} />
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black font-sans leading-none ${v_hr.text}`}>{hr}</span>
              <span className="text-xs font-mono text-slate-400">LPM</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${v_hr.barBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((hr - 40) / 140) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono leading-none">
                <span className={`${v_hr.text} font-black`}>{v_hr.label}</span>
                <span className="text-slate-500 font-bold">Norm: 60-100</span>
              </div>
            </div>
          </div>

          {/* Card 2: PRESIÓN ARTERIAL (BP) */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">2/8 PRESIÓN ARTERIAL (BP)</span>
              <span className={`w-2 h-2 rounded-full ${v_bp.isCrit ? 'bg-rose-500 animate-pulse' : v_bp.isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black font-sans leading-none tracking-tight ${v_bp.text}`}>{sys}/{dia}</span>
              <span className="text-[9px] font-mono text-slate-400">mmHg</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${v_bp.barBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((sys - 70) / 130) * 100))}%` }}
                />
              </div>
              <div className="text-[8px] font-mono flex justify-between leading-none">
                <span className={`${v_bp.text} font-black`}>{v_bp.label}</span>
                <span className="text-slate-500">PAM: <strong className="text-cyan-300 font-bold">{meanArterialPressure}</strong></span>
              </div>
            </div>
          </div>

          {/* Card 3: FRECUENCIA RESPIRATORIA (FR) */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md animate-fade-in">
            <div className="absolute top-0 right-0 p-2 opacity-[0.08] pointer-events-none">
              <Wind className="w-14 h-14 text-teal-400 animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">3/8 FREC. RESPIRATORIA (FR)</span>
              <Wind className={`w-3.5 h-3.5 ${v_rr.isCrit ? 'text-rose-500 animate-pulse' : v_rr.isAlert ? 'text-amber-500' : 'text-emerald-500'}`} />
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black font-sans leading-none ${v_rr.text}`}>{rr}</span>
              <span className="text-xs font-mono text-slate-400">RPM</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-550 ${v_rr.barBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((rr - 6) / 38) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono leading-none">
                <span className={`${v_rr.text} font-black`}>{v_rr.label}</span>
                <span className="text-slate-500 font-bold">Norm: 12-20</span>
              </div>
            </div>
          </div>

          {/* Card 4: ÍNDICE DE CHOQUE HEMODINÁMICO */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">4/8 ÍNDICE DE CHOQUE</span>
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="my-0.5 flex items-baseline gap-1 text-indigo-400">
              <span className="text-3xl font-black font-sans leading-none">{shockIndex}</span>
              <span className="text-[10px] font-mono text-slate-400">Ratio</span>
            </div>
            <div className="text-[8px] font-mono border-t border-slate-900 pt-1.5 flex justify-between">
              <span className={shockIndex > 0.75 ? 'text-rose-450 font-bold' : 'text-indigo-300 font-semibold'}>{shockIndex > 0.75 ? "🚨 CHOQUE ALTO" : "✓ RITMO SEGURO"}</span>
              <span className="text-slate-500 font-bold">PP: {pulsePressure} mmHg</span>
            </div>
          </div>

        </div>

        {/* COLUMN B: CENTRAL HOLOGRAPHIC PROJECTOR (Displays patient custom avatar state) */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative min-h-[460px] rounded-2xl border border-blue-950/50 bg-slate-950/30 backdrop-blur-md overflow-hidden" id="center-hologram-viewport">
          
          {/* Decorative futuristic scan boundaries rings */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_75%)] pointer-events-none" />
          
          {/* Radial Light matching patient biostructure health evaluation */}
          <div className={`absolute w-80 h-80 rounded-full blur-[80px] opacity-25 ${
            currentStatus.status === 'CRÍTICO' ? 'bg-rose-500' :
            currentStatus.status === 'RIESGO / INESTABLE' ? 'bg-amber-500' : 'bg-cyan-500'
          }`} />

          {loading ? (
            /* Rotating advanced medical sweep loaders for hologram construction */
            <div className="flex flex-col items-center justify-center space-y-4 text-center p-6 z-10" id="scanner-loader">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-cyan-400/30 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-purple-500/55 animate-[spin_5s_linear_infinite_reverse]" />
                <div className="absolute inset-4 rounded-full border-b-2 border-t-2 border-cyan-400 animate-[spin_2.5s_linear_infinite]" />
                <Activity className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-cyan-300 tracking-widest uppercase bg-cyan-950 px-2.5 py-1 rounded border border-cyan-900">
                  <Radio className="w-2.5 h-2.5 animate-ping" /> ANALIZANDO
                </span>
                <p className="text-xs font-semibold tracking-wide text-slate-200 mt-1.5">{LOADING_STEPS[loadingStepIdx]}</p>
                <div className="w-48 h-1 bg-slate-950 rounded-full mx-auto overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 w-full animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            /* Active visualization clinical grid */
            <div className="relative flex flex-col items-center justify-center w-full h-full p-4" id="viewer-container">
              
              {/* Top Dynamic Status badge in Hologram stand */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-25 text-[9px] font-mono bg-slate-950/90 border border-slate-800 rounded-lg p-2 leading-none shadow-[inset_0_1px_5px_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400 font-extrabold uppercase">AVATAR</span>
                </div>
                <div className="flex items-center gap-1.5 text-right">
                  <span className="text-slate-500 font-bold">ESTADO INTERPRETADO:</span>
                  <span className={`font-black tracking-wider uppercase text-[10px] px-1.5 py-0.5 rounded ${currentStatus.color} bg-black/40`}>
                    {currentStatus.status}
                  </span>
                </div>
              </div>

              {/* Holographic Laser Sweeper laser guide */}
              <div className={`absolute left-1/2 -translate-x-1/2 top-[55px] w-64 h-0.5 z-25 animate-laser rounded-full pointer-events-none ${currentStatus.scanStyle}`} />

              <div className="relative w-64 h-64 flex items-center justify-center my-6 animate-fade-in" id="character-canvas">
                {imageUrl ? (
                  /* 3D Photorealistic customized avatar model with status glows overlayed */
                  <div className={`relative p-1.5 rounded-2xl transition-all duration-700 ${currentStatus.glowColor} ${currentStatus.bezelColor} border`}>
                    <img
                      src={imageUrl}
                      alt={`${patientData.name} Realistic Nano Banana Biomechanical Model`}
                      className={`w-52 h-52 object-cover rounded-xl relative z-10 border border-cyan-550/30 ${currentStatus.avatarBorder} max-w-full`}
                      referrerPolicy="no-referrer"
                      id="loaded-fotorrealistic-avatar"
                    />
                    
                    {/* Active HUD scanner ticks floating inside frame */}
                    <div className="absolute top-3 left-3 bg-cyan-900/80 border border-cyan-500/30 text-[7px] font-mono px-1 py-0.5 rounded text-cyan-300 z-20 font-bold select-none">
                      SCAN: IN SITU
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/85 border border-purple-500/30 text-[7px] font-mono px-1.5 py-1 rounded text-purple-300 z-20 font-bold select-none leading-none">
                      {patientData.age}A / {patientData.gender[0]}
                    </div>
                  </div>
                ) : (
                  /* Scientific Interactive Standby / fallback biostructure */
                  <div className="flex flex-col items-center justify-center z-10 p-4" id="standby-text-card">
                    {diagnosed ? (
                      /* Fallback physiological silhouette rendering based on diagnosed status colors */
                      <div className={`w-[200px] h-[200px] rounded-full border relative z-10 flex items-center justify-center overflow-hidden transition-all duration-700 ${currentStatus.glowColor} ${currentStatus.bezelColor}`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_75%)]" />
                        <svg className={`w-36 h-36 opacity-75 animate-pulse ${currentStatus.color}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
                        </svg>
                        <span className={`absolute top-20 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full animate-ping ${
                          currentStatus.status === 'CRÍTICO' ? 'bg-rose-500' : 'bg-cyan-400'
                        }`} />
                      </div>
                    ) : (
                      /* Standing stand active standby mode verbatim matching initial screenshot layout precisely */
                      <div className="bg-[#030d1d]/90 rounded-2xl border border-cyan-500/25 p-5 max-w-xs text-center backdrop-blur-xl animate-fade-in shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-20" id="stand-standby-dialog font-sans">
                        {/* Interactive biomechanical spinner */}
                        <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                          <div className="w-10 h-10 border-2 border-dashed border-cyan-500/40 rounded-full animate-spin flex items-center justify-center">
                            <div className="w-5 h-5 border border-purple-500/60 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                          </div>
                        </div>

                        <h3 className="text-xs font-black tracking-widest text-cyan-300 font-mono uppercase mb-1.5">SISTEMA EN ESPERA</h3>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                          Plexo anatómico en rotación. Presione el botón clínico para computar el expediente e integrar el diagnóstico holográfico con nano banana interpretando su estado actual.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cybernetic decorative rings spinning slowly */}
                <div className="absolute -inset-2 border border-cyan-500/10 rounded-full animate-[spin_35s_linear_infinite]" />
                <div className="absolute -inset-5 border border-purple-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{ borderStyle: 'dotted' }} />
              </div>

              {/* Central Floating Overlay Micro-Specs */}
              <div className="absolute bottom-14 left-4 right-4 flex justify-between z-20 text-[9px] font-mono bg-slate-950/90 border border-slate-800 rounded px-2.5 py-1.5 shadow-md leading-none" id="hologram-overlay-specs">
                <span className="text-cyan-400 font-extrabold font-sans">ESTATURA: {patientData.height} CM / PESO: {patientData.weight} KG</span>
                <span className="text-indigo-305 font-extrabold leading-none font-sans">IMC: {bmi} ({bmi < 18.5 ? 'Bajo' : bmi < 25 ? 'Normal' : 'Sobrepeso'})</span>
              </div>

              {/* Dynamic Diagnoses Oval Capsule */}
              <div 
                className={`absolute bottom-4 left-4 right-4 h-7 border border-dashed rounded-full flex items-center justify-center font-mono text-[9px] bg-slate-950/85 z-20 transition-all duration-300 px-4 ${
                  diagnosed && diagnoses 
                    ? "border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)] bg-[#040c1a]/85" 
                    : "border-purple-500/35 text-purple-400 animate-pulse bg-[#030a16]/40"
                }`}
                id="hologram-diagnoses-oval"
              >
                {diagnosed && diagnoses ? (
                  <span className="font-extrabold tracking-wider uppercase truncate max-w-[95%] text-center">
                    🎯 DX: {diagnoses}
                  </span>
                ) : (
                  <span className="font-bold tracking-widest uppercase opacity-65 text-center">
                    SINCRO RESUMEN COMPLETO ACTIVO
                  </span>
                )}
              </div>

            </div>
          )}

          {/* Holograph projector glowing platform base cylinder */}
          <div className="w-64 h-12 relative mt-auto mb-3" id="stand-base">
            <div className={`absolute inset-0 rounded-full blur-md transform -rotate-x-12 opacity-85 ${
              currentStatus.status === 'CRÍTICO' ? 'bg-rose-500/15' : 'bg-cyan-550/15'
            }`} />
            <div className={`absolute inset-1 border-2 rounded-full transform -rotate-x-12 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse ${
              currentStatus.status === 'CRÍTICO' ? 'border-rose-500' : 'border-cyan-500'
            }`} />
            <div className="absolute inset-3 border border-purple-500/40 rounded-full transform -rotate-x-12 animate-[spin_12s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
          </div>
        </div>

        {/* COLUMN C: RIGHT SIDE BIO-TELEMETRY (4 Vitals with Dynamic Colors) */}
        <div className="md:col-span-3 flex flex-col justify-between space-y-4" id="right-monitor-widgets">
          
          {/* Card 5: TEMP */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md">
            <div className="absolute top-0 right-0 p-2 opacity-[0.08] pointer-events-none">
              <Thermometer className="w-14 h-14 text-orange-500" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">5/8 TEMPERATURA (°C)</span>
              <Thermometer className={`w-3.5 h-3.5 ${v_temp.isCrit ? 'text-rose-500 animate-pulse' : v_temp.isAlert ? 'text-amber-500' : 'text-emerald-500'}`} />
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black font-sans leading-none ${v_temp.text}`}>{temp}</span>
              <span className="text-xs font-mono text-slate-400">°C</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${v_temp.barBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((temp - 34) / 8) * 100))}%` }}
                />
              </div>
              <div className="text-[8px] font-mono flex justify-between leading-none">
                <span className={`${v_temp.text} font-black`}>{v_temp.label}</span>
                <span className="text-slate-500 font-bold">Norm: 36.1-37.2</span>
              </div>
            </div>
          </div>

          {/* Card 6: SATURACIÓN DE OXÍGENO (SpO2) */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">6/8 SATURACIÓN O₂</span>
              <span className={`w-2 h-2 rounded-full ${v_o2.isCrit ? 'bg-rose-500 animate-ping' : v_o2.isAlert ? 'bg-amber-550 animate-pulse' : 'bg-emerald-500'}`} />
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black font-sans leading-none ${v_o2.text}`}>{o2}</span>
              <span className="text-[10px] font-mono font-medium text-emerald-500">%</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${v_o2.barBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((o2 - 70) / 30) * 100))}%` }}
                />
              </div>
              <div className="text-[8px] font-mono flex justify-between leading-none">
                <span className={`${v_o2.text} font-black`}>{v_o2.label}</span>
                <span className="text-slate-500">Norm: 95-100%</span>
              </div>
            </div>
          </div>

          {/* Card 7: GLUCOSA CAPILAR */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">7/8 GLUCOSA CAPILAR</span>
              <span className={`w-2 h-2 rounded-full ${v_gluc.isCrit ? 'bg-rose-500 animate-ping' : v_gluc.isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black font-sans leading-none ${v_gluc.text}`}>{gluc}</span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">mg/dL</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${v_gluc.barBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((gluc - 40) / 410) * 100))}%` }}
                />
              </div>
              <div className="text-[8px] font-mono flex justify-between leading-none">
                <span className={`${v_gluc.text} font-black`}>{v_gluc.label}</span>
                <span className="text-slate-500">Limit: 70-140</span>
              </div>
            </div>
          </div>

          {/* Card 8: ESCALA DE DOLOR (EVA) */}
          <div className="bg-slate-950/75 border border-blue-950/45 p-4 rounded-xl flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider font-extrabold uppercase">8/8 ESCALA DOLOR (EVA)</span>
              <Flame className={`w-3.5 h-3.5 ${v_pain.isCrit ? 'text-rose-500 animate-pulse' : v_pain.isAlert ? 'text-amber-500' : 'text-emerald-500'}`} />
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className={`text-3xl font-black font-sans leading-none ${v_pain.text}`}>{pain}</span>
              <span className="text-xs font-mono text-slate-450 font-bold">/10</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${v_pain.barBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, (pain / 10) * 100))}%` }}
                />
              </div>
              <div className="text-[8px] font-mono flex justify-between leading-none">
                <span className={`${v_pain.text} font-black truncate max-w-[130px]`}>{v_pain.label}</span>
                <span className="text-slate-505">Max: 10</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. BOTTOM MONITOR PANEL: Live ECG Heartbeat Waveform sweep */}
      <div className="border-t border-blue-950 bg-slate-950/50 p-4 flex flex-col space-y-2 z-15" id="ecg-monitor-waveform">
        <div className="flex justify-between text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold px-2">
          <span>SEÑAL DE VIDA</span>
          <span className="text-cyan-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            ADQUISICIÓN BIOMÉTRICA CONTINUA
          </span>
        </div>
        
        {/* ECG Moving SVG Line Grid */}
        <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-900 relative overflow-hidden h-14 flex items-center shadow-inner" id="ecg-track-viewport">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
          
          <svg className={`w-full h-10 ${ecgWaveStyle.textColor} transition-colors duration-500 z-10`} viewBox="0 0 1000 40" preserveAspectRatio="none">
            <path
              d="M0 20 L80 20 L90 20 L95 10 L100 30 L105 20 L115 20 L120 2 L125 38 L130 20 L140 20 L240 20 L250 20 L255 10 L260 30 L265 20 L275 20 L280 2 L285 38 L290 20 L300 20 L400 20 L410 20 L415 10 L420 30 L425 20 L435 20 L440 2 L445 38 L450 20 L460 20 L560 20 L570 20 L575 10 L585 30 L590 20 L600 20 L605 2 L610 38 L615 20 L625 20 L725 20 L725 20 L735 20 L740 10 L745 30 L750 20 L760 20 L765 2 L770 38 L775 20 L785 20 L885 20 L895 20 L900 10 L905 30 L910 20 L920 20 L925 2 L930 38 L935 20 L945 20 L1000 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="animate-ecg-sweep"
              style={{ filter: ecgWaveStyle.glowFilter }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 5. Futuristic status footer */}
      <div className="w-full flex justify-between text-[9px] font-mono text-slate-500 px-6 py-3 border-t border-blue-950 bg-slate-950" id="monitor-footer">
        <span className="flex items-center gap-1.5 select-text">
          <Cpu className="w-3.5 h-3.5 text-purple-405 animate-pulse" /> Sistema DoctorISMO IA Diagnostico
        </span>
        <span className="text-cyan-450 flex items-center gap-1.5 font-bold">
          <Zap className="w-3.5 h-3.5 animate-spin" /> ANALIZANDO
        </span>
      </div>
    </div>
  );
};
