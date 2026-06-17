/**
 * Local runner for the full alert pipeline (no web server needed).
 *
 *   # add + auto-confirm a test subscriber (dev convenience)
 *   npm run pipeline -- --add du@example.com "Hengstey,Klima,Schule"
 *
 *   # run a scan; in dev (no RESEND_API_KEY) alert emails print to the console
 *   npm run pipeline
 *
 * Uses the local JSON store unless DATABASE_URL is set.
 */

import { getStore } from './lib/store';
import { runScan } from './lib/alerts';

async function main() {
  const argv = process.argv.slice(2);
  const addIdx = argv.indexOf('--add');
  if (addIdx !== -1) {
    const email = argv[addIdx + 1];
    const keywords = (argv[addIdx + 2] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!email || keywords.length === 0) {
      console.error('Usage: --add <email> "<kw1,kw2,…>"');
      process.exit(1);
    }
    const store = await getStore();
    const sub = await store.createPending({ email, keywords });
    await store.confirm(sub.confirmToken); // auto-confirm for local testing
    console.log(`Added + confirmed: ${email}  [${keywords.join(', ')}]`);
    return;
  }

  console.log('Running scan…');
  const result = await runScan();
  console.log('\nScan result:');
  console.log(JSON.stringify(result, null, 2));
  process.exit(0); // close any open DB handles
}

main().catch((err) => {
  console.error('Fatal:', (err as Error).message);
  process.exit(1);
});
