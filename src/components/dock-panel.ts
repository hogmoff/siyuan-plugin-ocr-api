import { Plugin, showMessage, openTab } from "siyuan";
import { ApiConfig, Notebook, ConversionState } from "../types";
import { OcrService } from "../api/ocr-service";
import { SiYuanApi } from "../api/siyuan-api";

export class DockPanel {
    private plugin: Plugin;
    private element: HTMLElement;
    private i18n: Record<string, string>;
    private siyuanApi: SiYuanApi;

    private apis: ApiConfig[] = [];
    private notebooks: Notebook[] = [];
    private selectedApiId: string = "";
    private selectedNotebookId: string = "";
    private targetPath: string = "/";
    private documentName: string = "";
    private uploadedFile: File | null = null;

    private state: ConversionState = {
        isProcessing: false,
        progress: 0,
        statusMessage: ""
    };

    constructor(plugin: Plugin, element: HTMLElement, i18n: Record<string, string>) {
        this.plugin = plugin;
        this.element = element;
        this.i18n = i18n;
        this.siyuanApi = new SiYuanApi();
    }

    async init(apis: ApiConfig[], lastApiId?: string, lastNotebookId?: string, lastPath?: string) {
        this.apis = apis;
        this.selectedApiId = lastApiId || "";
        this.selectedNotebookId = lastNotebookId || "";
        this.targetPath = lastPath || "/";

        try {
            this.notebooks = await this.siyuanApi.listNotebooks();
            if (!this.selectedNotebookId && this.notebooks.length > 0) {
                this.selectedNotebookId = this.notebooks[0].id;
            }
        } catch (error) {
            console.error("Failed to load notebooks:", error);
        }

        this.render();
        this.bindEvents();
    }

    updateApis(apis: ApiConfig[]) {
        this.apis = apis;
        if (!apis.find(a => a.id === this.selectedApiId)) {
            this.selectedApiId = apis.length > 0 ? apis[0].id : "";
        }
        this.render();
        this.bindEvents();
    }

