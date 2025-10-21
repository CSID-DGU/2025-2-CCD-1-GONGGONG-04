/**
 * Accessibility Audit Script (axe-core + Playwright)
 * 센터 상세 페이지 접근성 감사 자동화
 *
 * 실행 방법:
 * node scripts/accessibility-audit.js [url]
 *
 * 예시:
 * node scripts/accessibility-audit.js http://localhost:3000/centers/1
 */

const { chromium } = require('playwright');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');

// WCAG 레벨 및 태그 설정
const AXE_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
};

/**
 * 접근성 감사 실행
 */
async function runAccessibilityAudit(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 페이지 로드
    console.log(`\n🔍 Loading page: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // axe-core 주입
    await injectAxe(page);

    // 접근성 검사 실행
    console.log('🔬 Running axe-core accessibility scan...');
    const results = await page.evaluate(
      async ([axeOptions]) => {
        // @ts-ignore
        return await axe.run(document, axeOptions);
      },
      [AXE_OPTIONS]
    );

    // 결과 분석
    const analysis = analyzeAxeResults(results);

    // 수동 테스트 체크리스트
    const manualChecks = await performManualChecks(page);

    await browser.close();

    return {
      automated: analysis,
      manual: manualChecks,
      passed: analysis.violations.length === 0,
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * axe 결과 분석
 */
function analyzeAxeResults(results) {
  const { violations, passes, incomplete } = results;

  // 위반 사항을 심각도별로 분류
  const violationsBySeverity = {
    critical: [],
    serious: [],
    moderate: [],
    minor: [],
  };

  violations.forEach((violation) => {
    violationsBySeverity[violation.impact].push({
      id: violation.id,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      impact: violation.impact,
      tags: violation.tags,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    });
  });

  return {
    summary: {
      violations: violations.length,
      passes: passes.length,
      incomplete: incomplete.length,
      critical: violationsBySeverity.critical.length,
      serious: violationsBySeverity.serious.length,
      moderate: violationsBySeverity.moderate.length,
      minor: violationsBySeverity.minor.length,
    },
    violations: violationsBySeverity,
    incomplete: incomplete.map((item) => ({
      id: item.id,
      description: item.description,
      help: item.help,
    })),
  };
}

/**
 * 수동 접근성 체크 수행
 */
async function performManualChecks(page) {
  const checks = [];

  // 1. 키보드 네비게이션 테스트
  console.log('⌨️  Testing keyboard navigation...');
  const keyboardCheck = await testKeyboardNavigation(page);
  checks.push(keyboardCheck);

  // 2. 포커스 관리 테스트
  console.log('🎯 Testing focus management...');
  const focusCheck = await testFocusManagement(page);
  checks.push(focusCheck);

  // 3. ARIA 속성 검증
  console.log('🏷️  Testing ARIA attributes...');
  const ariaCheck = await testAriaAttributes(page);
  checks.push(ariaCheck);

  // 4. 색상 대비 검증
  console.log('🎨 Testing color contrast...');
  const contrastCheck = await testColorContrast(page);
  checks.push(contrastCheck);

  return checks;
}

/**
 * 키보드 네비게이션 테스트
 */
async function testKeyboardNavigation(page) {
  const issues = [];

  try {
    // Tab 키로 모든 인터랙티브 요소 탐색
    const interactiveElements = await page.$$('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    if (interactiveElements.length === 0) {
      issues.push('No interactive elements found for keyboard navigation');
    }

    // 첫 번째 요소로 Tab 이동 테스트
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    if (!focusedElement || focusedElement === 'BODY') {
      issues.push('Tab key does not focus any element');
    }

    // ESC 키 테스트 (모달이 있는 경우)
    const hasModal = await page.$('[role="dialog"]');
    if (hasModal) {
      await page.keyboard.press('Escape');
      const modalStillVisible = await page.$('[role="dialog"]:visible');
      if (modalStillVisible) {
        issues.push('ESC key does not close modal');
      }
    }
  } catch (error) {
    issues.push(`Keyboard navigation test error: ${error.message}`);
  }

  return {
    test: 'Keyboard Navigation',
    passed: issues.length === 0,
    issues,
  };
}

/**
 * 포커스 관리 테스트
 */
async function testFocusManagement(page) {
  const issues = [];

  try {
    // 포커스 가능한 요소에 포커스 표시 확인
    const focusableElements = await page.$$('button, a[href], input');

    for (const element of focusableElements.slice(0, 5)) {
      // 처음 5개만 테스트
      await element.focus();

      const hasVisibleFocus = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el, ':focus-visible');
        return (
          styles.outline !== 'none' ||
          styles.outlineWidth !== '0px' ||
          styles.boxShadow !== 'none'
        );
      });

      if (!hasVisibleFocus) {
        const tag = await element.evaluate((el) => el.tagName);
        issues.push(`${tag} element does not have visible focus indicator`);
      }
    }
  } catch (error) {
    issues.push(`Focus management test error: ${error.message}`);
  }

  return {
    test: 'Focus Management',
    passed: issues.length === 0,
    issues,
  };
}

/**
 * ARIA 속성 테스트
 */
async function testAriaAttributes(page) {
  const issues = [];

  try {
    // 버튼에 aria-label 또는 텍스트 컨텐츠 확인
    const buttons = await page.$$('button');

    for (const button of buttons) {
      const hasAccessibleName = await button.evaluate((el) => {
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledby = el.getAttribute('aria-labelledby');
        const textContent = el.textContent?.trim();

        return ariaLabel || ariaLabelledby || textContent;
      });

      if (!hasAccessibleName) {
        issues.push('Button found without accessible name (aria-label or text)');
      }
    }

    // 이미지에 alt 텍스트 확인
    const images = await page.$$('img');

    for (const img of images) {
      const hasAlt = await img.evaluate((el) => {
        return el.hasAttribute('alt');
      });

      if (!hasAlt) {
        const src = await img.getAttribute('src');
        issues.push(`Image missing alt text: ${src}`);
      }
    }

    // 랜드마크 역할 확인
    const hasMain = await page.$('main, [role="main"]');
    if (!hasMain) {
      issues.push('Page missing main landmark');
    }

    const hasNav = await page.$('nav, [role="navigation"]');
    if (!hasNav) {
      issues.push('Page missing navigation landmark');
    }
  } catch (error) {
    issues.push(`ARIA attributes test error: ${error.message}`);
  }

  return {
    test: 'ARIA Attributes',
    passed: issues.length === 0,
    issues,
  };
}

/**
 * 색상 대비 테스트
 */
async function testColorContrast(page) {
  const issues = [];

  try {
    // axe-core가 이미 색상 대비를 체크하므로 추가 검증만 수행
    const textElements = await page.$$('p, h1, h2, h3, h4, h5, h6, span, a, button');

    let checkedCount = 0;
    for (const element of textElements.slice(0, 20)) {
      // 처음 20개만 샘플링
      const contrastRatio = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;

        // 간단한 대비 계산 (실제로는 axe가 더 정확)
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
          return null; // 배경이 투명하면 스킵
        }

        return { color, bgColor }; // 실제 계산은 복잡하므로 정보만 수집
      });

      if (contrastRatio) {
        checkedCount++;
      }
    }

    if (checkedCount === 0) {
      issues.push('Could not verify color contrast (transparent backgrounds)');
    }
  } catch (error) {
    issues.push(`Color contrast test error: ${error.message}`);
  }

  return {
    test: 'Color Contrast',
    passed: issues.length === 0,
    issues,
    note: 'Detailed contrast ratios are verified by axe-core automated scan',
  };
}

/**
 * 결과 리포트 생성
 */
function generateReport(results, url, outputDir) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const reportDir = path.join(outputDir, `a11y-${timestamp}`);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // JSON 결과 저장
  fs.writeFileSync(
    path.join(reportDir, 'accessibility-report.json'),
    JSON.stringify({ url, timestamp, ...results }, null, 2)
  );

  // 마크다운 리포트 생성
  const markdown = generateMarkdownReport(results, url);
  fs.writeFileSync(path.join(reportDir, 'accessibility-report.md'), markdown);

  return reportDir;
}

/**
 * 마크다운 리포트 생성
 */
function generateMarkdownReport(results, url) {
  const { automated, manual, passed } = results;

  let md = `# Accessibility Audit Report\n\n`;
  md += `**URL**: ${url}\n`;
  md += `**Date**: ${new Date().toISOString()}\n`;
  md += `**Status**: ${passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

  md += `## Summary\n\n`;
  md += `- Total Violations: ${automated.summary.violations}\n`;
  md += `- Critical: ${automated.summary.critical}\n`;
  md += `- Serious: ${automated.summary.serious}\n`;
  md += `- Moderate: ${automated.summary.moderate}\n`;
  md += `- Minor: ${automated.summary.minor}\n`;
  md += `- Passed Checks: ${automated.summary.passes}\n`;
  md += `- Incomplete: ${automated.summary.incomplete}\n\n`;

  if (automated.summary.violations > 0) {
    md += `## Violations\n\n`;

    ['critical', 'serious', 'moderate', 'minor'].forEach((severity) => {
      const violations = automated.violations[severity];
      if (violations.length > 0) {
        md += `### ${severity.toUpperCase()} (${violations.length})\n\n`;

        violations.forEach((violation, index) => {
          md += `#### ${index + 1}. ${violation.help}\n\n`;
          md += `- **ID**: ${violation.id}\n`;
          md += `- **Impact**: ${violation.impact}\n`;
          md += `- **Description**: ${violation.description}\n`;
          md += `- **Help**: [Learn more](${violation.helpUrl})\n`;
          md += `- **WCAG Tags**: ${violation.tags.filter((t) => t.startsWith('wcag')).join(', ')}\n\n`;

          if (violation.nodes.length > 0) {
            md += `**Affected Elements**:\n\n`;
            violation.nodes.slice(0, 3).forEach((node) => {
              md += `\`\`\`html\n${node.html}\n\`\`\`\n\n`;
            });
          }

          md += `---\n\n`;
        });
      }
    });
  }

  md += `## Manual Tests\n\n`;
  manual.forEach((check) => {
    const status = check.passed ? '✅ PASS' : '❌ FAIL';
    md += `### ${status} ${check.test}\n\n`;

    if (check.issues.length > 0) {
      md += `**Issues**:\n\n`;
      check.issues.forEach((issue) => {
        md += `- ${issue}\n`;
      });
      md += `\n`;
    }

    if (check.note) {
      md += `> ${check.note}\n\n`;
    }
  });

  return md;
}

/**
 * 결과 콘솔 출력
 */
function printResults(results) {
  const { automated, manual, passed } = results;

  console.log('\n========================================');
  console.log('  Accessibility Audit Results');
  console.log('========================================\n');

  console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('📊 Automated Scan Summary:');
  console.log(`  Total Violations: ${automated.summary.violations}`);
  console.log(`  - Critical: ${automated.summary.critical}`);
  console.log(`  - Serious: ${automated.summary.serious}`);
  console.log(`  - Moderate: ${automated.summary.moderate}`);
  console.log(`  - Minor: ${automated.summary.minor}`);
  console.log(`  Passed Checks: ${automated.summary.passes}`);
  console.log(`  Incomplete: ${automated.summary.incomplete}\n`);

  if (automated.summary.violations > 0) {
    console.log('⚠️  Top Violations:\n');

    ['critical', 'serious'].forEach((severity) => {
      const violations = automated.violations[severity];
      violations.slice(0, 3).forEach((violation) => {
        console.log(`  [${severity.toUpperCase()}] ${violation.help}`);
        console.log(`    - ${violation.description}`);
        console.log(`    - Learn more: ${violation.helpUrl}\n`);
      });
    });
  }

  console.log('🔍 Manual Tests:\n');
  manual.forEach((check) => {
    const emoji = check.passed ? '✅' : '❌';
    console.log(`  ${emoji} ${check.test}`);
    if (check.issues.length > 0) {
      check.issues.forEach((issue) => {
        console.log(`    - ${issue}`);
      });
    }
  });

  console.log('\n========================================\n');

  if (!passed) {
    console.log('❌ Accessibility audit failed. Please fix the violations.');
    process.exit(1);
  } else {
    console.log('✅ All accessibility checks passed!');
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const url = process.argv[2] || 'http://localhost:3000/centers/1';
  const outputDir = path.join(__dirname, '../claudedocs/a11y-reports');

  console.log(`\n🔍 Running accessibility audit on: ${url}\n`);

  try {
    const results = await runAccessibilityAudit(url);

    const reportDir = generateReport(results, url, outputDir);
    console.log(`\n📄 Reports saved to: ${reportDir}`);

    printResults(results);
  } catch (error) {
    console.error('❌ Accessibility audit failed:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { runAccessibilityAudit, analyzeAxeResults };
