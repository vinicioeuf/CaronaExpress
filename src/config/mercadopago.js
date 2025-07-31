// Configuração do Mercado Pago
const MERCADO_PAGO_CONFIG = {
  PUBLIC_KEY: "TEST-b58b105d-488d-451d-bc74-8c9496d6d2f2",
  ACCESS_TOKEN: "TEST-4120618741008484-060310-c259c9368e34364e096d68a36f000fec-1677330594",
  BASE_URL: "https://api.mercadopago.com"
};

// Função para verificar se as credenciais estão configuradas
export const checkCredentials = () => {
  return {
    publicKey: MERCADO_PAGO_CONFIG.PUBLIC_KEY,
    accessToken: MERCADO_PAGO_CONFIG.ACCESS_TOKEN ? 'Configurado' : 'Não configurado'
  };
};

// Função para gerar QR Code PIX simulado (para demonstração)
export const generatePixPayment = async (amount, description = 'Depósito no CaronaExpress') => {
  try {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gerar ID único para o pagamento
    const paymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simular QR Code base64 (um QR Code simples)
    const qrCodeData = `00020126580014br.gov.bcb.pix0136${paymentId}520400005303986540510.005802BR5913CaronaExpress6008Brasilia62070503***6304`;
    const qrCodeBase64 = btoa(qrCodeData); // Simular QR Code em base64
    
    return {
      success: true,
      preferenceId: paymentId,
      initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${paymentId}`,
      qrCode: qrCodeData,
      qrCodeBase64: qrCodeBase64,
      pixCopyPaste: qrCodeData,
      externalReference: `deposito_${Date.now()}`,
      amount: amount,
      description: description
    };
  } catch (error) {
    console.error('Erro ao gerar pagamento PIX:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para verificar status do pagamento (simulado)
export const checkPaymentStatus = async (paymentId) => {
  try {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular diferentes status baseado no tempo
    const timeSinceCreation = Date.now() - parseInt(paymentId.split('_')[1]);
    let status = 'pending';
    
    // Simular aprovação após 30 segundos
    if (timeSinceCreation > 30000) {
      status = 'approved';
    } else if (timeSinceCreation > 15000) {
      status = 'in_process';
    }
    
    // Simular rejeição ocasional
    if (Math.random() < 0.1) {
      status = 'rejected';
    }
    
    return {
      success: true,
      status: status,
      statusDetail: status === 'approved' ? 'Pagamento aprovado' : 
                   status === 'pending' ? 'Aguardando pagamento' :
                   status === 'in_process' ? 'Processando pagamento' :
                   'Pagamento rejeitado',
      amount: 10.00, // Valor simulado
      externalReference: paymentId
    };
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para buscar pagamentos por referência externa (simulado)
export const getPaymentsByReference = async (externalReference) => {
  try {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      payments: [
        {
          id: externalReference,
          status: 'approved',
          amount: 10.00,
          external_reference: externalReference,
          date_created: new Date().toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para fazer requisições reais para a API do Mercado Pago (para produção)
const makeRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const url = `${MERCADO_PAGO_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const options = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Função para gerar pagamento PIX real (para produção)
export const generatePixPaymentReal = async (amount, description = 'Depósito no CaronaExpress') => {
  try {
    const preference = {
      items: [
        {
          title: description,
          unit_price: parseFloat(amount),
          quantity: 1,
        }
      ],
      payment_methods: {
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "debit_card" },
          { id: "bank_transfer" }
        ],
        installments: 1
      },
      back_urls: {
        success: "https://caronaexpress.com/success",
        failure: "https://caronaexpress.com/failure",
        pending: "https://caronaexpress.com/pending"
      },
      auto_return: "approved",
      notification_url: "https://caronaexpress.com/webhook",
      external_reference: `deposito_${Date.now()}`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    };

    const response = await makeRequest('/checkout/preferences', 'POST', preference);
    
    if (response && response.id) {
      // Buscar informações do pagamento PIX
      const paymentInfo = await makeRequest(`/v1/payments/${response.id}`);
      
      return {
        success: true,
        preferenceId: response.id,
        initPoint: response.init_point,
        qrCode: paymentInfo.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: paymentInfo.point_of_interaction?.transaction_data?.qr_code_base64,
        pixCopyPaste: paymentInfo.point_of_interaction?.transaction_data?.qr_code_base64,
        externalReference: response.external_reference
      };
    } else {
      throw new Error('Erro ao gerar preferência de pagamento');
    }
  } catch (error) {
    console.error('Erro ao gerar pagamento PIX:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  checkCredentials,
  generatePixPayment,
  checkPaymentStatus,
  getPaymentsByReference,
  generatePixPaymentReal, // Versão real para produção
  MERCADO_PAGO_CONFIG
}; 