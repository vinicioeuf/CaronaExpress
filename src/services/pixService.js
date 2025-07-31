import { generatePixPayment as mercadopagoGeneratePix, checkPaymentStatus as mercadopagoCheckStatus } from '../config/mercadopago';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

class PixService {
  constructor() {
    this.currentPayment = null;
    this.paymentCheckInterval = null;
  }

  // Gerar pagamento PIX
  async generatePixPayment(amount, description = 'Depósito CaronaExpress') {
    try {
      const paymentResult = await mercadopagoGeneratePix(amount, description);
      
      if (paymentResult.success) {
        this.currentPayment = {
          id: paymentResult.preferenceId,
          amount: amount,
          status: 'pending',
          createdAt: new Date(),
          externalReference: paymentResult.externalReference
        };
        
        return {
          success: true,
          qrCodeBase64: paymentResult.qrCodeBase64,
          qrCode: paymentResult.qrCode,
          pixCopyPaste: paymentResult.pixCopyPaste,
          paymentId: paymentResult.preferenceId,
          externalReference: paymentResult.externalReference
        };
      } else {
        throw new Error(paymentResult.error || 'Erro ao gerar pagamento PIX');
      }
    } catch (error) {
      console.error('Erro no PixService.generatePixPayment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar status do pagamento
  async checkPaymentStatus(paymentId) {
    try {
      const statusResult = await mercadopagoCheckStatus(paymentId);
      
      if (statusResult.success) {
        return {
          success: true,
          status: statusResult.status,
          statusDetail: statusResult.statusDetail,
          amount: statusResult.amount,
          externalReference: statusResult.externalReference
        };
      } else {
        throw new Error(statusResult.error || 'Erro ao verificar status do pagamento');
      }
    } catch (error) {
      console.error('Erro no PixService.checkPaymentStatus:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento aprovado
  async processApprovedPayment(paymentId, amount) {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('Documento do usuário não encontrado');
      }

      const currentBalance = userDoc.data().balance || 0;
      const newBalance = currentBalance + amount;

      await updateDoc(userDocRef, {
        balance: newBalance,
        lastDeposit: {
          amount: amount,
          paymentId: paymentId,
          date: new Date(),
          method: 'PIX'
        }
      });

      return {
        success: true,
        newBalance: newBalance,
        depositedAmount: amount
      };
    } catch (error) {
      console.error('Erro no PixService.processApprovedPayment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Iniciar monitoramento automático do pagamento
  startPaymentMonitoring(paymentId, onStatusChange, onComplete) {
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }

    this.paymentCheckInterval = setInterval(async () => {
      try {
        const statusResult = await this.checkPaymentStatus(paymentId);
        
        if (statusResult.success) {
          onStatusChange(statusResult.status, statusResult.statusDetail);
          
          if (statusResult.status === 'approved') {
            // Pagamento aprovado
            const processResult = await this.processApprovedPayment(paymentId, statusResult.amount);
            
            if (processResult.success) {
              onComplete('approved', processResult);
            } else {
              onComplete('error', processResult.error);
            }
            
            this.stopPaymentMonitoring();
          } else if (statusResult.status === 'rejected' || statusResult.status === 'cancelled') {
            // Pagamento rejeitado ou cancelado
            onComplete('rejected', statusResult.statusDetail);
            this.stopPaymentMonitoring();
          }
        }
      } catch (error) {
        console.error('Erro no monitoramento do pagamento:', error);
      }
    }, 5000); // Verificar a cada 5 segundos
  }

  // Parar monitoramento do pagamento
  stopPaymentMonitoring() {
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
      this.paymentCheckInterval = null;
    }
  }

  // Limpar dados do pagamento atual
  clearCurrentPayment() {
    this.currentPayment = null;
    this.stopPaymentMonitoring();
  }

  // Obter pagamento atual
  getCurrentPayment() {
    return this.currentPayment;
  }

  // Validar valor do pagamento
  validatePaymentAmount(amount) {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        valid: false,
        error: 'Valor inválido'
      };
    }
    
    if (numAmount < 1) {
      return {
        valid: false,
        error: 'Valor mínimo é R$ 1,00'
      };
    }
    
    if (numAmount > 10000) {
      return {
        valid: false,
        error: 'Valor máximo é R$ 10.000,00'
      };
    }
    
    return {
      valid: true,
      amount: numAmount
    };
  }
}

export default new PixService(); 