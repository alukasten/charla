# Bone Banner 🇪🇸

Spanisch lernen durch Gespräche mit KI-Charakteren – inspiriert von Apps wie Langua.

- 💬 Chatte auf Spanisch mit fünf verschiedenen KI-Charakteren aus Spanien, Mexiko, Argentinien, Kolumbien und Chile
- 🎙️ Sprich deine Antworten statt zu tippen (Spracherkennung) – die Charaktere antworten mit eigenem Länder-Akzent per Sprachausgabe
- 💡 Bekomme automatische Grammatik-Tipps zu deinen eigenen Sätzen
- 📚 Sammle neue Vokabeln direkt aus den Antworten der Charaktere in deinem persönlichen Wortschatz
- 🔥 Streak, XP und Tagesziel motivieren zum täglichen Üben

Einfach `index.html` im Browser öffnen – reines Frontend (React über CDN), kein Server nötig.

Die Charaktere werden von Google Gemini (kostenloser Tarif) gesteuert und antworten dynamisch
auf das, was du schreibst oder sagst – inklusive Grammatik-Feedback zu deinen eigenen Sätzen.
Dafür trägst du einmalig deinen eigenen, kostenlosen Gemini API-Key ein (Einstellungen in der
App, Key von [aistudio.google.com/apikey](https://aistudio.google.com/apikey), keine
Kreditkarte nötig); der Key wird nur lokal im Browser gespeichert (`localStorage`) und der
Aufruf geht direkt vom Browser an `generativelanguage.googleapis.com` – ohne eigenes Backend.
Der kostenlose Tarif ist rate-limitiert.

Für Mikrofon-Zugriff (Sprechen statt Tippen) muss die Seite als normale Webseite geöffnet werden
(z.B. lokal per Doppelklick oder über GitHub Pages) – nicht eingebettet in einem iframe.
