-- ============================================================
-- EJECUTAR TODO ESTO EN EL SQL EDITOR DE SUPABASE
-- https://supabase.beaienergy.com → SQL Editor → New Query → Pegar → Run
-- ============================================================

-- ====== PASO 1: SCHEMA ======

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS cap_clinics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL, slug text NOT NULL UNIQUE, address text, phone text, email text,
    timezone text NOT NULL DEFAULT 'Europe/Madrid', settings jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES cap_clinics(id),
    first_name text NOT NULL, last_name text NOT NULL, email text, phone text,
    date_of_birth date, gender text CHECK (gender IN ('male','female','other')),
    medical_notes text, id_document text, preferred_language text NOT NULL DEFAULT 'es',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_care_protocols (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES cap_clinics(id),
    name text NOT NULL, description text, intervention_type text NOT NULL DEFAULT 'fue',
    pre_op_days integer NOT NULL DEFAULT 15, post_op_days integer NOT NULL DEFAULT 365,
    is_default boolean NOT NULL DEFAULT false, is_active boolean NOT NULL DEFAULT true,
    version integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_protocol_task_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id uuid NOT NULL REFERENCES cap_care_protocols(id) ON DELETE CASCADE,
    day_offset integer NOT NULL, day_offset_end integer, title text NOT NULL, description text,
    category text NOT NULL DEFAULT 'care' CHECK (category IN ('care','hygiene','restriction','medication','photo','appointment')),
    frequency text NOT NULL DEFAULT 'once' CHECK (frequency IN ('once','every_30min','hourly','twice_daily','three_daily','daily')),
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical','high','normal','low')),
    sort_order integer NOT NULL DEFAULT 0, icon text, is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_protocol_medication_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id uuid NOT NULL REFERENCES cap_care_protocols(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL CHECK (category IN ('antibiotic','painkiller','anti_inflammatory','gastric_protector','supplement','topical','other')),
    dosage text NOT NULL, frequency text NOT NULL, start_day_offset integer NOT NULL DEFAULT 0,
    duration_days integer, is_mandatory boolean NOT NULL DEFAULT true, instructions text,
    sort_order integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_protocol_shopping_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id uuid NOT NULL REFERENCES cap_care_protocols(id) ON DELETE CASCADE,
    name text NOT NULL, description text, where_to_buy text,
    category text NOT NULL DEFAULT 'essential' CHECK (category IN ('essential','recommended','optional')),
    icon text, sort_order integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_interventions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES cap_patients(id),
    protocol_id uuid NOT NULL REFERENCES cap_care_protocols(id),
    clinic_id uuid NOT NULL REFERENCES cap_clinics(id),
    access_code text NOT NULL UNIQUE, surgery_date date NOT NULL,
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','pre_op','surgery_day','post_op','recovery','completed','cancelled')),
    grafts_count integer, technique text, surgeon_name text, clinical_notes text,
    pre_op_lab_completed boolean NOT NULL DEFAULT false, pre_op_lab_date date,
    access_code_expires_at timestamptz, is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_task_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    protocol_task_item_id uuid REFERENCES cap_protocol_task_items(id),
    day_offset integer NOT NULL, completed_at timestamptz, skipped boolean NOT NULL DEFAULT false,
    notes text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_medication_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    protocol_medication_item_id uuid REFERENCES cap_protocol_medication_items(id),
    taken_at timestamptz NOT NULL DEFAULT now(), day_offset integer NOT NULL,
    dose_label text, skipped boolean NOT NULL DEFAULT false, notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_shopping_list_checks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    protocol_shopping_item_id uuid NOT NULL REFERENCES cap_protocol_shopping_items(id),
    purchased boolean NOT NULL DEFAULT false, purchased_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(intervention_id, protocol_shopping_item_id)
);

CREATE TABLE IF NOT EXISTS cap_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    storage_path text NOT NULL, thumbnail_path text, day_offset integer NOT NULL,
    zone text NOT NULL DEFAULT 'frontal' CHECK (zone IN ('frontal','top','donor','left','right','detail')),
    photo_type text NOT NULL DEFAULT 'progress' CHECK (photo_type IN ('progress','concern','requested','pre_op')),
    ai_analysis jsonb, ai_analyzed_at timestamptz, staff_review text,
    staff_reviewed_by uuid, staff_reviewed_at timestamptz, is_flagged boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('patient','ai_agent','staff')),
    content text NOT NULL, metadata jsonb DEFAULT '{}', staff_user_id uuid,
    day_offset integer, is_escalated boolean NOT NULL DEFAULT false,
    read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_follow_up_appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES cap_clinics(id),
    appointment_type text NOT NULL CHECK (appointment_type IN ('cure_24h','cure_72h','photo_review_7d','photo_review_10d','follow_up_1m','follow_up_3m','follow_up_6m','follow_up_12m','consultation','other')),
    scheduled_date date NOT NULL, scheduled_time time, day_offset integer,
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','completed','cancelled','no_show')),
    notes text, completed_notes text, completed_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_clinic_calendar (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES cap_clinics(id),
    intervention_id uuid REFERENCES cap_interventions(id),
    follow_up_id uuid REFERENCES cap_follow_up_appointments(id),
    title text NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('surgery','follow_up','consultation','blocked','holiday','other')),
    event_date date NOT NULL, start_time time, end_time time,
    all_day boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('tentative','confirmed','cancelled')),
    notes text, staff_user_id uuid, color text,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('push','whatsapp','email','in_app')),
    title text NOT NULL, body text NOT NULL, day_offset integer,
    scheduled_for timestamptz NOT NULL, sent_at timestamptz, read_at timestamptz,
    notification_type text NOT NULL CHECK (notification_type IN ('task_reminder','medication_reminder','photo_request','appointment_reminder','milestone','custom')),
    metadata jsonb DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_patient_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES cap_patients(id) ON DELETE CASCADE,
    consent_type text NOT NULL CHECK (consent_type IN ('data_processing','photo_ai_analysis','data_sharing_clinic','marketing')),
    granted boolean NOT NULL DEFAULT false, granted_at timestamptz, revoked_at timestamptz,
    ip_address text, user_agent text, consent_version integer NOT NULL DEFAULT 1,
    consent_text text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_data_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES cap_clinics(id),
    actor_type text NOT NULL CHECK (actor_type IN ('staff','system','patient')),
    actor_id uuid, action text NOT NULL CHECK (action IN ('view','export','delete','modify','ai_analysis')),
    resource_type text NOT NULL, resource_id uuid, intervention_id uuid,
    ip_address text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_data_deletion_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES cap_patients(id),
    requested_at timestamptz NOT NULL DEFAULT now(),
    requested_by text NOT NULL CHECK (requested_by IN ('patient','staff')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','denied')),
    completed_at timestamptz, completed_by uuid, denial_reason text,
    data_exported boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);

