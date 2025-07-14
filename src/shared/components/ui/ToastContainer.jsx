import React, { useState, useEffect } from 'react';
import Toast from './Toast';

/* global window, CustomEvent */

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type, duration } = event.detail;
      const id = Date.now() + Math.random();
      
      setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    // Global showToast function
    window.showToast = (message, type = 'info', duration = 3000) => {
      const event = new CustomEvent('showToast', {
        detail: { message, type, duration }
      });
      window.dispatchEvent(event);
    };

    window.addEventListener('showToast', handleToast);
    return () => {
      window.removeEventListener('showToast', handleToast);
      delete window.showToast;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-0 right-0 z-[250] space-y-2 p-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
