const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export function formatProfile(user, orders, invoice, recs) {
  const lines = [
    `  Profile:     ${user.name} (${user.id})`,
    `  Orders:      ${orders.length}, latest ${orders[0].id}`,
    `  Invoice:     ${invoice.id}, ${inr.format(invoice.amount)}`,
  ];
  if (recs) lines.push(`  Recommended: ${recs.join(', ')}`);
  return lines.join('\n');
}

export function renderProfile(user, orders, invoice, recs) {
  console.log(formatProfile(user, orders, invoice, recs));
}

export function showError(err) {
  console.error(`  Error: ${err.message}`);
}

export function banner(title) {
  console.log(`\n${title}\n${'-'.repeat(title.length)}`);
}
