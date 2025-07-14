// Order synchronization utilities for cross-panel communication

// Unique ID generator for orders
export const generateUniqueOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 999) + 100; // 100-999 arası
  const orderNumber = `SIP-${timestamp.toString().slice(-6)}${random}`;
  return orderNumber;
};

// Add new order to both customer and seller storage
export const addOrder = (orderData) => {
  const newOrder = {
    id: generateUniqueOrderId(),
    date: new Date(),
    status: 'pending',
    total: orderData.total,
    itemCount: orderData.items.length,
    deliveryAddress: orderData.deliveryAddress || "Atatürk Caddesi No: 123, Kadıköy, İstanbul",
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
    items: orderData.items,
    timeline: [
      { status: "confirmed", time: null, completed: false },
      { status: "preparing", time: null, completed: false },
      { status: "out_for_delivery", time: null, completed: false },
      { status: "delivered", time: null, completed: false }
    ],
    canCancel: true,
    canReorder: true,
    notes: orderData.notes || "",
    isDemo: false
  };

  // Add to customer orders
  const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
  customerOrders.unshift(newOrder);
  localStorage.setItem('customerOrders', JSON.stringify(customerOrders));

  // Add to seller orders with seller-specific format
  const sellerOrder = {
    id: newOrder.id,
    orderNumber: newOrder.id.replace('order-', '#'),
    customer: orderData.customerName || "Müşteri Adı",
    phone: orderData.customerPhone || "+90 555 123 4567",
    date: newOrder.date,
    status: newOrder.status,
    total: newOrder.total,
    itemCount: newOrder.itemCount,
    deliveryAddress: newOrder.deliveryAddress,
    estimatedDelivery: newOrder.estimatedDelivery,
    items: newOrder.items,
    timeline: newOrder.timeline,
    canCancel: newOrder.canCancel,
    notes: newOrder.notes,
    isDemo: false
  };

  const sellerOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
  sellerOrders.unshift(sellerOrder);
  localStorage.setItem('sellerOrders', JSON.stringify(sellerOrders));

  // Notify other tabs/panels about the new order
  window.dispatchEvent(new CustomEvent('newOrderReceived', {
    detail: { order: newOrder, sellerOrder }
  }));

  console.log('Order added to both customer and seller panels:', newOrder.id);
  return newOrder.id;
};

// Update order status in both customer and seller storage
export const updateOrderStatus = (orderId, newStatus) => {
  // Update customer orders
  const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
  const customerOrderIndex = customerOrders.findIndex(order => order.id === orderId);
  if (customerOrderIndex !== -1) {
    customerOrders[customerOrderIndex].status = newStatus;
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
  }

  // Update seller orders
  const sellerOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
  const sellerOrderIndex = sellerOrders.findIndex(order => order.id === orderId);
  if (sellerOrderIndex !== -1) {
    sellerOrders[sellerOrderIndex].status = newStatus;
    localStorage.setItem('sellerOrders', JSON.stringify(sellerOrders));
  }

  // Notify other tabs about the status update
  window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
    detail: { orderId, newStatus }
  }));

  console.log(`Order ${orderId} status updated to ${newStatus}`);
};

// Delete single order from both storages
export const deleteOrder = (orderId) => {
  // Remove from customer orders
  const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
  const updatedCustomerOrders = customerOrders.filter(order => order.id !== orderId);
  localStorage.setItem('customerOrders', JSON.stringify(updatedCustomerOrders));

  // Remove from seller orders
  const sellerOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
  const updatedSellerOrders = sellerOrders.filter(order => order.id !== orderId);
  localStorage.setItem('sellerOrders', JSON.stringify(updatedSellerOrders));

  // Notify other tabs about the deletion
  window.dispatchEvent(new CustomEvent('orderDeleted', {
    detail: { orderId }
  }));

  console.log(`Order ${orderId} deleted from both panels`);
};

// Clear all orders from both storages
export const clearAllOrders = () => {
  // Set demo orders disabled flag
  localStorage.setItem('demoOrdersDisabled', 'true');
  
  // Clear customer orders
  localStorage.setItem('customerOrders', JSON.stringify([]));
  
  // Clear seller orders
  localStorage.setItem('sellerOrders', JSON.stringify([]));

  // Notify other tabs about clearing all orders
  window.dispatchEvent(new CustomEvent('allOrdersCleared', {
    detail: { timestamp: Date.now() }
  }));

  console.log('All orders cleared from both panels');
};

// Get demo orders disabled status
export const isDemoOrdersDisabled = () => {
  return localStorage.getItem('demoOrdersDisabled') === 'true';
};

// Reset demo orders disabled status
export const enableDemoOrders = () => {
  localStorage.removeItem('demoOrdersDisabled');
  console.log('Demo orders enabled');
};
