import { Dialog, showMessage, confirm } from "siyuan";
import { ApiConfig, ApiType } from "../types";

export class SettingsPanel {
    private i18n: Record<string, string>;
    private apis: ApiConfig[];
    private onSave: (apis: ApiConfig[]) => void;

    constructor(
        i18n: Record<string, string>,
        apis: ApiConfig[],
        onSave: (apis: ApiConfig[]) => void
    ) {
        this.i18n = i18n;
        this.apis = [...apis];
        this.onSave = onSave;
    }

    render(): HTMLElement {
        const container = document.createElement("div");
        container.className = "ocr-settings";
        container.innerHTML = this.getHtml();
        this.bindEvents(container);
        return container;
    }

    private getHtml(): string {
        return `
            <div class="ocr-settings__header">
                <h3 class="ocr-settings__title">${this.i18n.apiConfigurations}</h3>
                <button class="b3-button b3-button--outline" id="ocr-add-api">
                    <svg class="b3-button__icon"><use xlink:href="#iconAdd"></use></svg>
                    ${this.i18n.addApi}
                </button>
            </div>
            <div class="ocr-settings__list" id="ocr-api-list">
                ${this.apis.length === 0 ? `
                    <div class="ocr-settings__empty">${this.i18n.noApiConfigured}</div>
                ` : this.apis.map(api => this.renderApiItem(api)).join("")}
            </div>
        `;
    }

    private renderApiItem(api: ApiConfig): string {
        return `
            <div class="ocr-settings__item" data-id="${api.id}">
                <div class="ocr-settings__item-header">
                    <span class="ocr-settings__item-name">${api.displayName}</span>
                    <span class="ocr-settings__item-type">${api.apiType}</span>
                </div>
                <div class="ocr-settings__item-url">${api.apiUrl}</div>
                ${api.model ? `<div class="ocr-settings__item-url" style="color: var(--b3-theme-on-surface-light);">Model: ${api.model}</div>` : ""}
                <div class="ocr-settings__item-actions">
                    <button class="b3-button b3-button--small ocr-edit-api" data-id="${api.id}">
                        <svg class="b3-button__icon"><use xlink:href="#iconEdit"></use></svg>
                        ${this.i18n.editApi}
                    </button>
                    <button class="b3-button b3-button--small b3-button--error ocr-delete-api" data-id="${api.id}">
                        <svg class="b3-button__icon"><use xlink:href="#iconTrashcan"></use></svg>
                        ${this.i18n.deleteApi}
                    </button>
                </div>
            </div>
        `;
    }

