-- ============================================================
-- SEED: Clinica Capilex Madrid + Protocolo FUE Standard
-- Datos extraidos de los documentos oficiales de Capilex
-- ============================================================

-- 1. CLINICA
INSERT INTO clinics (id, name, slug, address, phone, email, timezone) VALUES
('00000000-0000-0000-0000-000000000001',
 'Capilex Madrid', 'capilex-madrid',
 'Madrid, Espana', NULL, 'recetas@capilexmadrid.es', 'Europe/Madrid');

-- 2. PROTOCOLO FUE STANDARD
INSERT INTO care_protocols (id, clinic_id, name, description, intervention_type, pre_op_days, post_op_days, is_default) VALUES
('00000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000001',
 'FUE Standard Capilex',
 'Protocolo estandar de trasplante capilar FUE de Clinica Capilex Madrid',
 'fue', 15, 540, true);

-- ============================================================
-- 3. PROTOCOL TASK ITEMS (tareas por dia)
-- ============================================================

-- === PRE-OP: 15 DIAS ANTES (day_offset = -15) ===
INSERT INTO protocol_task_items (protocol_id, day_offset, day_offset_end, title, description, category, frequency, priority, sort_order, icon) VALUES
('00000000-0000-0000-0000-000000000010', -15, -8, 'Suspender Minoxidil', 'Si esta en tratamiento con minoxidil, debe suspenderlo.', 'restriction', 'once', 'high', 1, '💊'),
('00000000-0000-0000-0000-000000000010', -15, -8, 'Revisar cuero cabelludo', 'Si nota picor, enrojecimiento o caspa, comunicarlo a la clinica para tratarlo antes de la cirugia.', 'care', 'once', 'high', 2, '🔍'),
('00000000-0000-0000-0000-000000000010', -15, -8, 'Suspender complejos vitaminicos', 'Suspender Vitamina E y hierbas medicinales como Ginkgo Biloba. Alteran la cicatrizacion.', 'restriction', 'once', 'high', 3, '💊'),
('00000000-0000-0000-0000-000000000010', -15, -8, 'Reducir deporte de alta intensidad', 'El ejercicio intenso aumenta el sangrado durante la cirugia.', 'restriction', 'once', 'normal', 4, '🏃'),
('00000000-0000-0000-0000-000000000010', -15, -1, 'Realizar analitica preoperatoria', 'Hemograma completo, bioquimica, coagulacion (INR, TP, TTPA), serologia (HIV, Sifilis, VHB, VHC).', 'appointment', 'once', 'critical', 5, '🧪'),

-- === PRE-OP: 7 DIAS ANTES (day_offset = -7) ===
('00000000-0000-0000-0000-000000000010', -7, -1, 'Suspender alcohol', 'Suspender completamente el consumo de alcohol.', 'restriction', 'once', 'critical', 1, '🚫'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'No cafeina, teina ni excitantes', 'No tomar bebidas con cafeina, teina, taurina o excitantes.', 'restriction', 'once', 'high', 2, '☕'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'Dejar de fumar', 'El tabaco interfiere en la cicatrizacion, favorece infecciones y reduce la tasa de injerto.', 'restriction', 'once', 'critical', 3, '🚭'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'Suspender estupefacientes', 'Suspender cualquier consumo de estupefacientes.', 'restriction', 'once', 'critical', 4, '🚫'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'Suspender todo deporte', 'Suspender completamente el ejercicio fisico.', 'restriction', 'once', 'high', 5, '🏋️'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'No tomar Aspirina ni AINEs', 'No tomar antiinflamatorios. Consultar al medico para sustituirlos si es necesario.', 'restriction', 'once', 'critical', 6, '💊'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'Evitar exposicion solar excesiva', 'Proteger el cuero cabelludo del sol para no causar irritacion.', 'restriction', 'once', 'normal', 7, '☀️'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'No cortarse el cabello', 'Lo cortaran en la clinica antes de entrar a quirofano, tras el diseno.', 'restriction', 'once', 'normal', 8, '✂️'),

