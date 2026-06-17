/**
 * Lightweight i18n: German is the source language (keys are the German strings),
 * with English and Ukrainian dictionaries. Missing entries fall back to German.
 * Dates/times/relative values are formatted via Intl using `bcp47` per locale.
 */
export const LOCALES = ['de', 'en', 'uk'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

export const LOCALE_NAMES: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  uk: 'Українська',
};

export const BCP47: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en-GB',
  uk: 'uk-UA',
};

type Dict = Record<string, string>;

const en: Dict = {
  // chrome
  Start: 'Home',
  Abfahrten: 'Departures',
  'Müll': 'Waste',
  Schulen: 'Schools',
  Sitzungen: 'Council',
  Datenschutz: 'Privacy',
  Impressum: 'Imprint',
  Hauptnavigation: 'Main navigation',
  'Herdecke — Startseite': 'Herdecke — Home',
  'Dunkles Design einschalten': 'Switch to dark mode',
  'Helles Design einschalten': 'Switch to light mode',
  Teilen: 'Share',
  'Link kopiert ✓': 'Link copied ✓',
  'Sprache / Language / Мова': 'Sprache / Language / Мова',
  'Ein unabhängiges Bürger-Projekt. Keine offizielle Seite der Stadt Herdecke.':
    "An independent citizens' project — not an official site of the City of Herdecke.",
  // home
  'Wetter, Verkehr, Ruhr-Pegel, Müllabfuhr und der Stadtrat — das Wichtigste aus Herdecke auf einen Blick.':
    'Weather, transit, the Ruhr water level, waste collection and the city council — the essentials of Herdecke at a glance.',
  'Stichwort-Alarm für den Stadtrat': 'Keyword alerts for the city council',
  'E-Mail-Benachrichtigungen werden bald freigeschaltet. Bis dahin findest du die Tagesordnungen unter':
    'Email notifications will be enabled soon. Until then you can find the agendas under',
  // dashboard
  '⠿ Kacheln am Griff anordnen': '⠿ Drag the handle to rearrange tiles',
  'Zurücksetzen': 'Reset',
  'Kachel verschieben': 'Move tile',
  // card titles + states
  Wetter: 'Weather',
  'Nächste Abfahrten': 'Next departures',
  'Müll-Wecker': 'Waste reminder',
  'Ruhr-Pegel': 'Ruhr water level',
  'Luftqualität': 'Air quality',
  'Schulferien NRW': 'School holidays (NRW)',
  'Nächste Ratssitzung': 'Next council meeting',
  'Zurzeit nicht verfügbar.': 'Currently unavailable.',
  'Station Herdecke': 'Herdecke station',
  'Luftqualitätsindex (Umweltbundesamt)': 'Air quality index (Umweltbundesamt)',
  'Mehr beim WSV →': 'More at WSV →',
  'Wasserstand der Ruhr (Pegel Hattingen)': 'Ruhr water level (Hattingen gauge)',
  'Alle Sitzungen →': 'All meetings →',
  'Ganze Tagesordnung →': 'Full agenda →',
  'Tagesordnung noch nicht veröffentlicht.': 'Agenda not published yet.',
  'Zurzeit keine Sitzung angekündigt.': 'No meeting announced at the moment.',
  'Zurzeit keine Abfahrten.': 'No departures right now.',
  'Haltestelle wählen →': 'Choose a stop →',
  // waste card
  'Trage deine Straße ein, um hier die nächste Abfuhr zu sehen.':
    'Enter your street to see the next collection here.',
  'Alle Termine →': 'All dates →',
  'Adresse eintragen →': 'Enter address →',
  'Keine Termine gefunden.': 'No dates found.',
  Restabfall: 'Residual waste',
  Restmüll: 'Residual waste',
  Bioabfall: 'Organic waste',
  Papier: 'Paper',
  'Gelber Sack': 'Yellow bag',
  'Gelbe Tonne': 'Yellow bin',
  // pages: shared
  'Quelle:': 'Source:',
  'Quellen:': 'Sources:',
  // muell page
  'Wann wird in deiner Straße abgeholt? Gib deine Adresse ein und sieh die nächsten Termine für Restabfall, Bioabfall, Papier und Gelben Sack.':
    'When is your street collected? Enter your address to see the next dates for residual, organic, paper and yellow-bag waste.',
  'Straße in Herdecke': 'Street in Herdecke',
  'Nr.': 'No.',
  'Abfuhrtermine anzeigen': 'Show collection dates',
  'Suche…': 'Searching…',
  '📍 Meinen Standort verwenden': '📍 Use my location',
  'Standort…': 'Locating…',
  'Meintest du:': 'Did you mean:',
  'Erinnerung aktivieren': 'Activate reminder',
  // abfahrten page
  'Wähle deine Haltestelle in Herdecke und sieh die nächsten Bus- und Bahnabfahrten in Echtzeit. Du kannst eine Haltestelle als Standard für die Startseite speichern.':
    'Pick your stop in Herdecke and see the next bus and rail departures in real time. You can save a stop as the default for the homepage.',
  'Haltestelle in Herdecke': 'Stop in Herdecke',
  'Als Standard für die Startseite': 'Set as homepage default',
  '✓ Als Standard gespeichert': '✓ Saved as default',
  // schulen page
  'Schulen & Ferien': 'Schools & holidays',
  'Alle Schulen in Herdecke und die kommenden Schulferien in Nordrhein-Westfalen.':
    'All schools in Herdecke and the upcoming school holidays in North Rhine-Westphalia.',
  'Nächste Schulferien (NRW)': 'Upcoming school holidays (NRW)',
  'Schulen in Herdecke': 'Schools in Herdecke',
  // sitzungen page
  'Kommende Ratssitzungen': 'Upcoming council meetings',
  'Rat, Ausschüsse und Gremien der Stadt Herdecke. Tagesordnungen erscheinen meist wenige Tage vor der Sitzung.':
    'Council, committees and bodies of the City of Herdecke. Agendas usually appear a few days before the meeting.',
  'Zurzeit sind keine kommenden Sitzungen angekündigt.': 'No upcoming meetings announced at the moment.',
};

