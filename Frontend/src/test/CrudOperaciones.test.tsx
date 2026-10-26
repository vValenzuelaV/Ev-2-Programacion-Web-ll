import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormularioInstrumentoPage } from '../pages/FormularioInstrumentoPage';
import { servicioInstrumentos } from '../api/instrumentos.service';
import { servicioCategorias } from '../api/categorias.service';
import { servicioMarcas } from '../api/marcas.service';
import * as AuthContextModule from '../context/AuthContext';

describe('Operaciones CRUD - Creación de Instrumento con API Simulada', () => {
  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: { id: 1, nombre: 'Admin Demo', correo: 'admin@tienda.com', rol: 'administrador' },
      esAutenticado: true,
      cargando: false,
      error: null,
      tieneRol: () => true,
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
      limpiarError: vi.fn(),
    });

    vi.spyOn(servicioCategorias, 'listar').mockResolvedValue([
      { id: 1, nombre: 'Guitarras y Cuerdas', slug: 'cuerdas', icono: 'guitarra', created_at: '' },
    ]);

    vi.spyOn(servicioMarcas, 'listar').mockResolvedValue([
      { id: 1, nombre: 'Fender', pais: 'EE.UU.', created_at: '' },
    ]);
  });

  it('muestra errores de validación si se intenta enviar el formulario vacío', async () => {
    render(
      <MemoryRouter>
        <FormularioInstrumentoPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Registrar Nuevo Instrumento')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Crear Instrumento/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/El nombre del instrumento es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/Selecciona una categoría válida/i)).toBeInTheDocument();
    });
  });

  it('envía los datos estructurados a la API al completar los campos requeridos', async () => {
    const crearSpy = vi.spyOn(servicioInstrumentos, 'crear').mockResolvedValue({
      id: 99,
      nombre: 'Bajo Jazz Bass Custom',
      codigo_sku: 'FEN-JBASS-01',
      precio: 1299990,
      stock: 3,
      categoria_id: 1,
      marca_id: 1,
      condicion: 'nuevo',
      activo: true,
      created_at: '',
      updated_at: '',
    } as any);

    render(
      <MemoryRouter>
        <FormularioInstrumentoPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre del Instrumento/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Nombre del Instrumento/i), {
      target: { value: 'Bajo Jazz Bass Custom' },
    });
    fireEvent.change(screen.getByLabelText(/Categoría/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Marca Fabricante/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Precio \(CLP\)/i), {
      target: { value: '1299990' },
    });
    fireEvent.change(screen.getByLabelText(/Stock Inicial en Almacén/i), {
      target: { value: '3' },
    });

    const submitBtn = screen.getByRole('button', { name: /Crear Instrumento/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(crearSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Bajo Jazz Bass Custom',
          precio: 1299990,
          stock: 3,
        })
      );
    });
  });
});
