import { IQASummary } from '../../helpers/types/qaAgentTypes';

const listOrNone = (a_Items: string[]): string =>
  a_Items.length > 0 ? a_Items.map((i) => `- ${i}`).join('\n') : '_none_';

export const renderReport = (a_Summary: IQASummary): string => {
  const {
    configPath,
    mode,
    outputDir,
    generatedAt,
    fileCheck,
    schemaCheck,
    stats,
    topHotspots,
    validation,
  } = a_Summary;

  const sections: string[] = [];

  sections.push(`# QA Report`);
  sections.push(
    `Generated: ${generatedAt}\n` +
      `Config: \`${configPath}\` (mode: \`${mode}\`)\n` +
      `Output dir: \`${outputDir}\``,
  );

  sections.push(
    `## Output files\n` +
      `**Present**\n${listOrNone(fileCheck.present)}\n\n` +
      `**Missing**${fileCheck.missing.length > 0 ? ' ⚠️' : ''}\n${listOrNone(fileCheck.missing)}`,
  );

  if (schemaCheck) {
    sections.push(
      `## Schema shape check\n` +
        `Checked ${schemaCheck.checked} event(s) in \`canonicalSchema.json\` for the full ` +
        `\`IEventSchema\` key set (structural check, not a full validator).\n\n` +
        `**Issues**${schemaCheck.issues.length > 0 ? ' ⚠️' : ''}\n${listOrNone(schemaCheck.issues)}`,
    );
  }

  if (stats) {
    sections.push(
      `## Data quality (from \`stats.json\`)\n` +
        `| Metric | Value |\n|---|---|\n` +
        `| Event count | ${stats.count_total} |\n` +
        `| Matched / Unmatched | ${stats.matching_stats.matched} / ${stats.matching_stats.unmatched} |\n` +
        `| Unmatched fraction | ${stats.unmatched_fraction} |\n` +
        `| Mean triage score | ${stats.mean_score} |\n` +
        `| Mean uncertainty | ${stats.mean_uncertainty} |\n` +
        `| Time range | ${stats.time_range.start} → ${stats.time_range.end} |\n\n` +
        `**Missingness**\n` +
        Object.entries(stats.missingness)
          .map(([field, pct]) => `- ${field}: ${pct}`)
          .join('\n'),
    );
  }

  if (topHotspots) {
    const rows =
      topHotspots.length > 0
        ? topHotspots
            .map(
              (h) =>
                `| ${h.cell_id} | ${h.count_total} | ${h.count_unmatched} | ${h.count_high_score_unmatched} | ${h.mean_score ?? 'N/A'} | ${h.mean_uncertainty ?? 'N/A'} | ${h.pct_near_coast} |`,
            )
            .join('\n')
        : '_no hotspots generated_';

    sections.push(
      `## Top ${topHotspots.length} hotspot cell(s)\n` +
        `| cell_id | total | unmatched | high-score unmatched | mean score | mean uncertainty | % near coast |\n` +
        `|---|---|---|---|---|---|---|\n${rows}`,
    );
  }

  if (validation) {
    const rows =
      validation.strata.length > 0
        ? validation.strata
            .map(
              (s) =>
                `| ${s.stratum} | ${s.count} | ${s.blank_labels} | ${s.filled_labels} |`,
            )
            .join('\n')
        : '_no strata found_';

    const violation = validation.total_filled_labels > 0;

    sections.push(
      `## Validation sample\n` +
        `Labels are expected to ship **blank** (analyst fills them in later) — a non-zero ` +
        `"filled" count here means something pre-populated a label before export.\n\n` +
        `| stratum | rows | blank labels | filled labels |\n|---|---|---|---|\n${rows}\n\n` +
        `Total rows: ${validation.total_rows} — ` +
        `${violation ? `⚠️ ${validation.total_filled_labels} row(s) have a non-blank label` : 'all labels blank ✓'}`,
    );
  }

  return sections.join('\n\n') + '\n';
};
