[中文](README_zh_CN.md) | [Deutsch](README_de_DE.md)

# SiYuan OCR Document Converter

A SiYuan plugin that converts documents (PDF, images) to SiYuan notes using OCR APIs.

## Features

- **Sidebar Integration**: Access OCR conversion directly from the SiYuan sidebar
- **Multiple API Support**: Configure and use multiple OCR API providers
- **Mistral OCR**: Built-in support for Mistral's OCR API
- **Format Preservation**: Converts OCR results to markdown while preserving formatting
- **Multi-language**: Supports English, German, and Chinese interfaces
- **Drag & Drop**: Easy file upload via drag & drop or file picker

## Supported Document Formats

- PDF
- PNG
- JPG/JPEG
- TIFF
- BMP
- WEBP

## Installation

1. Download the latest release from the releases page
2. Extract `package.zip` to `{workspace}/data/plugins/siyuan-plugin-ocr`
3. Restart SiYuan or reload plugins
4. Enable the plugin in SiYuan settings

## Usage

### 1. Configure API

1. Open SiYuan Settings > Plugin > OCR Document Converter
2. Click "Add API" to add a new OCR API configuration
3. Enter:
   - **Display Name**: A friendly name for this API configuration
   - **API Type**: Select the OCR provider (currently Mistral)
   - **API URL**: The API endpoint (default: `https://api.mistral.ai/v1/ocr`)
   - **API Key**: Your API key from the provider

### 2. Convert Documents

1. Open the OCR Converter dock (sidebar icon or hotkey `⌥⇧O`)
2. Select an OCR API from the dropdown
3. Choose the target notebook and path for the new document
4. Optionally enter a custom document name
5. Upload a document via drag & drop or click to select
6. Click "Start Conversion"
7. Once complete, click "Open Document" to view the result

## Document Attributes

The plugin automatically adds the following attributes to the created document:

- `custom-ocr-source-file`: Original filename of the scanned file
- `custom-ocr-date`: Date of conversion
- `custom-ocr-pages`: Number of pages
- `custom-ocr-images`: Number of images
- `custom-ocr-model`: Model used for conversion

## API Providers

### Mistral OCR

[Mistral AI](https://mistral.ai/) provides a powerful OCR API that can extract text from documents while preserving formatting.

1. Create an account at [console.mistral.ai](https://console.mistral.ai/)
2. Generate an API key
3. Use the key in the plugin settings

For more information, see the [Mistral OCR Documentation](https://docs.mistral.ai/capabilities/document_ai/basic_ocr).

## Data Privacy and File Storage

- **Original Files**: Uploaded source files are not stored in SiYuan. They are only sent to the API for the duration of the conversion.
- **Extracted Images**: Images extracted from documents are saved in SiYuan's `assets` folder to be displayed in the converted document.
- **API Privacy**: Please observe the privacy policies of the respective API providers. These are not the responsibility of the plugin author.

## Development

```bash
# Install dependencies
pnpm install

# Development build with watch
pnpm run dev

# Production build
pnpm run build
```

## Contributing

Contributions to the plugin are welcome! However, please note that contributions (issues, pull requests, discussions) must be written exclusively in **English** to facilitate international collaboration.

## License

MIT License
