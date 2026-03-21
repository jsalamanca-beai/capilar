// ============================================================
// Database types matching Supabase schema v2.0
// ============================================================

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  medical_notes: string | null;
  id_document: string | null;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  clinic_id: string;
  full_name: string;
  role: "admin" | "doctor" | "coordinator";
  email: string;
  created_at: string;
}

export interface CareProtocol {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  intervention_type: string;
  pre_op_days: number;
  post_op_days: number;
  is_default: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export type TaskCategory = "care" | "hygiene" | "restriction" | "medication" | "photo" | "appointment";
export type TaskFrequency = "once" | "every_30min" | "hourly" | "twice_daily" | "three_daily" | "daily";
export type TaskPriority = "critical" | "high" | "normal" | "low";

export interface ProtocolTaskItem {
  id: string;
  protocol_id: string;
  day_offset: number;
  day_offset_end: number | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  frequency: TaskFrequency;
  priority: TaskPriority;
  sort_order: number;
  icon: string | null;
  is_active: boolean;
}

export type MedicationCategory = "antibiotic" | "painkiller" | "anti_inflammatory" | "gastric_protector" | "supplement" | "topical" | "other";

export interface ProtocolMedicationItem {
  id: string;
  protocol_id: string;
  name: string;
  category: MedicationCategory;
  dosage: string;
  frequency: string;
  start_day_offset: number;
  duration_days: number | null;
  is_mandatory: boolean;
  instructions: string | null;
  sort_order: number;
}

export interface ProtocolShoppingItem {
  id: string;
  protocol_id: string;
  name: string;
  description: string | null;
  where_to_buy: string | null;
  category: "essential" | "recommended" | "optional";
  icon: string | null;
  sort_order: number;
}

export type InterventionStatus = "scheduled" | "pre_op" | "surgery_day" | "post_op" | "recovery" | "completed" | "cancelled";

export interface Intervention {
  id: string;
  patient_id: string;
  protocol_id: string;
  clinic_id: string;
  access_code: string;
  surgery_date: string;
  status: InterventionStatus;
  grafts_count: number | null;
  technique: string | null;
  surgeon_name: string | null;
  clinical_notes: string | null;
  pre_op_lab_completed: boolean;
  pre_op_lab_date: string | null;
  access_code_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InterventionTimeline extends Intervention {
  current_day: number;
  first_name: string;
  last_name: string;
  patient_phone: string | null;
  patient_email: string | null;
  medical_notes: string | null;
  protocol_name: string;
  intervention_type: string;
}

export interface TaskCompletion {
  id: string;
  intervention_id: string;
  protocol_task_item_id: string | null;
  day_offset: number;
  completed_at: string | null;
  skipped: boolean;
  notes: string | null;
}

export interface MedicationLog {
  id: string;
  intervention_id: string;
  protocol_medication_item_id: string | null;
  taken_at: string;
  day_offset: number;
  dose_label: string | null;
  skipped: boolean;
  notes: string | null;
}

export type PhotoZone = "frontal" | "top" | "donor" | "left" | "right" | "detail";
export type PhotoType = "progress" | "concern" | "requested" | "pre_op";

export interface PhotoAnalysis {
  zone_detected: string;
  overall_assessment: "normal" | "monitorizar" | "atencion_clinica" | "urgente";
  parameters: Record<string, { score: number; description: string }>;
  recommendations: string[];
  requires_clinic_contact: boolean;
  urgency: "none" | "low" | "medium" | "high";
  patient_message: string;
}

export interface Photo {
  id: string;
  intervention_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  day_offset: number;
  zone: PhotoZone;
  photo_type: PhotoType;
  ai_analysis: PhotoAnalysis | null;
  ai_analyzed_at: string | null;
  staff_review: string | null;
  staff_reviewed_by: string | null;
  staff_reviewed_at: string | null;
  is_flagged: boolean;
  created_at: string;
}

export type ChatRole = "patient" | "ai_agent" | "staff";

export interface ChatMessage {
  id: string;
  intervention_id: string;
  role: ChatRole;
  content: string;
  metadata: {
    agent_type?: "surgery_expert" | "patient_experience" | "risk_prevention";
    model?: string;
    escalated_reason?: string;
  };
  staff_user_id: string | null;
  day_offset: number | null;
  is_escalated: boolean;
  read_at: string | null;
  created_at: string;
}

export type AppointmentType = "cure_24h" | "cure_72h" | "photo_review_7d" | "photo_review_10d" | "follow_up_1m" | "follow_up_3m" | "follow_up_6m" | "follow_up_12m" | "consultation" | "other";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface FollowUpAppointment {
  id: string;
  intervention_id: string;
  clinic_id: string;
  appointment_type: AppointmentType;
  scheduled_date: string;
  scheduled_time: string | null;
  day_offset: number | null;
  status: AppointmentStatus;
  notes: string | null;
  completed_notes: string | null;
  completed_by: string | null;
}

export interface Notification {
  id: string;
  intervention_id: string;
  channel: "push" | "whatsapp" | "email" | "in_app";
  title: string;
  body: string;
  day_offset: number | null;
  scheduled_for: string;
  sent_at: string | null;
  read_at: string | null;
  notification_type: string;
  metadata: Record<string, unknown>;
}

export interface ShoppingListCheck {
  id: string;
  intervention_id: string;
  protocol_shopping_item_id: string;
  purchased: boolean;
  purchased_at: string | null;
}