    private bindEvents(container: HTMLElement) {
        // Add API button
        const addBtn = container.querySelector("#ocr-add-api");
        if (addBtn) {
            addBtn.addEventListener("click", () => this.showApiDialog());
        }

        // Edit buttons
        container.querySelectorAll(".ocr-edit-api").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = (btn as HTMLElement).dataset.id;
                const api = this.apis.find(a => a.id === id);
                if (api) {
                    this.showApiDialog(api);
                }
            });
        });

        // Delete buttons
        container.querySelectorAll(".ocr-delete-api").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = (btn as HTMLElement).dataset.id;
                if (id) {
                    this.deleteApi(id, container);
                }
            });
        });
    }

    private showApiDialog(existingApi?: ApiConfig) {
        const isEdit = !!existingApi;
        const api: ApiConfig = existingApi || {
            id: this.generateId(),
            displayName: "",
            apiType: "mistral",
            apiUrl: "https://api.mistral.ai/v1/ocr",
            apiKey: "",
            model: "mistral-ocr-latest"
        };

        const dialog = new Dialog({
            title: isEdit ? this.i18n.editApi : this.i18n.addApi,
            content: `
                <div class="b3-dialog__content">
                    <div class="ocr-dialog__form">
                        <div class="ocr-dialog__field">
                            <label class="ocr-dialog__label">${this.i18n.displayName}</label>
                            <input type="text" class="b3-text-field" id="ocr-api-name"
                                placeholder="${this.i18n.displayNamePlaceholder}" value="${api.displayName}">
                        </div>
                        <div class="ocr-dialog__field">
                            <label class="ocr-dialog__label">${this.i18n.apiType}</label>
                            <select class="b3-select" id="ocr-api-type">
                                <option value="mistral" ${api.apiType === "mistral" ? "selected" : ""}>
                                    ${this.i18n.mistralOcr}
                                </option>
                            </select>
                        </div>
                        <div class="ocr-dialog__field">
                            <label class="ocr-dialog__label">${this.i18n.model}</label>
                            <input type="text" class="b3-text-field" id="ocr-api-model"
                                placeholder="${this.i18n.modelPlaceholder}" value="${api.model || "mistral-ocr-latest"}">
                        </div>
                        <div class="ocr-dialog__field">
                            <label class="ocr-dialog__label">${this.i18n.apiUrl}</label>
                            <input type="text" class="b3-text-field" id="ocr-api-url"
                                placeholder="${this.i18n.apiUrlPlaceholder}" value="${api.apiUrl}">
                        </div>
                        <div class="ocr-dialog__field">
                            <label class="ocr-dialog__label">${this.i18n.apiKey}</label>
                            <input type="password" class="b3-text-field" id="ocr-api-key"
                                placeholder="${this.i18n.apiKeyPlaceholder}" value="${api.apiKey}">
                        </div>
                    </div>
                </div>
                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel" id="ocr-dialog-cancel">${this.i18n.cancel}</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text" id="ocr-dialog-save">${this.i18n.save}</button>
                </div>
            `,
            width: "520px"
        });

        // Handle API type change to update default URL
        const typeSelect = dialog.element.querySelector("#ocr-api-type") as HTMLSelectElement;
        const urlInput = dialog.element.querySelector("#ocr-api-url") as HTMLInputElement;
        typeSelect?.addEventListener("change", () => {
            if (typeSelect.value === "mistral" && !urlInput.value) {
                urlInput.value = "https://api.mistral.ai/v1/ocr";
            }
        });

        // Cancel button
        dialog.element.querySelector("#ocr-dialog-cancel")?.addEventListener("click", () => {
            dialog.destroy();
        });

        // Save button
        dialog.element.querySelector("#ocr-dialog-save")?.addEventListener("click", () => {
            const nameInput = dialog.element.querySelector("#ocr-api-name") as HTMLInputElement;
            const keyInput = dialog.element.querySelector("#ocr-api-key") as HTMLInputElement;
            const modelInput = dialog.element.querySelector("#ocr-api-model") as HTMLInputElement;

            const updatedApi: ApiConfig = {
                id: api.id,
                displayName: nameInput.value.trim() || this.i18n.defaultApiName,
                apiType: typeSelect.value as ApiType,
                apiUrl: urlInput.value.trim(),
                apiKey: keyInput.value,
                model: modelInput.value.trim()
            };

            if (isEdit) {
                const index = this.apis.findIndex(a => a.id === api.id);
                if (index >= 0) {
                    this.apis[index] = updatedApi;
                }
            } else {
                this.apis.push(updatedApi);
            }

            this.onSave(this.apis);
            showMessage(this.i18n.apiSaved, 2000, "info");
            dialog.destroy();

            // Re-render the settings panel
            const settingsContainer = document.querySelector(".ocr-settings");
            if (settingsContainer) {
                settingsContainer.innerHTML = this.getHtml();
                this.bindEvents(settingsContainer as HTMLElement);
            }
        });
    }

    private deleteApi(id: string, container: HTMLElement) {
        confirm(this.i18n.confirm, this.i18n.confirmDelete, () => {
            this.apis = this.apis.filter(a => a.id !== id);
            this.onSave(this.apis);
            showMessage(this.i18n.apiDeleted, 2000, "info");

            // Re-render
            container.innerHTML = this.getHtml();
            this.bindEvents(container);
        });
    }

    private generateId(): string {
        return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
