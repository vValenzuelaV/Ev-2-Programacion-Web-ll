import { test, expect } from '@playwright/test';

test.describe('Flujo End-to-End: Autenticación y Operación CRUD', () => {
  test('Flujo completo: Iniciar sesión, Crear nuevo instrumento y Verificar en el listado', async ({ page }) => {
    // 1. Visitar pantalla de inicio de sesión
    await page.goto('/iniciar-sesion');
    await expect(page).toHaveTitle(/Harmonía/i);

    // 2. Ingresar credenciales del Administrador
    await page.fill('#correo-usuario', 'admin@tienda.com');
    await page.fill('#clave-usuario', 'Admin123!');
    await page.click('button[type="submit"]');

    // 3. Verificar que redirige a inicio y la sesión está activa (aparece botón de gestión)
    await page.waitForURL('**/');
    const adminLink = page.locator('a[href="/admin/instrumentos"]').first();
    await expect(adminLink).toBeVisible();

    // 4. Navegar a creación de instrumento
    await page.goto('/admin/instrumentos/nuevo');
    await expect(page.locator('h1')).toContainText('Registrar Nuevo Instrumento');

    // 5. Completar formulario con datos del nuevo instrumento
    const nombreInstrumento = `Bajo Eléctrico Pro E2E - ${Date.now()}`;

    await page.fill('#campo-nombre', nombreInstrumento);
    await page.selectOption('#campo-categoria', { index: 1 });
    await page.selectOption('#campo-marca', { index: 1 });
    await page.fill('#campo-precio', '649990');
    await page.fill('#campo-stock', '4');
    await page.fill('#campo-descripcion', 'Instrumento de prueba automatizada End-to-End generado por Playwright.');

    // 6. Guardar el nuevo instrumento
    await page.click('button[type="submit"]');

    // 7. Verificar redirección automática al inventario de administración
    await page.waitForURL('**/admin/instrumentos');
    await expect(page.locator('h1')).toContainText('Gestión de Inventario');

    // 8. Verificar que el nuevo instrumento recién creado está listado en la tabla
    const filaInstrumento = page.locator(`text=${nombreInstrumento}`);
    await expect(filaInstrumento).toBeVisible();
  });
});
