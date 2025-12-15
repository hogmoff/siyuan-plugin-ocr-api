[English](README.md) | [Deutsch](README_de_DE.md)

# 思源 OCR 文档转换器

一个将文档（PDF、图片）通过 OCR API 转换为思源笔记的插件。

## 功能特点

- **侧边栏集成**：直接从思源侧边栏访问 OCR 转换功能
- **多 API 支持**：配置和使用多个 OCR API 提供商
- **Mistral OCR**：内置支持 Mistral 的 OCR API
- **格式保留**：将 OCR 结果转换为 markdown 同时保留格式
- **多语言**：支持英文、德文和中文界面
- **拖放上传**：通过拖放或文件选择器轻松上传文件

## 支持的文档格式

- PDF
- PNG
- JPG/JPEG
- TIFF
- BMP
- WEBP

## 安装

1. 从发布页面下载最新版本
2. 将 `package.zip` 解压到 `{workspace}/data/plugins/siyuan-plugin-ocr`
3. 重启思源或重新加载插件
4. 在思源设置中启用插件

## 使用方法

### 1. 配置 API

1. 打开思源设置 > 插件 > OCR 文档转换器
2. 点击"添加 API"添加新的 OCR API 配置
3. 输入：
   - **显示名称**：此 API 配置的友好名称
   - **API 类型**：选择 OCR 提供商（目前为 Mistral）
   - **API 地址**：API 端点（默认：`https://api.mistral.ai/v1/ocr`）
   - **API 密钥**：您从提供商获取的 API 密钥

### 2. 转换文档

1. 打开 OCR 转换器面板（侧边栏图标或快捷键 `⌥⇧O`）
2. 从下拉菜单中选择一个 OCR API
3. 选择新文档的目标笔记本和路径
4. 可选择输入自定义文档名称
5. 通过拖放或点击选择上传文档
6. 点击"开始转换"
7. 完成后，点击"打开文档"查看结果

## 文档属性

插件会自动向创建的文档添加以下属性：

- `custom-ocr-source-file`：原始扫描文件名
- `custom-ocr-date`：转换日期
- `custom-ocr-pages`：页数
- `custom-ocr-images`：图片数量
- `custom-ocr-model`：转换使用的模型

## API 提供商

### Mistral OCR

[Mistral AI](https://mistral.ai/) 提供强大的 OCR API，可以从文档中提取文本同时保留格式。

1. 在 [console.mistral.ai](https://console.mistral.ai/) 创建账户
2. 生成 API 密钥
3. 在插件设置中使用该密钥

更多信息，请参阅 [Mistral OCR 文档](https://docs.mistral.ai/capabilities/document_ai/basic_ocr)。

## 数据隐私和文件存储

- **原始文件**：上传的源文件不会存储在 SiYuan 中。它们仅在转换期间发送到 API。
- **提取的图像**：从文档中提取的图像将保存到 SiYuan 的 `assets` 文件夹中，以便在转换后的文档中显示。
- **API 隐私**：请遵守各个 API 提供商的隐私政策。这些不在插件作者的责任范围内。

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式构建（监听文件变化）
pnpm run dev

# 生产模式构建
pnpm run build
```

## 贡献

欢迎参与插件开发！但是请注意，所有贡献（Issue、Pull Request、讨论）必须且仅能使用**英语**，以便于国际合作。

## 许可证

MIT 许可证
