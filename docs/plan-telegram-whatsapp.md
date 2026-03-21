# Plan: Canales de Comunicacion - Telegram y WhatsApp

## Objetivo

Establecer dos canales de comunicacion complementarios para la clinica Capilex Madrid:
- **Telegram**: Canal interno del equipo clinico (notificaciones, alertas, coordinacion)
- **WhatsApp**: Comunicacion directa con el paciente (recordatorios, seguimiento)

---

## 1. TELEGRAM - Canal Interno de la Clinica

### Para que sirve
Canal privado donde el equipo clinico recibe alertas automaticas sobre pacientes. NO es para comunicarse con pacientes, es una herramienta interna del staff.

### Arquitectura

```
App Capilex (servidor)
      │
      ▼
  Bot Telegram (API HTTP)
      │
      ▼
  Grupo privado "Capilex Staff"
  (solo equipo clinico)
```

### Tipos de notificaciones

| Notificacion | Trigger | Prioridad |
|---|---|---|
| 📸 Foto subida | Paciente sube foto | Normal |
| 🔴 Foto con riesgo | IA detecta riesgo alto | ALTA |
| ⚠️ Escalado chat | IA escala conversacion | ALTA |
| 📋 Plazo pre-op | Cirugia en <7 dias + pendientes | Media |
| 📷 Fotos no enviadas | Paciente no envia fotos dia 7/10 | Media |
| 🆕 Nuevo acceso | Paciente usa app 1a vez | Baja |
| 📊 Resumen diario | Cron 08:00 cada dia | Info |
| 🗓 Cirugia manana | Cron dia anterior a cirugia | ALTA |

### Setup tecnico

1. **Crear bot**: Hablar con @BotFather → `/newbot` → nombre "Capilex Alertas"
2. **Crear grupo**: Grupo privado en Telegram → anadir bot como admin
3. **Obtener chat_id**: Enviar mensaje al grupo → visitar `https://api.telegram.org/bot<TOKEN>/getUpdates` → copiar chat_id (numero negativo)
4. **Configurar .env**: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CLINIC_CHAT_ID`

### Coste: GRATIS

| Concepto | Coste |
|---|---|
| Bot de Telegram | Gratuito |
| API de Telegram | Gratuita, sin limites practicos |
| Grupo privado | Gratuito |
| Mensajes ilimitados | Gratuito |
| **TOTAL** | **0 EUR/mes** |

Telegram no cobra nada por el uso de bots. No hay limites significativos para el volumen que manejara una clinica (max ~30 mensajes/seg, nunca llegaremos a eso).

---

## 2. WHATSAPP - Comunicacion con el Paciente

### Para que sirve
Enviar mensajes automaticos al paciente via WhatsApp: recordatorios de medicacion, alertas de cuidados, recordatorios de fotos, y permitir que el paciente responda directamente.

### Opciones de implementacion

#### Opcion A: WhatsApp Business API (via proveedor)

```
App Capilex (servidor)
      │
      ▼
  Proveedor (Twilio / MessageBird / 360dialog)
      │
      ▼
  WhatsApp Business API
      │
      ▼
  WhatsApp del paciente
```

**Proveedores principales:**

| Proveedor | Coste por mensaje | Setup | Facilidad |
|---|---|---|---|
| **Twilio** | 0.005-0.08 EUR/msg | Facil | Alta |
| **360dialog** | 0.03-0.06 EUR/msg | Media | Media |
| **MessageBird** | 0.04-0.07 EUR/msg | Media | Media |
| **Meta Cloud API** (directo) | Gratis primeros 1000/mes | Complejo | Baja |

#### Opcion B: Meta Cloud API directo (sin proveedor)

Conectar directamente a la API de Meta. Mas barato pero mas complejo de configurar.

### Modelo de precios WhatsApp Business API

Meta cobra por "conversacion" (ventana de 24h), no por mensaje individual:

| Tipo de conversacion | Coste (Espana) | Quien la inicia |
|---|---|---|
| **Utility** (recordatorios, alertas) | ~0.03 EUR | La clinica |
| **Marketing** (promociones) | ~0.06 EUR | La clinica |
| **Authentication** (codigos) | ~0.02 EUR | La clinica |
| **Service** (respuesta a paciente) | GRATIS | El paciente |

**NOTA**: Si el paciente escribe primero, la respuesta es GRATIS durante 24h.

### Estimacion de costes WhatsApp por paciente

Asumiendo un paciente tipico con cirugia y seguimiento de 18 meses:

| Fase | Mensajes | Tipo | Coste unitario | Subtotal |
|---|---|---|---|---|
| Pre-op (4 alertas) | 4 | Utility | 0.03 EUR | 0.12 EUR |
| Dia cirugia | 1 | Utility | 0.03 EUR | 0.03 EUR |
| Post-op dias 1-15 (diarios) | 15 | Utility | 0.03 EUR | 0.45 EUR |
| Post-op dias 16-30 | 4 | Utility | 0.03 EUR | 0.12 EUR |
| Meses 2-18 (mensuales) | 10 | Utility | 0.03 EUR | 0.30 EUR |
| Recordatorios fotos (dia 7,10,120,180,365) | 5 | Utility | 0.03 EUR | 0.15 EUR |
| Respuestas del paciente | ~10 | Service | GRATIS | 0.00 EUR |
| **TOTAL POR PACIENTE** | **~49** | | | **~1.17 EUR** |

### Estimacion mensual segun volumen de la clinica

| Pacientes/mes | Coste WhatsApp/mes | Coste Twilio (plataforma) | Total/mes |
|---|---|---|---|
| 5 | 5.85 EUR | 0 EUR (free tier) | ~6 EUR |
| 10 | 11.70 EUR | 0 EUR | ~12 EUR |
| 20 | 23.40 EUR | 0 EUR | ~24 EUR |
| 50 | 58.50 EUR | 15 EUR | ~74 EUR |
| 100 | 117.00 EUR | 15 EUR | ~132 EUR |

### Mensajes que enviariamos por WhatsApp

**Pre-operatorio:**
```
Hola Jose 👋
Faltan 7 dias para tu cirugia en Capilex Madrid.

