# Capilex Patient App

Aplicacion de acompanamiento al paciente de trasplante capilar para **Clinica Capilex Madrid**.

Digitaliza todo el proceso pre y postoperatorio: timeline interactivo, checklist diario, subida de fotos con analisis IA (GPT-4o Vision), chatbot con 3 agentes expertos, alertas proactivas via Telegram, y panel de administracion para la clinica.

## Stack

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js 16 + Tailwind v4 + TypeScript |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| IA Chat | OpenAI GPT-4o-mini (3 agentes + router) |
| IA Vision | OpenAI GPT-4o (analisis fotos cuero cabelludo) |
| Notificaciones | Telegram Bot API |
| Hosting | Vercel |

## Funcionalidades

### App Paciente
- **Login con codigo unico** de 8 caracteres (sin registro)
- **Onboarding** de 5 pantallas la primera vez
- **Dashboard** con contador de dias, mensajes motivacionales por fase, accesos rapidos
- **Timeline interactivo** — click en cada fase muestra tareas y restricciones
- **Checklist diario** — tareas del dia con checkboxes, progreso, celebracion al 100%
- **Tracker medicacion** — 4 medicamentos con dosis, frecuencia, estado activo/completado
- **Lista de compras** — productos necesarios con donde comprar (farmacia, Amazon...)
- **Subida de fotos** — camara/galeria, selector de zona, compresion, analisis IA con 6 parametros
- **Galeria de fotos** — thumbnails, modal con zoom, scores IA, estado revision clinica
- **Chat IA 24/7** — 3 agentes expertos (quirurgico, experiencia, riesgos), routing automatico, streaming
- **Escalado a humano** — si la IA detecta emergencia, notifica al equipo via Telegram
- **Contacto emergencia** — "Tu equipo de apoyo" con chat IA, telefono clinica, sintomas de alarma

### Panel Admin (Clinica)
- **Login staff** con Supabase Auth
- **Dashboard** — fotos sin revisar, escalados pendientes, cirugias esta semana
- **Lista pacientes** — filtros (pre-op/post-op/criticos), badges de pendientes
- **Generador codigos** — crear paciente + intervencion + codigo + link copiable
- **Detalle paciente** — info, timeline, codigo acceso, contacto
- **Revision fotos** — galeria con analisis IA al lado, notas del equipo, marcar revisada
- **Chat admin** — ver historial con indicador de agente IA, responder como "Equipo Capilex"

### Integraciones
- **Telegram Bot** — 6 tipos de alerta (foto subida, escalado, plazos pre-op, inactividad, primer acceso, resumen diario)
- **Telegram Webhook** — Comandos interactivos desde el grupo del equipo:
  - `/paciente nombre` — Info detallada (dia postop, fotos, escalados, evaluacion IA)
  - `/pacientes` — Lista de todos los pacientes activos
  - `/ayuda` — Comandos disponibles
- **Modo claro/oscuro** — Toggle persistente en header paciente y sidebar admin
- **RGPD** — consentimientos, logs auditoria, solicitudes supresion datos

## Estructura del proyecto

```
capilex-patient-app/
├── src/
│   ├── app/
│   │   ├── (patient)/          # Rutas paciente (con layout + bottom nav)
│   │   │   ├── dashboard/      # Timeline + contador dias
│   │   │   ├── checklist/      # Tareas diarias
│   │   │   ├── photos/         # Galeria + upload con IA
│   │   │   ├── chat/           # Chat con agentes IA
│   │   │   ├── medications/    # Tracker medicacion
│   │   │   ├── shopping/       # Lista compras
│   │   │   └── emergency/      # Contacto clinica
│   │   ├── admin/              # Panel administracion
│   │   │   ├── dashboard/      # Alertas y stats
│   │   │   ├── patients/       # Lista + detalle + fotos + chat
│   │   │   ├── codes/          # Generador codigos acceso
│   │   │   └── settings/       # Configuracion
│   │   └── api/
│   │       ├── auth/           # Login paciente (JWT) + staff (Supabase Auth) + logout
│   │       ├── patient/        # Profile, timeline, tasks, photos, chat
│   │       ├── admin/          # Patients, alerts, photos review, chat reply
│   │       ├── ai/             # Photo analysis, chat agent router
│   │       ├── cron/           # Daily summary, notifications
│   │       └── telegram/       # Test endpoint
│   ├── components/
│   │   ├── patient/            # DayCounter, TimelineView, PhotoCapture, OnboardingOverlay...
│   │   └── shared/             # BottomNav
│   └── lib/
│       ├── auth/               # JWT sign/verify (jose), rate limiter
│       ├── openai/             # Client, prompts (surgery, experience, risk, photo, router)
│       ├── supabase/           # Browser + server clients
│       ├── telegram/           # Bot con 6 tipos de notificacion
│       ├── timeline/           # Compute phase, day utils
│       ├── content/            # Frases motivacionales por fase
│       ├── constants/          # Medications, shopping list
│       ├── hooks/              # usePatient context
│       └── types/              # Database types (todas las tablas)
├── supabase/
│   ├── migrations/             # 3 ficheros SQL (schema + seeds + notifications)
│   └── EJECUTAR_EN_SUPABASE.sql  # Script todo-en-uno para setup
├── docs/                       # Documentacion HTML con estilos Capilex
└── public/
    └── logo-capilex.png
```

