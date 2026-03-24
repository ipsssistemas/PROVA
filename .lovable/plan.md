
# Smart Home Premium — Plataforma de Prova Técnica

## Visão Geral
Plataforma de avaliação técnica para candidatos a técnicos de instalação de dispositivos inteligentes. O candidato acessa com nome e código, realiza uma prova de 30 perguntas com contagem regressiva, e recebe o resultado por e-mail.

---

## Tela de Acesso (sem login)
- Campos: **Nome completo** e **Código de acesso**
- O código será fornecido previamente pela empresa
- Logo/nome "Smart Home Premium" no topo
- Botão "Iniciar Prova"

## Cabeçalho da Prova
- Nome da empresa "Smart Home Premium"
- Nome do candidato
- **Contagem regressiva** (tempo restante) com destaque visual
- Nota introdutória explicando o objetivo: avaliar o nível técnico avançado do candidato na instalação de dispositivos inteligentes

## Prova — 30 Perguntas Técnicas Avançadas
Temas cobertos:
- Interruptores Wi-Fi e Zigbee
- Controlador universal (IR/RF)
- Fechadura digital
- Interfone inteligente
- Fita de LED (instalação e controle)
- Sensor de presença
- Sensor de movimento

Cada pergunta terá **até 5 opções de resposta** (múltipla escolha, uma correta). Navegação pergunta a pergunta. **Cada resposta é salva individualmente no banco** assim que respondida.

## Tempo Configurável
- Tempo padrão: **45 minutos**
- Possibilidade de configurar tempo máximo por prova
- Ao fim do tempo: bloqueio total, modal de encerramento

## Fim da Prova
- Modal parabenizando o candidato
- Mensagem: "O resultado será enviado por e-mail nos próximos minutos. A empresa entrará em contato."

## E-mail de Resultado
- E-mail profissional com nota (X/30), percentual de acerto
- Branding "Smart Home Premium"
- Enviado automaticamente alguns minutos após a finalização

## Backend (Supabase)
- Tabela de códigos de acesso (para validar entrada)
- Tabela de sessões de prova (candidato, início, fim, tempo configurado)
- Tabela de respostas (salvas individualmente)
- Tabela de perguntas e respostas corretas
- Edge Function para envio de e-mail com resultado
