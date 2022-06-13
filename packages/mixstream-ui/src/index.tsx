import { ipcRenderer } from 'electron';
import React from 'react';
import 'react-contexify/dist/ReactContexify.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import Language from './components/Language';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { closeHandle, disableDevTools, isProd } from './utils';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Language>
      <App />
    </Language>
  </React.StrictMode>
);

ipcRenderer.on('process_close', closeHandle);

reportWebVitals();

if (isProd) {
  disableDevTools();
}
