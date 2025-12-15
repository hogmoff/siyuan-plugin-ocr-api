[English](README.md) | [中文](README_zh_CN.md)

# SiYuan OCR Dokumentenkonverter

Ein SiYuan-Plugin, das Dokumente (PDF, Bilder) mittels OCR-APIs in SiYuan-Notizen umwandelt.

## Funktionen

- **Seitenleisten-Integration**: Zugriff auf die OCR-Konvertierung direkt aus der SiYuan-Seitenleiste
- **Mehrere API-Unterstützung**: Konfiguration und Nutzung mehrerer OCR-API-Anbieter
- **Mistral OCR**: Integrierte Unterstützung für Mistrals OCR-API
- **Formaterhaltung**: Konvertiert OCR-Ergebnisse in Markdown unter Beibehaltung der Formatierung
- **Mehrsprachig**: Unterstützt englische, deutsche und chinesische Oberfläche
- **Drag & Drop**: Einfacher Datei-Upload per Drag & Drop oder Dateiauswahl

## Unterstützte Dokumentformate

- PDF
- PNG
- JPG/JPEG
- TIFF
- BMP
- WEBP

## Installation

1. Laden Sie die neueste Version von der Release-Seite herunter
2. Entpacken Sie `package.zip` nach `{workspace}/data/plugins/siyuan-plugin-ocr`
3. Starten Sie SiYuan neu oder laden Sie die Plugins neu
4. Aktivieren Sie das Plugin in den SiYuan-Einstellungen

## Verwendung

### 1. API konfigurieren

1. Öffnen Sie SiYuan-Einstellungen > Plugin > OCR Dokumentenkonverter
2. Klicken Sie auf "API hinzufügen" um eine neue OCR-API-Konfiguration hinzuzufügen
3. Geben Sie ein:
   - **Anzeigename**: Ein freundlicher Name für diese API-Konfiguration
   - **API-Typ**: Wählen Sie den OCR-Anbieter (derzeit Mistral)
   - **API-URL**: Der API-Endpunkt (Standard: `https://api.mistral.ai/v1/ocr`)
   - **API-Schlüssel**: Ihr API-Schlüssel vom Anbieter

### 2. Dokumente konvertieren

1. Öffnen Sie das OCR-Konverter-Dock (Seitenleisten-Symbol oder Tastenkürzel `⌥⇧O`)
2. Wählen Sie eine OCR-API aus dem Dropdown-Menü
3. Wählen Sie das Ziel-Notizbuch und den Pfad für das neue Dokument
4. Geben Sie optional einen benutzerdefinierten Dokumentnamen ein
5. Laden Sie ein Dokument per Drag & Drop hoch oder klicken Sie zum Auswählen
6. Klicken Sie auf "Konvertierung starten"
7. Nach Abschluss klicken Sie auf "Dokument öffnen" um das Ergebnis anzuzeigen

## Dokument-Attribute

Das Plugin fügt dem erstellten Dokument automatisch folgende Attribute hinzu:

- `custom-ocr-source-file`: Originalnamen der gescannten Datei
- `custom-ocr-date`: Datum der Konvertierung
- `custom-ocr-pages`: Anzahl der Seiten
- `custom-ocr-images`: Anzahl der Bilder
- `custom-ocr-model`: Modell der Konvertierung

## API-Anbieter

### Mistral OCR

[Mistral AI](https://mistral.ai/) bietet eine leistungsstarke OCR-API, die Text aus Dokumenten extrahiert und dabei die Formatierung beibehält.

1. Erstellen Sie ein Konto auf [console.mistral.ai](https://console.mistral.ai/)
2. Generieren Sie einen API-Schlüssel
3. Verwenden Sie den Schlüssel in den Plugin-Einstellungen

Weitere Informationen finden Sie in der [Mistral OCR Dokumentation](https://docs.mistral.ai/capabilities/document_ai/basic_ocr).

## Datenschutz und Dateispeicherung

- **Originaldateien**: Die hochgeladenen Originaldateien werden nicht in SiYuan gespeichert. Sie werden nur für die Dauer der Konvertierung an die API gesendet.
- **Extrahierte Bilder**: Bilder, die aus den Dokumenten extrahiert wurden, werden im `assets`-Ordner von SiYuan gespeichert, um im konvertierten Dokument angezeigt werden zu können.
- **API-Datenschutz**: Bitte beachten Sie die Datenschutzrichtlinien der jeweiligen API-Betreiber. Diese liegen nicht in der Verantwortung des Autors des Plugins.

## Entwicklung

```bash
# Abhängigkeiten installieren
pnpm install

# Entwicklungs-Build mit Watch-Modus
pnpm run dev

# Produktions-Build
pnpm run build
```

## Mitwirken

Mitarbeit am Plugin ist willkommen! Bitte beachten Sie jedoch, dass Beiträge (Issues, Pull Requests, Diskussionen) ausschließlich in **Englischer Sprache** verfasst werden müssen, um die internationale Zusammenarbeit zu erleichtern.

## Lizenz

MIT-Lizenz
