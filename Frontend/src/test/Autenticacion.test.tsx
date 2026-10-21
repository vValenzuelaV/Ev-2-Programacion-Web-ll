import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IniciarSesionPage } from '../pages/IniciarSesionPage.js';
import { AuthProvider } from '../context/AuthContext.js';

describe('Pruebas del Módulo de Autenticación en Frontend', () => {
  it('Debe renderizar los campos accesibles de inicio de sesión', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <IniciarSesionPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar a la Tienda/i })).toBeInTheDocument();
  });

  it('Debe mostrar error de validación cuando los campos obligatorios están vacíos', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <IniciarSesionPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const botonSubmit = screen.getByRole('button', { name: /Entrar a la Tienda/i });
    fireEvent.click(botonSubmit);

    expect(screen.getByText(/El correo electrónico es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/La contraseña es requerida/i)).toBeInTheDocument();
  });

  it('Debe permitir escribir en los campos de entrada de credenciales', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <IniciarSesionPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const inputCorreo = screen.getByLabelText(/Correo Electrónico/i) as HTMLInputElement;
    const inputClave = screen.getByLabelText(/Contraseña/i) as HTMLInputElement;

    fireEvent.change(inputCorreo, { target: { value: 'usuario@tienda.com' } });
    fireEvent.change(inputClave, { target: { value: 'SecretPassword99#' } });

    expect(inputCorreo.value).toBe('usuario@tienda.com');
    expect(inputClave.value).toBe('SecretPassword99#');
  });
});
