import { contact, b64, emailFallback, phoneFallback } from '@/lib/site';
import { Contact } from '../components/Contact';

export const metadata = { title: 'Datenschutz — Digital.Herdecke' };

export default function DatenschutzPage() {
  return (
    <section className="section prose">
      <h1>Datenschutzerklärung</h1>

      <h2>1. Datenschutz auf einen Blick</h2>

      <h3>Allgemeine Hinweise</h3>
      <p>
        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
        passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
        identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter
        diesem Text aufgeführten Datenschutzerklärung.
      </p>

      <h3>Datenerfassung auf dieser Website</h3>
      <p>
        <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
        <br />
        Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie
        dem Abschnitt „Hinweis zur verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
      </p>
      <p>
        <strong>Wie erfassen wir Ihre Daten?</strong>
        <br />
        Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z. B. eine Adresse für den
        Müll-Wecker oder Stichwörter für Benachrichtigungen). Andere Daten werden automatisch beim Besuch der
        Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser,
        Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie
        diese Website betreten.
      </p>
      <p>
        <strong>Wofür nutzen wir Ihre Daten?</strong>
        <br />
        Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere
        Daten verarbeiten wir, um die von Ihnen angeforderten Funktionen bereitzustellen (z. B. Abfuhrtermine zu
        Ihrer Adresse). Eine Analyse Ihres Nutzerverhaltens findet <strong>nicht</strong> statt.
      </p>
      <p>
        <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong>
        <br />
        Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
        gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder
        Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können
        Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten
        Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht
        Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
      </p>

      <h2>2. Hosting</h2>
      <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter:</p>
      <h3>Externes Hosting</h3>
      <p>
        Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden,
        werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen,
        Meta- und Kommunikationsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine
        Website generiert werden, handeln. Das externe Hosting erfolgt im Interesse einer sicheren, schnellen und
        effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1
        lit. f DSGVO). Unser Hoster verarbeitet Ihre Daten nur insoweit, wie dies zur Erfüllung seiner
        Leistungspflichten erforderlich ist, und befolgt unsere Weisungen in Bezug auf diese Daten.
      </p>
      <p>Wir setzen folgenden Hoster ein:</p>
      <p>
        Vercel Inc.
        <br />
        340 S Lemon Ave #4133, Walnut, CA 91789, USA
      </p>
      <p>
        <strong>Auftragsverarbeitung:</strong> Wir haben einen Vertrag über Auftragsverarbeitung (AVV) zur Nutzung
        des oben genannten Dienstes geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich
        vorgeschriebenen Vertrag, der gewährleistet, dass dieser die personenbezogenen Daten unserer
        Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO verarbeitet.
      </p>

      <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>

      <h3>Datenschutz</h3>
      <p>
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
        personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser
        Datenschutzerklärung. Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der
        Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem
        Zugriff durch Dritte ist nicht möglich.
      </p>

      <h3>Hinweis zur verantwortlichen Stelle</h3>
      <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
      <p>
        {contact.name}
        <br />
        <Contact
          kind="address"
          enc={b64(`${contact.street}, ${contact.city}`)}
          fallback={`${contact.street}, ${contact.city}`}
        />
      </p>
      <p>
        Telefon: <Contact kind="phone" enc={b64(contact.phone)} fallback={phoneFallback(contact.phone)} />
        <br />
        E-Mail: <Contact kind="email" enc={b64(contact.email)} fallback={emailFallback(contact.email)} />
      </p>
      <p>
        Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen
        über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.
      </p>

      <h3>Speicherdauer</h3>
      <p>
        Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre
        personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein
        berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden
        Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung haben.
      </p>

      <h3>Allgemeine Hinweise zu den Rechtsgrundlagen</h3>
      <p>
        Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre personenbezogenen Daten auf
        Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. § 25 Abs. 1 TDDDG, soweit die Einwilligung den Zugriff auf
        Informationen im Endgerät umfasst. Die Einwilligung ist jederzeit widerrufbar. Sind Ihre Daten zur
        Vertragserfüllung oder vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage
        von Art. 6 Abs. 1 lit. b DSGVO. Soweit zur Erfüllung einer rechtlichen Verpflichtung erforderlich, auf
        Grundlage von Art. 6 Abs. 1 lit. c DSGVO. Die Verarbeitung kann ferner auf Grundlage unseres berechtigten
        Interesses nach Art. 6 Abs. 1 lit. f DSGVO erfolgen.
      </p>

      <h3>Empfänger von personenbezogenen Daten</h3>
      <p>
        Wir geben personenbezogene Daten nur dann an externe Stellen weiter, wenn dies im Rahmen der
        Funktionsbereitstellung erforderlich ist, wir gesetzlich dazu verpflichtet sind, ein berechtigtes Interesse
        nach Art. 6 Abs. 1 lit. f DSGVO besteht oder eine sonstige Rechtsgrundlage die Weitergabe erlaubt. Beim
        Einsatz von Auftragsverarbeitern geben wir Daten nur auf Grundlage eines gültigen Vertrags über
        Auftragsverarbeitung weiter.
      </p>

      <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
      <p>
        Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine
        bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten
        Datenverarbeitung bleibt vom Widerruf unberührt.
      </p>

      <h3>Widerspruchsrecht (Art. 21 DSGVO)</h3>
      <p style={{ textTransform: 'uppercase', fontSize: 13 }}>
        Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, haben Sie jederzeit
        das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, gegen die Verarbeitung Ihrer
        personenbezogenen Daten Widerspruch einzulegen; dies gilt auch für ein auf diese Bestimmungen gestütztes
        Profiling. Wenn Sie Widerspruch einlegen, werden wir Ihre betroffenen personenbezogenen Daten nicht mehr
        verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die
        Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung
        oder Verteidigung von Rechtsansprüchen (Widerspruch nach Art. 21 Abs. 1 DSGVO).
      </p>

      <h3>Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
      <p>
        Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer
        Aufsichtsbehörde zu, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes
        oder des Orts des mutmaßlichen Verstoßes. Das Beschwerderecht besteht unbeschadet anderweitiger
        verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe.
      </p>

      <h3>Recht auf Datenübertragbarkeit</h3>
      <p>
        Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags
        automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format
        aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen
        verlangen, erfolgt dies nur, soweit es technisch machbar ist.
      </p>

      <h3>Auskunft, Berichtigung und Löschung</h3>
      <p>
        Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft
        über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der
        Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
      </p>

      <h3>Recht auf Einschränkung der Verarbeitung</h3>
      <p>
        Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Hierzu
        können Sie sich jederzeit an uns wenden.
      </p>

      <h3>SSL- bzw. TLS-Verschlüsselung</h3>
      <p>
        Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-
        bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des
        Browsers von „http://" auf „https://" wechselt und am Schloss-Symbol in Ihrer Browserzeile.
      </p>

      <h2>4. Funktionen und Datenverarbeitung dieser Website</h2>

      <h3>Keine Cookies, kein Tracking</h3>
      <p>
        Wir setzen <strong>keine Tracking- oder Marketing-Cookies</strong> und keine Analyse-Werkzeuge (z. B. Google
        Analytics) ein. Es findet kein Profiling und keine Weitergabe zu Werbezwecken statt.
      </p>

      <h3>Lokale Speicherung im Browser (localStorage)</h3>
      <p>
        Damit Sie Einstellungen nicht erneut eingeben müssen, speichern wir Ihre zuletzt genutzte Adresse
        (Müll-Wecker), Ihre Standard-Haltestelle (Abfahrten), die Reihenfolge der Kacheln und die gewählte Sprache
        ausschließlich <strong>lokal in Ihrem Browser</strong> (localStorage). Diese Daten verlassen Ihr Gerät
        nicht und werden nicht an uns übertragen. Es handelt sich um eine unbedingt erforderliche, rein funktionale
        Speicherung (§ 25 Abs. 2 Nr. 2 TDDDG); ein Cookie-Banner ist hierfür nicht erforderlich. Sie können diese
        Daten jederzeit über die Einstellungen Ihres Browsers löschen.
      </p>

      <h3>Standortermittlung (Geolocation)</h3>
      <p>
        Beim Müll-Wecker können Sie optional „Meinen Standort verwenden". Nur auf diese ausdrückliche Aktion hin
        übermittelt Ihr Gerät einmalig Ihre Koordinaten an unseren Server. Wir verarbeiten diese ausschließlich, um
        per Reverse-Geocoding Ihre Straße zu bestimmen, und <strong>speichern die Koordinaten nicht</strong>.
        Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch das Auslösen der Funktion
        erteilen. Für das Reverse-Geocoding nutzen wir den Dienst <strong>Nominatim / OpenStreetMap</strong> (OpenStreetMap
        Foundation, St John&apos;s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes Königreich);
        dorthin werden ausschließlich die Koordinaten übermittelt, nicht Ihre IP-Adresse oder andere Daten.
      </p>

      <h3>Externe Datenquellen (serverseitig)</h3>
      <p>
        Die angezeigten Inhalte (Wetter und Warnungen, ÖPNV-Abfahrten, Ruhr-Pegel, Luftqualität, Abfuhrtermine,
        Schulen und Ferien sowie die Tagesordnungen des Stadtrats) werden von unserem Server bei den jeweiligen
        öffentlichen Stellen abgerufen (u. a. DWD/Bright Sky, VRR, PegelOnline/WSV, Umweltbundesamt, AHE,
        Schulministerium NRW, OpenHolidays, Ratsinformationssystem der Stadt Herdecke). <strong>Ihre IP-Adresse
        wird dabei nicht an diese Dritten übermittelt</strong>, da der Abruf serverseitig erfolgt.
      </p>

      <h3>E-Mail-Benachrichtigungen</h3>
      <p>
        E-Mail-Benachrichtigungen (Stadtrat-Stichwortalarm, Müll-Wecker-Erinnerung) sind derzeit{' '}
        <strong>deaktiviert</strong>. Sobald sie aktiviert werden, verarbeiten wir die von Ihnen angegebene
        E-Mail-Adresse sowie die zugehörigen Angaben (Stichwörter bzw. Straße/Hausnummer) auf Grundlage Ihrer
        Einwilligung im Double-Opt-In-Verfahren (Art. 6 Abs. 1 lit. a DSGVO). Als Auftragsverarbeiter kämen dabei
        ein E-Mail-Dienst (z. B. Resend) und eine Datenbank (z. B. Neon/PostgreSQL) zum Einsatz; eine Abmeldung ist
        jederzeit per Link in jeder E-Mail möglich.
      </p>

      <p className="hint">
        Grundtext erstellt mit dem Datenschutz-Generator von e-recht24.de; um die Funktionen dieser Website ergänzt.
      </p>
    </section>
  );
}
