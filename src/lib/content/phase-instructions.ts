export interface PhaseInstruction {
  icon: string;
  title: string;
  description?: string;
  danger?: boolean;
}

export interface PhaseAlert {
  icon: string;
  text: string;
  type: "info" | "danger";
}

export interface PhaseContent {
  instructions: PhaseInstruction[];
  alerts?: PhaseAlert[];
}

export const PHASE_INSTRUCTIONS: Record<string, PhaseContent> = {
  pre_15: {
    instructions: [
      { icon: "💊", title: "Suspender Minoxidil", description: "Si estas en tratamiento, suspender desde hoy." },
      { icon: "🔍", title: "Revisar cuero cabelludo", description: "Si hay picor, enrojecimiento o caspa, comunicarlo a la clinica para tratarlo antes de la cirugia." },
      { icon: "💊", title: "Suspender complejos vitaminicos", description: "Especialmente Vitamina E y hierbas como Ginkgo Biloba. Alteran la cicatrizacion." },
      { icon: "🏋️", title: "Reducir deporte", description: "Evitar ejercicio de alta intensidad (aumenta el sangrado)." },
    ],
    alerts: [
      {
        icon: "🧪",
        text: "Analitica preoperatoria obligatoria: Hemograma completo, Bioquimica (Glucosa, Creatinina, Urea, ALT, AST), Coagulacion (INR, TP, TTPA), Serologia (HIV, Sifilis, VHB, VHC).",
        type: "info",
      },
    ],
  },

  pre_7: {
    instructions: [
      { icon: "🚫", title: "Alcohol", description: "Suspender completamente.", danger: true },
      { icon: "🚫", title: "Cafeina, teina, taurina", description: "Suspender cualquier bebida excitante.", danger: true },
      { icon: "🚫", title: "Tabaco", description: "Interfiere en la cicatrizacion, favorece infecciones y reduce la tasa de injerto.", danger: true },
      { icon: "🚫", title: "Estupefacientes", description: "Suspender cualquier consumo.", danger: true },
      { icon: "🚫", title: "Deporte", description: "Suspender completamente.", danger: true },
      { icon: "🚫", title: "Aspirina y AINEs", description: "No tomar antiinflamatorios. Si tomas alguno, consultar al medico.", danger: true },
      { icon: "🚫", title: "Exposicion solar excesiva", description: "Proteger el cuero cabelludo.", danger: true },
      { icon: "✂️", title: "No cortarse el pelo", description: "Salvo indicacion del cirujano. Lo cortan en la clinica antes de quirofano.", danger: true },
    ],
  },

  pre_2: {
    instructions: [
      { icon: "🎨", title: "Tinte de pelo", description: "Solo si tienes cabello canoso o muy rubio: tenirse de castano oscuro o negro para ver mejor los foliculos. La clinica te lo indicara." },
      { icon: "😴", title: "Evitar estres", description: "Procura descansar y dormir 8 horas la noche anterior." },
    ],
    alerts: [
      {
        icon: "🛒",
        text: "Tenlo todo preparado: Agua Termal (spray AVENE), Mustela Mousse (champu espuma bebes), Blastoestimulina (pomada cicatrizante), Suero fisiologico, Agua oxigenada, Almohada cervical (collarin de viaje), Toalla microfibra o gasas esteriles, Champu pH neutro (para dia 15+).",
        type: "info",
      },
    ],
  },

  surgery_day: {
    instructions: [
      { icon: "🚿", title: "Ducharse y lavar bien el cabello", description: "Con champu. SIN geles, lacas, gomina ni productos cosmeticos." },
      { icon: "🥞", title: "Desayuno ligero", description: "Yogur con frutas, leche con avena, tostada con pavo y zumo, barras de proteina. Si la OP es por la tarde, comida poco copiosa." },
      { icon: "💊", title: "Medicacion habitual", description: "Tomarla con normalidad EXCEPTO la que te indicaron suspender." },
      { icon: "👔", title: "Ropa comoda", description: "Camisa de botones, sudadera con cremallera o chaqueta que NO pase por la cabeza. Sin joyas ni bisuteria en cuello, manos o brazos." },
    ],
    alerts: [
      {
        icon: "❗",
        text: "IMPRESCINDIBLE: Llevar todos los informes medicos y comunicar al cirujano todos los antecedentes clinicos, habitos y medicaciones (especialmente anticoagulantes, diabetes, etc.).",
        type: "danger",
      },
    ],
  },

  post_1_2: {
    instructions: [
      { icon: "💧", title: "Dia 1 — HIDRATAR cada 30 min", description: "La zona injertada con Agua Termal (mientras estes despierto)." },
      { icon: "🩹", title: "Dia 1 — Zona donante cubierta", description: "Dejar el vendaje puesto. Evitar tocar la cabeza." },
      { icon: "🚗", title: "Dia 1 — No conducir", description: "En las primeras 24h por anestesia y sedacion." },
      { icon: "💧", title: "Dia 2 — Seguir hidratando cada 30 min", description: "Continuar con Agua Termal en zona injertada." },
      { icon: "🩹", title: "Dia 2 — Primera cura zona donante", description: "Retirar vendaje, aplicar suero o agua oxigenada, limpiar y aplicar capa fina de Blastoestimulina (2 veces al dia)." },
      { icon: "🏥", title: "Dia 2 — Cura en clinica", description: "A las 24/72h si puedes desplazarte." },
    ],
    alerts: [
      {
        icon: "🛏️",
        text: "Postura para dormir (15 primeros dias): Boca arriba a 45°, con varias almohadas y collarin de viaje. Nariz mirando hacia arriba. No mover la cabeza.",
        type: "info",
      },
      {
        icon: "🚨",
        text: "CUIDADO: No rozar ni golpear la zona implantada. El mas minimo roce puede provocar la caida de unidades foliculares. El injerto no se consolida hasta el dia 7-8.",
        type: "danger",
      },
    ],
  },

  post_3_4: {
    instructions: [
      { icon: "💧", title: "Seguir hidratando cada 30 min", description: "Continuar con Agua Termal en zona injertada." },
      { icon: "🧴", title: "Dia 3 — Primer lavado SOLO zona donante", description: "1. Aplicar agua tibia → 2. Aplicar champu, dejar actuar 5 min → 3. Masajes circulares suaves sin presion para eliminar costras → 4. Aclarar con agua tibia → 5. Secar con toalla de microfibra o gasas → 6. Aplicar capa fina de Blastoestimulina." },
      { icon: "🧴", title: "Dia 4 — Continuar lavado donante", description: "Mismo lavado de zona donante + Blastoestimulina." },
    ],
  },

  post_5_7: {
    instructions: [
      { icon: "💧", title: "Seguir hidratando cada 30 min", description: "Continuar con Agua Termal en zona injertada." },
      { icon: "🧴", title: "Dia 5 — Primer lavado zona receptora (2 veces/dia)", description: "1. Dejar caer agua suavemente (SIN chorro directo) → 2. Aplicar espuma Mustela SIN TOCAR, dejar actuar 5 min → 3. Aclarar con mucho cuidado → 4. Dejar secar al aire (nunca toalla ni secador)." },
      { icon: "🧴", title: "Continuar lavado zona donante", description: "Mismo protocolo + Blastoestimulina." },
      { icon: "🧴", title: "Dia 7 — Blastoestimulina", description: "Ya NO es necesario aplicar Blastoestimulina en zona donante." },
    ],
    alerts: [
      {
        icon: "📸",
        text: "RECORDAR: Enviar fotos a la clinica el DIA 7 y el DIA 10.",
        type: "info",
      },
    ],
  },

  post_8_15: {
    instructions: [
      { icon: "💧", title: "Seguir hidratando zona injertada", description: "Continuar con Agua Termal." },
      { icon: "🧴", title: "Lavado zona receptora — cambio (1 vez al dia)", description: "1. Enjuagar con agua tibia → 2. Aplicar espuma Mustela, dejar actuar 5 min → 3. Masajes circulares suaves con yema de los dedos (presion ligera) durante 5 min → 4. Aclarar con cuidado → 5. Dejar secar al aire." },
      { icon: "⚠️", title: "Las costras se desprenden solas", description: "NO arrancarlas nunca." },
      { icon: "🧴", title: "Continuar lavado zona donante", description: "Mismo protocolo." },
    ],
    alerts: [
      {
        icon: "📸",
        text: "RECORDAR: Enviar fotos a la clinica el DIA 10.",
        type: "info",
      },
    ],
  },

  post_15_30: {
    instructions: [
      { icon: "✅", title: "Lavado normal", description: "Una vez sin costras, lavar el pelo con normalidad con champu de pH neutro. Puedes dejar caer el chorro de la ducha directamente." },
      { icon: "🏋️", title: "Dia 15+ — Puedes hacer ejercicio suave", description: "Nada de alta intensidad, pesas ni contacto hasta cumplir 30 dias." },
      { icon: "🧢", title: "Dia 10+ — Puedes usar gorra holgada", description: "Gorra o sombrero holgado permitido." },
    ],
  },

  post_30_90: {
    instructions: [
      { icon: "✂️", title: "Puedes cortarte el pelo", description: "Maquinilla en zona donante, tijera en zona receptora." },
      { icon: "☀️", title: "Proteccion solar", description: "Usar gorra o proteccion solar SPF 50 al exponerse al sol (hasta 3-4 meses)." },
      { icon: "🎨", title: "Mes 2+ — Puedes tenir el pelo", description: "Solo tintes vegetales sin amoniaco." },
      { icon: "🧴", title: "Mes 3+ — Productos quimicos", description: "Puedes usar gominas, lacas, etc." },
    ],
    alerts: [
      {
        icon: "💇",
        text: "El shedding (caida de los pelos trasplantados) es completamente normal en esta fase. Los foliculos estan entrando en fase de crecimiento.",
        type: "info",
      },
    ],
  },

  post_90_180: {
    instructions: [
      { icon: "🌱", title: "Primeros resultados visibles", description: "Los primeros pelos nuevos son permanentes. Ya no caeran." },
      { icon: "☀️", title: "Seguir con proteccion solar", description: "Hasta cumplir 4 meses, usa gorra o SPF 50." },
    ],
  },

  post_180_365: {
    instructions: [
      { icon: "📈", title: "Crecimiento significativo", description: "El crecimiento se acelera. Cada mes veras mas resultados." },
    ],
  },

  post_365_plus: {
    instructions: [
      { icon: "🎉", title: "Resultado final", description: "Tu trasplante esta madurando. El resultado final esta aqui." },
    ],
  },
};

