import {
    Plugin,
    Setting,
    getFrontend,
    adaptHotkey
} from "siyuan";
import "./index.scss";
import { ApiConfig, PluginStorage } from "./types";
import { DockPanel } from "./components/dock-panel";
import { SettingsPanel } from "./components/settings-panel";

const STORAGE_NAME = "ocr-config";
const DOCK_TYPE = "ocr_dock";

export default class OcrPlugin extends Plugin {
    private isMobile: boolean;
    private dockPanel: DockPanel | null = null;
    private storage: PluginStorage = { apis: [] };

    onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // Add custom icons
        this.addIcons(`
            <symbol id="iconOCR" viewBox="0 0 1024 1024">
                <path d="M896 128H128c-35.2 0-64 28.8-64 64v640c0 35.2 28.8 64 64 64h768c35.2 0 64-28.8 64-64V192c0-35.2-28.8-64-64-64zM128 832V192h768v640H128z"/>
                <path d="M256 384h128v64H256zM256 512h128v64H256zM256 640h128v64H256zM448 384h320v64H448zM448 512h320v64H448zM448 640h320v64H448z"/>
            </symbol>
            <symbol id="iconUpload" viewBox="0 0 1024 1024">
                <path d="M544 864V533.312l109.248 109.248 45.248-45.248L512 410.816 325.504 597.312l45.248 45.248L480 533.312V864h64z"/>
                <path d="M832 384H704v-64h128c35.2 0 64 28.8 64 64v448c0 35.2-28.8 64-64 64H192c-35.2 0-64-28.8-64-64V384c0-35.2 28.8-64 64-64h128v64H192v448h640V384z"/>
                <path d="M512 160c88.384 0 160 71.616 160 160H352c0-88.384 71.616-160 160-160z"/>
            </symbol>
        `);

        // Add dock
        this.addDock({
            config: {
                position: "RightTop",
                size: { width: 320, height: 0 },
                icon: "iconOCR",
                title: this.i18n.dockTitle,
                hotkey: "⌥⇧O"
            },
            data: {},
            type: DOCK_TYPE,
            resize() {
                console.log(DOCK_TYPE + " resize");
            },
            update: () => {
                console.log(DOCK_TYPE + " update");
            },
            init: (dock) => {
                this.initDock(dock);
            },
            destroy: () => {
                console.log(DOCK_TYPE + " destroy");
                this.dockPanel = null;
            }
        });

        // Setup settings
        this.setupSettings();

        console.log("OCR Plugin loaded");
    }

    private initDock(dock: { element: HTMLElement }) {
        if (this.isMobile) {
            dock.element.innerHTML = `
                <div class="toolbar toolbar--border toolbar--dark">
                    <svg class="toolbar__icon"><use xlink:href="#iconOCR"></use></svg>
                    <div class="toolbar__text">${this.i18n.dockTitle}</div>
                </div>
                <div class="fn__flex-1 ocr-dock-container" id="ocr-dock-content"></div>
            `;
        } else {
            dock.element.innerHTML = `
                <div class="fn__flex-1 fn__flex-column">
                    <div class="block__icons">
                        <div class="block__logo">
                            <svg class="block__logoicon"><use xlink:href="#iconOCR"></use></svg>
                            ${this.i18n.dockTitle}
                        </div>
                        <span class="fn__flex-1 fn__space"></span>
                        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}">
                            <svg><use xlink:href="#iconMin"></use></svg>
                        </span>
                    </div>
                    <div class="fn__flex-1 ocr-dock-container" id="ocr-dock-content"></div>
                </div>
            `;
        }

        const contentEl = dock.element.querySelector("#ocr-dock-content") as HTMLElement;
        if (contentEl) {
            this.dockPanel = new DockPanel(this, contentEl, this.i18n);
            this.dockPanel.init(
                this.storage.apis,
                this.storage.lastSelectedApiId,
                this.storage.lastNotebookId,
                this.storage.lastPath
            );
        }
    }

    private setupSettings() {
        this.setting = new Setting({
            confirmCallback: () => {
                // Settings are saved automatically when APIs are modified
            }
        });

        const settingsPanel = new SettingsPanel(
            this.i18n,
            this.storage.apis,
            (apis) => this.saveApis(apis)
        );

        this.setting.addItem({
            title: this.i18n.apiSettings,
            description: "",
            createActionElement: () => settingsPanel.render()
        });
    }

    private async saveApis(apis: ApiConfig[]) {
        this.storage.apis = apis;
        await this.saveData(STORAGE_NAME, this.storage);

        // Update dock panel if it exists
        if (this.dockPanel) {
            this.dockPanel.updateApis(apis);
        }
    }

    async onLayoutReady() {
        // Load stored data
        const storedData = await this.loadData(STORAGE_NAME);
        if (storedData) {
            this.storage = storedData;
        }

        const stateData = await this.loadData("ocr-state");

        // Update dock panel with loaded data
        if (this.dockPanel) {
            this.dockPanel.init(
                this.storage.apis,
                stateData?.lastSelectedApiId ?? this.storage.lastSelectedApiId,
                stateData?.lastNotebookId ?? this.storage.lastNotebookId,
                stateData?.lastPath ?? this.storage.lastPath
            );
        }

        // Re-setup settings with loaded APIs
        this.setupSettings();

        console.log("OCR Plugin layout ready");
    }

    onunload() {
        console.log("OCR Plugin unloaded");
    }

    async uninstall() {
        await this.removeData(STORAGE_NAME);
        console.log("OCR Plugin uninstalled");
    }
}
