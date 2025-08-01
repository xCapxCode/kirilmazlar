const sellerService = {
  getSellerSubscription: async (sellerId) => {
    return {
      success: true,
      data: {
        id: `sub-${sellerId}-${Date.now()}`,
        seller_id: sellerId,
        plan_name: 'Pro Plan',
        credits_balance: 1000,
        status: 'active',
        created_at: new Date().toISOString(),
        current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      }
    };
  },

  getCreditTransactions: async () => {
    // Gerçek işlem geçmişi storage'dan gelecek
    return {
      success: true,
      data: []
    };
  },

  createCreditTransaction: async (transactionData) => {
    return {
      success: true,
      data: {
        id: `txn-${Math.random().toString(36).substr(2, 9)}`,
        ...transactionData,
        created_at: new Date().toISOString()
      }
    };
  },

  getSellerAnalytics: async () => {
    // Gerçek analitik verileri hesaplanacak
    return {
      success: true,
      data: []
    };
  },

  updateSubscription: async () => {
    return { success: true };
  },

  purchaseCredits: async (sellerId, amount, planName = 'credit_package') => {
    return {
      success: true,
      data: {
        id: `txn-${Math.random().toString(36).substr(2, 9)}`,
        seller_id: sellerId,
        type: 'purchase',
        amount,
        description: `Credits purchase - ${planName}`,
        created_at: new Date().toISOString()
      }
    };
  },

  useCredits: async (sellerId, amount, description, referenceId = null) => {
    return {
      success: true,
      data: {
        id: `txn-${Math.random().toString(36).substr(2, 9)}`,
        seller_id: sellerId,
        type: 'usage',
        amount,
        description,
        reference_id: referenceId,
        created_at: new Date().toISOString()
      }
    };
  },

  subscribeToSubscriptionChanges: () => {
    // Mock subscription, does nothing
    return { unsubscribe: () => { } };
  },

  subscribeToCreditTransactions: () => {
    // Mock subscription, does nothing
    return { unsubscribe: () => { } };
  }
};

export default sellerService;
