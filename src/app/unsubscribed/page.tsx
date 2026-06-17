import Link from 'next/link';

export default function UnsubscribedPage() {
  return (
    <section className="section prose">
      <h1>Abgemeldet</h1>
      <p>
        Du erhältst keine Benachrichtigungen mehr. Deine Daten wurden gelöscht. Schade, dass du gehst — du kannst
        dich jederzeit wieder <Link href="/">anmelden</Link>.
      </p>
    </section>
  );
}
