import React from 'react';
import ReactDOM from 'react-dom/client';
import "bootstrap/dist/css/bootstrap.css"
import App from './App';
import { Provider } from 'react-redux';
import store from "./App/store";
import './index.css'
import { HelmetProvider } from 'react-helmet-async'; 


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
      <App />
      </HelmetProvider>

    </Provider>
   
  </React.StrictMode>,
)
