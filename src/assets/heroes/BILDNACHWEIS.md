# Bildnachweis Artikel-Heroes und Startseite

Alle Dateien stammen von Pexels. Die Pexels-Lizenz erlaubt die kommerzielle
Nutzung ohne Namensnennung; die Urheber sind hier trotzdem festgehalten,
damit bei einer Lizenzpruefung die Herkunft belegbar bleibt.
Zuschnitt: mittiger Ausschnitt auf 1600x686 (Skript im Sitzungs-Scratchpad).
Stand: 14.09.2026.

| Datei | Fotograf | Pexels-ID | Seite |
| --- | --- | --- | --- |
| ausrichtung.jpg | Iqbal farooz | 37083400 | https://www.pexels.com/photo/solar-panels-on-residential-roof-in-srinagar-37083400/ |
| balkonkraftwerk.jpg | Vladimir Srajber | 13963757 | https://www.pexels.com/photo/blue-solar-panels-on-the-roof-13963757/ |
| checkliste-vor-kauf.jpg | Mikael Blomkvist | 8961343 | https://www.pexels.com/photo/man-in-blue-denim-jeans-standing-beside-woman-in-black-and-white-checkered-shirt-8961343/ |
| e-auto.jpg | Ed Harvey | 5391510 | https://www.pexels.com/photo/black-charger-plugged-in-on-white-car-5391510/ |
| gestehungskosten.jpg | Mark Stebnicki | 15751136 | https://www.pexels.com/photo/close-up-of-solar-panels-15751136/ |
| grundlagen.jpg | Vladimir Srajber | 17965455 | https://www.pexels.com/photo/close-up-of-solar-panels-on-a-roof-of-a-house-17965455/ |
| kaufen-mieten.jpg | Robert So | 12243093 | https://www.pexels.com/photo/a-house-with-solar-panel-on-the-roof-12243093/ |
| kosten.jpg | Gustavo Fring | 4254162 | https://www.pexels.com/photo/electricians-inspecting-the-solar-panels-4254162/ |
| mieterstrom.jpg | Robert So | 13558357 | https://www.pexels.com/photo/a-white-wooden-house-13558357/ |
| oekobilanz.jpg | ERod Photos | 20844067 | https://www.pexels.com/photo/solar-panels-in-countryside-20844067/ |
| reinigung.jpg | Florida Solar Fix | 33379364 | https://www.pexels.com/photo/efficient-solar-panel-cleaning-in-tampa-florida-33379364/ |
| speicher.jpg | Elite Power Group | 39057090 | https://www.pexels.com/photo/electrician-installing-residential-battery-storage-39057090/ |
| speicher-wirkungsgrad.jpg | Elite Power Group | 38171130 | https://www.pexels.com/photo/electrician-installing-solar-inverter-outdoors-38171130/ |
| steuern.jpg | Kindel Media | 7979432 | https://www.pexels.com/photo/man-couple-love-woman-7979432/ |
| versicherung.jpg | Gustavo Fring | 4254171 | https://www.pexels.com/photo/solar-technician-inspecting-solar-panel-4254171/ |
| waermepumpe.jpg | alpha innotec | 38067300 | https://www.pexels.com/photo/modern-heat-pump-in-residential-setting-38067300/ |
| einspeiseverguetung.jpg | (Bestand, Herkunft nicht dokumentiert) | – | – |

Startseiten-Hero (/src/assets/hero-modulflaeche.jpg, 2400x1800, unbeschnitten):

| Datei | Fotograf | Pexels-ID | Seite |
| --- | --- | --- | --- |
| hero-modulflaeche.jpg | Cristian Rojas | 8853509 | https://www.pexels.com/photo/close-up-photo-of-a-solar-panel-8853509/ |

Liegt unter src/assets/ statt public/, damit Astro daraus WebP und die
srcset-Groessen erzeugt (public/ wird unveraendert ausgeliefert).

Ersetzt am 16.09.2026 die vorherige Drohnen-Luftaufnahme
(/public/images/startseite.jpg, Janick Bunzel, Pexels-ID 16432398). Grund:
Das Motiv zeigte parkende Autos, Spielgeraete und eine Personengruppe auf
der Terrasse eines fremden Hauses und las sich damit als Referenzkunde, den
es nicht gibt (CLAUDE.md: keine erfundenen Aussagen ueber das Unternehmen).
Die Datei ist geloescht; bei Bedarf ueber die Pexels-ID erneut zu beziehen.

Bild neben "Was ist Photovoltaik?" auf der Startseite
(/src/assets/montage-team.jpg, 550x367):

| Datei | Fotograf | Quelle/ID | Seite |
| --- | --- | --- | --- |
| montage-team.jpg | [BITTE EINTRAGEN] | [BITTE EINTRAGEN] | [BITTE EINTRAGEN] |

OFFEN vor Livegang — zwei Punkte:

1. Herkunft und Lizenz sind nicht dokumentiert. Die Datei kam am 16.09.2026
   ohne Quellenangabe ins Projekt. Vor der Veroeffentlichung klaeren, woher
   sie stammt und ob die Lizenz kommerzielle Nutzung erlaubt; sonst ersetzen.
   Gleiche Lage wie bei einspeiseverguetung.jpg weiter oben.
2. Aufloesung 550x367 ist fuer die Anzeigebreite von rund 500px knapp und auf
   Retina-Displays sichtbar weich. Ein Original ab 1100px Breite ersetzt die
   Datei; dann in src/pages/index.astro die `widths` erhoehen.

Motiv-Hinweis: Das Bild zeigt zwei Monteure auf einem Dach. Es steht bewusst
ohne Bildunterschrift und ohne Zuschreibung — als "unsere Monteure" oder als
Referenzanlage gelesen waere es eine erfundene Aussage ueber das Unternehmen
(§ 5 UWG). Aus genau diesem Grund wurde die frueher genutzte Drohnenaufnahme
entfernt, siehe Absatz darueber.
