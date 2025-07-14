import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
    it('renders without crashing', () => {
        expect(() => render(<App />)).not.toThrow();
    });
});
