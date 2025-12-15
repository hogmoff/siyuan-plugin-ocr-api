import { fetchPost } from "siyuan";
import {
    Notebook,
    SiYuanResponse,
    CreateDocResponse,
    ListNotebooksResponse,
    OcrResult
} from "../types";

export class SiYuanApi {
    async listNotebooks(): Promise<Notebook[]> {
        return new Promise((resolve, reject) => {
            fetchPost("/api/notebook/lsNotebooks", {}, (response: SiYuanResponse<ListNotebooksResponse>) => {
                if (response.code === 0) {
                    resolve(response.data.notebooks.filter(nb => !nb.closed));
                } else {
                    reject(new Error(response.msg));
                }
            });
        });
    }

    async createDocWithMarkdown(
        notebookId: string,
        path: string,
        markdown: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            fetchPost("/api/filetree/createDocWithMd", {
                notebook: notebookId,
                path: path,
                markdown: markdown
            }, (response: SiYuanResponse<CreateDocResponse>) => {
                if (response.code === 0) {
                    resolve(response.data.id);
                } else {
                    reject(new Error(response.msg));
                }
            });
        });
    }

    async uploadAsset(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file[]", file);
            formData.append("assetsDirPath", "/assets/");

            fetch("/api/asset/upload", {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then((data: SiYuanResponse<{ succMap: Record<string, string> }>) => {
                    if (data.code === 0) {
                        const fileName = Object.keys(data.data.succMap)[0];
                        resolve(data.data.succMap[fileName]);
                    } else {
                        reject(new Error(data.msg));
                    }
                })
                .catch(reject);
        });
    }

    async uploadBase64Asset(base64Data: string, filename: string): Promise<string> {
        // Convert base64 to blob
        // Clean base64 string (remove data URI prefix if present and all whitespace)
        const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, "").replace(/\s/g, "");
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const file = new File([blob], filename);

        return this.uploadAsset(file);
    }

    convertOcrResultToMarkdown(result: OcrResult, uploadedImages?: Map<string, string>): string {
        const sections: string[] = [];

        for (const page of result.pages) {
            let markdown = page.markdown;

            // Replace image references with uploaded asset paths
            if (uploadedImages && page.images) {
                for (const image of page.images) {
                    const assetPath = uploadedImages.get(image.id);
                    if (assetPath) {
                        // Replace image reference in markdown
                        // Match "](id)" pattern to handle both images ![...](id) and links [...](id)
                        // This also handles nested brackets in alt text correctly by focusing on the link part
                        const escapedId = this.escapeRegExp(image.id);
                        const regex = new RegExp(`(\\]\\s*\\()${escapedId}(\\s*\\))`, "g");
                        markdown = markdown.replace(regex, `$1${assetPath}$2`);
                    }
                }
            }

            sections.push(markdown);
        }

        return sections.join("\n\n---\n\n");
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private getRelativePath(docPath: string, assetPath: string): string {
        // Remove leading slash if present
        const cleanDocPath = docPath.replace(/^\//, "");
        
        // Split path into segments
        const parts = cleanDocPath.split("/").filter(p => p.length > 0);
        
        // Remove filename, keep directories
        // e.g. "Folder/Doc" -> "Folder" (depth 1)
        // "Doc" -> "" (depth 0)
        parts.pop();
        
        const depth = parts.length;
        if (depth === 0) {
            return assetPath;
        }
        
        const prefix = "../".repeat(depth);
        return prefix + assetPath;
    }

    async processAndCreateDocument(
        result: OcrResult,
        notebookId: string,
        docPath: string,
        onProgress?: (progress: number, message: string) => void
    ): Promise<string> {
        const uploadedImages = new Map<string, string>();
        let imageCount = 0;
        let totalImages = 0;

        // Count total images
        for (const page of result.pages) {
            if (page.images) {
                totalImages += page.images.length;
            }
        }

        // Upload images
        if (totalImages > 0) {
            onProgress?.(30, `Uploading images (0/${totalImages})...`);

            for (const page of result.pages) {
                if (page.images) {
                    for (const image of page.images) {
                        if (image.base64) {
                            try {
                                const assetPath = await this.uploadBase64Asset(
                                    image.base64,
                                    `ocr_${Date.now()}_${image.id}.png`
                                );
                                
                                console.log(`Uploaded asset: ${assetPath} for doc: ${docPath}`);
                                const adjustedPath = this.getRelativePath(docPath, assetPath);
                                console.log(`Adjusted path: ${adjustedPath}`);
                                
                                uploadedImages.set(image.id, adjustedPath);
                                imageCount++;
                                const progress = 30 + Math.round((imageCount / totalImages) * 50);
                                onProgress?.(progress, `Uploading images (${imageCount}/${totalImages})...`);
                            } catch (error) {
                                console.error(`Failed to upload image ${image.id}:`, error);
                            }
                        }
                    }
                }
            }
        }

        onProgress?.(85, "Creating document...");

        // Convert to markdown
        const markdown = this.convertOcrResultToMarkdown(result, uploadedImages);

        // Create document
        const docId = await this.createDocWithMarkdown(notebookId, docPath, markdown);

        onProgress?.(100, "Done!");

        return docId;
    }
}
