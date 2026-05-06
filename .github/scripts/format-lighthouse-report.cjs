/* global module, require */

module.exports = function formatLighthouseReport({ core }) {
  const fs = require('node:fs');
  const manifestPath = './.lighthouseci/manifest.json';
  const linksPath = './.lighthouseci/links.json';

  if (!fs.existsSync(manifestPath)) {
    core.setOutput('comment', '❌ Lighthouse failed to generate a report.');
    return;
  }

  const results = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const links = fs.existsSync(linksPath) ? JSON.parse(fs.readFileSync(linksPath, 'utf8')) : {};

  let comment = '## ⚡ Lighthouse CI Report\n\n';
  comment += '| URL | Performance | Accessibility | Best Practices | SEO |\n';
  comment += '| --- | --- | --- | --- | --- |\n';

  const formatScore = (score) => {
    const val = Math.round(score * 100);
    let emoji = '🔴'; // Poor (< 50)
    if (val >= 90)
      emoji = '🟢'; // Good (>= 90)
    else if (val >= 50) emoji = '🟠'; // Needs Improvement (50-89)
    return `${emoji} ${val}`;
  };

  results.forEach((result) => {
    const summary = result.summary;
    const reportUrl = links[result.url] ? `[View Report](${links[result.url]})` : result.url;

    comment += `| ${reportUrl} | ${formatScore(summary.performance)} | ${formatScore(summary.accessibility)} | ${formatScore(summary['best-practices'])} | ${formatScore(summary.seo)} |\n`;
  });

  return comment;
};
