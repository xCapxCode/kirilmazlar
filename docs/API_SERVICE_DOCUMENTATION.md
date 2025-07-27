/**
 * P2.5 Testing & Documentation - API Documentation
 * @package Kırılmazlar Panel Testing Suite
 */

# API Documentation - Kırılmazlar Panel Services

## Overview
This document provides comprehensive API documentation for all core services in the Kırılmazlar Panel system.

## Authentication Service (`authService`)

### Methods

#### `signIn(email, password)`
**Purpose:** Authenticate user and create session
**Parameters:**
- `email` (string): User email address
- `password` (string): User password

**Returns:** Promise resolving to:
```javascript
{
  success: boolean,
  user: {
    id: string,
    email: string,
    name: string,
    role: string
  } | null,
  error?: string
}
```

**Example:**
```javascript
const result = await authService.signIn('user@example.com', 'password123');
if (result.success) {
  console.log('Logged in:', result.user.name);
}
```

#### `signOut()`
**Purpose:** End user session and clear authentication data
**Parameters:** None
**Returns:** Promise resolving to:
```javascript
{
  success: boolean,
  error?: string
}
```

#### `getCurrentUser()`
**Purpose:** Get currently authenticated user
**Parameters:** None
**Returns:** User object or null
```javascript
{
  id: string,
  email: string,
  name: string,
  role: string
} | null
```

#### `isSessionValid()`
**Purpose:** Check if current session is valid
**Parameters:** None
**Returns:** boolean

#### `refreshSession()`
**Purpose:** Refresh expired session if possible
**Parameters:** None
**Returns:** Promise resolving to authentication result

---

## Customer Service (`customerService`)

### Methods

#### `getById(customerId)`
**Purpose:** Retrieve customer by ID
**Parameters:**
- `customerId` (string): Customer unique identifier

**Returns:** Promise resolving to customer object or null

#### `create(customerData)`
**Purpose:** Create new customer
**Parameters:**
- `customerData` (object): Customer information
```javascript
{
  name: string,
  email: string,
  phone: string,
  address?: string
}
```

**Returns:** Promise resolving to:
```javascript
{
  success: boolean,
  customer?: object,
  error?: string
}
```

#### `update(customerId, updates)`
**Purpose:** Update customer information
**Parameters:**
- `customerId` (string): Customer ID
- `updates` (object): Fields to update

**Returns:** Promise resolving to update result

#### `search(query, filters)`
**Purpose:** Search customers with filters
**Parameters:**
- `query` (string): Search term
- `filters` (object): Additional filters

**Returns:** Promise resolving to array of matching customers

#### `getCustomerOrders(customerId)`
**Purpose:** Get all orders for specific customer
**Parameters:**
- `customerId` (string): Customer ID

**Returns:** Promise resolving to array of orders

---

## Order Service (`orderService`)

### Methods

#### `create(orderData)`
**Purpose:** Create new order
**Parameters:**
- `orderData` (object): Order information
```javascript
{
  customerId: string,
  items: Array<{
    productId: string,
    quantity: number,
    price: number
  }>,
  total: number,
  notes?: string
}
```

**Returns:** Promise resolving to:
```javascript
{
  success: boolean,
  order?: {
    id: string,
    customerId: string,
    items: Array,
    total: number,
    status: string,
    createdAt: string
  },
  error?: string
}
```

#### `getById(orderId)`
**Purpose:** Get order by ID
**Parameters:**
- `orderId` (string): Order unique identifier

**Returns:** Promise resolving to order object or null

#### `getByCustomerId(customerId)`
**Purpose:** Get all orders for customer
**Parameters:**
- `customerId` (string): Customer ID

**Returns:** Promise resolving to array of orders

#### `updateStatus(orderId, status)`
**Purpose:** Update order status
**Parameters:**
- `orderId` (string): Order ID
- `status` (string): New status ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')

**Returns:** Promise resolving to update result

#### `calculateTotal(items)`
**Purpose:** Calculate order total from items
**Parameters:**
- `items` (Array): Order items

**Returns:** number (calculated total)

---

## Product Service (`productService`)

### Methods

#### `getAll()`
**Purpose:** Get all products
**Parameters:** None
**Returns:** Promise resolving to array of products

#### `getById(productId)`
**Purpose:** Get product by ID
**Parameters:**
- `productId` (string): Product unique identifier

**Returns:** Promise resolving to product object or null

#### `getByCategory(category)`
**Purpose:** Get products by category
**Parameters:**
- `category` (string): Product category

**Returns:** Promise resolving to array of products

#### `search(query)`
**Purpose:** Search products by name or description
**Parameters:**
- `query` (string): Search term

**Returns:** Promise resolving to array of matching products

#### `updateStock(productId, quantity)`
**Purpose:** Update product stock
**Parameters:**
- `productId` (string): Product ID
- `quantity` (number): New stock quantity

**Returns:** Promise resolving to update result

---

## Storage Service (`storageService`)

### Methods

#### `setItem(key, value)`
**Purpose:** Store data in localStorage
**Parameters:**
- `key` (string): Storage key
- `value` (any): Data to store (will be JSON stringified)

**Returns:** void

#### `getItem(key)`
**Purpose:** Retrieve data from localStorage
**Parameters:**
- `key` (string): Storage key

**Returns:** Parsed data or null

#### `removeItem(key)`
**Purpose:** Remove item from localStorage
**Parameters:**
- `key` (string): Storage key

**Returns:** void

#### `clear()`
**Purpose:** Clear all localStorage data
**Parameters:** None
**Returns:** void

#### `healthCheck()`
**Purpose:** Check storage system health
**Parameters:** None
**Returns:** Health status object

---

## Error Handling

All services implement consistent error handling:

```javascript
{
  success: false,
  error: "Error message",
  code?: "ERROR_CODE",
  details?: object
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `PERMISSION_DENIED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Data validation failed
- `STORAGE_ERROR`: Storage operation failed
- `NETWORK_ERROR`: Network request failed

---

## Usage Examples

### Complete Order Flow
```javascript
// 1. Authenticate
const loginResult = await authService.signIn('customer@email.com', 'password');
if (!loginResult.success) return;

// 2. Get products
const products = await productService.getAll();

// 3. Create order
const orderData = {
  customerId: loginResult.user.id,
  items: [
    { productId: products[0].id, quantity: 2, price: products[0].price }
  ],
  total: products[0].price * 2
};

const orderResult = await orderService.create(orderData);
if (orderResult.success) {
  console.log('Order created:', orderResult.order.id);
}
```

### Customer Management
```javascript
// Get customer with orders
const customer = await customerService.getById('customer_id');
const orders = await customerService.getCustomerOrders('customer_id');

// Update customer info
const updateResult = await customerService.update('customer_id', {
  phone: '0555 123 4567'
});
```

---

## Security Considerations

1. **Authentication Required**: Most operations require valid session
2. **Data Isolation**: Customer data is isolated by authentication
3. **Input Validation**: All inputs are validated before processing
4. **Error Sanitization**: Error messages don't expose sensitive data
5. **Session Management**: Sessions expire and require refresh

---

## Performance Notes

1. **Caching**: Services implement local caching where appropriate
2. **Batch Operations**: Use batch methods for multiple operations
3. **Lazy Loading**: Data is loaded on demand
4. **Storage Optimization**: localStorage is used efficiently

---

*This documentation covers all core service APIs used throughout the Kırılmazlar Panel system. Each service is designed to be independent, testable, and maintainable.*
