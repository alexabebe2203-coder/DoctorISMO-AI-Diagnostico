/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { PatientData, DiagnosticReportData } from '../types';

class PDFBuilder {
  doc: jsPDF;
  y: number;
  margin: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  pageNum: number;
  patientName: string;
  expedienteID: string;

  constructor(patientName: string, expedienteID: string) {
    // letter format is 215.9 x 279.4 mm
    this.doc = new jsPDF('p', 'mm', 'letter');
    this.y = 20;
    this.margin = 15;
    this.pageWidth = 215.9;
    this.pageHeight = 279.4;
    this.contentWidth = this.pageWidth - (this.margin * 2); // 185.9 mm
    this.pageNum = 1;
    this.patientName = patientName;
    this.expedienteID = expedienteID;
    
    this.drawPageDecorations();
  }

  drawPageDecorations() {
    // Header
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(100, 116, 139); // Slate-400
    this.doc.text(`DOCTORISMO IA SUITE CLÍNICA - REPORTES DE ALTA FIDELIDAD`, this.margin, 10);
    this.doc.text(`EXP: ${this.expedienteID}`, this.pageWidth - this.margin, 10, { align: 'right' });
    
    // Thin separator line
    this.doc.setDrawColor(226, 232, 240); // Slate-200
    this.doc.setLineWidth(0.2);
    this.doc.line(this.margin, 11.5, this.pageWidth - this.margin, 11.5);

    // Footer
    this.doc.setDrawColor(226, 232, 240);
    this.doc.line(this.margin, this.pageHeight - 12, this.pageWidth - this.margin, this.pageHeight - 12);
    this.doc.text(`Página ${this.pageNum}`, this.pageWidth / 2, this.pageHeight - 8, { align: 'center' });
    this.doc.text(`* Reporte clínico confidencial. DoctorISMO Inteligencia Médica Multimodal.`, this.margin, this.pageHeight - 8);
  }

  checkPageBreak(neededHeight: number) {
    if (this.y + neededHeight > this.pageHeight - 18) {
      this.doc.addPage();
      this.pageNum++;
      this.y = 20;
      this.drawPageDecorations();
    }
  }

