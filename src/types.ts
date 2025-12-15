// API Configuration Types
export interface ApiConfig {
    id: string;
    displayName: string;
    apiType: ApiType;
    apiUrl: string;
    apiKey: string;
}

export type ApiType = "mistral" | "custom";

// Plugin Storage Types
export interface PluginStorage {
    apis: ApiConfig[];
    lastSelectedApiId?: string;
    lastNotebookId?: string;
    lastPath?: string;
}

// Mistral OCR API Types
export interface MistralOcrRequest {
    model: string;
    document: MistralDocument;
    include_image_base64?: boolean;
}

export interface MistralDocument {
    type: "document_url" | "image_url" | "base64";
    source?: string;
    data?: string;
    document_url?: string;
    image_url?: string;
}

export interface MistralOcrResponse {
    pages: MistralPage[];
    model: string;
    usage: MistralUsage;
}

export interface MistralPage {
    index: number;
    markdown: string;
    images?: MistralImage[];
    dimensions?: {
        dpi: number;
        height: number;
        width: number;
    };
}

export interface MistralImage {
    id: string;
    top_left_x: number;
    top_left_y: number;
    bottom_right_x: number;
    bottom_right_y: number;
    image_base64?: string;
}

export interface MistralUsage {
    pages_processed: number;
    doc_size_bytes?: number;
}

// Generic OCR Response (normalized)
export interface OcrResult {
    pages: OcrPage[];
    totalPages: number;
    model?: string;
}

export interface OcrPage {
    pageNumber: number;
    markdown: string;
    images?: OcrImage[];
}

export interface OcrImage {
    id: string;
    base64?: string;
}

// SiYuan API Types
export interface Notebook {
    id: string;
    name: string;
    icon: string;
    sort: number;
    closed: boolean;
}

export interface SiYuanResponse<T> {
    code: number;
    msg: string;
    data: T;
}

export type CreateDocResponse = string;

export interface ListNotebooksResponse {
    notebooks: Notebook[];
}

// UI State Types
export interface ConversionState {
    isProcessing: boolean;
    progress: number;
    statusMessage: string;
    error?: string;
    resultDocId?: string;
}