    private render() {
        const hasApis = this.apis.length > 0;

        this.element.innerHTML = `
            <div class="ocr-dock">
                <div class="ocr-dock__section">
                    <label class="ocr-dock__label">${this.i18n.selectApi}</label>
                    ${hasApis ? `
                        <select class="b3-select ocr-dock__select" id="ocr-api-select">
                            ${this.apis.map(api => `
                                <option value="${api.id}" ${api.id === this.selectedApiId ? "selected" : ""}>
                                    ${api.displayName}
                                </option>
                            `).join("")}
                        </select>
                    ` : `
                        <div class="ocr-dock__message">${this.i18n.noApiConfigured}</div>
                    `}
                </div>

                <div class="ocr-dock__section">
                    <label class="ocr-dock__label">${this.i18n.notebook}</label>
                    <select class="b3-select ocr-dock__select" id="ocr-notebook-select">
                        ${this.notebooks.length === 0 ? `
                            <option value="">${this.i18n.noNotebooks}</option>
                        ` : this.notebooks.map(nb => `
                            <option value="${nb.id}" ${nb.id === this.selectedNotebookId ? "selected" : ""}>
                                ${nb.icon ? `${nb.icon} ` : ""}${nb.name}
                            </option>
                        `).join("")}
                    </select>
                </div>

                <div class="ocr-dock__section">
                    <label class="ocr-dock__label">${this.i18n.targetPath}</label>
                    <input type="text" class="b3-text-field ocr-dock__input" id="ocr-target-path"
                        placeholder="${this.i18n.targetPathPlaceholder}" value="${this.targetPath}">
                </div>

                <div class="ocr-dock__section">
                    <label class="ocr-dock__label">${this.i18n.documentName}</label>
                    <input type="text" class="b3-text-field ocr-dock__input" id="ocr-doc-name"
                        placeholder="${this.i18n.documentNamePlaceholder}" value="${this.documentName}">
                </div>

                <div class="ocr-dock__section">
                    <label class="ocr-dock__label">${this.i18n.uploadDocument}</label>
                    <div class="ocr-dock__upload" id="ocr-upload-zone">
                        <div class="ocr-dock__upload-content">
                            ${this.uploadedFile ? `
                                <div class="ocr-dock__file-info">
                                    <svg class="ocr-dock__file-icon"><use xlink:href="#iconFile"></use></svg>
                                    <span class="ocr-dock__file-name">${this.uploadedFile.name}</span>
                                    <button class="b3-button b3-button--small ocr-dock__file-remove" id="ocr-remove-file">
                                        <svg><use xlink:href="#iconClose"></use></svg>
                                    </button>
                                </div>
                            ` : `
                                <svg class="ocr-dock__upload-icon"><use xlink:href="#iconUpload"></use></svg>
                                <div class="ocr-dock__upload-hint">${this.i18n.dragDropHint}</div>
                                <div class="ocr-dock__upload-formats">${this.i18n.supportedFormats}</div>
                            `}
                        </div>
                        <input type="file" id="ocr-file-input" class="ocr-dock__file-input"
                            accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.bmp,.webp" ${this.uploadedFile ? "disabled" : ""}>
                    </div>
                </div>

                ${this.state.isProcessing ? `
                    <div class="ocr-dock__progress">
                        <div class="ocr-dock__progress-bar">
                            <div class="ocr-dock__progress-fill" style="width: ${this.state.progress}%"></div>
                        </div>
                        <div class="ocr-dock__progress-text">${this.state.statusMessage}</div>
                    </div>
                ` : ""}

                ${this.state.error ? `
                    <div class="ocr-dock__error">${this.state.error}</div>
                ` : ""}

                ${this.state.resultDocId ? `
                    <div class="ocr-dock__success">
                        <span>${this.i18n.success}</span>
                        <button class="b3-button b3-button--small" id="ocr-open-doc">
                            ${this.i18n.openDocument}
                        </button>
                    </div>
                ` : ""}

                <div class="ocr-dock__actions">
                    <button class="b3-button b3-button--text ocr-dock__button" id="ocr-start-btn"
                        ${!hasApis || this.state.isProcessing ? "disabled" : ""}>
                        ${this.state.isProcessing ? this.i18n.processing : this.i18n.startConversion}
                    </button>
                </div>
            </div>
        `;
    }

    private bindEvents() {
        // API select
        const apiSelect = this.element.querySelector("#ocr-api-select") as HTMLSelectElement;
        if (apiSelect) {
            apiSelect.addEventListener("change", () => {
                this.selectedApiId = apiSelect.value;
                this.saveState();
            });
        }

        // Notebook select
        const notebookSelect = this.element.querySelector("#ocr-notebook-select") as HTMLSelectElement;
        if (notebookSelect) {
            notebookSelect.addEventListener("change", () => {
                this.selectedNotebookId = notebookSelect.value;
                this.saveState();
            });
        }

        // Target path input
        const targetPathInput = this.element.querySelector("#ocr-target-path") as HTMLInputElement;
        if (targetPathInput) {
            targetPathInput.addEventListener("input", () => {
                this.targetPath = targetPathInput.value;
                this.saveState();
            });
        }

        // Document name input
        const docNameInput = this.element.querySelector("#ocr-doc-name") as HTMLInputElement;
        if (docNameInput) {
            docNameInput.addEventListener("input", () => {
                this.documentName = docNameInput.value;
            });
        }

        // File upload
        const uploadZone = this.element.querySelector("#ocr-upload-zone") as HTMLElement;
        const fileInput = this.element.querySelector("#ocr-file-input") as HTMLInputElement;

        if (uploadZone && fileInput) {
            uploadZone.addEventListener("click", (e) => {
                if ((e.target as HTMLElement).closest("#ocr-remove-file")) return;
                if (!this.uploadedFile) {
                    fileInput.click();
                }
            });

            uploadZone.addEventListener("dragover", (e) => {
                e.preventDefault();
                uploadZone.classList.add("ocr-dock__upload--dragover");
            });

            uploadZone.addEventListener("dragleave", () => {
                uploadZone.classList.remove("ocr-dock__upload--dragover");
            });

            uploadZone.addEventListener("drop", (e) => {
                e.preventDefault();
                uploadZone.classList.remove("ocr-dock__upload--dragover");
                const files = e.dataTransfer?.files;
                if (files && files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });

            fileInput.addEventListener("change", () => {
                if (fileInput.files && fileInput.files.length > 0) {
                    this.handleFileSelect(fileInput.files[0]);
                }
            });
        }

        // Remove file button
        const removeFileBtn = this.element.querySelector("#ocr-remove-file");
        if (removeFileBtn) {
            removeFileBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.uploadedFile = null;
                this.render();
                this.bindEvents();
            });
        }

