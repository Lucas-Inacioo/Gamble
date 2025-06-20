import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BalanceProvider } from './contexts/BalanceContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BalanceProvider>
      <App />
    </BalanceProvider>
  </React.StrictMode>
);

reportWebVitals();