## Base de datos

19 tablas con prefijo `cap_` + 1 vista. Modelo intervencion-centrico (1 paciente = N intervenciones).

| Grupo | Tablas |
|---|---|
| Base | `cap_clinics`, `cap_patients`, `cap_staff` |
| Intervenciones | `cap_interventions`, `cap_care_protocols` |
| Protocolo (templates) | `cap_protocol_task_items`, `cap_protocol_medication_items`, `cap_protocol_shopping_items` |
| Tracking (instancias) | `cap_task_completions`, `cap_medication_logs`, `cap_shopping_list_checks` |
| Comunicacion | `cap_chat_messages`, `cap_photos`, `cap_notifications`, `cap_notification_templates` |
| Calendario | `cap_follow_up_appointments`, `cap_clinic_calendar` |
| RGPD | `cap_patient_consents`, `cap_data_access_logs`, `cap_data_deletion_requests` |
| Vista | `cap_intervention_timeline` (calcula `current_day` automaticamente) |

## Agentes IA

| Agente | Rol | Modelo |
|---|---|---|
| Router | Clasifica mensaje en SURGERY / EXPERIENCE / RISK / ESCALATE | gpt-4o-mini |
| Experto Quirurgico | Protocolo medico, lavados, medicacion, sintomas normales vs alarma | gpt-4o-mini |
| Experiencia Paciente | Soporte emocional, shedding, cronologia resultados, consejos | gpt-4o-mini |
| Prevencion Riesgos | Restricciones por dia, "puedo hacer X?", interacciones medicamentosas | gpt-4o-mini |
| Analisis Fotos | 6 parametros (costras, enrojecimiento, infeccion, injertos, donante, progreso) | gpt-4o |

## Setup rapido

### 1. Clonar e instalar
```bash
git clone https://github.com/jsalamanca-beai/capilar.git
cd capilar
npm install
```

### 2. Configurar .env.local
```bash
cp .env.example .env.local
# Editar con tus claves:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# OPENAI_API_KEY, JWT_SECRET, CRON_SECRET
# (Opcional) TELEGRAM_BOT_TOKEN, TELEGRAM_CLINIC_CHAT_ID
```

### 3. Crear tablas en Supabase
Ejecutar `supabase/EJECUTAR_EN_SUPABASE.sql` en el SQL Editor de Supabase.

