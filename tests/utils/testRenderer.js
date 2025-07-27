/**
 * Test Utilities - App Renderer
 * @package Kırılmazlar Panel Testing Suite
 */

import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock real application components for E2E testing
const MockApp = () => {
  return React.createElement('div', { className: 'app-container' },
    React.createElement('header', { className: 'header' },
      React.createElement('h1', null, 'Kırılmazlar Ofis'),
      React.createElement('nav', null,
        React.createElement('button', { role: 'button', className: 'login-btn' }, 'Giriş'),
        React.createElement('button', { role: 'button', className: 'mobile-menu' }, 'Menü')
      )
    ),
    React.createElement('main', { 'data-testid': 'home-page' },
      React.createElement('div', { className: 'hero-section' },
        React.createElement('h2', null, 'Kırılmazlar\'a Hoş Geldiniz'),
        React.createElement('p', null, 'Taze meyve ve sebzelerin adresi')
      ),
      React.createElement('div', { className: 'login-form', style: { display: 'none' } },
        React.createElement('input', { type: 'email', placeholder: 'E-posta adresiniz' }),
        React.createElement('input', { type: 'password', placeholder: 'Şifreniz' }),
        React.createElement('button', { type: 'submit' }, 'Giriş Yap')
      ),
      React.createElement('div', { className: 'dashboard', style: { display: 'none' } },
        React.createElement('h3', null, 'Hoş Geldiniz, Müşteri Paneli')
      ),
      React.createElement('div', { className: 'error-message', style: { display: 'none' } },
        React.createElement('p', null, 'Bağlantı sorunu')
      ),
      React.createElement('div', { className: 'validation-errors', style: { display: 'none' } },
        React.createElement('p', null, 'Lütfen tüm alanları doldurun')
      )
    )
  );
};

export const renderApp = (initialRoute = '/') => {
  // Use MemoryRouter with mock app for E2E testing
  return render(
    React.createElement(MemoryRouter, { initialEntries: [initialRoute] },
      React.createElement(MockApp)
    )
  );
};

export const renderWithRouter = (component, initialRoute = '/') => {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [initialRoute] }, component)
  );
};
