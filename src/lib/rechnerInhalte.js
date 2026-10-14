// Begleittext je Rechner: die drei Schritte, zwei bis drei Erklärabschnitte
// und die häufigen Fragen.
//
// Warum es das gibt: Zehn der elf Rechnerseiten bestanden aus Brotkrume,
// Überschrift, einem Absatz und der React-Insel — gemessen 379 Wörter auf
// /rechner/co2/, 469 auf /rechner/mieterstrom/. Für eine Seite, die über
// Suchmaschinen gefunden werden soll, ist das zu wenig indexierbarer Inhalt,
// und für jemanden, der das Ergebnis einordnen will, auch.
//
// REGELN für neue Einträge (dieselben wie für Artikel, siehe CLAUDE.md):
//  - Jede Zahl mit Quelle im Text. Nichts erfinden, nichts schätzen.
//  - Die Methodik steht bereits im Kopfkommentar der jeweiligen
//    src/lib/calculate<Name>.js — das hier ist die Lesefassung davon, keine
//    zweite Quelle. Ändert sich die Methodik, ändert sich beides.
//  - Höchstens 8–9 Fragen je Seite.
//  - Keine Leistungsversprechen ("Antwort in 24 Stunden", "Partnernetzwerk").
//  - Die Antworten müssen im sichtbaren Text gedeckt sein: Der FAQPage-
//    Strukturdatensatz entsteht aus genau dieser Liste, und Google verlangt
//    Übereinstimmung mit dem, was der Besucher sieht.
export const RECHNER_INHALTE = {
  photovoltaik: {
    schritte: [
      {
        titel: "Standort",
        text: "Die Postleitzahl bestimmt über PVGIS (EU Joint Research Centre) die Einstrahlung und die zwölf Monatserträge für genau diese Koordinaten. Ohne Angabe rechnen wir mit 950 kWh je kWp und Jahr — der Mitte der Praxisspanne von 850 bis 1.150. Das ist eine Größenordnung, keine Standortwahrheit.",
      },
      {
        titel: "Dach und Verbrauch",
        text: "Aus Dachform, Ausrichtung, Neigung und freier Fläche ergibt sich die mögliche Anlagengröße — gerechnet mit 4,7 m² je kWp auf dem Schrägdach und 12 m² je kWp auf dem aufgeständerten Flachdach (Quelle: ADAC beziehungsweise übereinstimmende PV-Ratgeber). Ihr Jahresverbrauch entscheidet dann, wie viel vom erzeugten Strom für Sie überhaupt wertvoll ist.",
      },
      {
        titel: "Ergebnis",
        text: "Anlagengröße, Jahresertrag, Autarkiegrad, Investition, Ersparnis und Amortisation, jeweils mit der Annahme dahinter. Nichts davon ist ein Angebot: Ein Installateur, der Ihr Dach gesehen hat, kann zu anderen Zahlen kommen.",
      },
    ],
    abschnitte: [
      {
        titel: "Was den Ertrag bestimmt",
        absaetze: [
          "Die Einstrahlung ist der größte Hebel und der einzige, den Sie nicht beeinflussen können. Zwischen Flensburg und Freiburg liegen rund 20 Prozent Jahresertrag. Deshalb fragt dieser Rechner als erstes die Postleitzahl ab und holt die gemessenen Werte für Ihre Koordinaten aus PVGIS, statt mit einem bundesweiten Mittelwert zu rechnen.",
          "Ausrichtung und Neigung wirken kleiner, als viele erwarten: Südwest oder Südost kosten gegenüber Süd etwa fünf Prozent, Ost oder West rund 15 Prozent. Erst eine Nordausrichtung fällt mit rund 29 Prozent des Südwerts deutlich ab (Quelle: photovoltaik.org). Eine flache oder sehr steile Neigung bleibt im Bereich von 88 bis 90 Prozent des Optimums.",
          "In die PVGIS-Abfrage gehen 14 Prozent Systemverluste ein — Kabel, Wechselrichter, Verschmutzung und Temperatur. Der ausgegebene Jahresertrag ist also bereits ein Nettowert und keine Modulnennleistung auf dem Papier.",
        ],
      },
      {
        titel: "Warum Autarkiegrad und Eigenverbrauchsquote nicht dasselbe sind",
        absaetze: [
          "Der Autarkiegrad ist der Anteil Ihres Verbrauchs, den die Anlage deckt. Die Eigenverbrauchsquote ist der Anteil des erzeugten Stroms, den Sie selbst nutzen. Beide bewegen sich mit der Anlagengröße in entgegengesetzte Richtungen: Eine große Anlage deckt mehr von Ihrem Bedarf, produziert aber gleichzeitig mehr Überschuss, den Sie einspeisen statt zu nutzen.",
          "Eine Anlage kann gleichzeitig 65 Prozent Autarkie und 45 Prozent Eigenverbrauchsquote haben. Der Ergebnis-Screen zeigt deshalb beide Balken übereinander, mit demselben orangen Mittelstück: dem selbst genutzten Solarstrom. Die Kennlinie dahinter nutzt die vom ADAC kommunizierten Spannen von 30 bis 55 Prozent ohne Speicher und bis zu 85 Prozent mit Speicher als Ober- und Untergrenze.",
        ],
      },
      {
        titel: "Woher die Geldbeträge kommen",
        absaetze: [
          "Selbst verbrauchter Strom wird mit 37,00 ct je Kilowattstunde bewertet (BDEW-Strompreisanalyse, Referenzhaushalt 3.500 kWh, Stand April 2026), eingespeister Strom mit 7,70 ct für Anlagen bis 10 kWp (Bundesnetzagentur, § 49 EEG, Inbetriebnahme 1.8.2026 bis 31.1.2027). Größere Anlagen bekommen den niedrigeren Satz nur für den Anteil oberhalb von 10 kWp — 6,66 ct bis 40 kWp, 5,44 ct darüber.",
          "Die Investition rechnet mit 1.300 € je kWp. Das ist das obere Ende der Fraunhofer-ISE-Spanne und die Mitte realer Anbieterpreise inklusive Marge. Brutto entspricht netto: Anlagen bis 30 kWp auf Wohngebäuden sind seit dem 1.1.2023 von der Umsatzsteuer befreit (§ 12 Abs. 3 UStG).",
        ],
      },
    ],
    faq: [
      {
        frage: "Sind die Ergebnisse ein Angebot?",
        antwort: "Nein. Der Rechner liefert eine fachliche Größenordnung aus öffentlichen Datenquellen und durchschnittlichen Marktpreisen. Er kennt weder Ihre Dachstatik noch Verschattung durch Nachbarbäume noch die Länge der Kabelwege bis zum Zählerschrank. Ein Angebot für Ihr konkretes Dach kann davon abweichen.",
      },
      {
        frage: "Welche Datenquellen stecken dahinter?",
        antwort: "Einstrahlung und Monatserträge von PVGIS (EU Joint Research Centre), Strompreis vom BDEW, Einspeisevergütung von der Bundesnetzagentur, Systemkosten und Volllaststunden vom Fraunhofer ISE, Autarkiespannen und Wechselrichterkosten vom ADAC, Speicherdimensionierung von der HTW Berlin. Jede Konstante steht mit Wert, Quelle und Stand auf der Methodik-Seite.",
      },
      {
        frage: "Warum weicht das Ergebnis von anderen Rechnern ab?",
        antwort: "Weil viele PV-Rechner mit Südausrichtung, idealer Neigung und sehr hohem Eigenverbrauch rechnen. Dieser Rechner nutzt die gemessene Einstrahlung für Ihren Standort und Ihre Angaben zu Dach und Verbrauch. Wer eine Amortisation von fünf Jahren sehen möchte, findet sie anderswo.",
      },
      {
        frage: "Berücksichtigt der Rechner steigende Strompreise?",
        antwort: "Nur in der 25-Jahres-Projektion, und dort mit vorsichtigen 2 Prozent pro Jahr. Der prominent angezeigte Jahreswert für Ersparnis und Amortisation rechnet ausschließlich mit dem heutigen Strompreis. Eine Preissteigerung in die Hauptzahl zu schmuggeln würde sie optimistischer aussehen lassen, als sie belegbar ist.",
      },
      {
        frage: "Was passiert mit meinen Eingaben?",
        antwort: "Die Berechnung läuft in Ihrem Browser. An PVGIS geht nur die Koordinate, die aus Ihrer Postleitzahl folgt, über unsere eigene Serverfunktion — nicht Ihre IP-Adresse an einen Dritten. Erst wenn Sie am Ende ausdrücklich ein Beratungsgespräch anfragen, werden die Angaben übermittelt.",
      },
    ],
  },

  kombi: {
    schritte: [
      {
        titel: "Anlage und Haushalt",
        text: "Dachfläche und Jahresverbrauch legen die Ausgangslage fest — dieselben Formeln wie im Photovoltaik-Rechner, damit beide Werkzeuge nicht auseinanderlaufen.",
      },
      {
        titel: "Verbraucher zuschalten",
        text: "Wärmepumpe, E-Auto und Speicher lassen sich einzeln dazunehmen. Jede Kombination verändert den Jahresverbrauch und damit, wie viel vom erzeugten Strom im Haus bleibt.",
      },
      {
        titel: "Szenarien vergleichen",
        text: "Statt einer Zahl zeigt der Rechner sechs Szenarien nebeneinander: ohne PV, PV allein, PV mit Speicher, PV mit E-Auto, PV mit Wärmepumpe und alles zusammen — je mit Ertrag, Eigenverbrauch, Autarkie, Investition und Amortisation.",
      },
    ],
    abschnitte: [
      {
        titel: "Warum ein Vergleich statt einer Zahl",
        absaetze: [
          "Die Frage bei Wärmepumpe und E-Auto lautet selten, ob sich die PV-Anlage lohnt, sondern wie stark sich das Bild verschiebt, wenn ein großer Verbraucher dazukommt. Eine einzelne Kennzahl beantwortet das nicht. Deshalb rechnet dieser Rechner mehrere Ausbaustufen parallel durch und stellt sie nebeneinander.",
          "Der Effekt ist strukturell: Ein zusätzlicher Verbraucher erhöht den Jahresverbrauch, und damit steigt der Anteil des Solarstroms, der im Haus bleibt, statt für 7,70 ct ins Netz zu gehen. Jede so zusätzlich selbst verbrauchte Kilowattstunde ist rund 29 ct mehr wert — die Differenz zwischen Bezugspreis und Einspeisevergütung.",
        ],
      },
      {
        titel: "Welche Annahmen für die Verbraucher gelten",
        absaetze: [
          "Für die Wärmepumpe rechnet das Modell mit 3.000 kWh zusätzlichem Jahresstrombedarf. Für das E-Auto hängt der Zuschlag vom gewählten Fahrprofil ab. Beide Werte fließen nur ein, wenn das Gerät tatsächlich vorhanden ist: Die Auswahl „geplant“ zählt bewusst nicht mit, denn erst die Anschaffung erhöht den Verbrauch.",
          "Autarkiegrad und Eigenverbrauch kommen aus derselben Kennlinie wie im Hauptrechner (ADAC-Spannen, 30 bis 55 Prozent ohne Speicher, bis 85 Prozent mit Speicher). Der Kombi-Rechner bringt hier keine eigenen Formeln mit, sondern nutzt die des Photovoltaik-Rechners — sonst könnten dieselben Eingaben in zwei Werkzeugen verschiedene Ergebnisse liefern.",
        ],
      },
      {
        titel: "In welcher Reihenfolge ausbauen?",
        absaetze: [
          "Wenn Budget oder Dachfläche nicht für alles auf einmal reichen, ist die Reihenfolge nicht beliebig. Wirtschaftlich am dankbarsten ist der Verbraucher, der große Strommengen zu Zeiten abnimmt, in denen die Anlage ohnehin produziert — beim E-Auto lässt sich das über eine überschussgeführte Wallbox steuern, bei der Wärmepumpe über die Vorlauftemperatur und einen Pufferspeicher.",
          "Der Speicher steht in dieser Reihenfolge meist hinten. Er erzeugt keine Kilowattstunde zusätzlich, sondern verschiebt vorhandene in der Zeit, und kostet dafür 400 € je nutzbarer Kilowattstunde. Ein zusätzlicher echter Verbraucher hebt den Eigenverbrauch in der Regel günstiger als ein Speicher gleicher Investitionssumme. Der Szenarienvergleich macht genau das sichtbar: Achten Sie darauf, wie sich Amortisation und Autarkie zwischen „PV + Speicher“ und „PV + E-Auto“ unterscheiden.",
          "Was der Vergleich nicht leisten kann: Er kennt Ihr Lastprofil nicht. Ob die Wärmepumpe tatsächlich mittags läuft oder nachts, entscheidet über den realen Eigenverbrauch stärker als jede Anlagengröße. Die zugrunde liegende Kennlinie ist eine Näherung mit vier Stützpunkten, keine viertelstündliche Simulation.",
        ],
      },
    ],
    faq: [
      {
        frage: "Lohnt sich eine größere Anlage, wenn Wärmepumpe und E-Auto dazukommen?",
        antwort: "In der Tendenz ja, weil ein höherer Eigenverbrauch jede Kilowattstunde wertvoller macht. Die Grenze setzt das Dach: Der Rechner leitet die mögliche Anlagengröße aus Ihrer freien Fläche ab und deckelt sie bei 30 kWp.",
      },
      {
        frage: "Rechnet der Vergleich die Anschaffung von Wärmepumpe und E-Auto mit?",
        antwort: "Nein. Verglichen wird die Wirtschaftlichkeit der Photovoltaik-Anlage unter verschiedenen Verbrauchssituationen. Die Investition in Wärmepumpe oder Fahrzeug ist eine eigene Entscheidung mit eigenen Förderungen und gehört nicht in diese Rechnung.",
      },
      {
        frage: "Warum unterscheidet sich die Amortisation je Szenario?",
        antwort: "Weil sich zwei Größen gleichzeitig ändern: die Investition (ein Speicher kostet zusätzlich) und die jährliche Ersparnis (mehr Eigenverbrauch bringt mehr). Welche Richtung überwiegt, hängt von Ihrem Verbrauch und der Anlagengröße ab — genau das macht der Vergleich sichtbar.",
      },
      {
        frage: "Gilt die Rechnung auch für eine bestehende Anlage?",
        antwort: "Teilweise. Die Ertrags- und Eigenverbrauchswerte stimmen, die Amortisation bezieht sich aber auf eine Neuanschaffung zu heutigen Preisen und zur heute geltenden Einspeisevergütung. Für eine ältere Anlage mit höherer Vergütung passt sie nicht.",
      },
    ],
  },

  rendite: {
    schritte: [
      {
        titel: "Anlage beschreiben",
        text: "Anlagengröße, Investition und Jahresverbrauch bestimmen Ertrag und Eigenverbrauch — dieselbe Grundlage wie im Photovoltaik-Rechner.",
      },
      {
        titel: "Vergleichsanlage wählen",
        text: "Als Messlatte dient eine risikoarme Geldanlage mit fester Verzinsung. Der Zinssatz ist frei einstellbar, damit Sie Ihre eigene Alternative einsetzen können statt einer unterstellten.",
      },
      {
        titel: "Verlauf lesen",
        text: "Das Ergebnis ist eine Jahrestabelle über 20 Jahre: Cashflow je Jahr, kumulierter Überschuss und Rendite — nicht nur ein Endwert, sondern der Weg dorthin.",
      },
    ],
    abschnitte: [
      {
        titel: "Amortisation und Rendite beantworten verschiedene Fragen",
        absaetze: [
          "Die Amortisationszeit sagt, wann das eingesetzte Geld wieder da ist. Sie sagt nichts darüber, was danach passiert — und die Anlage läuft typischerweise deutlich länger. Die Rendite stellt die andere Frage: Was bringt das Kapital über die gesamte Laufzeit, verglichen mit der Alternative, es einfach liegen zu lassen?",
          "Dieser Rechner folgt derselben 25-Jahres-Projektion wie der Hauptrechner, zeigt sie aber als Jahrestabelle statt als kumulierten Endwert. Eingerechnet sind 0,5 Prozent Moduldegradation pro Jahr (NREL-Feldstudie), rund ein Prozent der Investitionssumme als jährliche Betriebskosten und ein einmaliger Wechselrichtertausch im 13. Jahr mit 1.000 bis 3.000 € (ADAC).",
        ],
      },
      {
        titel: "Was die Rechnung nicht leisten kann",
        absaetze: [
          "Die Strompreissteigerung von 2 Prozent pro Jahr ist eine Annahme, keine Quelle — bewusst vorsichtig gewählt. Sie ist der empfindlichste Hebel der gesamten Projektion: Wer mit 4 Prozent rechnet, kommt auf deutlich bessere Zahlen, und genau deshalb steht der Wert offen da, statt in der Formel zu verschwinden.",
          "Nicht enthalten sind Finanzierungskosten. Wer die Anlage über einen Kredit bezahlt, muss Zins und Tilgung gegen den Cashflow stellen. Ebenfalls nicht enthalten ist ein Restwert der Anlage nach der betrachteten Laufzeit.",
        ],
      },
      {
        titel: "Welche Stellschrauben das Ergebnis wirklich bewegen",
        absaetze: [
          "Drei Größen entscheiden über die Rendite, und sie sind unterschiedlich gut beeinflussbar. Der Eigenverbrauchsanteil ist der stärkste Hebel: Jede selbst genutzte Kilowattstunde ist 37,00 ct wert, jede eingespeiste 7,70 ct. Wer den Eigenverbrauch von 30 auf 50 Prozent hebt, verändert das Ergebnis mehr als jede Preisverhandlung beim Installateur.",
          "Der Einkaufspreis je kWp ist der zweite. Der Rechner setzt 1.300 € an, das obere Ende der Fraunhofer-ISE-Spanne. Wer günstiger einkauft, verschiebt die gesamte Kurve nach oben — deshalb lohnt sich das Einholen mehrerer Angebote mehr als das Optimieren der letzten Modulreihe.",
          "Der dritte ist die unterstellte Strompreissteigerung. Sie ist die unsicherste der drei und gleichzeitig diejenige, mit der sich das Ergebnis am leichtesten schönrechnen lässt. Aus diesem Grund steht sie im Rechner offen und vorsichtig bei 2 Prozent, statt in der Formel zu verschwinden.",
        ],
      },
    ],
    faq: [
      {
        frage: "Mit welcher Rendite darf ich rechnen?",
        antwort: "Das hängt vor allem vom Eigenverbrauchsanteil ab, denn selbst genutzter Strom ist mit 37,00 ct rund fünfmal so viel wert wie eingespeister mit 7,70 ct. Der Rechner gibt den Wert für Ihre Eingaben aus, statt eine allgemeine Zahl zu nennen.",
      },
      {
        frage: "Ist die Rendite steuerfrei?",
        antwort: "Für Anlagen bis 30 kWp auf Wohngebäuden sind Einspeiseerlöse und Eigenverbrauch nach § 3 Nr. 72 EStG einkommensteuerfrei. Der Rechner setzt keine Steuer an. Bei größeren Anlagen oder gewerblicher Nutzung gilt das nicht — dann ist eine steuerliche Beratung angebracht.",
      },
      {
        frage: "Warum wird mit 20 Jahren gerechnet und nicht mit 25?",
        antwort: "Weil die Einspeisevergütung für 20 Jahre ab Inbetriebnahme festgeschrieben ist. Was danach kommt, ist offen — die Anlage läuft technisch weiter, aber zu welchem Erlös der Überschuss dann vergütet wird, lässt sich heute nicht belegen.",
      },
      {
        frage: "Wie wird der Vergleich mit Festgeld berechnet?",
        antwort: "Die gleiche Investitionssumme wird mit dem von Ihnen eingestellten Zinssatz über dieselbe Laufzeit verzinst. Der Vergleich ist bewusst schlicht: Er soll eine Größenordnung liefern, keine Anlageberatung ersetzen.",
      },
      {
        frage: "Wie wirkt sich eine Finanzierung auf die Rendite aus?",
        antwort: "Der Rechner unterstellt eine Zahlung aus Eigenmitteln. Bei einer Finanzierung sind Zins und Tilgung gegen den jährlichen Cashflow zu stellen. Liegt der Kreditzins unter der errechneten Rendite, verbessert die Finanzierung die Eigenkapitalrendite; liegt er darüber, verschlechtert sie sie.",
      },
      {
        frage: "Was ist nach Ablauf der 20 Jahre?",
        antwort: "Die Anlage läuft technisch weiter, nur die feste Einspeisevergütung endet. Der Eigenverbrauch bleibt in vollem Umfang wertvoll, für den Überschuss braucht es dann eine Anschlusslösung. Weil sich deren Konditionen heute nicht belegen lassen, endet die Betrachtung bei 20 Jahren.",
      },
    ],
  },

  speicher: {
    schritte: [
      {
        titel: "Anlage und Verbrauch",
        text: "Anlagengröße und Jahresverbrauch bestimmen, wie viel Überschuss überhaupt anfällt — ohne Überschuss gibt es nichts zu speichern.",
      },
      {
        titel: "Speichergröße wählen",
        text: "Als Ausgangspunkt schlägt der Rechner 1,2 kWh je 1.000 kWh Jahresverbrauch vor (HTW Berlin, Unabhängigkeitsrechner-FAQ). Der Wert ist frei änderbar.",
      },
      {
        titel: "Ergebnis einordnen",
        text: "Mehr-Eigenverbrauch in Kilowattstunden, jährliche Zusatzersparnis in Euro und die Amortisation des Speichers allein — nicht die der gesamten Anlage.",
      },
    ],
    abschnitte: [
      {
        titel: "Was ein Speicher wirtschaftlich tatsächlich tut",
        absaetze: [
          "Ein Speicher erzeugt keinen Strom. Er verschiebt Strom, der sonst für 7,70 ct ins Netz gegangen wäre, in eine Stunde, in der Sie ihn brauchen und sonst für 37,00 ct gekauft hätten. Der Mehrwert je zusätzlich selbst verbrauchter Kilowattstunde ist also die Differenz der beiden Preise, rund 29 ct — nicht der volle Strompreis.",
          "Daraus folgt die gesamte Rechnung: Amortisation gleich Speicherinvestition geteilt durch Mehr-Eigenverbrauch mal dieser Differenz. Der Mehr-Eigenverbrauch kommt aus derselben Autarkie-Kennlinie wie der Hauptrechner, einmal ohne und einmal mit Speicher gerechnet. Eine eigene Faustregel benutzt dieser Rechner bewusst nicht — eine solche wich an anderer Stelle bereits um den Faktor 1,57 ab.",
          "Gedeckelt wird der Effekt durch das, was die Anlage überhaupt erzeugt: Ein großer Speicher an einer kleinen Anlage kann nicht mehr zwischenspeichern, als an Überschuss anfällt.",
        ],
      },
      {
        titel: "Warum die Antwort oft ernüchternd ausfällt",
        absaetze: [
          "Mit 400 € je nutzbarer Kilowattstunde (Mitte der Marktpreisspanne von 300 bis 470 € für LiFePO₄-Systeme, Stand 2026) liegt die Amortisation eines Speichers häufig nahe an seiner erwarteten Lebensdauer oder darüber. Der Rechner beschönigt das nicht und weist aus, ob sich der Speicher innerhalb seiner Lebensdauer trägt.",
          "Es gibt gute Gründe für einen Speicher jenseits der Rendite — Notstromfähigkeit, Unabhängigkeit vom Netz, die Vorbereitung auf ein E-Auto. Dieser Rechner beantwortet ausschließlich die wirtschaftliche Frage.",
        ],
      },
      {
        titel: "Wann sich ein Speicher trotz der Zahlen lohnen kann",
        absaetze: [
          "Die Rechnung dieses Werkzeugs ist rein wirtschaftlich. Es gibt Gründe für einen Speicher, die darin nicht vorkommen und trotzdem zählen: eine notstromfähige Anlage, die bei Netzausfall weiterläuft; die Vorbereitung auf ein E-Auto oder eine Wärmepumpe, die den Eigenverbrauch später ohnehin anheben; oder schlicht der Wunsch nach Unabhängigkeit vom Versorger.",
          "Wirtschaftlich verändert sich das Bild vor allem dann, wenn der Verbrauch steigt. Ein Speicher an einem Haushalt mit 3.000 kWh Jahresverbrauch sieht anders aus als derselbe Speicher bei 8.000 kWh mit Wärmepumpe. Wer den Ausbau plant, sollte den Rechner mit dem künftigen Verbrauch füttern, nicht mit dem heutigen.",
          "Umgekehrt gilt: Ein Speicher, der deutlich größer ist als der typische Tagesüberschuss, steht einen erheblichen Teil des Jahres ungenutzt herum und verlängert die Amortisation, ohne die Autarkie nennenswert zu heben. Die Faustregel von 1,2 kWh je 1.000 kWh Jahresverbrauch ist eher eine Obergrenze als ein Mindestwert.",
        ],
      },
    ],
    faq: [
      {
        frage: "Wie groß sollte der Speicher sein?",
        antwort: "Als Ausgangspunkt gilt etwa 1,2 kWh je 1.000 kWh Jahresverbrauch (HTW Berlin). Größer heißt nicht automatisch besser: Was über den typischen Tagesüberschuss hinausgeht, bleibt einen großen Teil des Jahres ungenutzt und verlängert die Amortisation.",
      },
      {
        frage: "Warum erreiche ich mit Speicher keine 100 Prozent Autarkie?",
        antwort: "Weil im Winter schlicht zu wenig Sonne da ist, um den Bedarf zu decken, und ein saisonaler Speicher in Haushaltsgröße nicht existiert. Die HTW Berlin weist ausdrücklich darauf hin, dass volle Autarkie mit sinnvoll dimensionierten Speichern nicht erreichbar ist; der ADAC nennt bis zu 85 Prozent als Obergrenze.",
      },
      {
        frage: "Zählt die Speicherinvestition in die Steuerbefreiung?",
        antwort: "Der Nullsteuersatz nach § 12 Abs. 3 UStG gilt auch für den Speicher, wenn er zusammen mit einer Anlage auf einem Wohngebäude angeschafft wird. Der Rechner setzt die Kosten deshalb brutto gleich netto an.",
      },
      {
        frage: "Wie lange hält ein Speicher?",
        antwort: "Hersteller geben für LiFePO₄-Systeme üblicherweise Garantien über eine bestimmte Zahl von Ladezyklen oder über zehn Jahre. Der Rechner vergleicht die errechnete Amortisation mit dieser Größenordnung und sagt, ob sie darunter liegt.",
      },
      {
        frage: "Warum liefert der große Rechner leicht andere Werte?",
        antwort: "Sollte er nicht. Beide leiten den Mehr-Eigenverbrauch aus derselben Funktion ab; über einen Prüflauf mit 216 Kombinationen beträgt die größte Abweichung 1 kWh und stammt aus der Rundung.",
      },
    ],
  },

  balkonkraftwerk: {
    schritte: [
      {
        titel: "Gerät beschreiben",
        text: "Modulleistung und Ausrichtung des Balkons oder der Terrasse bestimmen den Ertrag. Die Ausrichtungs- und Neigungsfaktoren sind dieselben wie im Photovoltaik-Rechner.",
      },
      {
        titel: "Verbrauch einschätzen",
        text: "Entscheidend ist die Grundlast, die ohnehin permanent läuft — Kühlschrank, Router, Standby. Was davon der Balkon deckt, ersetzt teuren Netzstrom.",
      },
      {
        titel: "Amortisation lesen",
        text: "Anschaffungspreis geteilt durch jährliche Ersparnis. Bei Steckersolargeräten fällt das Ergebnis meist deutlich kürzer aus als bei einer Dachanlage.",
      },
    ],
    abschnitte: [
      {
        titel: "Was seit dem Solarpaket I gilt",
        absaetze: [
          "Die Einspeiseleistung des Wechselrichters ist auf 800 Watt begrenzt. Diese Grenze gilt seit der EEG-Änderung im Rahmen des Solarpakets I vom 16. Mai 2024. Anlagen bis zu dieser Leistung sind unkompliziert anmeldefähig: Es genügt die Eintragung im Marktstammdatenregister, eine gesonderte Anmeldung beim Netzbetreiber entfällt.",
          "Die installierte Modulleistung darf die 800 Watt deutlich überschreiten. Das ist kein Schlupfloch, sondern sinnvoll: Module erreichen ihre Nennleistung nur unter Normbedingungen, und mehr Modulfläche hebt vor allem den Ertrag an trüben Tagen und in den Randstunden — also genau dann, wenn die Grundlast trotzdem läuft.",
        ],
      },
      {
        titel: "Warum der Eigenverbrauchsanteil so hoch angesetzt ist",
        absaetze: [
          "Der Rechner unterstellt, dass rund 85 Prozent des erzeugten Stroms im Haushalt bleiben. Das ist eine dokumentierte eigene Annahme und keine externe Quelle — sie folgt der Überlegung, dass 800 Watt selten über der Grundlast eines bewohnten Haushalts liegen. Wer tagsüber nie zu Hause ist und alle größeren Geräte abends nutzt, liegt darunter.",
          "Für den eingespeisten Rest setzt der Rechner keinen Erlös an. Für Steckersolargeräte lohnt der Aufwand einer Einspeisevergütung in der Regel nicht, und ohne entsprechenden Vertrag verschenkt man den Überschuss ans Netz.",
        ],
      },
      {
        titel: "Was den Ertrag am Balkon begrenzt",
        absaetze: [
          "Der größte Unterschied zur Dachanlage ist die Neigung. Senkrecht an der Brüstung montierte Module stehen in etwa 90 Grad und liegen damit deutlich unter dem Optimum von 30 bis 35 Grad — im Sommer, wenn die Sonne hoch steht, kostet das spürbar Ertrag. Eine leichte Aufständerung, wo sie zulässig ist, holt einen Teil davon zurück.",
          "Der zweite Faktor ist Verschattung. Ein Balkon liegt oft in einer Häuserschlucht, und schon eine teilverschattete Zelle zieht die Leistung des gesamten Strangs nach unten. Wer die Wahl zwischen zwei Montageorten hat, sollte den mit der längeren unverschatteten Zeit nehmen, auch wenn die Ausrichtung dort schlechter ist.",
          "Der dritte ist der eigene Tagesablauf. Weil der Rechner unterstellt, dass rund 85 Prozent des Stroms im Haushalt bleiben, hängt die Ersparnis daran, dass tatsächlich eine Grundlast läuft. In einem Haushalt, der tagsüber vollständig leer steht und abends alle Geräte anwirft, fällt der Anteil niedriger aus — und damit die Ersparnis.",
        ],
      },
    ],
    faq: [
      {
        frage: "Brauche ich die Zustimmung des Vermieters?",
        antwort: "Für die Montage an Balkonbrüstung oder Fassade ist grundsätzlich die Zustimmung nötig, weil in die Bausubstanz oder das Erscheinungsbild eingegriffen wird. Steckersolargeräte sind inzwischen gesetzlich privilegiert; die konkrete Ausgestaltung bleibt eine Rechtsfrage, die dieser Rechner nicht beantwortet.",
      },
      {
        frage: "Reicht eine normale Schuko-Steckdose?",
        antwort: "Technisch funktioniert das und ist weit verbreitet. Der VDE empfiehlt eine spezielle Einspeisesteckdose. Im Zweifel klärt eine Elektrofachkraft, ob der Stromkreis dafür geeignet ist.",
      },
      {
        frage: "Warum amortisiert sich ein Balkonkraftwerk schneller als eine Dachanlage?",
        antwort: "Weil die Anschaffung im niedrigen dreistelligen bis niedrigen vierstelligen Bereich liegt und fast der gesamte erzeugte Strom direkt teuren Netzstrom ersetzt, statt für 7,70 ct eingespeist zu werden. Die absolute Ersparnis bleibt trotzdem klein — es geht um einen Bruchteil des Haushaltsverbrauchs.",
      },
      {
        frage: "Muss ich das Gerät anmelden?",
        antwort: "Ja, im Marktstammdatenregister der Bundesnetzagentur. Seit dem Solarpaket I ist das der einzige verpflichtende Schritt für Geräte bis 800 Watt Einspeiseleistung.",
      },
      {
        frage: "Lohnt sich ein Speicher am Balkonkraftwerk?",
        antwort: "Wirtschaftlich in der Regel nicht. Der Speicher kostet oft mehr als das Gerät selbst und kann nur den kleinen Überschuss von maximal 800 Watt Einspeiseleistung aufnehmen. Die Amortisation verlängert sich dadurch meist deutlich.",
      },
      {
        frage: "Was passiert bei einem Umzug?",
        antwort: "Steckersolargeräte sind nicht fest mit dem Gebäude verbunden und lassen sich mitnehmen. Zu ändern ist dann der Eintrag im Marktstammdatenregister, weil sich der Standort ändert.",
      },
    ],
  },

  co2: {
    schritte: [
      {
        titel: "Anlage angeben",
        text: "Anlagengröße und Standortqualität bestimmen den Jahresertrag. Gerechnet wird mit denselben Ertragswerten wie im Photovoltaik-Rechner.",
      },
      {
        titel: "Einsparung berechnen",
        text: "Jede erzeugte Kilowattstunde ersetzt eine aus dem Netzstrommix. Der Rechner multipliziert den Ertrag mit dem Emissionsfaktor des deutschen Strommixes.",
      },
      {
        titel: "Einordnen",
        text: "Das Ergebnis erscheint als Kilogramm pro Jahr, über 25 Jahre und übersetzt in Vergleichsgrößen — Bäume, Autokilometer, Bahnfahrten.",
      },
    ],
    abschnitte: [
      {
        titel: "Die Rechnung dahinter",
        absaetze: [
          "Grundlage ist der Emissionsfaktor des deutschen Strommixes von 344 Gramm CO₂ je Kilowattstunde (Umweltbundesamt, Jahreswert 2025). Der Betrieb einer Photovoltaik-Anlage stößt praktisch kein CO₂ aus, also gilt jede erzeugte Kilowattstunde als vermiedene Netzstrom-Kilowattstunde — unabhängig davon, ob Sie sie selbst verbrauchen oder einspeisen.",
          "Die Vergleichsgrößen sind gekennzeichnete Annahmen: Ein Baum bindet rund 12,5 kg CO₂ im Jahr (ADAC), ein Mittelklasse-Benziner mit etwa 6 l/100 km stößt ungefähr 150 g je Kilometer aus, der Fernverkehrszug laut Umweltbundesamt etwa 30 g je Personenkilometer. Sie machen die Zahl greifbar, sind aber keine Bilanzierung.",
        ],
      },
      {
        titel: "Was der Rechner bewusst weglässt",
        absaetze: [
          "Nicht enthalten ist die Herstellung der Module, die sogenannte graue Energie. Sie ist real, aber nach heutigem Stand innerhalb weniger Jahre durch die Erzeugung ausgeglichen; danach arbeitet die Anlage klimapositiv. Wer die vollständige Bilanz sehen will, findet sie im Ratgeber-Artikel zur Ökobilanz.",
          "Ebenfalls nicht enthalten ist die Veränderung des Strommixes über die Laufzeit. Wird der Netzstrom sauberer, sinkt der Vorteil je Kilowattstunde. Die 25-Jahres-Zahl schreibt den heutigen Faktor fort und ist deshalb eine Obergrenze, kein Prognosewert.",
        ],
      },
      {
        titel: "Was die Zahl praktisch bedeutet",
        absaetze: [
          "Eine typische Hausdachanlage mit 8 kWp erzeugt in Deutschland rund 7.600 kWh im Jahr. Mit dem Emissionsfaktor von 344 g je Kilowattstunde entspricht das gut 2,6 Tonnen vermiedenem CO₂ pro Jahr — in der Größenordnung dessen, was ein Mittelklasse-Benziner auf etwa 17.000 Kilometern ausstößt.",
          "Über 25 Jahre summiert sich das auf einen mittleren zweistelligen Tonnenbereich. Diese Hochrechnung schreibt allerdings den heutigen Strommix fort. Wird das deutsche Netz über die Laufzeit sauberer, sinkt der vermiedene Ausstoß je Kilowattstunde entsprechend — die 25-Jahres-Zahl ist deshalb als Obergrenze zu lesen und nicht als Prognose.",
          "Für eine Einordnung gegenüber anderen Maßnahmen hilft der Vergleich pro investiertem Euro. Photovoltaik gehört dabei zu den günstigsten CO₂-Vermeidungsoptionen im privaten Bereich, weil die Anlage über zwei Jahrzehnte ohne weiteren Aufwand weiterarbeitet. Eine vollständige Bilanz inklusive Herstellung steht im Ratgeber-Artikel zur Ökobilanz.",
        ],
      },
    ],
    faq: [
      {
        frage: "Zählt auch eingespeister Strom?",
        antwort: "Ja. Eingespeister Solarstrom verdrängt im Netz ebenfalls Strom aus fossilen Kraftwerken. Für die CO₂-Bilanz ist es unerheblich, ob Sie die Kilowattstunde selbst verbrauchen oder Ihr Nachbar.",
      },
      {
        frage: "Ist die Herstellung der Module eingerechnet?",
        antwort: "Nein. Der Rechner zeigt die vermiedenen Emissionen im Betrieb. Die Herstellung ist ein einmaliger Aufwand, der sich nach heutigem Stand innerhalb weniger Betriebsjahre amortisiert.",
      },
      {
        frage: "Warum 344 Gramm je Kilowattstunde?",
        antwort: "Das ist der vom Umweltbundesamt ausgewiesene Emissionsfaktor des deutschen Strommixes für das Jahr 2025, der aktuellste verfügbare Jahreswert. Er wird mit jedem neuen Jahreswert nachgezogen.",
      },
      {
        frage: "Wie belastbar ist der Vergleich mit Bäumen?",
        antwort: "Als Größenordnung. Wie viel CO₂ ein Baum bindet, hängt von Art, Alter und Standort ab; 12,5 kg pro Jahr ist ein vom ADAC genannter Durchschnittswert. Die Zahl soll ein Gefühl vermitteln, keine Kompensation belegen.",
      },
      {
        frage: "Wie schnell ist die Herstellung der Module energetisch ausgeglichen?",
        antwort: "Die sogenannte energetische Amortisation liegt für in Europa gefertigte Module nach heutigem Stand im niedrigen einstelligen Jahresbereich. Danach arbeitet die Anlage über die restliche Laufzeit von zwei Jahrzehnten klimapositiv. Der Rechner zeigt diesen Vorlauf nicht — er betrachtet ausschließlich die vermiedenen Emissionen im Betrieb.",
      },
      {
        frage: "Kann ich die Einsparung als Kompensation ausweisen?",
        antwort: "Nein. Eine Kompensation setzt eine zertifizierte Zusätzlichkeit und Anrechnung voraus, die dieser Rechner nicht leistet. Die Zahl beschreibt, wie viel Netzstrom Ihre Anlage rechnerisch verdrängt — für eine Bilanz nach anerkanntem Standard ist sie nicht geeignet.",
      },
    ],
  },

  gestehungskosten: {
    schritte: [
      {
        titel: "Anlage und Kosten",
        text: "Anlagengröße und Investitionssumme bilden die Kostenseite. Optional kommt ein Speicher dazu.",
      },
      {
        titel: "Ertrag über die Lebensdauer",
        text: "Der Jahresertrag wird über die technische Lebensdauer hochgerechnet, inklusive 0,5 Prozent Moduldegradation pro Jahr.",
      },
      {
        titel: "Vergleich mit dem Netzpreis",
        text: "Das Ergebnis in ct/kWh steht direkt neben dem aktuellen Haushaltsstrompreis von 37,00 ct — die eigentliche Aussage dieser Kennzahl.",
      },
    ],
    abschnitte: [
      {
        titel: "Was Stromgestehungskosten aussagen",
        absaetze: [
          "Die Stromgestehungskosten, international LCOE, sind der Preis je Kilowattstunde, zu dem sich die Anlage über ihre Lebensdauer selbst trägt. Sie beantworten eine andere Frage als die Amortisationszeit: nicht wann das Geld zurück ist, sondern was die eigene Kilowattstunde kostet — und ob das unter oder über dem liegt, was der Versorger verlangt.",
          "Die Rechnung ist denkbar einfach: sämtliche Kosten über die Lebensdauer geteilt durch den gesamten Ertrag über dieselbe Zeit. In die Kostenseite gehen die Investition, laufende Betriebskosten von rund einem Prozent der Investitionssumme pro Jahr und ein Wechselrichtertausch ein. In die Ertragsseite geht der Jahresertrag abzüglich Degradation.",
        ],
      },
      {
        titel: "Wo dieser Rechner vom Fraunhofer-Modell abweicht",
        absaetze: [
          "Das vollständige Modell des Fraunhofer ISE diskontiert künftige Zahlungsströme mit einem Kapitalkostensatz. Dieser Rechner tut das nicht — er rechnet undiskontiert. Für eine Einordnung der Größenordnung reicht das; für eine Investitionsrechnung im Unternehmenskontext nicht.",
          "Der zweite Unterschied liegt bei den Speicherkosten: Wir setzen 400 € je nutzbarer Kilowattstunde an, die Mitte aktueller Marktpreisübersichten. Das Fraunhofer-Modell arbeitet mit einer erheblich weiteren Spanne. Die Entscheidung für den Marktpreis ist bewusst — dieser Rechner begleitet eine Kaufentscheidung, keine Systemstudie.",
        ],
      },
      {
        titel: "Wie sich die Kennzahl über die Laufzeit verändert",
        absaetze: [
          "Die Stromgestehungskosten sind kein fester Wert, sondern das Ergebnis einer Division — und beide Seiten bewegen sich. Auf der Ertragsseite sinkt die Leistung um rund 0,5 Prozent pro Jahr (NREL-Feldstudie, Medianwert); nach 25 Jahren liegt sie noch bei etwa 85 bis 90 Prozent. Diese Degradation ist im Rechner enthalten.",
          "Auf der Kostenseite steht neben der Investition der laufende Betrieb mit rund einem Prozent der Investitionssumme pro Jahr für Versicherung, Zählermiete und Wartung, dazu ein einmaliger Wechselrichtertausch mit 1.000 bis 3.000 € im 13. Jahr (ADAC). Wer diese beiden Posten weglässt — was viele Überschlagsrechnungen tun —, kommt auf deutlich zu niedrige Gestehungskosten.",
          "Nicht enthalten ist ein Kapitalkostensatz. Wer die Anlage finanziert, muss die Zinsen zusätzlich auf die Kostenseite nehmen; das vollständige Fraunhofer-ISE-Modell tut genau das über eine Diskontierung. Für eine Größenordnung im Vergleich zum Netzstrompreis von 37,00 ct reicht die einfachere Rechnung.",
        ],
      },
    ],
    faq: [
      {
        frage: "Warum liegen meine Gestehungskosten unter dem Strompreis?",
        antwort: "Weil Photovoltaik in Deutschland inzwischen zu den günstigsten Erzeugungsarten gehört. Fraunhofer ISE beziffert Dachanlagen auf einen Bereich deutlich unterhalb des Haushaltsstrompreises von 37,00 ct. Genau diese Differenz ist der wirtschaftliche Kern einer PV-Anlage.",
      },
      {
        frage: "Ist die Einspeisevergütung eingerechnet?",
        antwort: "Nein. Die Stromgestehungskosten sind eine reine Kostenkennzahl und bewusst erlösfrei. Was Sie mit dem Strom verdienen — Eigenverbrauch oder Einspeisung — beantwortet der Photovoltaik-Rechner.",
      },
      {
        frage: "Warum erhöht ein Speicher die Gestehungskosten?",
        antwort: "Weil er die Kostenseite erhöht, ohne eine einzige zusätzliche Kilowattstunde zu erzeugen. Ein Speicher verschiebt Strom in der Zeit; für diese Kennzahl ist das eine reine Zusatzinvestition. Seinen Nutzen zeigt der Speicher-Rechner.",
      },
      {
        frage: "Mit welcher Lebensdauer wird gerechnet?",
        antwort: "Mit der technischen Lebensdauer nach Fraunhofer ISE, nicht mit den 20 Jahren der Einspeisevergütung. Module laufen nach Ablauf der Förderung weiter, nur die Vergütung für den Überschuss endet.",
      },
      {
        frage: "Warum sinken die Gestehungskosten mit der Anlagengröße?",
        antwort: "Weil ein Teil der Kosten unabhängig von der Leistung anfällt: Gerüst, Anfahrt, Netzanschluss und Planung. Verteilt auf mehr Kilowattpeak sinkt der Anteil je kWh. Deshalb ist eine größere Anlage je Kilowattstunde günstiger — vorausgesetzt, die Fläche gibt sie her.",
      },
      {
        frage: "Wie vergleiche ich den Wert mit meinem Stromtarif?",
        antwort: "Direkt. Beide sind Cent je Kilowattstunde. Liegen Ihre Gestehungskosten unter dem Arbeitspreis Ihres Tarifs, ist jede selbst verbrauchte Kilowattstunde günstiger als die gekaufte. Für den eingespeisten Anteil gilt der Vergleich nicht — dort zählt die Einspeisevergütung von 7,70 ct.",
      },
    ],
  },

  reinigung: {
    schritte: [
      {
        titel: "Anlage und Umgebung",
        text: "Anlagengröße, Dachneigung und Umgebung bestimmen, wie stark sich die Module überhaupt verschmutzen.",
      },
      {
        titel: "Verschmutzung abschätzen",
        text: "Aus Umgebungstyp und Zeit seit der letzten Reinigung ergibt sich der Ertragsverlust in Prozent.",
      },
      {
        titel: "Gegenrechnen",
        text: "Der verlorene Ertrag wird mit Ihrem Strommix bewertet und den Reinigungskosten gegenübergestellt.",
      },
    ],
    abschnitte: [
      {
        titel: "Wie viel Verschmutzung tatsächlich kostet",
        absaetze: [
          "Die angesetzten Ertragsverluste stammen aus übereinstimmenden Praxisquellen: rund 2,5 Prozent im Wohngebiet, etwa 4,5 Prozent in Wald- oder Feldlage, ungefähr 5,5 Prozent an Industrie und stark befahrenen Straßen und rund 7,5 Prozent in landwirtschaftlicher Umgebung. Stark belastete Flach-, Hallen- oder Stalldächer können nach Praxisberichten 8 bis 12 Prozent erreichen.",
          "Bewertet wird der Verlust nicht mit dem Strompreis allein. Eine verlorene Kilowattstunde, die Sie selbst verbraucht hätten, kostet 37,00 ct; eine, die Sie eingespeist hätten, nur 7,70 ct. Der Rechner nutzt deshalb einen Mischwert entsprechend Ihrem Eigenverbrauchsanteil — sonst fiele die Ersparnis der Reinigung deutlich zu hoch aus.",
        ],
      },
      {
        titel: "Warum Regen oft genügt",
        absaetze: [
          "Ab etwa 15 bis 25 Grad Dachneigung reinigen sich Module durch Regen weitgehend selbst. Auf einem gut geneigten Schrägdach in normaler Wohnlage ist eine professionelle Reinigung wirtschaftlich häufig nicht darstellbar: Die Kosten übersteigen den zurückgewonnenen Ertrag.",
          "Anders liegt der Fall bei flachen oder aufgeständerten Modulen, bei Standorten mit Laub, Vogelkot, landwirtschaftlichem Staub oder Emissionen — und wenn die letzte Reinigung lange zurückliegt. Der Rechner sagt für Ihre Kombination, auf welcher Seite Sie stehen.",
        ],
      },
      {
        titel: "Was vor der Reinigung zu klären ist",
        absaetze: [
          "Bevor die Wirtschaftlichkeit überhaupt zählt, steht die Frage nach der Ursache. Ein plötzlicher Ertragseinbruch ist selten Verschmutzung, sondern häufiger ein defekter Strangoptimierer, ein gealterter Wechselrichter oder neue Verschattung durch gewachsene Bäume. Ein Blick ins Monitoring über mehrere Jahre trennt schleichende Verschmutzung von einem technischen Defekt.",
          "Ist Verschmutzung die Ursache, entscheidet die Zugänglichkeit über die Kosten. Ein gut erreichbares Flachdach ist deutlich günstiger zu reinigen als eine steile Dachfläche im zweiten Obergeschoss, für die eine Hubarbeitsbühne anrücken muss. Die Anfahrt schlägt bei kleinen Anlagen oft stärker zu Buche als die eigentliche Reinigungsleistung.",
          "Sinnvoll ist deshalb, mehrere Angebote einzuholen und die Reinigung mit einer ohnehin anstehenden Sichtprüfung zu verbinden. Der wirtschaftliche Gewinn einer einzelnen Reinigung liegt bei einer Hausdachanlage typischerweise im niedrigen zweistelligen Eurobereich pro Jahr — die Fahrtkosten eines eigens gerufenen Betriebs können ihn vollständig aufzehren.",
        ],
      },
    ],
    faq: [
      {
        frage: "Wie oft sollte man eine PV-Anlage reinigen?",
        antwort: "Pauschal gar nicht. Ob sich eine Reinigung rechnet, hängt von Neigung, Umgebung und Verschmutzungsgrad ab. Dieser Rechner setzt die Kosten gegen den zurückgewonnenen Ertrag, statt ein Intervall zu empfehlen.",
      },
      {
        frage: "Kann ich selbst reinigen?",
        antwort: "Auf dem Dach ist das eine Arbeitssicherheitsfrage, keine wirtschaftliche. Fachbetriebe arbeiten mit entsichertem Wasser und Teleskopbürsten, um Kratzer und Kalkränder zu vermeiden; Hausmittel und Hochdruckreiniger können die Antireflexschicht beschädigen.",
      },
      {
        frage: "Bringt Reinigung bei Neuschnee etwas?",
        antwort: "Der Rechner betrachtet Verschmutzung, nicht Schnee. Schnee rutscht auf geneigten Dächern meist von selbst ab, und die Ertragsverluste im Winter sind ohnehin gering, weil in dieser Zeit wenig zu holen ist.",
      },
      {
        frage: "Sind Reinigungskosten steuerlich absetzbar?",
        antwort: "Bei Anlagen, die unter die Einkommensteuerbefreiung nach § 3 Nr. 72 EStG fallen, entfällt mit den steuerpflichtigen Einnahmen auch der Betriebsausgabenabzug. Das ist eine steuerliche Frage und keine, die dieser Rechner beantwortet.",
      },
      {
        frage: "Verlieren Module durch Reinigung ihre Garantie?",
        antwort: "Bei unsachgemäßer Reinigung kann das passieren — Hochdruckreiniger, Scheuermittel oder kaltes Wasser auf heißen Modulen können die Oberfläche oder die Antireflexschicht schädigen. Fachbetriebe arbeiten mit entsalztem Wasser und weichen Bürsten. Die Herstellerhinweise gehen im Zweifel vor.",
      },
      {
        frage: "Lohnt sich ein Wartungsvertrag?",
        antwort: "Das ist eine andere Frage als die Reinigung. Ein Wartungsvertrag deckt üblicherweise Sichtprüfung, Messung und Fehlersuche ab — Leistungen, die einen Defekt früh finden. Wirtschaftlich rechnet sich das eher über vermiedene Ausfälle als über zurückgewonnenen Ertrag; dieser Rechner bildet ausschließlich den Verschmutzungsanteil ab.",
      },
    ],
  },

  eauto: {
    schritte: [
      {
        titel: "Fahrprofil",
        text: "Jahresfahrleistung und Verbrauch des Fahrzeugs ergeben den zusätzlichen Strombedarf.",
      },
      {
        titel: "Solaranteil",
        text: "Wie viel davon aus der eigenen Anlage kommt, hängt davon ab, wann geladen wird und ob die Wallbox überschussgeführt arbeitet.",
      },
      {
        titel: "Kosten vergleichen",
        text: "Ladekosten mit Solarstrom gegen reines Netzladen — und die Anlagengröße, die zu diesem Fahrprofil passt.",
      },
    ],
    abschnitte: [
      {
        titel: "Wie der Solarstrom bewertet wird",
        absaetze: [
          "Der zusätzliche Bedarf ergibt sich aus Fahrleistung mal Verbrauch geteilt durch den Lade-Wirkungsgrad. Der Rechner setzt 18 kWh je 100 km und etwa 10 Prozent Ladeverlust an; der ADAC nennt eine reale Verbrauchsspanne von 13 bis 30 kWh je 100 km, in die sich der Wert einordnet.",
          "Entscheidend ist eine methodische Feinheit: Solarstrom, der ins Auto geht, wird nicht mit null bewertet, sondern mit dem entgangenen Einspeiseerlös von 7,70 ct. Denn diese Kilowattstunde hätte sonst Geld gebracht. Wer Solarladen mit null ansetzt, unterschätzt die tatsächlichen Kosten systematisch.",
          "Der Solarstromanteil liegt mit einer überschussgeführten Wallbox erfahrungsgemäß bei 40 bis 60 Prozent. Ohne Steuerung, also beim Laden nach Feierabend, fällt er deutlich niedriger aus — der Rechner lässt Sie den Anteil deshalb selbst einstellen.",
        ],
      },
      {
        titel: "Welche Anlagengröße zum Auto passt",
        absaetze: [
          "Als Faustgröße: 15.000 km im Jahr bedeuten rund 2.700 kWh zusätzlichen Bedarf plus Ladeverluste. Über den Solaranteil ergibt sich daraus, wie viel zusätzliche Anlagenleistung sinnvoll ist. Der Rechner gibt diesen Wert direkt aus, damit Sie ihn gegen Ihre verfügbare Dachfläche halten können.",
          "Ein E-Auto ist der wirtschaftlich dankbarste Zusatzverbraucher, weil es große Strommengen zu flexiblen Zeiten abnimmt. Genau das hebt den Eigenverbrauchsanteil, und jede so verschobene Kilowattstunde ist rund 29 ct wert statt 7,70 ct.",
        ],
      },
      {
        titel: "Was das Laden zu Hause günstig macht",
        absaetze: [
          "Drei Dinge entscheiden über die Ladekosten, und alle drei lassen sich beeinflussen. Erstens der Zeitpunkt: Wer tagsüber laden kann, trifft die Erzeugung. Zweitens die Steuerung: Eine überschussgeführte Wallbox regelt die Ladeleistung dem tatsächlichen Überschuss nach, statt mit voller Leistung aus dem Netz zu ziehen, sobald der Stecker steckt.",
          "Drittens die Ladeleistung selbst. Bei einphasigem Laden mit geringer Leistung lässt sich der Überschuss feiner ausnutzen, dafür dauert der Ladevorgang länger. Wer das Auto ohnehin über Nacht und am Wochenende stehen hat, verliert durch die längere Ladedauer nichts und gewinnt Solaranteil.",
          "Zum Vergleich: Öffentliches Schnellladen liegt deutlich über dem Haushaltsstrompreis von 37,00 ct. Der wirtschaftliche Vorteil des Ladens zu Hause entsteht also schon gegenüber der Ladesäule, bevor überhaupt eine eigene Anlage im Spiel ist — die Photovoltaik vergrößert ihn nur weiter.",
        ],
      },
    ],
    faq: [
      {
        frage: "Lohnt sich eine überschussgeführte Wallbox?",
        antwort: "Sie erhöht den Solaranteil deutlich, weil sie die Ladeleistung dem tatsächlichen Überschuss nachführt, statt mit voller Leistung aus dem Netz zu ziehen. Ob sich die Mehrkosten tragen, hängt an Ihrer Fahrleistung — der Rechner zeigt die jährliche Differenz.",
      },
      {
        frage: "Kann ich mein Auto komplett mit Sonne laden?",
        antwort: "Rechnerisch über das Jahr gesehen oft ja, praktisch nein. Geladen wird häufig abends und im Winter, erzeugt wird mittags und im Sommer. Realistisch sind 40 bis 60 Prozent mit einer smarten Wallbox.",
      },
      {
        frage: "Was kostet die Kilowattstunde beim Solarladen wirklich?",
        antwort: "Sie kostet den entgangenen Einspeiseerlös von 7,70 ct — nicht null. Gegenüber dem Netzbezug sparen Sie die Differenz zum Bezugspreis. Der Rechner weist beide Wege getrennt aus.",
      },
      {
        frage: "Ist der Ladeverlust berücksichtigt?",
        antwort: "Ja, mit rund 10 Prozent. Die aus der Wand entnommene Energie liegt über dem, was im Akku ankommt; wer den Verlust weglässt, rechnet die Ladekosten zu niedrig.",
      },
      {
        frage: "Wie groß muss die Anlage für ein E-Auto sein?",
        antwort: "Als Näherung: 15.000 km im Jahr entsprechen rund 2.700 kWh plus Ladeverlusten. Bei 950 kWh Ertrag je kWp und einem Solaranteil von etwa 50 Prozent sind das grob 1,5 bis 2 kWp zusätzlich. Der Rechner gibt den Wert für Ihr Fahrprofil genau aus.",
      },
      {
        frage: "Schadet häufiges Laden mit geringer Leistung dem Akku?",
        antwort: "Nach heutigem Stand nicht — Laden mit niedriger Leistung ist für die Zellchemie eher schonender als Schnellladen. Für das Überschussladen ist das günstig, weil es ohnehin mit geringer und schwankender Leistung arbeitet.",
      },
    ],
  },

  steuer: {
    schritte: [
      {
        titel: "Anlage angeben",
        text: "Anlagengröße und Investitionssumme genügen — die steuerlichen Regelungen hängen an der Leistung und der Gebäudeart.",
      },
      {
        titel: "Vorteile berechnen",
        text: "Der Rechner weist den Umsatzsteuervorteil aus und ordnet die Einkommensteuerbefreiung ein.",
      },
      {
        titel: "Einordnen",
        text: "Das Ergebnis zeigt, was die Rechtslage 2026 gegenüber der früheren Situation konkret bedeutet.",
      },
    ],
    abschnitte: [
      {
        titel: "Nullsteuersatz nach § 12 Abs. 3 UStG",
        absaetze: [
          "Seit dem 1. Januar 2023 gilt für die Lieferung und Installation von Photovoltaik-Anlagen auf oder in der Nähe von Wohngebäuden ein Umsatzsteuersatz von null Prozent. Das betrifft Module, Wechselrichter, Montage und auch den Speicher. Der Vorteil gegenüber der alten Rechtslage entspricht den früher fälligen 19 Prozent Umsatzsteuer.",
          "Praktisch heißt das: Brutto ist gleich netto. Deshalb rechnen alle Rechner auf dieser Seite ohne zusätzliche Mehrwertsteuer — ein häufiger Fehler in älteren Kalkulationen, der die Investition um fast ein Fünftel zu hoch ansetzt.",
        ],
      },
      {
        titel: "Einkommensteuerbefreiung nach § 3 Nr. 72 EStG",
        absaetze: [
          "Einnahmen aus Einspeisung und der Wert des Eigenverbrauchs sind für Anlagen bis 30 kWp je Wohn- oder Gewerbeeinheit einkommensteuerfrei. Der wirtschaftliche Wert liegt weniger in der gesparten Steuer als im entfallenden Aufwand: keine Einnahmenüberschussrechnung, keine Anlage im Steuerformular, keine Abschreibungstabelle.",
          "Mit der Steuerfreiheit entfällt allerdings auch der Betriebsausgabenabzug. Wartung, Versicherung und Reinigung lassen sich dann nicht mehr gegenrechnen. Für die meisten Hausdachanlagen bleibt die Befreiung trotzdem der einfachere und günstigere Weg.",
        ],
      },
      {
        titel: "Was sich im Alltag konkret ändert",
        absaetze: [
          "Der spürbarste Effekt ist nicht die gesparte Steuer, sondern der weggefallene Aufwand. Vor 2023 war für eine Hausdachanlage in der Regel eine Anmeldung beim Finanzamt, die Entscheidung über die Kleinunternehmerregelung, eine Umsatzsteuervoranmeldung und eine jährliche Einnahmenüberschussrechnung nötig. Für Anlagen, die unter beide Regelungen fallen, entfällt das.",
          "Die Anmeldung im Marktstammdatenregister der Bundesnetzagentur bleibt hiervon unberührt — sie ist keine steuerliche, sondern eine energierechtliche Pflicht und innerhalb eines Monats nach Inbetriebnahme fällig.",
          "Zu beachten ist die Kehrseite: Wo keine steuerpflichtigen Einnahmen entstehen, gibt es auch keinen Betriebsausgabenabzug. Wartung, Versicherung, Reinigung und ein späterer Wechselrichtertausch lassen sich nicht mehr geltend machen. In der Gesamtrechnung fällt das für eine übliche Hausdachanlage kaum ins Gewicht, gehört aber zum vollständigen Bild.",
        ],
      },
    ],
    faq: [
      {
        frage: "Muss ich ein Gewerbe anmelden?",
        antwort: "Für eine typische Hausdachanlage bis 30 kWp in der Regel nicht. Die Einspeisung gilt zwar formal als unternehmerische Tätigkeit, die steuerlichen Pflichten entfallen aber weitgehend. Bei größeren oder mehreren Anlagen ändert sich das Bild.",
      },
      {
        frage: "Gilt der Nullsteuersatz auch für einen späteren Speicher?",
        antwort: "Er gilt für Speicher, die dazu bestimmt sind, Strom aus einer begünstigten Anlage zu speichern. Eine Nachrüstung fällt darunter. Bei Einzelfragen ist die Auskunft des Finanzamts oder einer steuerberatenden Person maßgeblich.",
      },
      {
        frage: "Was passiert oberhalb von 30 kWp?",
        antwort: "Dann greift die Einkommensteuerbefreiung nach § 3 Nr. 72 EStG nicht mehr, und die Erträge sind zu erklären. Die Grenze gilt je Wohn- oder Gewerbeeinheit, bei Mehrfamilienhäusern also mehrfach.",
      },
      {
        frage: "Ersetzt der Rechner eine Steuerberatung?",
        antwort: "Nein. Er ordnet die beiden Regelungen für den Normalfall einer Hausdachanlage ein. Sobald Vermietung, mehrere Anlagen, gewerbliche Nutzung oder ein Betriebsgebäude im Spiel sind, ist eine steuerliche Beratung erforderlich.",
      },
      {
        frage: "Ändert sich etwas, wenn ich die Anlage später erweitere?",
        antwort: "Die 30-kWp-Grenze der Einkommensteuerbefreiung gilt für die Gesamtleistung je Wohn- oder Gewerbeeinheit. Wer eine bestehende Anlage über diese Grenze hinaus erweitert, verliert die Befreiung für die gesamte Anlage — nicht nur für den neuen Teil. Vor einer Erweiterung in diesem Bereich lohnt die steuerliche Vorabklärung.",
      },
      {
        frage: "Gilt der Nullsteuersatz auch für die Wallbox?",
        antwort: "Nein. Der Nullsteuersatz nach § 12 Abs. 3 UStG umfasst die Photovoltaik-Anlage samt wesentlicher Komponenten und Speicher. Eine Wallbox ist kein Teil der Anlage und wird regulär mit Umsatzsteuer berechnet.",
      },
    ],
  },

  mieterstrom: {
    schritte: [
      {
        titel: "Gebäude beschreiben",
        text: "Anzahl der Wohneinheiten und Dachfläche bestimmen Anlagengröße und die Menge, die an Mieter geliefert werden kann.",
      },
      {
        titel: "Preise setzen",
        text: "Der Mieterstrompreis ist auf 90 Prozent des örtlichen Grundversorgertarifs gedeckelt. Wie viel darunter Sie anbieten, entscheidet über Abnahme und Deckungsbeitrag.",
      },
      {
        titel: "Wirtschaftlichkeit prüfen",
        text: "Drei Einnahmequellen stehen der Investition gegenüber: Direktverkauf, Mieterstromzuschlag und Einspeisevergütung für den Überschuss.",
      },
    ],
    abschnitte: [
      {
        titel: "Woher die Einnahmen kommen",
        absaetze: [
          "Erstens der Direktverkauf an die Mieter. Der Preis ist nach § 42a EnWG auf höchstens 90 Prozent des örtlichen Grundversorgertarifs begrenzt — der Mieter muss günstiger fahren als beim Standardanbieter, sonst hat das Modell keinen Sinn.",
          "Zweitens der Mieterstromzuschlag nach § 21 Abs. 3 EEG, den der Betreiber für jede an Mieter gelieferte Kilowattstunde erhält. Für Inbetriebnahmen im Zeitraum Februar bis Juli 2026 beträgt er 2,54 ct/kWh bis 10 kWp, 2,36 ct/kWh von 10 bis 40 kWp und 1,29 ct/kWh von 40 bis 100 kWp (Bundesnetzagentur). Er degressiert halbjährlich und ist ab Inbetriebnahme für 20 Jahre festgeschrieben.",
          "Drittens die normale Einspeisevergütung für den Strom, den im Haus gerade niemand braucht.",
        ],
      },
      {
        titel: "Voraussetzungen und der große Unsicherheitsfaktor",
        absaetze: [
          "Gefördert werden Anlagen bis 100 kWp auf, an oder in einem Wohngebäude, bei dem mindestens 40 Prozent der Fläche dem Wohnen dienen. Der Strom muss ohne Nutzung des öffentlichen Netzes an Letztverbraucher im selben oder einem angeschlossenen Gebäude geliefert werden.",
          "Die laufenden Betriebskosten für Messwesen, Abrechnung und Kundenverwaltung sind im Rechner mit null vorbelegt. Das ist keine Nachlässigkeit, sondern eine bewusste Entscheidung: Für diese Kosten liegt keine belastbare öffentliche Quelle vor, und ein geschätzter Betrag würde die zentrale Kennzahl unbelegt verschieben. Sie sind real und gehören in jede ernsthafte Kalkulation — setzen Sie im Rechner Ihren eigenen Wert ein, sobald Sie ein Angebot eines Dienstleisters vorliegen haben.",
        ],
      },
      {
        titel: "Woran Mieterstromprojekte in der Praxis scheitern",
        absaetze: [
          "Der häufigste Grund ist die Abnahmequote. Kalkuliert wird mit einem Anteil teilnehmender Mieter; liegt er darunter, bricht die wichtigste Einnahmequelle weg, während Messkonzept und Abrechnung unverändert weiterlaufen. Weil Mieter nicht zur Abnahme verpflichtet werden dürfen, bleibt das ein echtes Risiko und keine reine Rechengröße.",
          "Der zweite Grund ist das Messkonzept. Für Mieterstrom braucht es eine Summenzählermessung mit Unterzählern je Wohneinheit, dazu einen Dienstleister für Abrechnung, Lieferantenwechsel und Kundenkommunikation. Diese Kosten fallen weitgehend unabhängig von der Gebäudegröße an — deshalb tun sich kleine Mehrfamilienhäuser besonders schwer.",
          "Der dritte ist Fluktuation. Jeder Ein- und Auszug bedeutet einen Vertragswechsel im Mieterstrommodell. Bei hoher Mieterfluktuation wächst der Verwaltungsaufwand schneller als der Deckungsbeitrag. Als Alternative bleibt die reine Volleinspeisung, die zwar weniger je Kilowattstunde bringt, dafür aber ohne Kundenverwaltung auskommt.",
        ],
      },
    ],
    faq: [
      {
        frage: "Lohnt sich Mieterstrom ab welcher Gebäudegröße?",
        antwort: "Der Aufwand für Messkonzept und Abrechnung fällt weitgehend unabhängig von der Größe an, weshalb kleine Gebäude es schwer haben. Der Rechner zeigt den Deckungsbeitrag für Ihre Konstellation, statt eine Mindestgröße zu behaupten.",
      },
      {
        frage: "Muss jeder Mieter mitmachen?",
        antwort: "Nein, und das ist rechtlich vorgegeben: Mieter dürfen nicht zur Abnahme verpflichtet werden und behalten ihre freie Anbieterwahl. Genau diese Unsicherheit über die Abnahmequote ist das wirtschaftliche Kernrisiko des Modells.",
      },
      {
        frage: "Was ist der Unterschied zu einer normalen Volleinspeisung?",
        antwort: "Bei Volleinspeisung erhalten Sie einen festen Satz je Kilowattstunde und haben keinen Aufwand mit Kunden. Mieterstrom bringt höhere Erlöse je Kilowattstunde, verlangt dafür aber Messkonzept, Abrechnung und Kundenverwaltung.",
      },
      {
        frage: "Warum stehen die Betriebskosten auf null?",
        antwort: "Weil für Messwesen und Abrechnung keine belastbare öffentliche Quelle vorliegt. Ein erfundener Betrag würde die Amortisation unbelegt verschieben. Die Kosten existieren — tragen Sie Ihren eigenen Wert ein, sobald Sie ein Angebot haben.",
      },
      {
        frage: "Ersetzt der Rechner eine rechtliche Prüfung?",
        antwort: "Nein. Mieterstrom berührt Energierecht, Mietrecht und Steuerrecht gleichzeitig. Der Rechner liefert eine erste wirtschaftliche Einschätzung, keine Prüfung Ihres konkreten Vorhabens.",
      },
      {
        frage: "Wie unterscheidet sich Mieterstrom von einer Gemeinschaftlichen Gebäudeversorgung?",
        antwort: "Die Gemeinschaftliche Gebäudeversorgung ist ein neueres, schlankeres Modell ohne Lieferantenpflichten und ohne Mieterstromzuschlag. Sie kommt mit weniger Verwaltung aus, bringt aber auch keinen Zuschlag. Welches Modell trägt, hängt an Gebäudegröße und Abnahmequote — dieser Rechner bildet den klassischen Mieterstrom nach § 21 EEG ab.",
      },
      {
        frage: "Kann ich das Dach stattdessen verpachten?",
        antwort: "Ja, und für viele Eigentümer ist das der einfachere Weg: Ein Betreiber übernimmt Investition, Betrieb und Kundenverwaltung, Sie erhalten eine Pacht. Die Erlöse sind niedriger als bei einem erfolgreichen Mieterstromprojekt, das Risiko aber auch.",
      },
    ],
  },
};
