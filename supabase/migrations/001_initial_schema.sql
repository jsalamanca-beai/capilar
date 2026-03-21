-- ============================================================
-- CAPILEX PATIENT APP - DATABASE SCHEMA v2.0
-- Supabase (PostgreSQL 15+)
-- 19 tablas + 1 vista
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. CLINICS
-- ============================================================
CREATE TABLE clinics (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    address     text,
    phone       text,
    email       text,
    timezone    text NOT NULL DEFAULT 'Europe/Madrid',
    settings    jsonb NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. PATIENTS (datos personales, sin datos clinicos)
-- ============================================================
CREATE TABLE patients (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           uuid NOT NULL REFERENCES clinics(id),
    first_name          text NOT NULL,
    last_name           text NOT NULL,
    email               text,
    phone               text,
    date_of_birth       date,
    gender              text CHECK (gender IN ('male', 'female', 'other')),
    medical_notes       text,
    id_document         text,
    preferred_language  text NOT NULL DEFAULT 'es',
    is_active           boolean NOT NULL DEFAULT true,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_email ON patients(email) WHERE email IS NOT NULL;

-- ============================================================
-- 3. STAFF (personal de la clinica, usa Supabase Auth)
-- ============================================================
CREATE TABLE staff (
    id          uuid PRIMARY KEY REFERENCES auth.users(id),
    clinic_id   uuid NOT NULL REFERENCES clinics(id),
    full_name   text NOT NULL,
    role        text NOT NULL DEFAULT 'coordinator'
                CHECK (role IN ('admin', 'doctor', 'coordinator')),
    email       text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_clinic ON staff(clinic_id);

-- ============================================================
-- 4. CARE PROTOCOLS (plantillas de cuidado)
-- ============================================================
CREATE TABLE care_protocols (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           uuid NOT NULL REFERENCES clinics(id),
    name                text NOT NULL,
    description         text,
    intervention_type   text NOT NULL DEFAULT 'fue',
    pre_op_days         integer NOT NULL DEFAULT 15,
    post_op_days        integer NOT NULL DEFAULT 365,
    is_default          boolean NOT NULL DEFAULT false,
    is_active           boolean NOT NULL DEFAULT true,
    version             integer NOT NULL DEFAULT 1,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_protocols_clinic ON care_protocols(clinic_id, is_active);

-- ============================================================
-- 5. PROTOCOL TASK ITEMS (tareas/checklists por dia)
-- ============================================================
CREATE TABLE protocol_task_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id     uuid NOT NULL REFERENCES care_protocols(id) ON DELETE CASCADE,
    day_offset      integer NOT NULL,
    day_offset_end  integer,
    title           text NOT NULL,
    description     text,
    category        text NOT NULL DEFAULT 'care'
                    CHECK (category IN ('care', 'hygiene', 'restriction', 'medication', 'photo', 'appointment')),
    frequency       text NOT NULL DEFAULT 'once'
                    CHECK (frequency IN ('once', 'every_30min', 'hourly', 'twice_daily', 'three_daily', 'daily')),
    priority        text NOT NULL DEFAULT 'normal'
                    CHECK (priority IN ('critical', 'high', 'normal', 'low')),
    sort_order      integer NOT NULL DEFAULT 0,
    icon            text,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proto_tasks_day ON protocol_task_items(protocol_id, day_offset);

-- ============================================================
-- 6. PROTOCOL MEDICATION ITEMS
-- ============================================================
CREATE TABLE protocol_medication_items (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id         uuid NOT NULL REFERENCES care_protocols(id) ON DELETE CASCADE,
    name                text NOT NULL,
    category            text NOT NULL
                        CHECK (category IN ('antibiotic', 'painkiller', 'anti_inflammatory',
                                            'gastric_protector', 'supplement', 'topical', 'other')),
    dosage              text NOT NULL,
    frequency           text NOT NULL,
    start_day_offset    integer NOT NULL DEFAULT 0,
    duration_days       integer,
    is_mandatory        boolean NOT NULL DEFAULT true,
    instructions        text,
    sort_order          integer NOT NULL DEFAULT 0,
    is_active           boolean NOT NULL DEFAULT true,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proto_meds ON protocol_medication_items(protocol_id, start_day_offset);

-- ============================================================
-- 7. PROTOCOL SHOPPING ITEMS
-- ============================================================
CREATE TABLE protocol_shopping_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id     uuid NOT NULL REFERENCES care_protocols(id) ON DELETE CASCADE,
    name            text NOT NULL,
    description     text,
    where_to_buy    text,
    category        text NOT NULL DEFAULT 'essential'
                    CHECK (category IN ('essential', 'recommended', 'optional')),
    icon            text,
    sort_order      integer NOT NULL DEFAULT 0,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. INTERVENTIONS (entidad central: cada cirugia)
-- ============================================================
CREATE TABLE interventions (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id              uuid NOT NULL REFERENCES patients(id),
    protocol_id             uuid NOT NULL REFERENCES care_protocols(id),
    clinic_id               uuid NOT NULL REFERENCES clinics(id),
    access_code             text NOT NULL UNIQUE,
    surgery_date            date NOT NULL,
    status                  text NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled', 'pre_op', 'surgery_day',
                                              'post_op', 'recovery', 'completed', 'cancelled')),
    grafts_count            integer,
    technique               text,
    surgeon_name            text,
    clinical_notes          text,
    pre_op_lab_completed    boolean NOT NULL DEFAULT false,
    pre_op_lab_date         date,
    access_code_expires_at  timestamptz,
    is_active               boolean NOT NULL DEFAULT true,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_interventions_patient ON interventions(patient_id);
CREATE INDEX idx_interventions_clinic_status ON interventions(clinic_id, status);
CREATE INDEX idx_interventions_date ON interventions(clinic_id, surgery_date);

-- ============================================================
-- 9. TASK COMPLETIONS
-- ============================================================
CREATE TABLE task_completions (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id         uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    protocol_task_item_id   uuid REFERENCES protocol_task_items(id),
    day_offset              integer NOT NULL,
    completed_at            timestamptz,
    skipped                 boolean NOT NULL DEFAULT false,
    notes                   text,
    created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_compl_intervention ON task_completions(intervention_id, day_offset);
CREATE UNIQUE INDEX idx_task_compl_unique
    ON task_completions(intervention_id, protocol_task_item_id, day_offset)
    WHERE protocol_task_item_id IS NOT NULL;

-- ============================================================
-- 10. MEDICATION LOGS
-- ============================================================
CREATE TABLE medication_logs (
    id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id                 uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    protocol_medication_item_id     uuid REFERENCES protocol_medication_items(id),
    taken_at                        timestamptz NOT NULL DEFAULT now(),
    day_offset                      integer NOT NULL,
    dose_label                      text,
    skipped                         boolean NOT NULL DEFAULT false,
    notes                           text,
    created_at                      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_med_logs_intervention ON medication_logs(intervention_id, day_offset);

-- ============================================================
-- 11. SHOPPING LIST CHECKS
-- ============================================================
CREATE TABLE shopping_list_checks (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id             uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    protocol_shopping_item_id   uuid NOT NULL REFERENCES protocol_shopping_items(id),
    purchased                   boolean NOT NULL DEFAULT false,
    purchased_at                timestamptz,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    UNIQUE(intervention_id, protocol_shopping_item_id)
);

-- ============================================================
-- 12. PHOTOS (con analisis IA)
-- ============================================================
CREATE TABLE photos (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    storage_path        text NOT NULL,
    thumbnail_path      text,
    day_offset          integer NOT NULL,
    zone                text NOT NULL DEFAULT 'frontal'
                        CHECK (zone IN ('frontal', 'top', 'donor', 'left', 'right', 'detail')),
    photo_type          text NOT NULL DEFAULT 'progress'
                        CHECK (photo_type IN ('progress', 'concern', 'requested', 'pre_op')),
    ai_analysis         jsonb,
    ai_analyzed_at      timestamptz,
    staff_review        text,
    staff_reviewed_by   uuid,
    staff_reviewed_at   timestamptz,
    is_flagged          boolean NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_intervention ON photos(intervention_id, day_offset);
CREATE INDEX idx_photos_flagged ON photos(intervention_id, is_flagged) WHERE is_flagged = true;

-- ============================================================
-- 13. CHAT MESSAGES
-- ============================================================
CREATE TABLE chat_messages (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    role                text NOT NULL CHECK (role IN ('patient', 'ai_agent', 'staff')),
    content             text NOT NULL,
    metadata            jsonb DEFAULT '{}',
    staff_user_id       uuid,
    day_offset          integer,
    is_escalated        boolean NOT NULL DEFAULT false,
    read_at             timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_intervention ON chat_messages(intervention_id, created_at);
CREATE INDEX idx_chat_escalated ON chat_messages(intervention_id, is_escalated)
    WHERE is_escalated = true;

-- ============================================================
-- 14. FOLLOW-UP APPOINTMENTS
-- ============================================================
CREATE TABLE follow_up_appointments (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    clinic_id           uuid NOT NULL REFERENCES clinics(id),
    appointment_type    text NOT NULL
                        CHECK (appointment_type IN ('cure_24h', 'cure_72h', 'photo_review_7d',
                                                     'photo_review_10d', 'follow_up_1m', 'follow_up_3m',
                                                     'follow_up_6m', 'follow_up_12m', 'consultation', 'other')),
    scheduled_date      date NOT NULL,
    scheduled_time      time,
    day_offset          integer,
    status              text NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes               text,
    completed_notes     text,
    completed_by        uuid,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_followups_intervention ON follow_up_appointments(intervention_id);
CREATE INDEX idx_followups_clinic_date ON follow_up_appointments(clinic_id, scheduled_date);

-- ============================================================
-- 15. CLINIC CALENDAR
-- ============================================================
CREATE TABLE clinic_calendar (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           uuid NOT NULL REFERENCES clinics(id),
    intervention_id     uuid REFERENCES interventions(id),
    follow_up_id        uuid REFERENCES follow_up_appointments(id),
    title               text NOT NULL,
    event_type          text NOT NULL
                        CHECK (event_type IN ('surgery', 'follow_up', 'consultation',
                                              'blocked', 'holiday', 'other')),
    event_date          date NOT NULL,
    start_time          time,
    end_time            time,
    all_day             boolean NOT NULL DEFAULT false,
    status              text NOT NULL DEFAULT 'confirmed'
                        CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
    notes               text,
    staff_user_id       uuid,
    color               text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_clinic_date ON clinic_calendar(clinic_id, event_date);
CREATE INDEX idx_calendar_intervention ON clinic_calendar(intervention_id)
    WHERE intervention_id IS NOT NULL;

-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    channel             text NOT NULL DEFAULT 'in_app'
                        CHECK (channel IN ('push', 'whatsapp', 'email', 'in_app')),
    title               text NOT NULL,
    body                text NOT NULL,
    day_offset          integer,
    scheduled_for       timestamptz NOT NULL,
    sent_at             timestamptz,
    read_at             timestamptz,
    notification_type   text NOT NULL
                        CHECK (notification_type IN ('task_reminder', 'medication_reminder',
                                                      'photo_request', 'appointment_reminder',
                                                      'milestone', 'custom')),
    metadata            jsonb DEFAULT '{}',
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_intervention ON notifications(intervention_id, day_offset);
CREATE INDEX idx_notif_pending ON notifications(scheduled_for) WHERE sent_at IS NULL;

-- ============================================================
-- 17. PATIENT CONSENTS (RGPD)
-- ============================================================
CREATE TABLE patient_consents (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consent_type    text NOT NULL
                    CHECK (consent_type IN ('data_processing', 'photo_ai_analysis',
                                            'data_sharing_clinic', 'marketing')),
    granted         boolean NOT NULL DEFAULT false,
    granted_at      timestamptz,
    revoked_at      timestamptz,
    ip_address      text,
    user_agent      text,
    consent_version integer NOT NULL DEFAULT 1,
    consent_text    text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_consents_patient ON patient_consents(patient_id);

-- ============================================================
-- 18. DATA ACCESS LOGS (auditoria RGPD)
-- ============================================================
CREATE TABLE data_access_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       uuid NOT NULL REFERENCES clinics(id),
    actor_type      text NOT NULL CHECK (actor_type IN ('staff', 'system', 'patient')),
    actor_id        uuid,
    action          text NOT NULL
                    CHECK (action IN ('view', 'export', 'delete', 'modify', 'ai_analysis')),
    resource_type   text NOT NULL,
    resource_id     uuid,
    intervention_id uuid,
    ip_address      text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_logs_clinic ON data_access_logs(clinic_id, created_at);
CREATE INDEX idx_access_logs_intervention ON data_access_logs(intervention_id)
    WHERE intervention_id IS NOT NULL;

-- ============================================================
-- 19. DATA DELETION REQUESTS (derecho supresion RGPD)
-- ============================================================
CREATE TABLE data_deletion_requests (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      uuid NOT NULL REFERENCES patients(id),
    requested_at    timestamptz NOT NULL DEFAULT now(),
    requested_by    text NOT NULL CHECK (requested_by IN ('patient', 'staff')),
    status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'completed', 'denied')),
    completed_at    timestamptz,
    completed_by    uuid,
    denial_reason   text,
    data_exported   boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_deletion_requests_patient ON data_deletion_requests(patient_id);
CREATE INDEX idx_deletion_requests_status ON data_deletion_requests(status)
    WHERE status IN ('pending', 'processing');

-- ============================================================
-- VISTA: intervention_timeline (calculo current_day)
-- ============================================================
CREATE OR REPLACE VIEW intervention_timeline AS
SELECT
    i.*,
    (CURRENT_DATE - i.surgery_date) AS current_day,
    p.first_name,
    p.last_name,
    p.phone AS patient_phone,
    p.email AS patient_email,
    p.medical_notes,
    cp.name AS protocol_name,
    cp.intervention_type
FROM interventions i
JOIN patients p ON p.id = i.patient_id
JOIN care_protocols cp ON cp.id = i.protocol_id
WHERE i.is_active = true;

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clinics_updated BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_protocols_updated BEFORE UPDATE ON care_protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_interventions_updated BEFORE UPDATE ON interventions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_followups_updated BEFORE UPDATE ON follow_up_appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_calendar_updated BEFORE UPDATE ON clinic_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
