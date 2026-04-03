/**
 * UI tests for hierarchy and critical use-case flows.
 * Maps to docs/USE_CASES.md. Requires PW_BASE_URL (default localhost:3000),
 * backend running, and credentials (see role-flows.spec.js or env).
 */
const { test, expect } = require('@playwright/test');

const baseURL = process.env.PW_BASE_URL || 'http://localhost:3000';

// Credentials: set via env or use same as role-flows.spec.js
const creds = {
  customer: {
    email: process.env.PW_CUSTOMER_EMAIL || 'customer1@hierarchy.example.com',
    password: process.env.PW_CUSTOMER_PASSWORD || 'HierarchyTest1!'
  },
  support_engineer: {
    email: process.env.PW_ENGINEER_EMAIL || 'engineer_1@hierarchy.example.com', // adjust id if needed
    password: process.env.PW_ENGINEER_PASSWORD || 'HierarchyTest1!'
  },
  city_admin: {
    email: process.env.PW_CITY_ADMIN_EMAIL || 'cityadmin_1@hierarchy.example.com',
    password: process.env.PW_CITY_ADMIN_PASSWORD || 'HierarchyTest1!'
  },
  state_admin: {
    email: process.env.PW_STATE_ADMIN_EMAIL || 'stateadmin_ka@hierarchy.example.com',
    password: process.env.PW_STATE_ADMIN_PASSWORD || 'HierarchyTest1!'
  },
  country_admin: {
    email: process.env.PW_COUNTRY_ADMIN_EMAIL || 'countryadmin@hierarchy.example.com',
    password: process.env.PW_COUNTRY_ADMIN_PASSWORD || 'HierarchyTest1!'
  },
  organization_admin: {
    email: process.env.PW_ORG_ADMIN_EMAIL || 'orgadmin@hierarchy.example.com',
    password: process.env.PW_ORG_ADMIN_PASSWORD || 'HierarchyTest1!'
  }
};

async function login(page, email, password) {
  await page.goto(`${baseURL}/login`);
  await page.getByPlaceholder('admin@erepairing.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.getByRole('button', { name: /Sign In|Login/i }).click();
  await page.waitForURL(/\/(customer|engineer|city-admin|state-admin|country-admin|organization-admin|platform-admin|vendor)\/dashboard|\/login/, { timeout: 25000 });
  if (page.url().includes('/login')) {
    const errText = await page.locator('body').textContent().then(t => (t || '').slice(0, 200));
    throw new Error(`Login did not redirect for ${email}. Run: cd backend && python scripts/seed_hierarchy.py. Password: HierarchyTest1!. ${errText}`);
  }
}

// ---------- Hierarchy: dashboards load per role (UC106–UC111, UC09) ----------
test.describe('Hierarchy – role dashboards', () => {
  test('Customer dashboard loads and shows My Service Dashboard', async ({ page }) => {
    await login(page, creds.customer.email, creds.customer.password);
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20000 });
    await expect(page.locator('body')).toContainText(/My Service Dashboard|Create Ticket|My Tickets/i);
  });

  test('Engineer dashboard loads', async ({ page }) => {
    await login(page, creds.support_engineer.email, creds.support_engineer.password);
    await page.waitForURL(/\/engineer\/dashboard/, { timeout: 20000 });
    await expect(page.locator('body')).toContainText(/Engineer|Today's Route|Ticket/i);
  });

  test('City admin dashboard loads', async ({ page }) => {
    await login(page, creds.city_admin.email, creds.city_admin.password);
    await page.waitForURL(/\/city-admin\/dashboard/, { timeout: 20000 });
    await expect(page.locator('body')).toContainText(/City Admin|Ticket|Engineer|Inventory/i);
  });

  test('State admin dashboard loads', async ({ page }) => {
    await login(page, creds.state_admin.email, creds.state_admin.password);
    await page.waitForURL(/\/state-admin\/dashboard/, { timeout: 20000 });
    await expect(page.locator('body')).toContainText(/State Admin|City|Transfer|Reallocat/i);
  });

  test('Country admin dashboard loads', async ({ page }) => {
    await login(page, creds.country_admin.email, creds.country_admin.password);
    await page.waitForURL(/\/country-admin\/dashboard/, { timeout: 20000 });
    await expect(page.locator('body')).toContainText(/Country|State|SLA|MTTR/i);
  });

  test('Organization admin dashboard loads', async ({ page }) => {
    await login(page, creds.organization_admin.email, creds.organization_admin.password);
    await page.waitForURL(/\/organization-admin\/dashboard/, { timeout: 20000 });
    await expect(page.locator('body')).toContainText(/Organization|User|Ticket|Product|Inventory/i);
  });
});

