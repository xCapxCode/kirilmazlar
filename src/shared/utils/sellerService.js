const sellerService = {
  getSellerSubscription: async (sellerId) => {
    return {
      success: true,
      data: {
        id: 'sub-demo-id',
        seller_id: sellerId,
        plan_name: 'Pro Plan',
        credits_balance: 1000,
        status: 'active',
        created_at: new Date().toISOString(),
        current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      }
    };
  },

  getCreditTransactions: async (sellerId, limit = 50) => {
    return {
      success: true,
      data: [
        { id: 'txn-1', seller_id: sellerId, type: 'purchase', amount: 500, description: 'Initial credits', created_at: new Date().toISOString() },
        { id: 'txn-2', seller_id: sellerId, type: 'usage', amount: 50, description: 'Customer data access', created_at: new Date().toISOString() }
      ]
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

  getSellerAnalytics: async (sellerId, startDate, endDate) => {
    return {
      success: true,
      data: [
        { date: '2023-10-01', profile_views: 150, leads: 20 },
        { date: '2023-10-02', profile_views: 180, leads: 25 }
      ]
    };
  },

  updateSubscription: async (sellerId, updates) => {
    return { success: true };
  },

  purchaseCredits: async (sellerId, amount, planName = 'credit_package') => {
    return {
      success: true,
      data: {
        id: `txn-${Math.random().toString(36).substr(2, 9)}`,
        seller_id: sellerId,
        type: 'purchase',
        amount: amount,
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
        amount: amount,
        description: description,
        reference_id: referenceId,
        created_at: new Date().toISOString()
      }
    };
  },

  subscribeToSubscriptionChanges: (sellerId, callback) => {
    // Mock subscription, does nothing
    return { unsubscribe: () => {} };
  },

  subscribeToCreditTransactions: (sellerId, callback) => {
    // Mock subscription, does nothing
    return { unsubscribe: () => {} };
  }
};

export default sellerService;
