

## Plano: Atualizar GMAIL_APP_PASSWORD e Revalidar Envio

### Contexto
As tentativas anteriores falharam com erro SMTP 535 (credenciais rejeitadas). A senha de app precisa ser gerada corretamente.

### Antes de prosseguir — Checklist obrigatório

Confirme que na conta `ipsssistema@gmail.com`:
1. **Verificação em duas etapas** está **ATIVADA**
2. A senha foi gerada em **myaccount.google.com/apppasswords**
3. A senha tem **16 caracteres** (sem espaços)
4. O app foi nomeado como quiser (ex: "Smart Home Premium")

### Passos

1. **Atualizar a secret** `GMAIL_APP_PASSWORD` com a nova senha de 16 caracteres
2. **Testar o envio** chamando a Edge Function `send-access-code` com dados de teste
3. **Verificar os logs** da função para confirmar sucesso ou diagnosticar erro

### Alternativa recomendada

Se a senha continuar sendo rejeitada, posso migrar o envio de e-mails para a **infraestrutura nativa do Lovable Cloud**, eliminando a dependência do Gmail SMTP. Isso requer configurar um domínio de e-mail mas é mais confiável a longo prazo.

