-- ============================================================
-- CAPILEX PATIENT APP - DATABASE SCHEMA v2.0
-- Supabase (PostgreSQL 15+)
-- Prefijo: cap_ en todos los objetos
-- 19 tablas + 1 vista
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. cap_clinics
-- ============================================================
CREATE TABLE cap_clinics (
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
-- 2. cap_patients
-- ============================================================
CREATE TABLE cap_patients (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           uuid NOT NULL REFERENCES cap_clinics(id),
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

CREATE INDEX cap_idx_patients_clinic ON cap_patients(clinic_id);
CREATE INDEX cap_idx_patients_email ON cap_patients(email) WHERE email IS NOT NULL;

-- ============================================================
-- 3. cap_staff
-- ============================================================
CREATE TABLE cap_staff (
    id          uuid PRIMARY KEY REFERENCES auth.users(id),
    clinic_id   uuid NOT NULL REFERENCES cap_clinics(id),
    full_name   text NOT NULL,
    role        text NOT NULL DEFAULT 'coordinator'
                CHECK (role IN ('admin', 'doctor', 'coordinator')),
    email       text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cap_idx_staff_clinic ON cap_staff(clinic_id);

-- ============================================================
-- 4. cap_care_protocols
-- ============================================================
CREATE TABLE cap_care_protocols (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           uuid NOT NULL REFERENCES cap_clinics(id),
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

CREATE INDEX cap_idx_protocols_clinic ON cap_care_protocols(clinic_id, is_active);

-- ============================================================
-- 5. cap_protocol_task_items
-- ============================================================
CREATE TABLE cap_protocol_task_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id     uuid NOT NULL REFERENCES cap_care_protocols(id) ON DELETE CASCADE,
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

CREATE INDEX cap_idx_proto_tasks_day ON cap_protocol_task_items(protocol_id, day_offset);

-- ============================================================
-- 6. cap_protocol_medication_items
-- ============================================================
CREATE TABLE cap_protocol_medication_items (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id         uuid NOT NULL REFERENCES cap_care_protocols(id) ON DELETE CASCADE,
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

CREATE INDEX cap_idx_proto_meds ON cap_protocol_medication_items(protocol_id, start_day_offset);

-- ============================================================
-- 7. cap_protocol_shopping_items
-- ============================================================
CREATE TABLE cap_protocol_shopping_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id     uuid NOT NULL REFERENCES cap_care_protocols(id) ON DELETE CASCADE,
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
-- 8. cap_interventions
-- ============================================================
CREATE TABLE cap_interventions (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id              uuid NOT NULL REFERENCES cap_patients(id),
    protocol_id             uuid NOT NULL REFERENCES cap_care_protocols(id),
    clinic_id               uuid NOT NULL REFERENCES cap_clinics(id),
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

CREATE INDEX cap_idx_interventions_patient ON cap_interventions(patient_id);
CREATE INDEX cap_idx_interventions_clinic_status ON cap_interventions(clinic_id, status);
CREATE INDEX cap_idx_interventions_date ON cap_interventions(clinic_id, surgery_date);

-- ============================================================
-- 9. cap_task_completions
-- ============================================================
CREATE TABLE cap_task_completions (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id         uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    protocol_task_item_id   uuid REFERENCES cap_protocol_task_items(id),
    day_offset              integer NOT NULL,
    completed_at            timestamptz,
    skipped                 boolean NOT NULL DEFAULT false,
    notes                   text,
    created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cap_idx_task_compl_intervention ON cap_task_completions(intervention_id, day_offset);
CREATE UNIQUE INDEX cap_idx_task_compl_unique
    ON cap_task_completions(intervention_id, protocol_task_item_id, day_offset)
    WHERE protocol_task_item_id IS NOT NULL;

-- ============================================================
-- 10. cap_medication_logs
-- ============================================================
CREATE TABLE cap_medication_logs (
    id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id                 uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    protocol_medication_item_id     uuid REFERENCES cap_protocol_medication_items(id),
    taken_at                        timestamptz NOT NULL DEFAULT now(),
    day_offset                      integer NOT NULL,
    dose_label                      text,
    skipped                         boolean NOT NULL DEFAULT false,
    notes                           text,
    created_at                      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cap_idx_med_logs_intervention ON cap_medication_logs(intervention_id, day_offset);

-- ============================================================
-- 11. cap_shopping_list_checks
-- ============================================================
CREATE TABLE cap_shopping_list_checks (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id             uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    protocol_shopping_item_id   uuid NOT NULL REFERENCES cap_protocol_shopping_items(id),
    purchased                   boolean NOT NULL DEFAULT false,
    purchased_at                timestamptz,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    UNIQUE(intervention_id, protocol_shopping_item_id)
);

-- ============================================================
-- 12. cap_photos
-- ============================================================
CREATE TABLE cap_photos (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
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

CREATE INDEX cap_idx_photos_intervention ON cap_photos(intervention_id, day_offset);
CREATE INDEX cap_idx_photos_flagged ON cap_photos(intervention_id, is_flagged) WHERE is_flagged = true;

-- ============================================================
-- 13. cap_chat_messages
-- ============================================================
CREATE TABLE cap_chat_messages (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    role                text NOT NULL CHECK (role IN ('patient', 'ai_agent', 'staff')),
    content             text NOT NULL,
    metadata            jsonb DEFAULT '{}',
    staff_user_id       uuid,
    day_offset          integer,
    is_escalated        boolean NOT NULL DEFAULT false,
    read_at             timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cap_idx_chat_intervention ON cap_chat_messages(intervention_id, created_at);
CREATE INDEX cap_idx_chat_escalated ON cap_chat_messages(intervention_id, is_escalated)
    WHERE is_escalated = true;

-- ============================================================
-- 14. cap_follow_up_appointments
-- ============================================================
CREATE TABLE cap_follow_up_appointments (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
    clinic_id           uuid NOT NULL REFERENCES cap_clinics(id),
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

CREATE INDEX cap_idx_followups_intervention ON cap_follow_up_appointments(intervention_id);
CREATE INDEX cap_idx_followups_clinic_date ON cap_follow_up_appointments(clinic_id, scheduled_date);

-- ============================================================
-- 15. cap_clinic_calendar
-- ============================================================
CREATE TABLE cap_clinic_calendar (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           uuid NOT NULL REFERENCES cap_clinics(id),
    intervention_id     uuid REFERENCES cap_interventions(id),
    follow_up_id        uuid REFERENCES cap_follow_up_appointments(id),
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

CREATE INDEX cap_idx_calendar_clinic_date ON cap_clinic_calendar(clinic_id, event_date);
CREATE INDEX cap_idx_calendar_intervention ON cap_clinic_calendar(intervention_id)
    WHERE intervention_id IS NOT NULL;

-- ============================================================
-- 16. cap_notifications
-- ============================================================
CREATE TABLE cap_notifications (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id     uuid NOT NULL REFERENCES cap_interventions(id) ON DELETE CASCADE,
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

CREATE INDEX cap_idx_notif_intervention ON cap_notifications(intervention_id, day_offset);
CREATE INDEX cap_idx_notif_pending ON cap_notifications(scheduled_for) WHERE sent_at IS NULL;

-- ============================================================
-- 17. cap_patient_consents
-- ============================================================
CREATE TABLE cap_patient_consents (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      uuid NOT NULL REFERENCES cap_patients(id) ON DELETE CASCADE,
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

CREATE INDEX cap_idx_consents_patient ON cap_patient_consents(patient_id);

-- ============================================================
-- 18. cap_data_access_logs
-- ============================================================
CREATE TABLE cap_data_access_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       uuid NOT NULL REFERENCES cap_clinics(id),
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

CREATE INDEX cap_idx_access_logs_clinic ON cap_data_access_logs(clinic_id, created_at);
CREATE INDEX cap_idx_access_logs_intervention ON cap_data_access_logs(intervention_id)
    WHERE intervention_id IS NOT NULL;

-- ============================================================
-- 19. cap_data_deletion_requests
-- ============================================================
CREATE TABLE cap_data_deletion_requests (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      uuid NOT NULL REFERENCES cap_patients(id),
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

CREATE INDEX cap_idx_deletion_requests_patient ON cap_data_deletion_requests(patient_id);
CREATE INDEX cap_idx_deletion_requests_status ON cap_data_deletion_requests(status)
    WHERE status IN ('pending', 'processing');

-- ============================================================
-- VISTA: cap_intervention_timeline
-- ============================================================
CREATE OR REPLACE VIEW cap_intervention_timeline AS
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
FROM cap_interventions i
JOIN cap_patients p ON p.id = i.patient_id
JOIN cap_care_protocols cp ON cp.id = i.protocol_id
WHERE i.is_active = true;

-- ============================================================
-- TRIGGER: cap_update_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION cap_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cap_trg_clinics_updated BEFORE UPDATE ON cap_clinics
    FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
CREATE TRIGGER cap_trg_patients_updated BEFORE UPDATE ON cap_patients
    FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
CREATE TRIGGER cap_trg_protocols_updated BEFORE UPDATE ON cap_care_protocols
    FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
CREATE TRIGGER cap_trg_interventions_updated BEFORE UPDATE ON cap_interventions
    FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
CREATE TRIGGER cap_trg_followups_updated BEFORE UPDATE ON cap_follow_up_appointments
    FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
CREATE TRIGGER cap_trg_calendar_updated BEFORE UPDATE ON cap_clinic_calendar
    FOR EACH ROW EXECUTE FUNCTION cap_update_updated_at_column();