-- VISTA
CREATE OR REPLACE VIEW cap_intervention_timeline AS
SELECT i.*, (CURRENT_DATE - i.surgery_date) AS current_day,
    p.first_name, p.last_name, p.phone AS patient_phone, p.email AS patient_email, p.medical_notes,
    cp.name AS protocol_name, cp.intervention_type
FROM cap_interventions i
JOIN cap_patients p ON p.id = i.patient_id
JOIN cap_care_protocols cp ON cp.id = i.protocol_id
WHERE i.is_active = true;

-- TRIGGER
CREATE OR REPLACE FUNCTION cap_update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER cap_trg_clinics_updated BEFORE UPDATE ON cap_clinics FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER cap_trg_patients_updated BEFORE UPDATE ON cap_patients FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER cap_trg_interventions_updated BEFORE UPDATE ON cap_interventions FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====== PASO 2: SEED DATA ======

INSERT INTO cap_clinics (id, name, slug, address, phone, email, timezone) VALUES
('00000000-0000-0000-0000-000000000001', 'Capilex Madrid', 'capilex-madrid', 'Madrid, Espana', NULL, 'recetas@capilexmadrid.es', 'Europe/Madrid')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cap_care_protocols (id, clinic_id, name, description, intervention_type, pre_op_days, post_op_days, is_default) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'FUE Standard Capilex', 'Protocolo estandar de trasplante capilar FUE', 'fue', 15, 540, true)
ON CONFLICT (id) DO NOTHING;

