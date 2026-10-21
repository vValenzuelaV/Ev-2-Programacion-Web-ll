import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-superficie)', borderTop: '1px solid var(--borde-suave)', marginTop: 'auto', padding: '3rem 0 2rem 0' }}>
      <div className="contenedor">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          {}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--texto-titulos)' }}>
                HARMONÍA
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--texto-secundario)', lineHeight: 1.6 }}>
              Tienda especializada en guitarras, teclados, vientos, percusión y audio profesional de las mejores marcas del mundo.
            </p>
          </div>

          {}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck size={20} color="var(--color-exito)" aria-hidden="true" />
              <h2 style={{ fontSize: '1rem', color: 'var(--texto-titulos)', margin: 0 }}>
                Seguridad & Accesibilidad
              </h2>
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: 'var(--texto-secundario)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>✓ Cumplimiento WCAG 2.2 Nivel AA</li>
              <li>✓ Autenticación Robusta con JWT</li>
              <li>✓ Control de Acceso por Roles (RBAC)</li>
              <li>✓ Mitigación OWASP API Security Top 10</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--borde-suave)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--texto-atenuado)' }}>
          <p>© 2026 Harmonía Music Store. Todos los derechos reservados.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            Desarrollado con React 19, TypeScript y Vite
          </p>
        </div>
      </div>
    </footer>
  );
};