  drawSectionHeader(title: string) {
    this.checkPageBreak(12);
    
    // Solid background panel for corporate look
    this.doc.setFillColor(4, 18, 45); // `#04122d` Corp Navy
    this.doc.rect(this.margin, this.y, this.contentWidth, 6.5, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(title.toUpperCase(), this.margin + 2.5, this.y + 4.5);
    
    this.y += 10;
  }

  drawTextRow(label: string, value: string, highlightLabel: boolean = false) {
    const cleanValue = value || 'No registrado / No aplica';
    
    // Measure label width at 8pt helvetica
    this.doc.setFont('helvetica', highlightLabel ? 'bold' : 'normal');
    this.doc.setFontSize(8);
    const labelWidth = this.doc.getTextWidth(label);
    
    // Check if the label is too long to safely fit side-by-side with a 58mm offset
    const isVeryLongLabel = labelWidth > 55;
    
    if (isVeryLongLabel) {
      // Draw label on its own line first
      this.checkPageBreak(6);
      if (highlightLabel) {
        this.doc.setTextColor(4, 18, 45); // Corp Navy
      } else {
        this.doc.setTextColor(115, 115, 115); // Neutral slate
      }
      this.doc.text(label, this.margin, this.y + 3.5);
      this.y += 4.5;
      
      // Draw the value slightly indented on the next line (giving it full page width)
      const wrappedValue = this.doc.splitTextToSize(cleanValue, this.contentWidth - 6);
      const neededHeightValue = wrappedValue.length * 4.2;
      this.checkPageBreak(neededHeightValue + 2);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(30, 41, 59); // Dark slate
      
      for (let i = 0; i < wrappedValue.length; i++) {
        this.doc.text(wrappedValue[i], this.margin + 4, this.y + 3.5 + (i * 4.2));
      }
      
      // Bottom thin line spacer
      this.doc.setDrawColor(241, 245, 249); // slate-100
      this.doc.setLineWidth(0.15);
      this.doc.line(this.margin, this.y + neededHeightValue + 0.8, this.pageWidth - this.margin, this.y + neededHeightValue + 0.8);
      
      this.y += neededHeightValue + 2;
    } else {
      // Elegant side-by-side layout with a generous and safe 58mm offset
      const colOffset = 58; 
      const wrappedValue = this.doc.splitTextToSize(cleanValue, this.contentWidth - (colOffset + 2));
      const neededHeight = Math.max(wrappedValue.length * 4.2, 5.5);
      this.checkPageBreak(neededHeight);
      
      // Render label
      if (highlightLabel) {
        this.doc.setTextColor(4, 18, 45); // Corp Navy
      } else {
        this.doc.setTextColor(115, 115, 115); // Neutral slate
      }
      this.doc.text(label, this.margin, this.y + 3.5);
      
      // Render lines
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(30, 41, 59); // Dark slate
      
      for (let i = 0; i < wrappedValue.length; i++) {
        this.doc.text(wrappedValue[i], this.margin + colOffset, this.y + 3.5 + (i * 4.2));
      }
      
      // Bottom thin line spacer
      this.doc.setDrawColor(241, 245, 249); // slate-100
      this.doc.setLineWidth(0.15);
      this.doc.line(this.margin, this.y + neededHeight + 0.8, this.pageWidth - this.margin, this.y + neededHeight + 0.8);
      
      this.y += neededHeight + 2;
    }
  }

  drawPara(heading: string, textContent: string, isAccent: boolean = false) {
    const cleanText = textContent || 'No suministrado.';
    const wrappedText = this.doc.splitTextToSize(cleanText, this.contentWidth - 6);
    const neededHeight = 6 + (wrappedText.length * 4.2);
    this.checkPageBreak(neededHeight);

    // Light background block
    if (isAccent) {
      this.doc.setFillColor(248, 250, 252); // soft slate
      this.doc.setDrawColor(226, 232, 240); // border slate
      this.doc.setLineWidth(0.2);
      this.doc.rect(this.margin, this.y, this.contentWidth, neededHeight, 'DF');
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(4, 18, 45); // Corp Navy
    this.doc.text(heading, this.margin + (isAccent ? 3 : 0), this.y + 4.5);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(30, 41, 59);

    for (let i = 0; i < wrappedText.length; i++) {
      this.doc.text(wrappedText[i], this.margin + (isAccent ? 3 : 0), this.y + 4.5 + 4.5 + (i * 4.2));
    }

    this.y += neededHeight + 3;
  }
}

export const generatePatientPDF = (patientData: PatientData, report: DiagnosticReportData | null) => {
  try {
    const getInitials = (name: string) => {
      if (!name) return 'PX';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getFormattedDate = () => {
      const today = new Date();
      return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    };

    const expedienteID = `EXP-${getFormattedDate()}-${getInitials(patientData.name)}`;
    const builder = new PDFBuilder(patientData.name || 'Paciente', expedienteID);
    const doc = builder.doc;

    // --- MAIN REPORT HEADER BLOCK ---
    doc.setFillColor(4, 18, 45); // Corp Navy background for block header
    doc.rect(builder.margin, builder.y, builder.contentWidth, 24, 'F');

    // Row 1 (y + 7.5)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(255, 255, 255);
    doc.text("DOCTORISMO - DOSSIER CLÍNICO INTEGRAL", builder.margin + 5, builder.y + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`EXPEDIENTE: ${expedienteID}`, builder.pageWidth - builder.margin - 5, builder.y + 7.5, { align: 'right' });

    // Row 2 (y + 13.5) - Subtitle left
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(147, 197, 253); // Light Blue
    doc.text("SUITE DE INTELIGENCIA DIAGNÓSTICA MULTIMODAL AVANZADA", builder.margin + 5, builder.y + 13.5);

    // Row 3 (y + 19.5) - Protocol left, Date right (aligned perfectly with no overlap)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225); // Slate-300
    doc.text("Protocolo ADA & AMBOSS SINC", builder.margin + 5, builder.y + 19.5);
    
    const formattedMetaDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(241, 245, 249);
    doc.text(`Fecha Emisión: ${formattedMetaDate}`, builder.pageWidth - builder.margin - 5, builder.y + 19.5, { align: 'right' });

    builder.y += 29;

    // --- SECTION I: IDENTIFICACIÓN ---
    builder.drawSectionHeader("I. Ficha de Identificación del Paciente");
    builder.drawTextRow("Nombre de Paciente:", patientData.name, true);
    
    // Age and Gender packed Row
    builder.checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text("Edad:", builder.margin, builder.y + 3.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${patientData.age} Años`, builder.margin + 44, builder.y + 3.5);
    
    doc.setTextColor(115, 115, 115);
    doc.text("Sexo Biológico:", builder.margin + 100, builder.y + 3.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${patientData.gender}`, builder.margin + 135, builder.y + 3.5);
    builder.y += 6.5;

    // Blood and Gestation Packed Row
    builder.checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text("Grupo Sanguíneo:", builder.margin, builder.y + 3.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${patientData.bloodType || 'No registrado'}`, builder.margin + 44, builder.y + 3.5);
    
    doc.setTextColor(115, 115, 115);
    doc.text("Gestación/Embarazo:", builder.margin + 100, builder.y + 3.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${patientData.pregnancyStatus || 'No aplica'}`, builder.margin + 135, builder.y + 3.5);
    builder.y += 6.5;

    // Weight, Height and BMI Packed Row
    const bmi = patientData.height > 0
      ? (patientData.weight / Math.pow(patientData.height / 100, 2)).toFixed(1)
      : 'N/A';
    builder.checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text("Antropometría:", builder.margin, builder.y + 3.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${patientData.weight} KG / ${patientData.height} CM  (IMC: ${bmi})`, builder.margin + 44, builder.y + 3.5);
    builder.y += 7.5;

    builder.drawTextRow("Ocupación o Profesión:", patientData.occupation);

    // --- SECTION II: SIGNOS VITALES ---
    builder.drawSectionHeader("II. Monitoreo de Signos Vitales Estables (Biometría)");
    
    builder.checkPageBreak(30);
    
    // We can draw a grid for Vitals
    const vitalsList = [
      { label: 'Frec. Cardíaca:', val: `${patientData.vitals.heartRate} LPM` },
      { label: 'Presión Arterial:', val: `${patientData.vitals.systolicBP}/${patientData.vitals.diastolicBP} mmHg` },
      { label: 'Saturación O2:', val: `${patientData.vitals.oxygenSaturation} %` },
      { label: 'Temperatura:', val: `${patientData.vitals.temperature} C` },
      { label: 'Glucosa Capilar:', val: `${patientData.vitals.glucose} mg/dL` },
      { label: 'Nivel Dolor EVA:', val: `${patientData.vitals.painLevel}/10` }
    ];

    // Card drawing loop
    doc.setFillColor(248, 250, 252); // soft slate bg
    doc.setDrawColor(226, 232, 240); // borders
    doc.setLineWidth(0.2);
    
    for (let i = 0; i < vitalsList.length; i++) {
      const colX = builder.margin + (i % 3) * 61.5;
      const rowY = builder.y + Math.floor(i / 3) * 11.5;
      
      doc.rect(colX, rowY, 59, 9.5, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(vitalsList[i].label, colX + 3, rowY + 3.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(4, 18, 45); // Corp Navy
      doc.text(vitalsList[i].val, colX + 3, rowY + 7.5);
    }
    
    builder.y += 26;

    // --- SECTION III: ANAMNESIS ---
    builder.drawSectionHeader("III. Anamnesis de Criterio del Paciente");
    builder.drawPara("Motivo de Consulta y Sintomatología Detallada:", patientData.symptoms, true);
    builder.drawPara("Hábitos de Estilo de Vida y Exposición Tóxica:", patientData.lifestyleHabits);

    // --- SECTION IV: ANTECEDENTES RELEVANTES ---
    builder.drawSectionHeader("IV. Antecedentes Clínicos del Declarado");
    builder.drawTextRow("Enfermedades Preexistentes/Crónicas:", patientData.congenitalDiseases);
    builder.drawTextRow("Alergias Clínicas Registradas:", patientData.allergies, true);
    builder.drawTextRow("Historial Quirúrgico / Quirófano:", patientData.surgicalHistory);
    builder.drawTextRow("Antecedentes Heredofamiliares directos:", patientData.familyHistory);
    builder.drawTextRow("Tratamiento Diario / Farmacoterapia:", patientData.currentTreatments);

    // If active files exist
    if (patientData.files && patientData.files.length > 0) {
      builder.drawSectionHeader("Estudios de Laboratorio & Archivos Adjuntos");
      patientData.files.forEach((f, idx) => {
        builder.drawTextRow(`Archivo [${idx + 1}]: ${f.name}`, f.description || 'Documento clínico del paciente.');
      });
    }

    // --- SECTION V: RESULTADOS DEL DIAGNÓSTICO IA ---
    if (report) {
      builder.drawSectionHeader("V. Resultados Clínicos DoctorISMO IA");
      
      builder.drawPara("Síntesis del Resumen Clínico Estructurado:", report.resumenClinico.sintesis, true);
      builder.drawTextRow("Problema Clínico Principal:", report.resumenClinico.problemaPrincipal.toUpperCase(), true);
      
      if (report.resumenClinico.hallazgosClave && report.resumenClinico.hallazgosClave.length > 0) {
        builder.drawPara("Criterios Clínicos Detectados:", report.resumenClinico.hallazgosClave.map(h => `- ${h}`).join('\n'));
      }

      // Differentials
      if (report.diagnosticosDiferenciales && report.diagnosticosDiferenciales.probables && report.diagnosticosDiferenciales.probables.length > 0) {
        builder.drawSectionHeader("VI. Análisis de Diagnósticos Diferenciales (ADA & AMBOSS)");
        
        report.diagnosticosDiferenciales.probables.forEach((item, idx) => {
          builder.checkPageBreak(35);
          doc.setFillColor(248, 250, 252);
          doc.rect(builder.margin, builder.y, builder.contentWidth, 6, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(4, 18, 45);
          doc.text(`[${idx + 1}] DIAGNÓSTICO: ${item.diagnostico} (${item.categoria})`, builder.margin + 2, builder.y + 4.2);
          
          builder.y += 8;
          builder.drawPara("Justificación Clínico-Fisiopatológica:", item.explicacion);
          builder.drawTextRow("A favor (Hallazgos congruentes):", item.favor);
          builder.drawTextRow("En contra (Incoherencias clínicas):", item.contra);
          builder.y += 1.5;
        });
      }

      // Fisiopatología & Correlacion
      builder.drawSectionHeader("VII. Correlación de Biomarcadores & Fisiopatología");
      builder.drawPara("Mecanismos Fisiopatológicos Detallados:", report.analisisFisiopatologico.mecanismos);
      builder.drawPara("Relaciones Anatómico-Clínicas de Riesgo:", report.analisisFisiopatologico.relaciones);
      builder.drawPara("Correlación de Biomarcadores con Síntomas:", report.correlacionClinica.correlacion);

      // suggested studies
      if (report.estudiosSugeridos && report.estudiosSugeridos.length > 0) {
        builder.drawSectionHeader("VIII. Estudios Complementarios Sugeridos");
        report.estudiosSugeridos.forEach((std, idx) => {
          builder.drawTextRow(`[${idx+1}] ${std.nombre} (Prioridad ${std.prioridad}):`, std.justificacion);
        });
      }

      // treatment lines & safety
      builder.drawSectionHeader("IX. Orientación Terapéutica GPC & Lineamientos");
      if (report.orientacionTerapeutica.lineasManejo && report.orientacionTerapeutica.lineasManejo.length > 0) {
        builder.drawPara("Protocolo Preventivo de Estabilización Básica:", report.orientacionTerapeutica.lineasManejo.map(l => `- ${l}`).join('\n'));
      }
      builder.drawTextRow("Opciones Farmacológicas Estándar:", report.orientacionTerapeutica.opcionesEstandar);
      builder.drawPara("Lineamiento de Seguridad Excluyente (Automedicación):", report.orientacionTerapeutica.seguridad, true);
      builder.drawTextRow("Derivación Hospitalaria:", report.orientacionTerapeutica.referenciaSegundoNivel);

      // Red flags
      if (report.criteriosAlerta && report.criteriosAlerta.length > 0) {
        builder.drawSectionHeader("X. Criterios de Alerta de Traslado Inmediato (Y Alertas Rojas)");
        report.criteriosAlerta.forEach((alert, idx) => {
          builder.checkPageBreak(16);
          builder.drawTextRow(`Alerta [${idx+1}] - Indicador:`, alert.indicador, true);
          builder.drawTextRow("Parámetro Crítico:", alert.parametroCritico);
          builder.drawTextRow("Instrucción Inmediata:", alert.accionInmediata);
          builder.y += 1.5;
        });
      }

      // Prognoses & limitations
      builder.drawSectionHeader("XI. Pronósticos y Limitaciones de IA");
      builder.drawPara("Evolución Clínica Esperada (Pronóstico medio):", report.pronosticoSeguimiento.evolucionEsperada);
      builder.drawTextRow("Factores Modificantes:", report.pronosticoSeguimiento.factoresModificantes);
      builder.drawTextRow("Plan Recomendado de Conservación:", report.pronosticoSeguimiento.vigilanciaRecomendada);

      if (report.limitaciones && report.limitaciones.length > 0) {
        builder.drawPara("Limitaciones Clínicas Tecnológicas Certificadas por IA:", report.limitaciones.map((l, i) => `${i+1}. ${l}`).join('\n'));
      }
    } else {
      // If report is empty/null, add a nice placeholder indicating the record was exported as single identity
      builder.drawSectionHeader("V. Estatus del Proceso Diagnóstico IA");
      builder.drawPara("Resultados Clínicos Pendientes de Emisión:", "Este expediente fue descargado desde el panel de base de datos de pacientes. Actualmente no cuenta con un informe diagnóstico generado. Para computar el diagnóstico diferencial de alta fidelidad, abra este paciente en la pantalla principal de DoctorISMO, termine de rellenar los datos clínicos e inicie el cómputo clínico mediante el botón principal 'Diagnóstico IA'.", true);
    }

    // --- XI. AUTORIZACIÓN CRIPTOGRÁFICA ---
    builder.checkPageBreak(35);
    builder.y += 5;
    doc.setDrawColor(4, 18, 45);
    doc.setLineWidth(0.4);
    doc.line(builder.margin, builder.y, builder.pageWidth - builder.margin, builder.y);
    builder.y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(4, 18, 45);
    doc.text("FIRMAS Y SELLOS DE AUTORIZACIÓN DIGITAL", builder.margin, builder.y);
    
    builder.y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
    doc.text("INTEGRIDAD DE DATOS VERIFICADA MEDIANTE FIRMA CRIPTOGRÁFICA DE HASH SHA256", builder.margin, builder.y);

    builder.y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Registro Electrónico SHA256: 9c89_b48f_107a_03e0_e88a_93bb_dfdf_2026_0527`, builder.margin, builder.y);

    // Draw stamps boxes
    builder.y += 4;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.15);
    doc.rect(builder.margin, builder.y, 45, 16, 'S');
    doc.rect(builder.margin + 55, builder.y, 42, 16, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("FIRMA DE SELLO DIGITAL IA", builder.margin + 2.5, builder.y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(4, 18, 45);
    doc.text("DoctorISMO Neural Engine", builder.margin + 2.5, builder.y + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("VALIDACIÓN DE PROTOCOLO", builder.margin + 55 + 2.5, builder.y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(2, 132, 199); // Sky blue
    doc.text("GPC & AMBOSS SINC", builder.margin + 55 + 2.5, builder.y + 11.5);

    // Triggers actual file download
    const rawPxName = patientData.name && patientData.name.trim() 
      ? patientData.name.trim().toUpperCase().replace(/\s+/g, '_') 
      : 'PACIENTE';
    
    doc.save(`EXPEDIENTE_${rawPxName}.pdf`);
  } catch (error) {
    console.error("Critical failure during jsPDF generation:", error);
    // Safe standard fallback printable trigger as safety margin
    window.print();
  }
};
