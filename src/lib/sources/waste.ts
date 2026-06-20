/**
 * Waste collection (Abfuhrkalender) for Herdecke.
 *
 * The Ennepe-Ruhr waste authority AHE and the city both publish the calendar,
 * including a per-street iCal export — but only behind a dynamic AJAX form, so
 * there is no stable machine endpoint yet. For now we link the official sources;
 * per-street bin reminders are a planned follow-up (reverse-engineer the form,
 * then fold it into the alert/subscription system).
 */
import { city } from '../../config/city';

/** Official waste-calendar links for the active city (provider + calendar/PDF). */
export const wasteInfo = city.sources.waste.links;
