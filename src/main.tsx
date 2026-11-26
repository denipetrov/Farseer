import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './api/queryClient';
import { router } from './router';
import { PreferencesProvider } from './preferences/PreferencesProvider';
// Site-wide CSS, in order: tokens (custom properties), global rules, game colours, icon sizing
import './styles/tokens.css';
import './styles/global.css';
import './styles/gameColors.css';
import './styles/iconOptics.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </PreferencesProvider>
  </StrictMode>,
);
