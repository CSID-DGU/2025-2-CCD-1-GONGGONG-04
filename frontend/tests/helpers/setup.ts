/**
 * Test Setup and Utility Functions
 * E2E 테스트 설정 및 유틸리티 함수
 */

import { Page, expect } from '@playwright/test';

/**
 * 페이지 로드 대기
 * @param page - Playwright Page 객체
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 센터 상세 페이지로 이동
 * @param page - Playwright Page 객체
 * @param centerId - 센터 ID
 */
export async function navigateToCenterDetail(page: Page, centerId: number) {
  await page.goto(`/centers/${centerId}`);
  await waitForPageLoad(page);
}

/**
 * 클립보드 권한 허용
 * @param page - Playwright Page 객체
 */
export async function grantClipboardPermissions(page: Page) {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
}

/**
 * 지리적 위치 권한 허용
 * @param page - Playwright Page 객체
 * @param latitude - 위도
 * @param longitude - 경도
 */
export async function grantGeolocationPermissions(
  page: Page,
  latitude: number,
  longitude: number
) {
  await page.context().setGeolocation({ latitude, longitude });
  await page.context().grantPermissions(['geolocation']);
}

/**
 * 요소의 크기 확인 (접근성)
 * @param page - Playwright Page 객체
 * @param selector - CSS 선택자
 * @param minWidth - 최소 너비
 * @param minHeight - 최소 높이
 */
export async function expectMinimumSize(
  page: Page,
  selector: string,
  minWidth: number,
  minHeight: number
) {
  const element = page.locator(selector);
  const box = await element.boundingBox();

  expect(box?.width).toBeGreaterThanOrEqual(minWidth);
  expect(box?.height).toBeGreaterThanOrEqual(minHeight);
}

/**
 * 포커스 가능 여부 확인
 * @param page - Playwright Page 객체
 * @param selector - CSS 선택자
 */
export async function expectFocusable(page: Page, selector: string) {
  const element = page.locator(selector);

  // 요소에 포커스
  await element.focus();

  // 포커스된 요소 확인
  const focused = page.locator(':focus');
  await expect(focused).toHaveCount(1);

  // 선택자와 일치하는지 확인
  const isFocused = await element.evaluate(
    (el, focusedEl) => el === focusedEl,
    await focused.elementHandle()
  );
  expect(isFocused).toBe(true);
}

/**
 * ARIA 속성 확인
 * @param page - Playwright Page 객체
 * @param selector - CSS 선택자
 * @param attribute - ARIA 속성 이름
 * @param expectedValue - 예상 값 (선택)
 */
export async function expectAriaAttribute(
  page: Page,
  selector: string,
  attribute: string,
  expectedValue?: string
) {
  const element = page.locator(selector);

  if (expectedValue !== undefined) {
    await expect(element).toHaveAttribute(attribute, expectedValue);
  } else {
    await expect(element).toHaveAttribute(attribute);
  }
}

/**
 * 새 탭/창 열림 대기
 * @param page - Playwright Page 객체
 * @param action - 새 탭을 여는 동작
 * @returns 새 페이지 객체
 */
export async function waitForNewTab(page: Page, action: () => Promise<void>) {
  const pagePromise = page.context().waitForEvent('page');
  await action();
  const newPage = await pagePromise;
  await newPage.waitForLoadState();
  return newPage;
}

/**
 * 토스트 메시지 확인
 * @param page - Playwright Page 객체
 * @param message - 예상 메시지
 */
export async function expectToastMessage(page: Page, message: string) {
  const toast = page.getByText(message);
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * 전화 링크 확인
 * @param page - Playwright Page 객체
 * @param phoneNumber - 전화번호 (하이픈 포함)
 */
export async function expectPhoneLink(page: Page, phoneNumber: string) {
  // 하이픈 제거한 전화번호
  const cleanPhone = phoneNumber.replace(/-/g, '');

  // tel: 링크 확인
  const phoneLink = page.locator(`a[href="tel:${cleanPhone}"]`);
  await expect(phoneLink).toBeVisible();

  // 표시되는 전화번호 확인
  await expect(phoneLink).toHaveText(phoneNumber);
}

/**
 * 카카오맵 링크 확인
 * @param page - Playwright Page 객체
 * @param address - 주소
 * @param latitude - 위도
 * @param longitude - 경도
 */
export async function expectKakaoMapLink(
  page: Page,
  address: string,
  latitude: number,
  longitude: number
) {
  // 새 탭 열림 대기
  const newPage = await waitForNewTab(page, async () => {
    await page.getByRole('button', { name: /길찾기/ }).click();
  });

  // 카카오맵 URL 확인
  expect(newPage.url()).toContain('kakao.com/link/to');
  expect(newPage.url()).toContain(encodeURIComponent(address));

  // 새 탭 닫기
  await newPage.close();
}

/**
 * 반응형 뷰포트 설정
 * @param page - Playwright Page 객체
 * @param width - 너비
 * @param height - 높이
 */
export async function setViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
}

/**
 * 키보드로 요소 선택
 * @param page - Playwright Page 객체
 * @param tabCount - Tab 키 누르는 횟수
 * @param key - 활성화 키 (Enter 또는 Space)
 */
export async function selectByKeyboard(
  page: Page,
  tabCount: number,
  key: 'Enter' | 'Space' = 'Enter'
) {
  // Tab 키로 포커스 이동
  for (let i = 0; i < tabCount; i++) {
    await page.keyboard.press('Tab');
  }

  // Enter 또는 Space로 활성화
  await page.keyboard.press(key);
}

/**
 * API 응답 모킹
 * @param page - Playwright Page 객체
 * @param url - API URL 패턴
 * @param response - 모킹할 응답 데이터
 * @param status - HTTP 상태 코드 (기본 200)
 */
export async function mockApiResponse(
  page: Page,
  url: string | RegExp,
  response: any,
  status: number = 200
) {
  await page.route(url, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * 네트워크 오프라인 시뮬레이션
 * @param page - Playwright Page 객체
 */
export async function simulateOffline(page: Page) {
  await page.context().setOffline(true);
}

/**
 * 네트워크 온라인 복구
 * @param page - Playwright Page 객체
 */
export async function simulateOnline(page: Page) {
  await page.context().setOffline(false);
}
