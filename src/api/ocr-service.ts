import {
    ApiConfig,
    MistralOcrResponse,
    OcrResult,
    OcrPage
} from "../types";

export class OcrService {
    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    async processDocument(file: File): Promise<OcrResult> {
        switch (this.config.apiType) {
            case "mistral":
                return this.processMistralOcr(file);
            default:
                throw new Error(`Unsupported API type: ${this.config.apiType}`);
        }
    }

    private async processMistralOcr(file: File): Promise<OcrResult> {
        const base64Data = await this.fileToBase64(file);
        const mimeType = this.getMimeType(file.name);

        const requestBody = {
            model: "mistral-ocr-latest",
            document: {
                type: "document_url",
                document_url: `data:${mimeType};base64,${base64Data}`
            },
            include_image_base64: true
        };

        const response = await fetch(this.config.apiUrl || "https://api.mistral.ai/v1/ocr", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mistral OCR API error: ${response.status} - ${errorText}`);
        }

        const data: MistralOcrResponse = await response.json();
        return this.normalizeMistralResponse(data);
    }

    private normalizeMistralResponse(response: MistralOcrResponse): OcrResult {
        const pages: OcrPage[] = response.pages.map(page => ({
            pageNumber: page.index + 1,
            markdown: page.markdown,
            images: page.images?.map(img => ({
                id: img.id,
                base64: img.image_base64
            }))
        }));

        return {
            pages,
            totalPages: response.pages.length
        };
    }

    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g., "data:application/pdf;base64,")
                const base64 = result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    private getMimeType(filename: string): string {
        const ext = filename.toLowerCase().split(".").pop();
        const mimeTypes: Record<string, string> = {
            "pdf": "application/pdf",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "tiff": "image/tiff",
            "tif": "image/tiff",
            "bmp": "image/bmp",
            "webp": "image/webp"
        };
        return mimeTypes[ext || ""] || "application/octet-stream";
    }

    static getSupportedExtensions(): string[] {
        return ["pdf", "png", "jpg", "jpeg", "tiff", "tif", "bmp", "webp"];
    }

    static isFileSupported(filename: string): boolean {
        const ext = filename.toLowerCase().split(".").pop();
        return this.getSupportedExtensions().includes(ext || "");
    }
}