const uk: Dict = {
  // chrome
  Start: 'Головна',
  Abfahrten: 'Відправлення',
  'Müll': 'Сміття',
  Schulen: 'Школи',
  Sitzungen: 'Засідання',
  Datenschutz: 'Конфіденційність',
  Impressum: 'Імпресум',
  Hauptnavigation: 'Головна навігація',
  'Herdecke — Startseite': 'Herdecke — Головна',
  'Dunkles Design einschalten': 'Увімкнути темну тему',
  'Helles Design einschalten': 'Увімкнути світлу тему',
  Teilen: 'Поділитися',
  'Link kopiert ✓': 'Посилання скопійовано ✓',
  'Sprache / Language / Мова': 'Sprache / Language / Мова',
  'Ein unabhängiges Bürger-Projekt. Keine offizielle Seite der Stadt Herdecke.':
    'Незалежний громадський проєкт — не є офіційним сайтом міста Гердекке.',
  // home
  'Wetter, Verkehr, Ruhr-Pegel, Müllabfuhr und der Stadtrat — das Wichtigste aus Herdecke auf einen Blick.':
    'Погода, транспорт, рівень води Рур, вивіз сміття та міська рада — найважливіше про Гердекке з одного погляду.',
  'Stichwort-Alarm für den Stadtrat': 'Сповіщення за ключовими словами про міськраду',
  'E-Mail-Benachrichtigungen werden bald freigeschaltet. Bis dahin findest du die Tagesordnungen unter':
    'Сповіщення електронною поштою скоро з’являться. До того часу порядки денні доступні в розділі',
  // dashboard
  '⠿ Kacheln am Griff anordnen': '⠿ Перетягуйте за маркер, щоб упорядкувати плитки',
  'Zurücksetzen': 'Скинути',
  'Kachel verschieben': 'Перемістити плитку',
  // card titles + states
  Wetter: 'Погода',
  'Nächste Abfahrten': 'Найближчі відправлення',
  'Müll-Wecker': 'Нагадування про сміття',
  'Ruhr-Pegel': 'Рівень води Рур',
  'Luftqualität': 'Якість повітря',
  'Schulferien NRW': 'Шкільні канікули (NRW)',
  'Nächste Ratssitzung': 'Наступне засідання ради',
  'Zurzeit nicht verfügbar.': 'Наразі недоступно.',
  'Station Herdecke': 'Станція Гердекке',
  'Luftqualitätsindex (Umweltbundesamt)': 'Індекс якості повітря (Umweltbundesamt)',
  'Mehr beim WSV →': 'Докладніше на WSV →',
  'Wasserstand der Ruhr (Pegel Hattingen)': 'Рівень води Рур (пост Гаттінген)',
  'Alle Sitzungen →': 'Усі засідання →',
  'Ganze Tagesordnung →': 'Повний порядок денний →',
  'Tagesordnung noch nicht veröffentlicht.': 'Порядок денний ще не опубліковано.',
  'Zurzeit keine Sitzung angekündigt.': 'Наразі засідань не оголошено.',
  'Zurzeit keine Abfahrten.': 'Наразі відправлень немає.',
  'Haltestelle wählen →': 'Обрати зупинку →',
  // waste card
  'Trage deine Straße ein, um hier die nächste Abfuhr zu sehen.':
    'Введіть свою вулицю, щоб побачити тут найближчий вивіз.',
  'Alle Termine →': 'Усі дати →',
  'Adresse eintragen →': 'Ввести адресу →',
  'Keine Termine gefunden.': 'Дати не знайдено.',
  Restabfall: 'Залишкові відходи',
  Restmüll: 'Залишкові відходи',
  Bioabfall: 'Біовідходи',
  Papier: 'Папір',
  'Gelber Sack': 'Жовтий мішок',
  'Gelbe Tonne': 'Жовтий контейнер',
  // pages: shared
  'Quelle:': 'Джерело:',
  'Quellen:': 'Джерела:',
  // muell page
  'Wann wird in deiner Straße abgeholt? Gib deine Adresse ein und sieh die nächsten Termine für Restabfall, Bioabfall, Papier und Gelben Sack.':
    'Коли вивозять сміття на вашій вулиці? Введіть адресу й перегляньте найближчі дати для залишкових, біо-, паперових відходів і жовтого мішка.',
  'Straße in Herdecke': 'Вулиця в Гердекке',
  'Nr.': '№',
  'Abfuhrtermine anzeigen': 'Показати дати вивозу',
  'Suche…': 'Пошук…',
  '📍 Meinen Standort verwenden': '📍 Використати моє місцезнаходження',
  'Standort…': 'Визначення…',
  'Meintest du:': 'Можливо, ви мали на увазі:',
  'Erinnerung aktivieren': 'Увімкнути нагадування',
  // abfahrten page
  'Wähle deine Haltestelle in Herdecke und sieh die nächsten Bus- und Bahnabfahrten in Echtzeit. Du kannst eine Haltestelle als Standard für die Startseite speichern.':
    'Оберіть свою зупинку в Гердекке й перегляньте найближчі відправлення автобусів і потягів у реальному часі. Зупинку можна зберегти як типову для головної сторінки.',
  'Haltestelle in Herdecke': 'Зупинка в Гердекке',
  'Als Standard für die Startseite': 'Зробити типовою для головної',
  '✓ Als Standard gespeichert': '✓ Збережено як типову',
  // schulen page
  'Schulen & Ferien': 'Школи та канікули',
  'Alle Schulen in Herdecke und die kommenden Schulferien in Nordrhein-Westfalen.':
    'Усі школи в Гердекке та найближчі шкільні канікули в Північному Рейні-Вестфалії.',
  'Nächste Schulferien (NRW)': 'Найближчі шкільні канікули (NRW)',
  'Schulen in Herdecke': 'Школи в Гердекке',
  // sitzungen page
  'Kommende Ratssitzungen': 'Майбутні засідання ради',
  'Rat, Ausschüsse und Gremien der Stadt Herdecke. Tagesordnungen erscheinen meist wenige Tage vor der Sitzung.':
    'Рада, комітети та органи міста Гердекке. Порядки денні зазвичай з’являються за кілька днів до засідання.',
  'Zurzeit sind keine kommenden Sitzungen angekündigt.': 'Наразі майбутніх засідань не оголошено.',
};

const translations: Record<Exclude<Locale, 'de'>, Dict> = { en, uk };

export function translate(locale: Locale, s: string): string {
  if (locale === 'de') return s;
  return translations[locale]?.[s] ?? s;
}
