export const metadata = { title: 'Impressum — Ratswatch Herdecke' };

export default function ImpressumPage() {
  return (
    <section className="section prose">
      <h1>Impressum</h1>

      <p className="note">
        <strong>TODO (vor dem öffentlichen Betrieb ausfüllen):</strong> Angaben gemäß § 5 DDG (ehem. TMG). Trage
        deine vollständigen Kontaktdaten ein. Ohne ein gültiges Impressum darf der Dienst nicht öffentlich
        betrieben werden.
      </p>

      <p>
        [Name]
        <br />
        [Anschrift]
        <br />
        [E-Mail-Adresse]
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>[Name, Anschrift]</p>

      <h2>Haftungsausschluss</h2>
      <p>
        Ratswatch Herdecke ist ein unabhängiges, ehrenamtliches Bürger-Projekt und steht in keiner Verbindung zur
        Stadt Herdecke. Die Benachrichtigungen erfolgen automatisiert und nach bestem Wissen, aber ohne Gewähr auf
        Vollständigkeit oder Richtigkeit. Maßgeblich sind allein die offiziellen Veröffentlichungen im
        Ratsinformationssystem der Stadt Herdecke.
      </p>
    </section>
  );
}
