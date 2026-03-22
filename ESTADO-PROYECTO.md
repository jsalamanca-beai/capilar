# Estado del Proyecto Capilex — 22 marzo 2026

## Que se ha hecho hoy

### Vercel + Deploy
- Proyecto linkeado a Vercel (`jsalamanca-beais-projects/capilar`)
- Variables de entorno subidas: Supabase, OpenAI, JWT, Telegram
- Deploy automatico en cada push a main
- URL produccion: https://capilar-dun.vercel.app

### Login / Auth
- Fix IP parsing en validate-code (x-forwarded-for con multiples IPs)
- Body parsing seguro con try/catch
- Cookie sameSite cambiado de `strict` a `lax` (necesario para Vercel)
- Prevencion de doble submit con ref
- Rate limiter subido a 10 intentos + nota sobre cold starts
- Logging de errores en validacion de codigo

### Supabase Storage
- Bucket `patient-photos` ya existia pero sin policies
- Creadas policies INSERT y SELECT para rol anon
- Subida de fotos funciona correctamente con analisis IA (GPT-4o Vision)

### Telegram Bot
- Bot creado: @CapilexBot (token: configurado en Vercel + .env.local)
- Grupo: "CAPILEX Equipo" (chat_id: configurado)
- Webhook registrado en: https://capilar-dun.vercel.app/api/telegram/webhook
- 6 tipos de notificacion automatica funcionando
- Comandos interactivos:
  - `/paciente nombre apellido` — info detallada del paciente
  - `/pacientes` — lista de pacientes activos
  - `/ayuda` — comandos disponibles
- Test local verificado (5 mensajes de prueba enviados OK)

### UI
- Boton logout en header paciente (icono puerta, redirige a `/`)
- Boton logout en admin mobile (icono puerta)
- Admin desktop ya tenia "Cerrar sesion" — cambiado redirect a `/`
- Modo claro/oscuro con ThemeProvider + persistencia localStorage
- Toggle sol/luna en header paciente
- Toggle texto en sidebar admin

## Que falta por verificar

- [ ] Telegram webhook responde a `/paciente` y `/pacientes` en produccion
- [ ] Modo claro se ve bien en todas las pantallas (hay colores hardcoded)
- [ ] Cron daily-summary se ejecuta a las 6:00 UTC (verificar en Vercel logs)
- [ ] Probar login con codigo real desde movil en produccion

## Pendiente proximo dia

### Urgente
- [ ] Obtener la service_role key real del servidor Supabase (actualmente usa anon key como service_role — funciona por las policies pero no es correcto)
- [ ] Revisar modo claro en todas las pantallas — refactorizar colores hardcoded (`bg-black`, `border-[#1a1a1a]`, etc.) a variables CSS
- [ ] Probar flujo completo en movil: login → dashboard → subir foto → chat → logout

### Importante
- [ ] Configurar Telegram: personalizar bot con @BotFather (foto perfil, descripcion)
- [ ] Verificar CRON_SECRET en Vercel (actualmente `your_cron_secret_here`)
- [ ] Crear primer paciente real desde admin y probar acceso con codigo
- [ ] Revisar accesibilidad (contraste dorado/negro, labels inputs)

### Mejoras planificadas (ver README.md)
- [ ] Push notifications (PWA)
- [ ] Comparativa fotos lado a lado
- [ ] Tests automatizados (Jest + Playwright)
- [ ] Dashboard analytics admin
- [ ] Exportar informe PDF
- [ ] Rate limiter con Upstash Redis

## Accesos rapidos

| Recurso | URL |
|---|---|
| App produccion | https://capilar-dun.vercel.app |
| Login paciente | https://capilar-dun.vercel.app/login |
| Panel admin | https://capilar-dun.vercel.app/admin/login |
| Vercel dashboard | https://vercel.com/jsalamanca-beais-projects/capilar |
| GitHub repo | https://github.com/jsalamanca-beai/capilar |
| Supabase | https://supabase.beaienergy.com |
| Telegram test (solo local) | http://localhost:3043/api/telegram/test |

## Comandos utiles

```bash
# Dev local
npm run dev -- -p 3043

# Deploy (automatico con push)
git push

# Ver variables Vercel
vercel env ls

# Registrar webhook Telegram (solo una vez)
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://capilar-dun.vercel.app/api/telegram/webhook"

# Ver estado webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

## Commits de hoy

```
faaa6d8 docs: actualizar README con Telegram webhook, tema y areas de mejora
c1833c1 fix: busqueda Telegram soporta nombre + apellido separados
69a2bf5 feat: modo claro/oscuro + logout admin mobile
bf74f45 feat: webhook Telegram con comandos /paciente y /pacientes
b72f9b8 fix: logout redirige a pantalla principal con ambos accesos
2751b0e feat: mejoras login Vercel + boton logout en header
```
