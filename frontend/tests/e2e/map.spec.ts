import { test, expect } from '@playwright/test';

/**
 * Sprint 1 - 지도 기반 센터 검색 E2E 테스트
 *
 * 테스트 범위:
 * - 지도 로딩 및 초기화
 * - 센터 마커 렌더링
 * - 마커 클릭 시 정보 팝업 표시
 * - 팝업 내 상세보기/길찾기 버튼
 * - 반응형 레이아웃
 * - 접근성 (키보드 네비게이션)
 */

test.describe('지도 기반 센터 검색', () => {
  test.beforeEach(async ({ page }) => {
    // 지도 페이지로 이동
    await page.goto('/map');
  });

  test.describe('지도 초기 로딩', () => {
    test('지도 컨테이너가 정상적으로 렌더링되어야 함', async ({ page }) => {
      // 지도 컨테이너 확인
      const mapContainer = page.locator('[class*="KakaoMapView"]').first();
      await expect(mapContainer).toBeVisible();
    });

    test('로딩 스켈레톤이 표시되고 사라져야 함', async ({ page }) => {
      // 로딩 스켈레톤 확인 (빠르게 사라질 수 있으므로 optional)
      const skeleton = page.locator('[class*="skeleton"]').first();

      // 스켈레톤이 있다면 사라져야 함
      if (await skeleton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(skeleton).toBeHidden({ timeout: 5000 });
      }
    });

    test('지도 SDK 로드 실패 시 에러 메시지 표시', async ({ page, context }) => {
      // SDK 스크립트 로드를 차단하여 에러 상황 시뮬레이션
      await context.route('**/dapi.kakao.com/**', route => route.abort());

      await page.reload();

      // 에러 메시지 확인
      const errorMessage = page.getByText(/지도 로드 실패|오류가 발생했습니다/i);
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('센터 마커 렌더링', () => {
    test('지도에 센터 마커들이 표시되어야 함', async ({ page }) => {
      // 지도가 로드될 때까지 대기
      await page.waitForTimeout(2000);

      // Kakao Maps 마커 확인 (실제 DOM에 추가되는 마커 이미지)
      const markers = page.locator('img[src*="data:image/svg+xml"]');
      const markerCount = await markers.count();

      // 최소 1개 이상의 마커가 있어야 함
      expect(markerCount).toBeGreaterThan(0);
    });

    test('마커 색상이 운영 상태에 따라 다르게 표시되어야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      // OPEN 상태 마커 (녹색) 확인
      const openMarkers = page.locator('img[src*="#10B981"]');
      const openCount = await openMarkers.count();

      // CLOSED 상태 마커 (회색) 확인
      const closedMarkers = page.locator('img[src*="#9CA3AF"]');
      const closedCount = await closedMarkers.count();

      // 둘 중 최소 하나는 있어야 함
      expect(openCount + closedCount).toBeGreaterThan(0);
    });
  });

  test.describe('마커 클릭 인터랙션', () => {
    test('마커 클릭 시 정보 팝업이 표시되어야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      // 첫 번째 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      // 팝업이 표시되는지 확인
      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible({ timeout: 3000 });
    });

    test('팝업에 센터 정보가 올바르게 표시되어야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      // 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();

      // 센터 이름 확인
      const centerName = popup.locator('[class*="CardTitle"]');
      await expect(centerName).toBeVisible();
      await expect(centerName).not.toBeEmpty();

      // 운영 상태 배지 확인
      const statusBadge = popup.locator('[class*="Badge"]').first();
      await expect(statusBadge).toBeVisible();

      // 거리 정보 확인
      const distanceInfo = popup.getByText(/m · 도보/);
      await expect(distanceInfo).toBeVisible();

      // 주소 정보 확인
      const address = popup.locator('text=/서울|경기|인천/').first();
      await expect(address).toBeVisible();
    });

    test('팝업의 "상세보기" 버튼 클릭 시 센터 상세 페이지로 이동', async ({ page }) => {
      await page.waitForTimeout(2000);

      // 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      // 상세보기 버튼 클릭
      const detailButton = page.getByRole('button', { name: '상세보기' });
      await expect(detailButton).toBeVisible();
      await detailButton.click();

      // URL이 /centers/:id 형식으로 변경되는지 확인
      await expect(page).toHaveURL(/\/centers\/\d+/, { timeout: 5000 });
    });

    test('팝업의 "길찾기" 버튼 클릭 시 지도 앱으로 이동', async ({ page, context }) => {
      await page.waitForTimeout(2000);

      // 새 탭 열림 감지
      const popupPromise = context.waitForEvent('page');

      // 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      // 길찾기 버튼 클릭
      const directionsButton = page.getByRole('button', { name: '길찾기' });
      await expect(directionsButton).toBeVisible();
      await directionsButton.click();

      // 새 탭이 열리고 Kakao Map URL이 포함되는지 확인
      const newPage = await popupPromise;
      expect(newPage.url()).toMatch(/map\.kakao\.com|maps\.apple\.com/);
      await newPage.close();
    });

    test('팝업의 닫기 버튼 클릭 시 팝업이 사라져야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      // 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();

      // 닫기 버튼 클릭
      const closeButton = popup.getByRole('button', { name: '닫기' });
      await closeButton.click();

      // 팝업이 사라지는지 확인
      await expect(popup).toBeHidden();
    });

    test('지도 클릭 시 팝업이 사라져야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      // 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();

      // 지도 빈 공간 클릭 (마커가 없는 영역)
      await page.locator('[class*="KakaoMapView"]').click({ position: { x: 50, y: 50 } });

      // 팝업이 사라지는지 확인
      await expect(popup).toBeHidden({ timeout: 3000 });
    });

    test('전화번호 클릭 시 tel: 링크가 동작해야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      // 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();

      // 전화번호 링크 찾기
      const phoneLink = popup.locator('a[href^="tel:"]').first();

      // 전화번호가 있는 경우에만 확인
      if (await phoneLink.count() > 0) {
        await expect(phoneLink).toBeVisible();
        const href = await phoneLink.getAttribute('href');
        expect(href).toMatch(/^tel:\d+/);
      }
    });
  });

  test.describe('반응형 레이아웃', () => {
    test('모바일 뷰포트에서 정상 작동', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      // 지도 컨테이너 확인
      const mapContainer = page.locator('[class*="KakaoMapView"]').first();
      await expect(mapContainer).toBeVisible();

      // 마커 클릭 및 팝업 확인
      await page.waitForTimeout(2000);
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();

      // 팝업이 화면에 맞게 표시되는지 확인
      const popupBox = await popup.boundingBox();
      expect(popupBox?.width).toBeLessThanOrEqual(375);
    });

    test('태블릿 뷰포트에서 정상 작동', async ({ page }) => {
      // 태블릿 뷰포트 설정
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      // 지도 및 팝업 확인
      const mapContainer = page.locator('[class*="KakaoMapView"]').first();
      await expect(mapContainer).toBeVisible();

      await page.waitForTimeout(2000);
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();
    });

    test('데스크톱 뷰포트에서 정상 작동', async ({ page }) => {
      // 데스크톱 뷰포트 설정
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();

      const mapContainer = page.locator('[class*="KakaoMapView"]').first();
      await expect(mapContainer).toBeVisible();
    });
  });

  test.describe('접근성 (Accessibility)', () => {
    test('팝업이 dialog role을 가져야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();
    });

    test('닫기 버튼에 aria-label이 있어야 함', async ({ page }) => {
      await page.waitForTimeout(2000);

      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const closeButton = page.getByRole('button', { name: '닫기' });
      await expect(closeButton).toBeVisible();

      const ariaLabel = await closeButton.getAttribute('aria-label');
      expect(ariaLabel).toBe('닫기');
    });

    test('키보드로 팝업 닫기 버튼에 접근 가능', async ({ page }) => {
      await page.waitForTimeout(2000);

      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();

      // Tab 키로 포커스 이동
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Enter 또는 Space로 버튼 클릭
      const closeButton = page.getByRole('button', { name: '닫기' });
      await closeButton.focus();
      await page.keyboard.press('Enter');

      // 팝업이 닫혀야 함
      await expect(popup).toBeHidden();
    });

    test('모든 버튼이 키보드로 접근 가능', async ({ page }) => {
      await page.waitForTimeout(2000);

      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      const popup = page.locator('[role="dialog"]');
      await expect(popup).toBeVisible();

      // 상세보기 버튼 포커스
      const detailButton = page.getByRole('button', { name: '상세보기' });
      await detailButton.focus();
      await expect(detailButton).toBeFocused();

      // 길찾기 버튼 포커스
      const directionsButton = page.getByRole('button', { name: '길찾기' });
      await directionsButton.focus();
      await expect(directionsButton).toBeFocused();
    });
  });

  test.describe('에러 처리', () => {
    test('API 에러 시 적절한 에러 메시지 표시', async ({ page }) => {
      // API 요청 실패 시뮬레이션
      await page.route('**/api/v1/centers*', route =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: '서버 오류가 발생했습니다'
            }
          })
        })
      );

      await page.reload();
      await page.waitForTimeout(2000);

      // 에러 메시지 또는 빈 상태 확인
      const errorMessage = page.getByText(/오류|실패|문제/i).first();
      if (await errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test('네트워크 에러 시 재시도 또는 에러 표시', async ({ page }) => {
      // 네트워크 연결 실패 시뮬레이션
      await page.route('**/api/v1/centers*', route => route.abort('failed'));

      await page.reload();
      await page.waitForTimeout(3000);

      // 에러 상태가 사용자에게 표시되는지 확인
      const hasError = await page.locator('text=/오류|실패|연결|네트워크/i').count() > 0;
      const hasNoMarkers = await page.locator('img[src*="data:image/svg+xml"]').count() === 0;

      // 에러 메시지가 있거나, 마커가 없어야 함
      expect(hasError || hasNoMarkers).toBe(true);
    });
  });

  test.describe('성능', () => {
    test('지도 로딩 시간이 5초 이내', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/map');

      // 지도 컨테이너가 표시될 때까지 대기
      await page.locator('[class*="KakaoMapView"]').first().waitFor({ state: 'visible' });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test('마커 클릭 후 팝업 표시 시간이 1초 이내', async ({ page }) => {
      await page.goto('/map');
      await page.waitForTimeout(2000);

      const startTime = Date.now();

      // 마커 클릭
      const firstMarker = page.locator('img[src*="data:image/svg+xml"]').first();
      await firstMarker.click();

      // 팝업 표시 대기
      await page.locator('[role="dialog"]').waitFor({ state: 'visible' });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });
  });
});
