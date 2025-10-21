/**
 * Lighthouse Audit Script
 * 센터 상세 페이지 성능 감사 자동화
 *
 * 실행 방법:
 * node scripts/lighthouse-audit.js [url]
 *
 * 예시:
 * node scripts/lighthouse-audit.js http://localhost:3000/centers/1
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// 임계값 설정
const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  bestPractices: 90,
  seo: 90,
};

// Core Web Vitals 임계값
const CORE_WEB_VITALS = {
  'largest-contentful-paint': 2500, // LCP < 2.5s
  'first-input-delay': 100, // FID < 100ms
  'cumulative-layout-shift': 0.1, // CLS < 0.1
  'first-contentful-paint': 1800, // FCP < 1.8s
  'speed-index': 3400, // SI < 3.4s
  'total-blocking-time': 200, // TBT < 200ms
  'time-to-interactive': 3800, // TTI < 3.8s
};

/**
 * Lighthouse 감사 실행
 */
async function runLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  });

  const lighthouseOptions = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    formFactor: options.mobile ? 'mobile' : 'desktop',
    screenEmulation: options.mobile
      ? {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
        }
      : {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
        },
  };

  try {
    const runnerResult = await lighthouse(url, lighthouseOptions);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

/**
 * 감사 결과 분석
 */
function analyzeResults(runnerResult, deviceType) {
  const { lhr } = runnerResult;

  const scores = {
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
  };

  // Core Web Vitals 추출
  const coreWebVitals = {
    lcp: lhr.audits['largest-contentful-paint'].numericValue,
    fcp: lhr.audits['first-contentful-paint'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
    si: lhr.audits['speed-index'].numericValue,
    tbt: lhr.audits['total-blocking-time'].numericValue,
    tti: lhr.audits['interactive'].numericValue,
  };

  // 위반 사항 추출
  const violations = [];

  // 접근성 위반
  if (scores.accessibility < THRESHOLDS.accessibility) {
    const a11yAudits = Object.values(lhr.audits).filter(
      (audit) =>
        audit.score !== null &&
        audit.score < 1 &&
        audit.id.includes('aria') ||
        audit.id.includes('color-contrast') ||
        audit.id.includes('image-alt') ||
        audit.id.includes('link-name')
    );

    violations.push({
      category: 'accessibility',
      issues: a11yAudits.map((audit) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
      })),
    });
  }

  // 성능 문제
  const performanceOpportunities = lhr.audits;
  const opportunities = Object.keys(performanceOpportunities)
    .filter((key) => performanceOpportunities[key].details?.type === 'opportunity')
    .map((key) => ({
      id: key,
      title: performanceOpportunities[key].title,
      savings: performanceOpportunities[key].details.overallSavingsMs,
    }))
    .filter((opp) => opp.savings > 100) // 100ms 이상 절약 가능한 것만
    .sort((a, b) => b.savings - a.savings);

  return {
    deviceType,
    scores,
    coreWebVitals,
    violations,
    opportunities,
    passed: Object.values(scores).every((score) => score >= 90),
  };
}

/**
 * 결과 리포트 생성
 */
function generateReport(results, outputDir) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const reportDir = path.join(outputDir, `lighthouse-${timestamp}`);

  // 디렉토리 생성
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // 각 디바이스별 결과 저장
  results.forEach((result) => {
    const devicePrefix = result.deviceType;

    // HTML 리포트 저장
    fs.writeFileSync(
      path.join(reportDir, `${devicePrefix}-report.html`),
      result.report[0]
    );

    // JSON 데이터 저장
    fs.writeFileSync(
      path.join(reportDir, `${devicePrefix}-data.json`),
      JSON.stringify(result.analysis, null, 2)
    );
  });

  // 통합 summary 생성
  const summary = {
    timestamp,
    results: results.map((r) => r.analysis),
    allPassed: results.every((r) => r.analysis.passed),
  };

  fs.writeFileSync(
    path.join(reportDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  return reportDir;
}

/**
 * 결과 콘솔 출력
 */
function printResults(results) {
  console.log('\n========================================');
  console.log('  Lighthouse Audit Results');
  console.log('========================================\n');

  results.forEach((result) => {
    const { analysis } = result;
    console.log(`\n[${analysis.deviceType.toUpperCase()}]\n`);

    console.log('📊 Scores:');
    Object.entries(analysis.scores).forEach(([category, score]) => {
      const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
      const threshold = THRESHOLDS[category];
      const status = score >= threshold ? 'PASS' : 'FAIL';
      console.log(`  ${emoji} ${category}: ${score}/100 (${status})`);
    });

    console.log('\n⚡ Core Web Vitals:');
    console.log(`  LCP: ${Math.round(analysis.coreWebVitals.lcp)}ms`);
    console.log(`  FCP: ${Math.round(analysis.coreWebVitals.fcp)}ms`);
    console.log(`  CLS: ${analysis.coreWebVitals.cls.toFixed(3)}`);
    console.log(`  SI: ${Math.round(analysis.coreWebVitals.si)}ms`);
    console.log(`  TBT: ${Math.round(analysis.coreWebVitals.tbt)}ms`);
    console.log(`  TTI: ${Math.round(analysis.coreWebVitals.tti)}ms`);

    if (analysis.opportunities.length > 0) {
      console.log('\n💡 Top Performance Opportunities:');
      analysis.opportunities.slice(0, 5).forEach((opp) => {
        console.log(`  - ${opp.title}: ~${Math.round(opp.savings)}ms`);
      });
    }

    if (analysis.violations.length > 0) {
      console.log('\n⚠️  Violations Found:');
      analysis.violations.forEach((violation) => {
        console.log(`  Category: ${violation.category}`);
        violation.issues.slice(0, 3).forEach((issue) => {
          console.log(`    - ${issue.title}`);
        });
      });
    }
  });

  console.log('\n========================================\n');

  const allPassed = results.every((r) => r.analysis.passed);
  if (allPassed) {
    console.log('✅ All thresholds passed!');
  } else {
    console.log('❌ Some thresholds failed. Check the reports for details.');
    process.exit(1);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const url = process.argv[2] || 'http://localhost:3000/centers/1';
  const outputDir = path.join(__dirname, '../claudedocs/lighthouse-reports');

  console.log(`\n🔍 Running Lighthouse audit on: ${url}\n`);

  try {
    // 모바일 감사
    console.log('📱 Running mobile audit...');
    const mobileResult = await runLighthouse(url, { mobile: true });
    const mobileAnalysis = analyzeResults(mobileResult, 'mobile');

    // 데스크톱 감사
    console.log('💻 Running desktop audit...');
    const desktopResult = await runLighthouse(url, { mobile: false });
    const desktopAnalysis = analyzeResults(desktopResult, 'desktop');

    // 결과 컴파일
    const results = [
      {
        deviceType: 'mobile',
        report: mobileResult.report,
        analysis: mobileAnalysis,
      },
      {
        deviceType: 'desktop',
        report: desktopResult.report,
        analysis: desktopAnalysis,
      },
    ];

    // 리포트 생성
    const reportDir = generateReport(results, outputDir);
    console.log(`\n📄 Reports saved to: ${reportDir}`);

    // 결과 출력
    printResults(results);
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { runLighthouse, analyzeResults };