        // Start button
        const startBtn = this.element.querySelector("#ocr-start-btn");
        if (startBtn) {
            startBtn.addEventListener("click", () => this.startConversion());
        }

        // Open document button
        const openDocBtn = this.element.querySelector("#ocr-open-doc");
        if (openDocBtn) {
            openDocBtn.addEventListener("click", () => {
                if (this.state.resultDocId) {
                    openTab({
                        app: this.plugin.app,
                        doc: { id: this.state.resultDocId }
                    });
                }
            });
        }
    }

    private handleFileSelect(file: File) {
        if (!OcrService.isFileSupported(file.name)) {
            showMessage(this.i18n.supportedFormats, 3000, "error");
            return;
        }
        this.uploadedFile = file;
        this.state.error = undefined;
        this.state.resultDocId = undefined;
        this.render();
        this.bindEvents();
    }

    private async startConversion() {
        // Validation
        if (!this.selectedApiId) {
            showMessage(this.i18n.errorNoApi, 3000, "error");
            return;
        }
        if (!this.uploadedFile) {
            showMessage(this.i18n.errorNoFile, 3000, "error");
            return;
        }
        if (!this.selectedNotebookId) {
            showMessage(this.i18n.errorNoPath, 3000, "error");
            return;
        }

        const api = this.apis.find(a => a.id === this.selectedApiId);
        if (!api) {
            showMessage(this.i18n.errorNoApi, 3000, "error");
            return;
        }

        // Start processing
        this.state = {
            isProcessing: true,
            progress: 0,
            statusMessage: this.i18n.converting
        };
        this.render();
        this.bindEvents();

        try {
            // Call OCR API
            this.updateProgress(10, this.i18n.converting);
            const ocrService = new OcrService(api);
            const result = await ocrService.processDocument(this.uploadedFile);

            // Determine document path
            let docName = this.documentName.trim();
            if (!docName) {
                docName = this.uploadedFile.name.replace(/\.[^/.]+$/, "");
            }
            let docPath = this.targetPath;
            if (!docPath.endsWith("/")) {
                docPath += "/";
            }
            docPath += docName;

            // Create SiYuan document
            this.updateProgress(25, this.i18n.converting);
            const docId = await this.siyuanApi.processAndCreateDocument(
                result,
                this.selectedNotebookId,
                docPath,
                (progress, message) => this.updateProgress(progress, message)
            );

            // Success
            this.state = {
                isProcessing: false,
                progress: 100,
                statusMessage: this.i18n.success,
                resultDocId: docId
            };
            showMessage(this.i18n.success, 3000, "info");

        } catch (error) {
            console.error("OCR conversion failed:", error);
            this.state = {
                isProcessing: false,
                progress: 0,
                statusMessage: "",
                error: `${this.i18n.errorOccurred}: ${error instanceof Error ? error.message : String(error)}`
            };
            showMessage(this.i18n.errorApiRequest, 3000, "error");
        }

        this.render();
        this.bindEvents();
    }

    private updateProgress(progress: number, message: string) {
        this.state.progress = progress;
        this.state.statusMessage = message;
        const progressFill = this.element.querySelector(".ocr-dock__progress-fill") as HTMLElement;
        const progressText = this.element.querySelector(".ocr-dock__progress-text") as HTMLElement;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = message;
        }
    }

    private saveState() {
        this.plugin.saveData("ocr-state", {
            lastSelectedApiId: this.selectedApiId,
            lastNotebookId: this.selectedNotebookId,
            lastPath: this.targetPath
        });
    }
}