-- Tareas protocolo
INSERT INTO cap_protocol_task_items (protocol_id, day_offset, day_offset_end, title, description, category, frequency, priority, sort_order, icon) VALUES
('00000000-0000-0000-0000-000000000010', -15, -8, 'Suspender Minoxidil', 'Si esta en tratamiento con minoxidil, debe suspenderlo.', 'restriction', 'once', 'high', 1, '💊'),
('00000000-0000-0000-0000-000000000010', -15, -1, 'Realizar analitica preoperatoria', 'Hemograma, bioquimica, coagulacion, serologia.', 'appointment', 'once', 'critical', 5, '🧪'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'Suspender alcohol', 'Suspender completamente el consumo de alcohol.', 'restriction', 'once', 'critical', 1, '🚫'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'Dejar de fumar', 'Interfiere cicatrizacion, favorece infecciones.', 'restriction', 'once', 'critical', 3, '🚭'),
('00000000-0000-0000-0000-000000000010', -7, -1, 'Suspender todo deporte', 'Suspender completamente el ejercicio fisico.', 'restriction', 'once', 'high', 5, '🏋️'),
('00000000-0000-0000-0000-000000000010', -2, -1, 'Comprar productos necesarios', 'Agua Termal, Mustela, Blastoestimulina, almohada cervical.', 'care', 'once', 'critical', 3, '🛒'),
('00000000-0000-0000-0000-000000000010', 0, NULL, 'Ducharse y lavar cabello', 'SIN geles, lacas, gomina ni productos cosmeticos.', 'hygiene', 'once', 'critical', 1, '🚿'),
('00000000-0000-0000-0000-000000000010', 0, NULL, 'Vestir ropa con botones', 'Que NO pase por la cabeza. Sin joyas.', 'care', 'once', 'high', 4, '👔'),
('00000000-0000-0000-0000-000000000010', 1, 4, 'Hidratar zona injertada cada 30 min', 'Pulverizar Agua Termal cada 30 min mientras este despierto.', 'care', 'every_30min', 'critical', 1, '💧'),
('00000000-0000-0000-0000-000000000010', 1, 15, 'No tocar la zona receptora', 'Injerto no consolida hasta dia 7-8.', 'restriction', 'once', 'critical', 3, '🚫'),
('00000000-0000-0000-0000-000000000010', 1, 15, 'Dormir boca arriba a 45 grados', 'Con almohada cervical. Nariz mirando arriba.', 'care', 'daily', 'critical', 5, '🛏️'),
('00000000-0000-0000-0000-000000000010', 2, NULL, 'Primera cura zona donante', 'Retirar vendaje, suero/agua oxigenada, Blastoestimulina.', 'hygiene', 'once', 'critical', 1, '🩹'),
('00000000-0000-0000-0000-000000000010', 3, 7, 'Lavar zona donante', 'Champu + masaje circular suave + Blastoestimulina.', 'hygiene', 'daily', 'high', 1, '🧴'),
('00000000-0000-0000-0000-000000000010', 5, 7, 'Lavar zona receptora (SIN tocar)', 'Espuma Mustela SIN TOCAR, 2x dia. Secar al aire.', 'hygiene', 'twice_daily', 'critical', 1, '💧'),
('00000000-0000-0000-0000-000000000010', 7, NULL, 'ENVIAR FOTOS a la clinica', 'Zona receptora + zona donante.', 'photo', 'once', 'critical', 1, '📸'),
('00000000-0000-0000-0000-000000000010', 8, 15, 'Lavar zona receptora CON masaje suave', 'Mustela + masaje circular con yemas, 1x dia.', 'hygiene', 'daily', 'high', 1, '🧴'),
('00000000-0000-0000-0000-000000000010', 10, NULL, 'ENVIAR FOTOS a la clinica', 'Segundo envio de fotos.', 'photo', 'once', 'critical', 1, '📸'),
('00000000-0000-0000-0000-000000000010', 1, 10, 'No fumar ni estupefacientes', 'Primeros 10 dias.', 'restriction', 'once', 'critical', 12, '🚭'),
('00000000-0000-0000-0000-000000000010', 1, 15, 'No ejercicio fisico', 'Primeros 15 dias.', 'restriction', 'once', 'high', 16, '🏋️'),
('00000000-0000-0000-0000-000000000010', 1, 30, 'Evitar sol directo', 'Primeros 30 dias. Luego SPF 50 hasta 3-4 meses.', 'restriction', 'once', 'high', 17, '☀️');

