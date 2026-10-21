import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { RutaProtegida } from './components/RutaProtegida.js';

import { CatalogoPage } from './pages/CatalogoPage.js';
import { DetalleInstrumentoPage } from './pages/DetalleInstrumentoPage.js';
import { IniciarSesionPage } from './pages/IniciarSesionPage.js';
import { RegistroPage } from './pages/RegistroPage.js';
import { AdminInstrumentosPage } from './pages/AdminInstrumentosPage.js';
import { FormularioInstrumentoPage } from './pages/FormularioInstrumentoPage.js';
import { MisPedidosPage } from './pages/MisPedidosPage.js';
import { AccesoDenegadoPage } from './pages/AccesoDenegadoPage.js';
import { NoEncontradoPage } from './pages/NoEncontradoPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {}
        <a href="#contenido-principal" className="enlace-saltar">
          Saltar directamente al contenido principal
        </a>

        {}
        <Navbar />

        {}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {}
            <Route path="/" element={<CatalogoPage />} />
            <Route path="/instrumento/:id" element={<DetalleInstrumentoPage />} />
            <Route path="/iniciar-sesion" element={<IniciarSesionPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/acceso-denegado" element={<AccesoDenegadoPage />} />

            {}
            <Route
              path="/mis-pedidos"
              element={
                <RutaProtegida>
                  <MisPedidosPage />
                </RutaProtegida>
              }
            />

            {}
            <Route
              path="/admin/instrumentos"
              element={
                <RutaProtegida rolesPermitidos={['administrador', 'vendedor']}>
                  <AdminInstrumentosPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/instrumentos/nuevo"
              element={
                <RutaProtegida rolesPermitidos={['administrador', 'vendedor']}>
                  <FormularioInstrumentoPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/instrumentos/:id/editar"
              element={
                <RutaProtegida rolesPermitidos={['administrador', 'vendedor']}>
                  <FormularioInstrumentoPage />
                </RutaProtegida>
              }
            />

            {}
            <Route path="*" element={<NoEncontradoPage />} />
          </Routes>
        </div>

        {}
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