// General post-operative restrictions timeline
export const POST_OP_RESTRICTIONS = [
  { period: "Primeros 3 dias", text: "No cafeina, teina ni excitantes." },
  { period: "Primeros 5 dias", text: "Reposo relativo." },
  { period: "Primeros 10 dias", text: "No fumar ni estupefacientes. No agacharse, postura erguida. Ropa que no pase por la cabeza. Evitar relaciones sexuales. Movil/tablet a la altura de los ojos." },
  { period: "Primeros 15 dias", text: "No ejercicio fisico ni deporte." },
  { period: "Evitar alcohol", text: "Hasta acabar toda la medicacion." },
  { period: "Primeros 30 dias", text: "No deporte intenso, pesas ni contacto. No usar casco. Evitar sol directo." },
  { period: "A partir de 1 mes", text: "Puedes cortarte el pelo (maquinilla donante, tijera receptora)." },
  { period: "A partir de 2 meses", text: "Puedes tenir (tintes vegetales sin amoniaco)." },
  { period: "A partir de 3 meses", text: "Puedes usar productos quimicos (gominas, lacas, etc)." },
  { period: "Hasta 3-4 meses", text: "Gorra o proteccion solar SPF 50 al exponerse al sol." },
  { period: "Alimentacion", text: "Normal, sin restricciones desde el dia 1." },
];

// Wash schedule summary
export const WASH_SCHEDULE = [
  { period: "Dias 1 a 4", steps: ["Solo HIDRATAR con Agua Termal", "Cada 30 min (max cada 2 horas)"], frequency: "" },
  { period: "Dias 5 a 7", steps: ["Hidratar + enjuagar", "Aplicar espuma Mustela SIN tocar", "Aclarar con cuidado", "Secar al aire"], frequency: "2 veces al dia" },
  { period: "Dias 8 a 15", steps: ["Hidratar + enjuagar", "Aplicar espuma Mustela", "Masajear con yemas", "Aclarar con cuidado", "Secar al aire"], frequency: "1 vez al dia" },
  { period: "Desde dia 15", steps: ["Lavado normal con champu pH neutro"], frequency: "Normal" },
];
