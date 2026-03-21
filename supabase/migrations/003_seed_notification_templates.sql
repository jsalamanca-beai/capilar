-- ============================================================
-- SEED: Templates de notificaciones proactivas
-- Se usan para generar notificaciones automaticas por cron job
-- ============================================================

-- Tabla auxiliar para templates (no necesita FK a interventions)
CREATE TABLE notification_templates (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id         uuid NOT NULL REFERENCES care_protocols(id) ON DELETE CASCADE,
    trigger_day_offset  integer NOT NULL,
    trigger_time        time NOT NULL DEFAULT '09:00',
    notification_type   text NOT NULL,
    title               text NOT NULL,
    body                text NOT NULL,
    channel             text NOT NULL DEFAULT 'in_app',
    is_active           boolean NOT NULL DEFAULT true,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_templates ON notification_templates(protocol_id, trigger_day_offset);

-- ============================================================
-- ALERTAS PRE-OPERATORIAS
-- ============================================================
INSERT INTO notification_templates (protocol_id, trigger_day_offset, trigger_time, notification_type, title, body) VALUES
('00000000-0000-0000-0000-000000000010', -15, '09:00', 'task_reminder',
 'Comienza tu preparacion pre-operatoria',
 'Faltan 15 dias para tu cirugia. Suspende el minoxidil, complejos vitaminicos y reduce el deporte intenso. Revisa tu checklist.'),

('00000000-0000-0000-0000-000000000010', -7, '09:00', 'task_reminder',
 'Una semana para tu cirugia - Restricciones importantes',
 'A partir de hoy: sin alcohol, cafeina, tabaco, deporte ni AINEs. Tu cuerpo se prepara para la intervencion.'),

('00000000-0000-0000-0000-000000000010', -2, '09:00', 'task_reminder',
 'Ultimos preparativos - Revisa tu lista de compras',
 'Asegurate de tener todo listo: Agua Termal AVENE, Mustela Mousse, Blastoestimulina, almohada cervical. Revisa la lista completa.'),

('00000000-0000-0000-0000-000000000010', -1, '20:00', 'milestone',
 'Manana es tu dia - Estas listo!',
 'Prepara ropa con botones, desayuno ligero, y descansa bien. Duerme 8 horas. Manana es el comienzo de tu nuevo look.'),

-- ============================================================
-- ALERTAS POST-OPERATORIAS
-- ============================================================
('00000000-0000-0000-0000-000000000010', 0, '20:00', 'task_reminder',
 'Bienvenido al postoperatorio',
 'Lo mas importante ahora: hidratar cada 30 minutos con Agua Termal y dormir boca arriba a 45 grados. No toques la zona receptora.'),

('00000000-0000-0000-0000-000000000010', 1, '09:00', 'medication_reminder',
 'Buenos dias - Dia 1 postoperatorio',
 'Toma tu medicacion: Ciprofloxacino + Prednisona + Paracetamol con el desayuno. Sigue hidratando cada 30 minutos.'),

('00000000-0000-0000-0000-000000000010', 2, '09:00', 'task_reminder',
 'Dia 2 - Primera cura zona donante',
 'Hoy retira el vendaje de la zona donante. Limpia con suero o agua oxigenada y aplica Blastoestimulina. Sigue hidratando la zona receptora.'),

('00000000-0000-0000-0000-000000000010', 3, '09:00', 'task_reminder',
 'Dia 3 - Primer lavado zona donante',
 'Hoy comienzan los lavados de la zona donante: agua tibia + champu 5 min + masaje circular suave + Blastoestimulina. Sigue hidratando receptora.'),

('00000000-0000-0000-0000-000000000010', 3, '14:00', 'milestone',
 'La hinchazon es normal',
 'Puede aparecer inflamacion en la frente estos dias. Es completamente normal y bajara por gravedad en 2-3 dias.'),

('00000000-0000-0000-0000-000000000010', 5, '09:00', 'task_reminder',
 'Dia 5 - Primer lavado zona receptora',
 'Hoy comienza el lavado de la zona receptora (2 veces/dia): agua suave + espuma Mustela SIN TOCAR + dejar 5 min + aclarar con cuidado. Secar al aire.'),

('00000000-0000-0000-0000-000000000010', 7, '09:00', 'photo_request',
 'Dia 7 - ENVIA TUS FOTOS DE SEGUIMIENTO',
 'Hoy es dia de fotos! Toma fotos de la zona receptora (frente y arriba) y zona donante. Ya no necesitas Blastoestimulina. Ultima dosis de antibiotico hoy.'),

('00000000-0000-0000-0000-000000000010', 8, '09:00', 'task_reminder',
 'Dia 8 - Nuevo protocolo de lavado',
 'A partir de hoy el lavado de zona receptora incluye masaje suave circular con yema de dedos (1 vez al dia). Las costras se iran cayendo solas.'),

('00000000-0000-0000-0000-000000000010', 10, '09:00', 'photo_request',
 'Dia 10 - ENVIA TUS FOTOS DE SEGUIMIENTO',
 'Segundo envio de fotos de seguimiento. A partir de hoy puedes usar gorra holgada y ropa normal.'),

('00000000-0000-0000-0000-000000000010', 12, '09:00', 'task_reminder',
 'Las costras se van cayendo',
 'Es normal que las costras se desprendan con los lavados. NUNCA las arranques, dejtalas caer solas.'),

('00000000-0000-0000-0000-000000000010', 15, '09:00', 'milestone',
 'Dia 15 - Fin del protocolo intensivo!',
 'Felicidades! Ya puedes lavarte el pelo con normalidad con champu de pH neutro. Puedes hacer ejercicio moderado. Sigue evitando el sol directo.'),

('00000000-0000-0000-0000-000000000010', 15, '14:00', 'milestone',
 'Sobre el shedding (caida del pelo trasplantado)',
 'En las proximas semanas el pelo trasplantado se caera. Esto es COMPLETAMENTE NORMAL. Los foliculos estan vivos bajo la piel y produciran pelo nuevo.'),

('00000000-0000-0000-0000-000000000010', 21, '09:00', 'milestone',
 'Tres semanas - Como vas?',
 'Si notas caida de pelo, recuerda que el shedding es normal y necesario. Los foliculos estan formando nuevas raices.'),

('00000000-0000-0000-0000-000000000010', 30, '09:00', 'milestone',
 'Un mes - Nuevas libertades',
 'Ya puedes hacer deporte intenso, usar casco, y cortar pelo (maquinilla en zona donante, tijera en receptora). Aun no tenirte.'),

('00000000-0000-0000-0000-000000000010', 60, '09:00', 'milestone',
 'Dos meses - Ya puedes tenirte',
 'Puedes tenir el pelo con tintes vegetales sin amoniaco. Sigue usando SPF 50 o gorra al exponerte al sol.'),

('00000000-0000-0000-0000-000000000010', 90, '09:00', 'milestone',
 'Tres meses - Primeros pelitos nuevos!',
 'Ya puedes usar productos de styling (gominas, lacas). Los primeros cabellos nuevos deben empezar a asomar. Son finos al principio, engrosaran.'),

('00000000-0000-0000-0000-000000000010', 120, '09:00', 'photo_request',
 'Cuatro meses - Envia foto de progreso',
 'El crecimiento se acelera a partir de ahora. Toma una foto para comparar con el dia 1.'),

('00000000-0000-0000-0000-000000000010', 180, '09:00', 'photo_request',
 'Seis meses - La mitad del camino',
 'Los resultados ya deben ser significativos. Envia una foto de seguimiento para ver tu progreso.'),

('00000000-0000-0000-0000-000000000010', 270, '09:00', 'photo_request',
 'Nueve meses - Casi en la meta',
 'Tu trasplante esta madurando. Envia foto de seguimiento.'),

('00000000-0000-0000-0000-000000000010', 365, '09:00', 'milestone',
 'UN ANO! Tu trasplante esta casi completo',
 'El resultado casi definitivo ya esta aqui. Comparalo con tu foto del dia 1. El resultado final se valora a los 12-18 meses.'),

('00000000-0000-0000-0000-000000000010', 540, '09:00', 'milestone',
 'Resultado definitivo - 18 meses',
 'Tu trasplante ha alcanzado su maduracion completa. Este es tu resultado final. El pelo trasplantado es permanente.');
