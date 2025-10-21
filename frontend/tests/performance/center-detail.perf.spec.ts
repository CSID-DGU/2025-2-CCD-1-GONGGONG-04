/**
 * Performance Tests for Center Detail Page
 * 센터 상세 페이지 성능 테스트
 *
 * 테스트 항목:
 * - Page load time < 1.5s
 * - API response < 500ms
 * - Core Web Vitals (LCP, FID, CLS)
 * - First Contentful Paint (FCP)
 * - Time to Interactive (TTI)
 */

import { test, expect } from '@playwright/test';

// 성능 예산 (Performance Budget)
const PERFORMANCE_BUDGET = {
  pageLoad: 1500, // 1.5초
  apiResponse: 500, // 0.5초
  lcp: 2500, // Largest Contentful Paint
  fcp: 1800, // First Contentful Paint
  cls: 0.1, // Cumulative Layout Shift
  tti: 3800, // Time to Interactive
  tbt: 200, // Total Blocking Time
};

test.describe('Center Detail Page - Performance', () => {
  test.beforeEach(async ({ page }) => {
    // 성능 메트릭 수집 활성화
    await page.goto('/'); // 홈페이지부터 시작 (캐시 워밍업)
  });

  test('should load page within 1.5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/centers/1', {
      waitUntil: 'networkidle',
    });

    const loadTime = Date.now() - startTime;

    console.log(`⏱️  Page load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(PERFORMANCE_BUDGET.pageLoad);
  });

  test('should fetch center detail API within 500ms', async ({ page }) => {
    // API 요청 가로채기
    const apiPromise = page.waitForResponse(
      (response) => response.url().includes('/api/v1/centers/') && response.status() === 200
    );

    const startTime = Date.now();
    await page.goto('/centers/1');

    const response = await apiPromise;
    const responseTime = Date.now() - startTime;

    console.log(`🌐 API response time: ${responseTime}ms`);

    expect(responseTime).toBeLessThan(PERFORMANCE_BUDGET.apiResponse);
  });

  test('should meet Core Web Vitals - LCP (Largest Contentful Paint)', async ({ page }) => {
    await page.goto('/centers/1');

    // LCP 측정
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // 타임아웃 설정 (5초 후에도 LCP가 없으면 실패)
        setTimeout(() => resolve(0), 5000);
      });
    });

    console.log(`🖼️  LCP: ${lcp}ms`);

    expect(lcp).toBeLessThan(PERFORMANCE_BUDGET.lcp);
    expect(lcp).toBeGreaterThan(0); // LCP가 측정되었는지 확인
  });

  test('should meet Core Web Vitals - FCP (First Contentful Paint)', async ({ page }) => {
    await page.goto('/centers/1');

    const fcp = await page.evaluate(() => {
      const fcpEntry = performance.getEntriesByType('paint').find((entry) => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });

    console.log(`🎨 FCP: ${fcp}ms`);

    expect(fcp).toBeLessThan(PERFORMANCE_BUDGET.fcp);
    expect(fcp).toBeGreaterThan(0);
  });

  test('should meet Core Web Vitals - CLS (Cumulative Layout Shift)', async ({ page }) => {
    await page.goto('/centers/1');

    // CLS 측정 (페이지 로드 후 3초 동안)
    await page.waitForTimeout(3000);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(clsValue), 100);
      });
    });

    console.log(`📐 CLS: ${cls.toFixed(3)}`);

    expect(cls).toBeLessThan(PERFORMANCE_BUDGET.cls);
  });

  test('should meet TTI (Time to Interactive)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/centers/1');

    // 페이지가 완전히 인터랙티브해질 때까지 대기
    await page.waitForLoadState('networkidle');

    const tti = Date.now() - startTime;

    console.log(`⚡ TTI: ${tti}ms`);

    expect(tti).toBeLessThan(PERFORMANCE_BUDGET.tti);
  });

  test('should have minimal JavaScript execution time (TBT)', async ({ page }) => {
    await page.goto('/centers/1');

    // 메인 스레드 블로킹 시간 측정
    const metrics = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        let totalBlockingTime = 0;

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (entry.duration > 50) {
              totalBlockingTime += entry.duration - 50;
            }
          }
        }).observe({ entryTypes: ['longtask'] });

        setTimeout(() => resolve({ totalBlockingTime }), 3000);
      });
    });

    console.log(`🔒 Total Blocking Time: ${metrics.totalBlockingTime}ms`);

    expect(metrics.totalBlockingTime).toBeLessThan(PERFORMANCE_BUDGET.tbt);
  });

  test('should display loading skeleton before content', async ({ page }) => {
    // 네트워크 스로틀링 시뮬레이션
    await page.route('**/api/v1/centers/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연
      route.continue();
    });

    const navigationPromise = page.goto('/centers/1');

    // 로딩 스켈레톤이 표시되는지 확인 (애니메이션 클래스 존재)
    const hasLoadingSkeleton = await page.locator('.animate-pulse').count();

    expect(hasLoadingSkeleton).toBeGreaterThan(0);

    await navigationPromise;
  });

  test('should optimize images with lazy loading', async ({ page }) => {
    await page.goto('/centers/1');

    // 이미지가 lazy loading 속성을 가지는지 확인
    const images = await page.locator('img').all();

    for (const img of images) {
      const loading = await img.getAttribute('loading');
      const isAboveFold = await img.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight;
      });

      // Above-the-fold 이미지가 아니면 lazy loading 적용되어야 함
      if (!isAboveFold) {
        expect(loading).toBe('lazy');
      }
    }
  });

  test('should cache API responses appropriately', async ({ page }) => {
    // 첫 번째 방문
    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    // 같은 페이지 재방문
    const startTime = Date.now();
    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - startTime;

    console.log(`🔄 Second load time (with cache): ${secondLoadTime}ms`);

    // 캐시가 적용되면 두 번째 로딩이 훨씬 빨라야 함
    expect(secondLoadTime).toBeLessThan(PERFORMANCE_BUDGET.pageLoad * 0.7); // 30% 빠름
  });

  test('should not block rendering with unnecessary JavaScript', async ({ page }) => {
    await page.goto('/centers/1');

    // JavaScript 번들 크기 확인
    const jsResources = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((entry: any) => entry.name.endsWith('.js'))
        .map((entry: any) => ({
          name: entry.name,
          size: entry.transferSize,
          duration: entry.duration,
        }));
    });

    console.log('📦 JavaScript bundles:');
    jsResources.forEach((resource: any) => {
      console.log(`  - ${resource.name.split('/').pop()}: ${Math.round(resource.size / 1024)}KB (${Math.round(resource.duration)}ms)`);
    });

    // 각 JS 파일의 로딩 시간이 합리적인지 확인
    jsResources.forEach((resource: any) => {
      expect(resource.duration).toBeLessThan(1000); // 각 JS 파일 로딩 < 1초
    });
  });

  test('should have optimized font loading', async ({ page }) => {
    await page.goto('/centers/1');

    // 폰트 리소스 확인
    const fontResources = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((entry: any) => entry.name.includes('font') || entry.name.endsWith('.woff2'))
        .map((entry: any) => ({
          name: entry.name,
          duration: entry.duration,
        }));
    });

    console.log('🔤 Font loading:');
    fontResources.forEach((resource: any) => {
      console.log(`  - ${resource.name.split('/').pop()}: ${Math.round(resource.duration)}ms`);
    });

    // 폰트 로딩이 페이지 렌더링을 블록하지 않는지 확인
    fontResources.forEach((resource: any) => {
      expect(resource.duration).toBeLessThan(500); // 폰트 로딩 < 500ms
    });
  });

  test('should generate performance report', async ({ page }) => {
    await page.goto('/centers/1');

    // 전체 성능 메트릭 수집
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((entry) => entry.name === 'first-contentful-paint');

      return {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        domParsing: navigation.domInteractive - navigation.responseEnd,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        fcp: fcp ? fcp.startTime : 0,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      };
    });

    console.log('\n📊 Performance Metrics Summary:');
    console.log('  DNS Lookup:', Math.round(performanceMetrics.dns), 'ms');
    console.log('  TCP Connection:', Math.round(performanceMetrics.tcp), 'ms');
    console.log('  Request Time:', Math.round(performanceMetrics.request), 'ms');
    console.log('  Response Time:', Math.round(performanceMetrics.response), 'ms');
    console.log('  DOM Parsing:', Math.round(performanceMetrics.domParsing), 'ms');
    console.log('  DOM Content Loaded:', Math.round(performanceMetrics.domContentLoaded), 'ms');
    console.log('  Load Complete:', Math.round(performanceMetrics.loadComplete), 'ms');
    console.log('  FCP:', Math.round(performanceMetrics.fcp), 'ms');
    console.log('  Total Load Time:', Math.round(performanceMetrics.totalLoadTime), 'ms');

    expect(performanceMetrics.totalLoadTime).toBeLessThan(PERFORMANCE_BUDGET.pageLoad);
  });
});

test.describe('Center Detail Page - Network Performance', () => {
  test('should minimize number of HTTP requests', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', (request) => {
      if (!request.url().includes('chrome-extension')) {
        requests.push(request.url());
      }
    });

    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    console.log(`🌐 Total HTTP requests: ${requests.length}`);

    // 초기 로딩 시 HTTP 요청 수 제한 (번들링 및 최적화된 경우)
    expect(requests.length).toBeLessThan(50); // 50개 이하
  });

  test('should use compression for text resources', async ({ page }) => {
    const compressedResources: any[] = [];

    page.on('response', async (response) => {
      const headers = response.headers();
      const url = response.url();

      if (
        (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html') || url.includes('/api/')) &&
        headers['content-encoding']
      ) {
        compressedResources.push({
          url: url.split('/').pop(),
          encoding: headers['content-encoding'],
        });
      }
    });

    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    console.log('🗜️  Compressed resources:');
    compressedResources.forEach((resource) => {
      console.log(`  - ${resource.url}: ${resource.encoding}`);
    });

    // 최소한 일부 리소스는 압축되어야 함
    expect(compressedResources.length).toBeGreaterThan(0);
  });

  test('should set appropriate cache headers', async ({ page }) => {
    const cachedResources: any[] = [];

    page.on('response', async (response) => {
      const headers = response.headers();
      const url = response.url();
      const cacheControl = headers['cache-control'];

      if (cacheControl && (url.endsWith('.js') || url.endsWith('.css') || url.includes('/_next/'))) {
        cachedResources.push({
          url: url.split('/').pop(),
          cacheControl,
        });
      }
    });

    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    console.log('💾 Cached resources:');
    cachedResources.forEach((resource) => {
      console.log(`  - ${resource.url}: ${resource.cacheControl}`);
    });

    // Next.js 정적 리소스는 캐시 헤더를 가져야 함
    expect(cachedResources.length).toBeGreaterThan(0);
  });
});