### 4. Crear bucket de fotos
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('patient-photos', 'patient-photos', false, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;
```

### 5. Arrancar
```bash
npm run dev  # http://localhost:3043
```

### 6. Probar
- **Paciente:** http://localhost:3043/login → TEST1234
- **Admin:** http://localhost:3043/admin/login → admin@capilexmadrid.es / Capilex2026!

## Documentacion

Toda la documentacion esta en `/docs/` como ficheros HTML autocontenidos con estilos Capilex (negro + dorado).

| Documento | Contenido |
|---|---|
| [deploy-vercel.html](docs/deploy-vercel.html) | Guia deploy paso a paso (Supabase + Vercel) |
| [setup-telegram.html](docs/setup-telegram.html) | Configurar bot Telegram en 5 pasos |
| [historias-de-usuario.html](docs/historias-de-usuario.html) | 24 user stories con estado (92% completadas) |
| [casos-de-test.html](docs/casos-de-test.html) | 32 test cases manuales |
| [costes-telegram-whatsapp.html](docs/costes-telegram-whatsapp.html) | Modelo costes comunicacion |
| [analisis-teams-telegram.html](docs/analisis-teams-telegram.html) | Comparativa Teams vs Telegram |
| [mejoras-ux-product.html](docs/mejoras-ux-product.html) | 21 mejoras priorizadas por agentes UX + PO |

## Costes estimados

| Volumen | Coste mensual |
|---|---|
| 10-20 pacientes | 6-45 EUR/mes |
| 50 pacientes | ~144 EUR/mes |
| Coste por paciente | ~1-2 EUR (todo incluido) |

## Estado

- **66 ficheros fuente**, ~5.700 lineas TypeScript
- **19 tablas** PostgreSQL con seed del protocolo Capilex
- **24 historias de usuario**, 22 completadas (92%)
- **32 casos de test** documentados
- **8 documentos** HTML de referencia
- **Puerto local:** 3043

## Areas de mejora futuras

### Prioridad Alta
| Area | Descripcion | Impacto |
|---|---|---|
| **Service Role Key** | El `.env.local` usa la anon key como service_role. Obtener la key real del servidor Supabase (self-hosted) o crear Storage Policies adecuadas | Seguridad |
| **Tests automatizados** | No hay tests unitarios ni e2e. Implementar Jest + Playwright para flujos criticos (login, upload foto, chat) | Calidad |
| **Push notifications** | Notificaciones nativas al movil para recordatorios de medicacion y tareas del dia | Engagement paciente |
| **PWA / App instalable** | Manifest + service worker para instalar como app nativa. Acceso offline al checklist y medicacion | UX mobile |
| **Rate limiter persistente** | El rate limiter actual es in-memory y se pierde en cada cold start de Vercel. Migrar a Upstash Redis | Seguridad |

### Prioridad Media
| Area | Descripcion | Impacto |
|---|---|---|
| **Comparativa fotos** | Vista lado a lado (dia 7 vs dia 30 vs dia 90) para que el paciente vea su progreso | Motivacion paciente |
| **Exportar informe PDF** | Generar informe con timeline, fotos y analisis IA para el paciente o para la clinica | Valor clinico |
| **Notificaciones Telegram por paciente** | Avisar cuando un paciente especifico no entra en la app en X dias | Seguimiento |
| **Dashboard analytics admin** | Graficas de uso, fotos subidas por dia, tiempo medio de revision, NPS | Gestion clinica |
| **Multi-idioma** | Soporte ingles/frances para pacientes internacionales (i18n con next-intl) | Alcance |
| **Citas / calendario** | Integrar con `cap_follow_up_appointments` para recordatorios y confirmaciones | Operativa |

### Prioridad Baja (futuro)
| Area | Descripcion | Impacto |
|---|---|---|
| **WhatsApp Business API** | Alternativa a Telegram para comunicacion con pacientes (mayor adopcion) | Canal paciente |
| **Multi-clinica** | Soporte para varias clinicas con protocolos independientes (la DB ya lo soporta) | Escalabilidad |
| **Video-consulta** | Teleconsulta integrada para seguimiento postoperatorio remoto | Servicio premium |
| **ML propio** | Entrenar modelo propio con fotos historicas para no depender de GPT-4o Vision | Coste + privacidad |
| **API publica** | Endpoint para que sistemas externos (CRM, ERP clinica) consulten datos | Integracion |

### Deuda tecnica
| Item | Detalle |
|---|---|
| Colores hardcoded | Varios componentes usan `bg-black`, `border-[#1a1a1a]`, `bg-[#111]` en vez de variables CSS. Refactorizar para que el tema claro/oscuro funcione al 100% |
| Supabase RLS | Las Row Level Security policies no estan configuradas. Actualmente se accede con service role. Implementar RLS por paciente/clinica |
| Error boundaries | No hay error boundaries en React. Un fallo en un componente rompe toda la pagina |
| Loading states | Algunos componentes no muestran skeleton loaders. UX mejorable en conexiones lentas |
| Accesibilidad (a11y) | Revisar contraste de colores (especialmente dorado sobre negro), labels en inputs, navegacion por teclado |
| Monitoring | No hay logging estructurado ni monitoring (Sentry, LogRocket). Los errores se pierden en los logs de Vercel |

---

Clinica Capilex Madrid — M&M Mundo Capilar — CIF: B16867491
