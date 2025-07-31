# Integração Mercado Pago PIX - CaronaExpress

## 📋 Visão Geral

Esta integração permite que os usuários do CaronaExpress realizem depósitos em suas contas através de pagamentos PIX usando o Mercado Pago.

## 🔧 Configuração

### Credenciais Configuradas

- **Public Key**: `TEST-b58b105d-488d-451d-bc74-8c9496d6d2f2`
- **Access Token**: `TEST-4120618741008484-060310-c259c9368e34364e096d68a36f000fec-1677330594`
- **Ambiente**: Sandbox (Teste)

### Arquivos Criados/Modificados

1. **`src/config/mercadopago.js`** - Configuração principal do Mercado Pago
2. **`src/services/pixService.js`** - Serviço para gerenciar pagamentos PIX
3. **`src/screens/Saldo.js`** - Tela atualizada com funcionalidade PIX

## 🚀 Funcionalidades Implementadas

### 1. Geração de QR Code PIX

- Gera QR Code para pagamento PIX
- Fornece código PIX copia e cola
- Validação de valores (mínimo R$ 1,00, máximo R$ 10.000,00)

### 2. Monitoramento Automático

- Verifica status do pagamento a cada 5 segundos
- Atualização automática do saldo quando pagamento é confirmado
- Tratamento de pagamentos rejeitados/cancelados

### 3. Interface do Usuário

- Modal com QR Code e código PIX
- Indicador de status do pagamento
- Botão para verificação manual
- Limpeza automática de dados após conclusão

## 📱 Como Usar

### Para o Usuário Final

1. **Acesse a tela de Saldo**
2. **Digite o valor do depósito** (mínimo R$ 1,00)
3. **Clique em "Gerar PIX"**
4. **Escaneie o QR Code** ou **copie o código PIX**
5. **Realize o pagamento** no seu app bancário
6. **Aguarde a confirmação** automática

### Fluxo de Pagamento

```
Usuário → Digita valor → Gera PIX → Escaneia QR Code →
Paga no banco → Mercado Pago confirma → Saldo atualizado
```

## 🔧 Para Desenvolvedores

### Estrutura dos Arquivos

#### `src/config/mercadopago.js`

```javascript
// Configuração principal
export const MERCADO_PAGO_CONFIG = {
  PUBLIC_KEY: "TEST-b58b105d-488d-451d-bc74-8c9496d6d2f2",
  ACCESS_TOKEN:
    "TEST-4120618741008484-060310-c259c9368e34364e096d68a36f000fec-1677330594",
};

// Funções principais
export const generatePixPayment = async(amount, description);
export const checkPaymentStatus = async(paymentId);
```

#### `src/services/pixService.js`

```javascript
// Serviço completo para PIX
class PixService {
  async generatePixPayment(amount, description)
  async checkPaymentStatus(paymentId)
  async processApprovedPayment(paymentId, amount)
  startPaymentMonitoring(paymentId, onStatusChange, onComplete)
  validatePaymentAmount(amount)
}
```

### Estados da Tela de Saldo

- `pixLoading`: Carregamento durante geração do PIX
- `qrCodeModalVisible`: Modal do QR Code visível
- `paymentStatus`: Status atual do pagamento
- `isMonitoring`: Monitoramento automático ativo

## 🛠️ Configuração para Produção

### 1. Alterar Credenciais

Substitua as credenciais de teste pelas de produção:

```javascript
// Em src/config/mercadopago.js
const MERCADO_PAGO_CONFIG = {
  PUBLIC_KEY: "APP-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  ACCESS_TOKEN: "APP_USR-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
};
```

### 2. Configurar Webhooks

Para produção, configure webhooks para receber notificações automáticas:

```javascript
// URL do webhook (seu backend)
WEBHOOK_URL: "https://seudominio.com/webhook/mercadopago";
```

### 3. URLs de Retorno

Configure URLs de retorno para seu domínio:

```javascript
BACK_URLS: {
  SUCCESS: "https://seudominio.com/success",
  FAILURE: "https://seudominio.com/failure",
  PENDING: "https://seudominio.com/pending"
}
```

## 🔒 Segurança

### Validações Implementadas

- ✅ Validação de valores mínimos e máximos
- ✅ Verificação de autenticação do usuário
- ✅ Tratamento de erros de rede
- ✅ Limpeza automática de dados sensíveis

### Boas Práticas

- Credenciais em variáveis de ambiente
- Validação de entrada do usuário
- Tratamento de erros robusto
- Monitoramento de pagamentos

## 📊 Status dos Pagamentos

| Status      | Descrição            | Ação                   |
| ----------- | -------------------- | ---------------------- |
| `pending`   | Aguardando pagamento | Monitoramento contínuo |
| `approved`  | Pagamento aprovado   | Atualizar saldo        |
| `rejected`  | Pagamento rejeitado  | Limpar dados           |
| `cancelled` | Pagamento cancelado  | Limpar dados           |

## 🐛 Troubleshooting

### Problemas Comuns

1. **QR Code não aparece**

   - Verifique conexão com internet
   - Confirme se as credenciais estão corretas

2. **Pagamento não é confirmado**

   - Verifique se o pagamento foi realizado no banco
   - Use o botão "Verificar Pagamento" manualmente

3. **Erro de credenciais**
   - Confirme se as chaves estão corretas
   - Verifique se está usando ambiente correto (teste/produção)

### Logs Úteis

```javascript
// Verificar configuração
console.log(pixService.checkCredentials());

// Verificar pagamento atual
console.log(pixService.getCurrentPayment());
```

## 📚 Documentação Mercado Pago

- [Documentação Oficial](https://www.mercadopago.com.br/developers/pt)
- [API de Pagamentos](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integrate-checkout)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/additional-content/notifications)

## 🎯 Próximos Passos

1. **Implementar webhooks** para notificações automáticas
2. **Adicionar histórico de pagamentos** no Firestore
3. **Implementar notificações push** para confirmação
4. **Adicionar múltiplos métodos de pagamento**
5. **Implementar relatórios de transações**

---

**Desenvolvido para CaronaExpress** 🚗💨
