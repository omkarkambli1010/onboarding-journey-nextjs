'use client';

import { PrimeReactProvider } from 'primereact/api';
import { ToastContainer } from 'react-toastify';
import { SpinnerProvider } from '@/components/spinner/Spinner';

// App-level providers — equivalent to Angular AppModule imports
// Wraps the app in PrimeReact, Spinner, and toast notification contexts

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <SpinnerProvider>
        {children}
        <ToastContainer
          position="bottom-center"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </SpinnerProvider>
    </PrimeReactProvider>
  );
}