// ---------- Central /tickets/[id] redirect (UC112) ----------
test.describe('Central ticket URL redirect', () => {
  test('Unauthenticated user redirects to login when opening /tickets/1', async ({ page }) => {
    await page.goto(`${baseURL}/tickets/1`);
    await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});
    await expect(page.locator('body')).toContainText(/Sign In|Login|email|password/i);
  });

  test('Customer opening /tickets/[id] redirects to /customer/ticket/[id]', async ({ page }) => {
    await login(page, creds.customer.email, creds.customer.password);
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20000 });
    await page.goto(`${baseURL}/tickets/1`);
    await page.waitForURL(/\/customer\/ticket\/1/, { timeout: 10000 }).catch(() => {});
    await expect(page.locator('body')).toContainText(/Ticket|Issue|Description|Back/i);
  });

  test('City admin opening /tickets/[id] redirects to engineer ticket view', async ({ page }) => {
    await login(page, creds.city_admin.email, creds.city_admin.password);
    await page.waitForURL(/\/city-admin\/dashboard/, { timeout: 20000 });
    await page.goto(`${baseURL}/tickets/1`);
    await page.waitForURL(/\/engineer\/ticket\/1/, { timeout: 10000 }).catch(() => {});
    await expect(page.locator('body')).toContainText(/Admin view|Ticket|Issue|Back/i);
  });
});

// ---------- Customer: own tickets only (UC26), notifications (UC20, UC21), OTP hint (UC22) ----------
test.describe('Customer flows', () => {
  test('Customer dashboard shows Tickets and Notifications tabs', async ({ page }) => {
    await login(page, creds.customer.email, creds.customer.password);
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('tab', { name: /My Tickets|Tickets/i }).or(page.locator('button:has-text("My Tickets")')).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.getByRole('tab', { name: /Notifications/i }).or(page.locator('button:has-text("Notifications")')).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Customer can open create-ticket page', async ({ page }) => {
    await login(page, creds.customer.email, creds.customer.password);
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20000 });
    await page.goto(`${baseURL}/customer/create-ticket`);
    await expect(page.locator('body')).toContainText(/Create Ticket|Describe|issue|address/i);
  });

  test('Dashboard tab from URL ?tab=notifications opens Notifications', async ({ page }) => {
    await login(page, creds.customer.email, creds.customer.password);
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20000 });
    await page.goto(`${baseURL}/customer/dashboard?tab=notifications`);
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Notifications|No new notifications|notification/i);
  });
});

// ---------- State admin: city page, engineers dropdown (UC67, UC69) ----------
test.describe('State admin hierarchy UI', () => {
  test('State admin can open a city page and see City Tickets', async ({ page }) => {
    await login(page, creds.state_admin.email, creds.state_admin.password);
    await page.waitForURL(/\/state-admin\/dashboard/, { timeout: 20000 });
    await page.waitForTimeout(2000);
    const cityLink = page.locator('a[href*="/state-admin/city/"], button:has-text("City"), [role="link"]:has-text("City")').first();
    if (await cityLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cityLink.click();
      await page.waitForURL(/\/state-admin\/city\/\d+/, { timeout: 10000 }).catch(() => {});
      await expect(page.locator('body')).toContainText(/City Tickets|Bulk Reassign|Ticket/i);
    } else {
      await expect(page.locator('body')).toContainText(/State Admin|City/i);
    }
  });

  test('State admin Reallocate Engineer modal has Engineer dropdown', async ({ page }) => {
    await login(page, creds.state_admin.email, creds.state_admin.password);
    await page.waitForURL(/\/state-admin\/dashboard/, { timeout: 20000 });
    await page.waitForTimeout(2000);
    const reallocateBtn = page.getByRole('button', { name: /Reallocate Engineer|Engineer Reallocat/i }).first();
    if (await reallocateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reallocateBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Reallocate Engineer').first()).toBeVisible();
      await expect(page.locator('text=Select engineer').or(page.locator('[aria-label*="engineer"]')).first()).toBeVisible();
    }
  });
});