-- === PRE-OP: 2 DIAS ANTES (day_offset = -2) ===
('00000000-0000-0000-0000-000000000010', -2, -1, 'Tenir cabello si canoso/rubio', 'Si tiene cabello canoso o muy rubio, tenirse castano oscuro o negro para ver mejor los foliculos. La clinica lo indicara.', 'care', 'once', 'normal', 1, '🎨'),
('00000000-0000-0000-0000-000000000010', -2, -1, 'Descansar y dormir 8 horas', 'Evitar estres excesivo. Descansar y dormir 8 horas la noche anterior.', 'care', 'once', 'high', 2, '😴'),
('00000000-0000-0000-0000-000000000010', -2, -1, 'Comprar productos necesarios', 'Agua Termal AVENE, Mustela Mousse, Blastoestimulina, almohada cervical, suero, agua oxigenada.', 'care', 'once', 'critical', 3, '🛒'),

-- === DIA DE LA INTERVENCION (day_offset = 0) ===
('00000000-0000-0000-0000-000000000010', 0, NULL, 'Ducharse y lavar cabello', 'Ducha con champu. SIN geles, lacas, gomina ni productos cosmeticos.', 'hygiene', 'once', 'critical', 1, '🚿'),
('00000000-0000-0000-0000-000000000010', 0, NULL, 'Desayuno ligero', 'Yogur con frutas, leche con avena, tostada con pavo y zumo, barras de proteina. Si OP por la tarde, comida poco copiosa.', 'care', 'once', 'high', 2, '🥞'),
('00000000-0000-0000-0000-000000000010', 0, NULL, 'Tomar medicacion habitual', 'Tomar medicacion habitual EXCEPTO la que indicaron suspender.', 'medication', 'once', 'high', 3, '💊'),
('00000000-0000-0000-0000-000000000010', 0, NULL, 'Vestir ropa comoda con botones', 'Camisa de botones, sudadera con cremallera. Que NO pase por la cabeza. Sin joyas.', 'care', 'once', 'high', 4, '👔'),
('00000000-0000-0000-0000-000000000010', 0, NULL, 'Llevar informes medicos', 'IMPRESCINDIBLE: todos los informes medicos, antecedentes clinicos, habitos, medicaciones.', 'appointment', 'once', 'critical', 5, '📋'),

-- === POST-OP DIA 1 (day_offset = 1) ===
('00000000-0000-0000-0000-000000000010', 1, 4, 'Hidratar zona injertada cada 30 min', 'Pulverizar Agua Termal en zona implantada cada 30 minutos mientras este despierto.', 'care', 'every_30min', 'critical', 1, '💧'),
('00000000-0000-0000-0000-000000000010', 1, NULL, 'Mantener zona donante cubierta', 'Dejar el vendaje de la zona donante sin tocar.', 'care', 'once', 'high', 2, '🩹'),
('00000000-0000-0000-0000-000000000010', 1, 15, 'No tocar la zona receptora', 'El mas minimo roce puede provocar la caida de unidades foliculares. Injerto no consolida hasta dia 7-8.', 'restriction', 'once', 'critical', 3, '🚫'),
('00000000-0000-0000-0000-000000000010', 1, NULL, 'No conducir', 'No conducir en las primeras 24h por la anestesia local y la sedacion oral.', 'restriction', 'once', 'high', 4, '🚗'),
('00000000-0000-0000-0000-000000000010', 1, 15, 'Dormir boca arriba a 45 grados', 'Decubito supino con varias almohadas y collarin de viaje. Nariz mirando arriba. No mover la cabeza.', 'care', 'daily', 'critical', 5, '🛏️'),

-- === POST-OP DIA 2 (day_offset = 2) ===
('00000000-0000-0000-0000-000000000010', 2, NULL, 'Primera cura zona donante', 'Retirar vendaje, aplicar suero o agua oxigenada, limpiar, aplicar capa fina de Blastoestimulina (2 veces/dia).', 'hygiene', 'once', 'critical', 1, '🩹'),
('00000000-0000-0000-0000-000000000010', 2, NULL, 'Cura en clinica si posible', 'Realizar la cura en la clinica a las 24/72h si puede desplazarse.', 'appointment', 'once', 'normal', 2, '🏥'),