-- Medicacion
INSERT INTO cap_protocol_medication_items (protocol_id, name, category, dosage, frequency, start_day_offset, duration_days, is_mandatory, instructions, sort_order) VALUES
('00000000-0000-0000-0000-000000000010', 'Ciprofloxacino', 'antibiotic', '500 mg', 'Cada 12h (desayuno y cena)', 0, 7, true, 'Antibiotico. Tomar con agua.', 1),
('00000000-0000-0000-0000-000000000010', 'Paracetamol', 'painkiller', '1 g', 'Cada 8h (desayuno, comida, cena)', 0, 3, true, 'Despues a demanda. Max 4g/dia.', 2),
('00000000-0000-0000-0000-000000000010', 'Prednisona', 'anti_inflammatory', '30 mg', 'Cada 24h en el desayuno', 0, 5, true, 'Antiinflamatorio.', 3),
('00000000-0000-0000-0000-000000000010', 'Omeprazol', 'gastric_protector', '20 mg', 'Cada 24h antes del desayuno', 0, 7, false, 'Protector gastrico recomendado.', 4);

-- Shopping
INSERT INTO cap_protocol_shopping_items (protocol_id, name, description, where_to_buy, category, icon, sort_order) VALUES
('00000000-0000-0000-0000-000000000010', 'Agua Termal', 'Spray tipo AVENE', 'Farmacia', 'essential', '💧', 1),
('00000000-0000-0000-0000-000000000010', 'Mustela Mousse', 'Champu espuma', 'Farmacia', 'essential', '🧴', 2),
('00000000-0000-0000-0000-000000000010', 'Blastoestimulina', 'Pomada cicatrizante', 'Farmacia', 'essential', '💊', 3),
('00000000-0000-0000-0000-000000000010', 'Suero fisiologico', 'Para zona donante', 'Farmacia', 'essential', '🧴', 4),
('00000000-0000-0000-0000-000000000010', 'Agua oxigenada', 'Para desinfectar', 'Farmacia/Super', 'essential', '🧪', 5),
('00000000-0000-0000-0000-000000000010', 'Almohada cervical', 'Collarin de viaje', 'Amazon', 'essential', '🛏️', 6),
('00000000-0000-0000-0000-000000000010', 'Toalla microfibra', 'O gasas esteriles', 'Farmacia/Super', 'recommended', '🧹', 7),
('00000000-0000-0000-0000-000000000010', 'Champu pH neutro', 'Para dia 15+', 'Farmacia/Super', 'recommended', '🧴', 8);

-- ====== PASO 3: PACIENTE DE PRUEBA ======

INSERT INTO cap_patients (id, clinic_id, first_name, last_name, email, phone) VALUES
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Jose', 'Salamanca', 'jose@test.com', '+34600000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cap_interventions (patient_id, protocol_id, clinic_id, access_code, surgery_date, status, grafts_count, technique, surgeon_name) VALUES
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
 'TEST1234', CURRENT_DATE - INTERVAL '5 days', 'post_op', 2500, 'FUE', 'Dr. Martinez')
ON CONFLICT (access_code) DO NOTHING;
