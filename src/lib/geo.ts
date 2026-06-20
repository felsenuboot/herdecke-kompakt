/**
 * Shared browser-geolocation helpers for the "use my location" flows
 * (Müll-Wecker on the homepage card and the /muell page).
 */

/** Human-readable German message for a GeolocationPositionError, by its code. */
export function geoErrorMessage(code: number): string {
  switch (code) {
    case 1: // PERMISSION_DENIED
      return 'Standortzugriff wurde abgelehnt. Bitte erlaube ihn in den Einstellungen deines Browsers oder gib die Adresse manuell ein.';
    case 3: // TIMEOUT
      return 'Zeitüberschreitung bei der Standortbestimmung. Bitte versuche es erneut oder gib die Adresse manuell ein.';
    default: // POSITION_UNAVAILABLE (2) or unknown
      return 'Standort konnte gerade nicht bestimmt werden. Bitte gib die Adresse manuell ein.';
  }
}

/**
 * Sensible geolocation options for street-level reverse geocoding on phones.
 * High accuracy (GPS) is unnecessary here and is the main cause of timeouts on
 * iOS, so we ask for low accuracy with a longer timeout and a short cache window.
 */
export const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15_000,
  maximumAge: 600_000,
};
