//npm install -D @axe-core/playwright
import { AxeBuilder } from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test"; // this type show that it is  compile time import

export const WCAG_STD_AA_TAGS = ["wcag2a", "wcag21a", "wcag22a", "wcag22aa", "wcag2aa", "wcag21aa"];

export function scanPageForAllIssues(page: Page): AxeBuilder {
    return new AxeBuilder({ page })
    .withTags([...WCAG_STD_AA_TAGS]);
}

export async function attachAccessibilityResults(testInfo: TestInfo, results: Awaited<ReturnType<AxeBuilder["analyze"]>>) {
    const impactCounts: Record<string, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    for (const violation of results.violations) {
        const impact = violation.impact ?? "minor";
        impactCounts[impact] = (impactCounts[impact] ?? 0) + 1;
    }

    const summary = {
        url: results.url,
        totalViolations: results.violations.length,
        totalAffectedElements: results.violations.reduce((sum, v) => sum + v.nodes.length, 0),
        violationsByImpact: impactCounts,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
    };

    const report = {
        summary,
        violations: results.violations.map(violation => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            description: violation.description,
            helpURL: violation.helpUrl,
            affectedElement: violation.nodes.length,
            nodes: violation.nodes.map((node) => ({
                html: node.html,
                target: node.target,
                failureSummary: node.failureSummary
            }))
        })),
    };

    const esc = (value: string) =>
        value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const summaryRows: [string, string | number][] = [
        ["Page URL", summary.url],
        ["Total violations", summary.totalViolations],
        ["Affected elements", summary.totalAffectedElements],
        ...Object.entries(impactCounts).map(([impact, count]): [string, number] => [`Impact: ${impact}`, count]),
        ["Rules passed", summary.passes],
        ["Incomplete (needs review)", summary.incomplete],
        ["Inapplicable", summary.inapplicable],
    ];

    const violationRows = results.violations.length
        ? results.violations
              .map(
                  (v) => `<tr>
<td>${esc(v.impact ?? "n/a")}</td>
<td>${esc(v.id)}</td>
<td>${esc(v.help)}</td>
<td>${v.nodes.length}</td>
<td><a href="${esc(v.helpUrl)}" target="_blank">Learn more</a></td>
</tr>`,
              )
              .join("\n")
        : `<tr><td colspan="5">No violations found</td></tr>`;

    const html = `<html><head><style>
body{font-family:Arial,sans-serif;font-size:14px}
table{border-collapse:collapse;margin-bottom:24px;width:100%}
th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}
th{background:#f0f0f0}
</style></head><body>
<h3>Accessibility Summary</h3>
<table>
<tr><th>Metric</th><th>Value</th></tr>
${summaryRows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(String(v))}</td></tr>`).join("\n")}
</table>
<h3>Accessibility Violations</h3>
<table>
<tr><th>Impact</th><th>Rule</th><th>Description</th><th>Elements</th><th>Help</th></tr>
${violationRows}
</table>
</body></html>`;

    await testInfo.attach("accessibility-summary", {
        body: html,
        contentType: "text/html"
    });

    await testInfo.attach("accessibility-report", {
        body: JSON.stringify(report, null, 2),
        contentType: "application/json"
    });
}