Recuerda:
🚫 Sin alcohol, cafeina ni tabaco
🚫 Sin deporte ni AINEs
📋 Revisa tu checklist en la app

👉 Accede a tu app: [link]
```

**Post-operatorio (dia 7):**
```
Buenos dias Jose 📸
Hoy es dia 7 postoperatorio.

Es momento de enviar tus fotos de seguimiento:
📷 Zona receptora (frente y arriba)
📷 Zona donante

Sube las fotos en la app y nuestro equipo las revisara.

👉 Subir fotos: [link]
```

**Alerta de medicacion:**
```
💊 Recordatorio Capilex
Hora de tu Ciprofloxacino (500mg) con la cena.

Dia 3 de 7 del antibiotico.
```

### Requisitos para WhatsApp Business API

1. **Cuenta Meta Business** verificada (la clinica necesita verificar su negocio)
2. **Numero de telefono dedicado** (no puede ser el movil personal, necesita ser un numero que no use WhatsApp normal)
3. **Plantillas de mensaje aprobadas** por Meta (los mensajes que inicia la clinica deben ser plantillas pre-aprobadas)
4. **Consentimiento del paciente** (opt-in obligatorio segun RGPD + politica Meta)

### Timeline de implementacion WhatsApp

| Paso | Tiempo | Descripcion |
|---|---|---|
| 1. Crear Meta Business Account | 1 dia | Si no existe ya |
| 2. Verificacion de negocio | 2-7 dias | Meta verifica documentacion |
| 3. Solicitar numero WhatsApp Business | 1-2 dias | Asignar numero dedicado |
| 4. Crear cuenta Twilio + conectar | 1 dia | Configuracion tecnica |
| 5. Disenar y aprobar plantillas | 3-5 dias | Meta revisa cada plantilla |
| 6. Implementar integracion en la app | 2-3 dias | Codigo + testing |
| 7. Testing con pacientes reales | 3-5 dias | Piloto |
| **TOTAL** | **2-3 semanas** | |

---

## 3. COMPARATIVA Telegram vs WhatsApp

| Aspecto | Telegram (clinica) | WhatsApp (paciente) |
|---|---|---|
| **Destinatario** | Equipo clinico | Paciente |
| **Coste** | GRATIS | ~1.17 EUR/paciente |
| **Setup** | 10 minutos | 2-3 semanas |
| **Aprobacion** | No necesaria | Plantillas aprobadas por Meta |
| **Verificacion** | No | Si (negocio verificado) |
| **Complejidad tecnica** | Baja (HTTP simple) | Media (SDK + webhooks) |
| **Bidireccional** | Solo lectura (alertas) | Si (paciente puede responder) |
| **Adjuntos** | Si (fotos, docs) | Si |
| **Limite mensajes** | Ilimitado | Pago por conversacion |
| **Fiabilidad** | Alta | Muy alta (99.9% entrega) |

---

## 4. RECOMENDACION

### Fase inmediata (esta semana): TELEGRAM
- Coste: 0 EUR
- Setup: 10 minutos
- Impacto: El equipo clinico recibe alertas al instante
- Ya esta implementado en el codigo (solo falta configurar token)

### Fase siguiente (mes proximo): WhatsApp
- Coste: ~6-24 EUR/mes para una clinica mediana
- Setup: 2-3 semanas (verificacion Meta + plantillas)
- Impacto: Los pacientes reciben recordatorios donde ya estan (WhatsApp)
- Requiere: consentimiento opt-in del paciente

### Fase opcional: Ambos combinados
- Telegram: alertas internas clinica (gratis)
- WhatsApp: comunicacion paciente (bajo coste)
- App: experiencia completa (timeline, fotos, chat IA)
- Total estimado: **~20-30 EUR/mes** para 10-20 pacientes activos

---

## 5. COSTES TOTALES DE LA APP

| Servicio | Coste mensual | Notas |
|---|---|---|
| **Vercel** (hosting) | 0 EUR | Free tier (suficiente para empezar) |
| **Supabase** (DB + storage) | 0 EUR | Free tier: 500MB DB, 1GB storage, 50K requests |
| **OpenAI GPT-4o** (chat + fotos) | ~5-20 EUR | ~0.50 EUR/paciente/mes (estimado 20-50 calls) |
| **Telegram Bot** | 0 EUR | Gratuito |
| **WhatsApp** (opcional) | ~6-24 EUR | Segun volumen |
| **Dominio** (app.capilexmadrid.es) | ~1 EUR | Subdominio del dominio existente |
| **TOTAL ESTIMADO** | **~6-45 EUR/mes** | Para 10-20 pacientes |

### Cuando escalar (costes de crecimiento)

| Si creces a... | Vercel | Supabase | OpenAI | WhatsApp | Total |
|---|---|---|---|---|---|
| 50 pacientes/mes | 20 EUR | 25 EUR | 25 EUR | 74 EUR | ~144 EUR |
| 100 pacientes/mes | 20 EUR | 25 EUR | 50 EUR | 132 EUR | ~227 EUR |

Estos costes son marginales comparados con el precio de un trasplante capilar (~3.000-6.000 EUR).
El coste por paciente es de **~1-2 EUR** incluyendo todo.
