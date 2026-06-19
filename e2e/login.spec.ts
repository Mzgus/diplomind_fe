import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
    test('should display the login form', async ({ page }) => {
        await page.goto('/login');

        // Vérifie que les champs sont présents
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel(/email/i).fill('wrong@email.com');
        await page.getByLabel(/mot de passe/i).fill('wrongpassword');
        await page.getByRole('button', { name: /se connecter/i }).click();

        // Vérifie qu'un message d'erreur apparaît
        await expect(page.getByText(/erreur|invalide/i)).toBeVisible();
    });

    test('should redirect to dashboard on successful login', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel(/email/i).fill('sophie.martin@diplomind.fr');
        await page.getByLabel(/mot de passe/i).fill('Password123');
        await page.getByRole('button', { name: /se connecter/i }).click();

        // Vérifie la redirection
        await expect(page).toHaveURL('/');
    });
});
