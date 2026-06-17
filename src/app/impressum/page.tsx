import { contact, b64, emailFallback, phoneFallback } from '@/lib/site';
import { Contact } from '../components/Contact';
import { FlagStack } from '../components/FlagStack';

export const metadata = { title: 'Impressum — Digital.Herdecke' };

export default function ImpressumPage() {
  return (
    <section className="section prose">
      <FlagStack />
      <h1>Impressum</h1>

      <p>Angaben gemäß § 5 DDG</p>
      <p>
        {contact.name}
        <br />
        <Contact
          kind="address"
          enc={b64(`${contact.street}, ${contact.city}`)}
          fallback={`${contact.street}, ${contact.city}`}
        />
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <Contact kind="phone" enc={b64(contact.phone)} fallback={phoneFallback(contact.phone)} />
        <br />
        E-Mail: <Contact kind="email" enc={b64(contact.email)} fallback={emailFallback(contact.email)} />
      </p>

      <h2>Redaktionell verantwortlich</h2>
      <p>
        Verantwortlich für journalistisch-redaktionelle Inhalte gem. § 18 Abs. 2 MStV: {contact.name}, {contact.city}.
      </p>

      <h2>Haftung &amp; Unabhängigkeit</h2>
      <p>
        Digital.Herdecke ist ein unabhängiges, ehrenamtliches Bürger-Projekt und steht in <strong>keiner
        Verbindung zur Stadt Herdecke</strong> oder anderen Behörden. Die angezeigten Informationen werden
        automatisiert aus öffentlichen Datenquellen zusammengetragen und erfolgen nach bestem Wissen, aber{' '}
        <strong>ohne Gewähr</strong> auf Vollständigkeit, Richtigkeit und Aktualität. Maßgeblich sind allein die
        jeweiligen offiziellen Veröffentlichungen (u. a. Ratsinformationssystem der Stadt Herdecke, AHE, VRR, DWD,
        Schulministerium NRW).
      </p>
      <p>
        Für Inhalte externer Links ist ausschließlich deren jeweiliger Anbieter verantwortlich; zum Zeitpunkt der
        Verlinkung waren keine Rechtsverstöße erkennbar.
      </p>

      <p className="hint">Grundtext erstellt mit dem Impressum-Generator von e-recht24.de.</p>
    </section>
  );
}