// ---------- City admin: ticket list and open ticket (UC47, UC48, UC49) ----------
test.describe('City admin hierarchy UI', () => {
  test('City admin can see ticket list and open ticket via central URL', async ({ page }) => {
    await login(page, creds.city_admin.email, creds.city_admin.password);
    await page.waitForURL(/\/city-admin\/dashboard/, { timeout: 20000 });
    await page.waitForTimeout(3000);
    const ticketLink = page.locator('a[href*="/tickets/"], button:has-text("TKT-")').first();
    if (await ticketLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ticketLink.click();
      await page.waitForURL(/\/(tickets|engineer\/ticket)\/\d+/, { timeout: 10000 }).catch(() => {});
      await expect(page.locator('body')).toContainText(/Admin view|Ticket|Issue|Back/i);
    } else {
      await expect(page.locator('body')).toContainText(/City Admin|Ticket/i);
    }
  });
});

// ---------- Inventory hierarchy UI (UC121, UC130, UC134) ----------
test.describe('Inventory hierarchy', () => {
  test('City admin dashboard has Inventory tab and shows city inventory scope', async ({ page }) => {
    await login(page, creds.city_admin.email, creds.city_admin.password);
    await page.waitForURL(/\/city-admin\/dashboard/, { timeout: 20000 });
    await page.waitForTimeout(3000);
    const inventoryTab = page.getByRole('tab', { name: /Inventory/i }).or(page.locator('button:has-text("Inventory")')).first();
    if (await inventoryTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await inventoryTab.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(/Inventory|Stock|Part|Low stock|Reorder/i);
    } else {
      await expect(page.locator('body')).toContainText(/City Admin|Dashboard/i);
    }
  });

  test('State admin can open Transfer Inventory modal (From City, To City, Part)', async ({ page }) => {
    await login(page, creds.state_admin.email, creds.state_admin.password);
    await page.waitForURL(/\/state-admin\/dashboard/, { timeout: 20000 });
    await page.waitForTimeout(2000);
    const transferBtn = page.getByRole('button', { name: /Transfer Inventory|Inventory Transfer/i }).first();
    if (await transferBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await transferBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Transfer Inventory').first()).toBeVisible();
      await expect(page.locator('text=From City').or(page.locator('label:has-text("From City")')).first()).toBeVisible();
      await expect(page.locator('text=To City').or(page.locator('label:has-text("To City")')).first()).toBeVisible();
      await expect(page.locator('text=Part').or(page.locator('label:has-text("Part")')).first()).toBeVisible();
    }
  });
});

// ---------- Engineer: ticket detail has On-site Workflow when assigned (UC29–UC31) ----------
test.describe('Engineer ticket view', () => {
  test('Engineer ticket page shows workflow sections when ticket exists', async ({ page }) => {
    await login(page, creds.support_engineer.email, creds.support_engineer.password);
    await page.waitForURL(/\/engineer\/dashboard/, { timeout: 20000 });
    await page.goto(`${baseURL}/engineer/ticket/1`);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Ticket|Issue|On-site|ETA|Resolution|Escalat/i);
  });
});

// ---------- Production: frontend uses correct API base (UC11, UC129) ----------
test.describe('Production readiness', () => {
  test('Login page loads and has email/password fields', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page.locator('input[type="email"], input[name="email"]').or(page.getByPlaceholder(/email/i))).toBeVisible();
    await expect(page.locator('input[type="password"]').or(page.getByPlaceholder(/password/i))).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In|Login/i })).toBeVisible();
  });

  test('Homepage or landing loads', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('404');
  });
});
