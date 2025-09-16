import { test, expect } from '@playwright/test';

test('메인 페이지가 로드되는지 확인', async ({ page }) => {
  await page.goto('/');
  
  // 제목이 있는지 확인
  await expect(page.locator('h1')).toContainText('도서관리 시스템');
  
  // 버튼이 있는지 확인
  await expect(page.locator('button')).toContainText('테스트 버튼');
});

test('버튼 클릭이 동작하는지 확인', async ({ page }) => {
  await page.goto('/');
  
  // 버튼 클릭
  await page.click('button');
  
  // 클릭 후에도 페이지가 정상인지 확인
  await expect(page.locator('h1')).toBeVisible();
});