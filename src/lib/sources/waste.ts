/**
 * Waste collection (Abfuhrkalender) for Herdecke.
 *
 * The Ennepe-Ruhr waste authority AHE and the city both publish the calendar,
 * including a per-street iCal export — but only behind a dynamic AJAX form, so
 * there is no stable machine endpoint yet. For now we link the official sources;
 * per-street bin reminders are a planned follow-up (reverse-engineer the form,
 * then fold it into the alert/subscription system).
 */
export const wasteInfo = {
  provider: 'AHE GmbH (Ennepe-Ruhr)',
  /** City page with the interactive calendar + "Abfuhrkalender als iCal" export. */
  calendarUrl: 'https://www.herdecke.de/portal/seiten/abfuhrkalender-900000008-37460.html',
  /** Town-wide calendar PDF (all districts). */
  pdfUrl: 'https://www.ahe.de/downloads/abfallkalender/herdecke.pdf',
  /** AHE's Herdecke page. */
  providerUrl: 'https://www.ahe.de/abfuhrtermine/herdecke/',
} as const;