-- === POST-OP DIA 3-4 (day_offset = 3) ===
('00000000-0000-0000-0000-000000000010', 3, 7, 'Lavar zona donante', 'Humedecer, champu con masaje circular suave sin presion, dejar 5-10 min, aclarar agua tibia. Secar con toalla microfibra.', 'hygiene', 'daily', 'high', 1, '🧴'),
('00000000-0000-0000-0000-000000000010', 3, 6, 'Aplicar Blastoestimulina zona donante', 'Capa fina de Blastoestimulina solo en zona donante despues de cada lavado.', 'care', 'daily', 'high', 2, '💊'),

-- === POST-OP DIA 5-7 (day_offset = 5) ===
('00000000-0000-0000-0000-000000000010', 5, 7, 'Lavar zona receptora (SIN tocar)', 'Dejar caer agua suave (sin chorro directo), aplicar espuma Mustela SIN TOCAR, dejar 5 min, aclarar con cuidado. Secar al aire.', 'hygiene', 'twice_daily', 'critical', 1, '💧'),

-- === POST-OP DIA 7 ===
('00000000-0000-0000-0000-000000000010', 7, NULL, 'ENVIAR FOTOS a la clinica', 'Tomar fotos de zona receptora (frente y arriba) y zona donante. Enviar a la clinica.', 'photo', 'once', 'critical', 1, '📸'),

-- === POST-OP DIA 8-15 (day_offset = 8) ===
('00000000-0000-0000-0000-000000000010', 8, 15, 'Lavar zona receptora CON masaje suave', 'Enjuagar, espuma Mustela 5 min, masajes circulares suaves con yema de dedos 5 min, aclarar. Secar al aire. 1 vez al dia.', 'hygiene', 'daily', 'high', 1, '🧴'),
('00000000-0000-0000-0000-000000000010', 8, 15, 'No arrancar costras', 'Las costras se desprenden solas con los lavados. NUNCA arrancarlas.', 'restriction', 'once', 'critical', 2, '🚫'),

-- === POST-OP DIA 10 ===
('00000000-0000-0000-0000-000000000010', 10, NULL, 'ENVIAR FOTOS a la clinica', 'Segundo envio de fotos de seguimiento. Zona receptora y zona donante.', 'photo', 'once', 'critical', 1, '📸'),

-- === MEDIDAS GENERALES POST-OP ===
('00000000-0000-0000-0000-000000000010', 1, 3, 'No cafeina, teina ni excitantes', 'Evitar cafeina, teina y excitantes los 3 primeros dias.', 'restriction', 'once', 'high', 10, '☕'),
('00000000-0000-0000-0000-000000000010', 1, 5, 'Reposo relativo', 'Guardar reposo relativo los 5 primeros dias.', 'restriction', 'once', 'high', 11, '🛋️'),
('00000000-0000-0000-0000-000000000010', 1, 10, 'No fumar ni estupefacientes', 'No fumar ni tomar estupefacientes los primeros 10 dias.', 'restriction', 'once', 'critical', 12, '🚭'),
('00000000-0000-0000-0000-000000000010', 1, 10, 'No agacharse, postura erguida', 'Mantener postura erguida. Movil/tablet a la altura de los ojos.', 'restriction', 'once', 'high', 13, '🧍'),
('00000000-0000-0000-0000-000000000010', 1, 10, 'Ropa abierta por delante', 'Usar ropa que no pase por la cabeza: camisas de botones, cremalleras.', 'restriction', 'once', 'high', 14, '👔'),
('00000000-0000-0000-0000-000000000010', 1, 10, 'Evitar relaciones sexuales', 'Evitar relaciones sexuales los primeros 10 dias.', 'restriction', 'once', 'normal', 15, '❌'),
('00000000-0000-0000-0000-000000000010', 1, 15, 'No ejercicio fisico', 'No hacer ejercicio fisico ni deporte los primeros 15 dias.', 'restriction', 'once', 'high', 16, '🏋️'),
('00000000-0000-0000-0000-000000000010', 1, 30, 'Evitar sol directo', 'Evitar exposicion directa al sol los primeros 30 dias. Despues, gorra o SPF 50 hasta 3-4 meses.', 'restriction', 'once', 'high', 17, '☀️'),
('00000000-0000-0000-0000-000000000010', 1, 30, 'No deporte intenso/pesas/contacto', 'No deporte de alta intensidad, pesas ni deportes de contacto hasta pasados 30 dias.', 'restriction', 'once', 'high', 18, '🏋️'),
('00000000-0000-0000-0000-000000000010', 1, 30, 'No usar casco', 'No colocar casco en un plazo de 30 dias.', 'restriction', 'once', 'normal', 19, '⛑️'),
('00000000-0000-0000-0000-000000000010', 1, NULL, 'Evitar alcohol hasta fin medicacion', 'Evitar alcohol hasta acabar toda la medicacion (7 dias).', 'restriction', 'once', 'high', 20, '🍷');

