Smart Home Premium - plataforma de prova técnica para técnicos de dispositivos inteligentes

## Design
- Fonts: Space Grotesk (display), Inter (body)
- Primary: blue 210 100% 45%
- Accent (success): green 160 70% 40%
- Warning: orange 38 92% 50%
- Danger: red 0 72% 51%

## Architecture
- No auth for exam - access via name + code
- Admin auth via email/password with user_roles table
- Tables: questions, access_codes, exam_sessions, answers, user_roles, profiles
- Edge function: send-exam-results
- Test access code: TESTE2024 (email: teste@smarthomepremium.com)
- Admin: Steevenadeau13@gmail.com / Admin2024!

## Routes
- / → Tela de acesso (candidato)
- /exam/:sessionId → Prova
- /admin → Login admin
- /admin/results → Dashboard resultados

## Rules
- Empresa: Smart Home Premium
- 30 perguntas técnicas (Wi-Fi, Zigbee, controlador, fechadura, interfone, LED, sensores)
- Tempo padrão: 45 minutos, configurável
- Salvar cada resposta individualmente
- Resultado enviado por e-mail
- Auto-confirm emails habilitado
