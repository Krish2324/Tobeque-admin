import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              <AppRoutes />
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