-- ============================================================
-- 4. PROTOCOL MEDICATION ITEMS
-- ============================================================
INSERT INTO protocol_medication_items (protocol_id, name, category, dosage, frequency, start_day_offset, duration_days, is_mandatory, instructions, sort_order) VALUES
('00000000-0000-0000-0000-000000000010', 'Ciprofloxacino', 'antibiotic', '500 mg', 'Cada 12h (desayuno y cena)', 0, 7, true, 'Tomar con agua. Evitar lacteos 2h antes/despues. Antibiotico para prevenir infeccion.', 1),
('00000000-0000-0000-0000-000000000010', 'Paracetamol', 'painkiller', '1 g', 'Cada 8h (desayuno, comida, cena)', 0, 3, true, 'Primeros 3 dias pautado. Despues a demanda si hay dolor. No exceder 4g/dia.', 2),
('00000000-0000-0000-0000-000000000010', 'Prednisona', 'anti_inflammatory', '30 mg', 'Cada 24h en el desayuno', 0, 5, true, 'Dia de la intervencion incluido. Antiinflamatorio para reducir hinchazon.', 3),
('00000000-0000-0000-0000-000000000010', 'Omeprazol/Pantoprazol', 'gastric_protector', '20 mg', 'Cada 24h antes del desayuno', 0, 7, false, 'Protector gastrico recomendado mientras dure la medicacion para evitar molestias gastrointestinales.', 4);

-- ============================================================
-- 5. PROTOCOL SHOPPING ITEMS
-- ============================================================
INSERT INTO protocol_shopping_items (protocol_id, name, description, where_to_buy, category, icon, sort_order) VALUES
('00000000-0000-0000-0000-000000000010', 'Agua Termal', 'Spray tipo AVENE', 'Farmacia / Parafarmacia', 'essential', '💧', 1),
('00000000-0000-0000-0000-000000000010', 'Mustela Mousse', 'Champu espuma para bebes', 'Farmacia / Parafarmacia', 'essential', '🧴', 2),
('00000000-0000-0000-0000-000000000010', 'Blastoestimulina', 'Pomada cicatrizante', 'Farmacia (con o sin receta)', 'essential', '💊', 3),
('00000000-0000-0000-0000-000000000010', 'Suero fisiologico', 'Para limpiar zona donante', 'Farmacia', 'essential', '🧴', 4),
('00000000-0000-0000-0000-000000000010', 'Agua oxigenada', 'Para desinfectar zona donante', 'Farmacia / Supermercado', 'essential', '🧪', 5),
('00000000-0000-0000-0000-000000000010', 'Almohada cervical', 'Collarin de viaje', 'Amazon / Tienda de viaje / Bazar', 'essential', '🛏️', 6),
('00000000-0000-0000-0000-000000000010', 'Toalla microfibra', 'O gasas esteriles sin hilo de tejer', 'Farmacia / Supermercado', 'recommended', '🧹', 7),
('00000000-0000-0000-0000-000000000010', 'Champu pH neutro', 'Para lavados a partir del dia 15', 'Farmacia / Supermercado', 'recommended', '🧴', 8);
