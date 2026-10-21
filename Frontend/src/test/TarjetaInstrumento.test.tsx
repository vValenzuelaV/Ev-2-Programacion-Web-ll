import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TarjetaInstrumento } from '../components/TarjetaInstrumento.js';
import { Instrumento } from '../types/index.js';

const instrumentoPrueba: Instrumento = {
  id: 1,
  nombre: 'Fender American Professional II Stratocaster',
  codigo_sku: 'FEN-STRAT-001',
  categoria_id: 1,
  marca_id: 1,
  precio: 1799.99,
  stock: 8,
  condicion: 'nuevo',
  descripcion: 'Guitarra eléctrica profesional de alta gama con pastillas V-Mod II.',
  imagen_url: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f',
  esta_activo: 1,
  categoria: { id: 1, nombre: 'Cuerdas', slug: 'cuerdas' },
  marca: { id: 1, nombre: 'Fender', pais_origen: 'USA' },
};

describe('Pruebas del Componente TarjetaInstrumento', () => {
  it('Debe renderizar la información comercial, marca, categoría y precio', () => {
    render(
      <BrowserRouter>
        <TarjetaInstrumento instrumento={instrumentoPrueba} />
      </BrowserRouter>
    );

    expect(screen.getByText('Fender American Professional II Stratocaster')).toBeInTheDocument();
    expect(screen.getByText('Fender')).toBeInTheDocument();
    expect(screen.getByText('Cuerdas')).toBeInTheDocument();
    expect(screen.getByText('8 en stock')).toBeInTheDocument();
    expect(screen.getByText(/\$1\.800|1800/i)).toBeInTheDocument();
  });

  it('Debe mostrar badge de Agotado cuando el stock es 0', () => {
    const instrumentoAgotado: Instrumento = {
      ...instrumentoPrueba,
      stock: 0,
    };

    render(
      <BrowserRouter>
        <TarjetaInstrumento instrumento={instrumentoAgotado} />
      </BrowserRouter>
    );

    expect(screen.getByText('Agotado')).toBeInTheDocument();
  });
});
