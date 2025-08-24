import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext.jsx';
import storage from '../../core/storage/index.js';

// Mock storage
vi.mock('../../core/storage/index.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  }
}));

// Test component to access cart context
function TestComponent() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{getCartItemCount()}</div>
      <div data-testid="cart-total">{getCartTotal()}</div>
      <div data-testid="cart-items">{JSON.stringify(cart)}</div>
      <button
        data-testid="add-item"
        onClick={() => addToCart({ id: 'prod1', name: 'Test Product', price: 100 })}
      >
        Add Item
      </button>
      <button
        data-testid="remove-item"
        onClick={() => removeFromCart('prod1')}
      >
        Remove Item
      </button>
      <button
        data-testid="update-quantity"
        onClick={() => updateQuantity('prod1', 3)}
      >
        Update Quantity
      </button>
      <button
        data-testid="clear-cart"
        onClick={() => clearCart()}
      >
        Clear Cart
      </button>
    </div>
  );
}

function renderWithCartProvider(component) {
  return render(
    <CartProvider>
      {component}
    </CartProvider>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.get.mockReturnValue([]);
  });

  describe('initial state', () => {
    it('should initialize with empty cart', () => {
      renderWithCartProvider(<TestComponent />);

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('[]');
    });

    it('should load cart from storage on initialization', () => {
      const savedCart = [
        { id: 'prod1', name: 'Saved Product', price: 50, quantity: 2 }
      ];
      storage.get.mockReturnValue(savedCart);

      renderWithCartProvider(<TestComponent />);

      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('100');
      expect(storage.get).toHaveBeenCalledWith('cart', []);
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      renderWithCartProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('add-item').click();
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('100');
      expect(storage.set).toHaveBeenCalledWith('cart', expect.any(Array));
    });

    it('should increase quantity for existing item', async () => {
      const existingCart = [
        { id: 'prod1', name: 'Test Product', price: 100, quantity: 1 }
      ];
      storage.get.mockReturnValue(existingCart);

      renderWithCartProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('add-item').click();
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('200');
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const existingCart = [
        { id: 'prod1', name: 'Test Product', price: 100, quantity: 1 },
        { id: 'prod2', name: 'Another Product', price: 50, quantity: 2 }
      ];
      storage.get.mockReturnValue(existingCart);

      renderWithCartProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('remove-item').click();
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('100');
      expect(storage.set).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const existingCart = [
        { id: 'prod1', name: 'Test Product', price: 100, quantity: 1 }
      ];
      storage.get.mockReturnValue(existingCart);

      renderWithCartProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('update-quantity').click();
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('300');
    });

    it('should remove item when quantity is 0', async () => {
      const existingCart = [
        { id: 'prod1', name: 'Test Product', price: 100, quantity: 1 }
      ];
      storage.get.mockReturnValue(existingCart);

      // Create a test component that can update quantity to 0
      function TestComponentWithZeroQuantity() {
        const { updateQuantity, getCartItemCount, getCartTotal } = useCart();
        
        return (
          <div>
            <div data-testid="cart-count">{getCartItemCount()}</div>
            <div data-testid="cart-total">{getCartTotal()}</div>
            <button
              data-testid="set-zero-quantity"
              onClick={() => updateQuantity('prod1', 0)}
            >
              Set Zero Quantity
            </button>
          </div>
        );
      }

      renderWithCartProvider(<TestComponentWithZeroQuantity />);

      await act(async () => {
        screen.getByTestId('set-zero-quantity').click();
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const existingCart = [
        { id: 'prod1', name: 'Test Product', price: 100, quantity: 1 },
        { id: 'prod2', name: 'Another Product', price: 50, quantity: 2 }
      ];
      storage.get.mockReturnValue(existingCart);

      renderWithCartProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('clear-cart').click();
      });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('[]');
      expect(storage.set).toHaveBeenCalledWith('cart', []);
    });
  });

  describe('cart calculations', () => {
    it('should calculate correct total', () => {
      const cartItems = [
        { id: 'prod1', name: 'Product 1', price: 100, quantity: 2 },
        { id: 'prod2', name: 'Product 2', price: 50, quantity: 3 }
      ];
      storage.get.mockReturnValue(cartItems);

      renderWithCartProvider(<TestComponent />);

      expect(screen.getByTestId('cart-total')).toHaveTextContent('350');
    });

    it('should calculate correct item count', () => {
      const cartItems = [
        { id: 'prod1', name: 'Product 1', price: 100, quantity: 2 },
        { id: 'prod2', name: 'Product 2', price: 50, quantity: 3 }
      ];
      storage.get.mockReturnValue(cartItems);

      renderWithCartProvider(<TestComponent />);

      expect(screen.getByTestId('cart-count')).toHaveTextContent('5');
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully', async () => {
      storage.set.mockImplementation(() => {
        throw new Error('Storage error');
      });

      renderWithCartProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('add-item').click();
      });

      // Should not crash the app
      expect(screen.getByTestId('cart-count')).toBeInTheDocument();
    });
  });
});