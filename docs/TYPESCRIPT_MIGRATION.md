# TypeScript Migration Plan

## 🎯 Migration Strategy

### Phase 1: Infrastructure Setup ✅
- [x] Install TypeScript and type definitions
- [x] Create tsconfig.json with strict configuration
- [x] Configure path aliases for better imports
- [x] Setup ESLint TypeScript rules

### Phase 2: Core Services Migration (Priority: HIGH)
- [ ] `src/core/storage/index.js` → `index.ts`
- [ ] `src/core/logger/index.js` → `index.ts`
- [ ] `src/core/environment/environmentService.js` → `environmentService.ts`
- [ ] `src/utils/dataValidator.js` → `dataValidator.ts`
- [ ] `src/utils/formatters.js` → `formatters.ts`

### Phase 3: Services Migration (Priority: HIGH)
- [ ] `src/services/authService.js` → `authService.ts`
- [ ] `src/services/productService.js` → `productService.ts`
- [ ] `src/services/orderService.js` → `orderService.ts`
- [ ] `src/services/customerService.js` → `customerService.ts`
- [ ] `src/services/autoTaskProgressionService.js` → `autoTaskProgressionService.ts`

### Phase 4: Context & Hooks Migration (Priority: MEDIUM)
- [ ] `src/contexts/AuthContext.jsx` → `AuthContext.tsx`
- [ ] `src/contexts/CartContext.jsx` → `CartContext.tsx`
- [ ] `src/hooks/useLocalStorage.js` → `useLocalStorage.ts`
- [ ] `src/hooks/useAuth.js` → `useAuth.ts`

### Phase 5: Components Migration (Priority: MEDIUM)
- [ ] Start with shared components in `src/components/shared/`
- [ ] Migrate admin components in `src/components/admin/`
- [ ] Migrate customer components in `src/components/customer/`

### Phase 6: Pages Migration (Priority: LOW)
- [ ] Admin pages: `src/pages/admin/`
- [ ] Customer pages: `src/pages/customer/`
- [ ] Landing page: `src/pages/LandingPage.jsx`

## 🔧 Migration Guidelines

### 1. File Naming Convention
```
.js  → .ts  (for utility files, services)
.jsx → .tsx (for React components)
```

### 2. Import Path Updates
```typescript
// Before
import storage from '../core/storage/index.js';

// After
import storage from '@/core/storage';
```

### 3. Type Definitions Priority

#### Core Types (Create first)
```typescript
// src/types/index.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  active: boolean;
  description?: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}
```

### 4. Service Type Safety
```typescript
// Example: authService.ts
import type { User } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Implementation
  },
  
  getCurrentUser(): User | null {
    // Implementation
  }
};
```

### 5. React Component Migration
```typescript
// Before: Component.jsx
import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  );
};

// After: Component.tsx
import React from 'react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  );
};
```

## 🚀 Migration Commands

### Install TypeScript Dependencies
```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Type Check
```bash
npx tsc --noEmit
```

### Build with TypeScript
```bash
npm run build
```

## 📋 Migration Checklist

### For Each File Migration:
- [ ] Rename file extension (.js → .ts, .jsx → .tsx)
- [ ] Add proper type imports
- [ ] Define interfaces for props/parameters
- [ ] Add return type annotations
- [ ] Update import paths to use aliases
- [ ] Fix any TypeScript errors
- [ ] Update tests if needed
- [ ] Verify build passes

### Quality Gates:
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No runtime errors in development

## 🎯 Success Metrics

- **Type Coverage**: Aim for 90%+ type coverage
- **Build Performance**: No significant build time increase
- **Developer Experience**: Better IntelliSense and error catching
- **Code Quality**: Reduced runtime errors

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)

---

**Note**: This migration should be done incrementally. Start with core services and work your way up to components. Each phase should be completed and tested before moving to the next.