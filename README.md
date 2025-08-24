# MCP PDF Reader

一个稳定可靠的MCP（Model Context Protocol）服务器，用于读取和分析PDF文件。使用延迟加载技术避免初始化问题。

## 功能特性

- 📖 **完整PDF读取**: 提取PDF文档中的所有文本内容
- 📊 **PDF元数据获取**: 获取文件大小、页数、作者、标题等详细信息
- 📄 **分页读取**: 读取指定页面范围的内容
- 🔍 **文本搜索**: 在PDF文档中搜索特定文本，支持大小写敏感选项
- ⚡ **延迟加载**: 使用动态导入避免pdf-parse初始化问题
- 🛡️ **错误处理**: 完善的错误处理和用户友好的错误信息

## 安装和使用

### 1. 安装依赖

```bash
cd mcp-pdf-reader
npm install
```

### 2. 构建项目

```bash
npm run build
```

### 3. 配置MCP

确保项目根目录的 `.mcp.json` 文件配置正确：

```json
{
  "servers": {
    "pdf-reader": {
      "command": "node",
      "args": [
        "/path/to/mcp-pdf-reader/build/index.js"
      ],
      "description": "PDF文件读取和分析服务器"
    }
  }
}
```

## 可用工具

### 1. read_pdf
读取PDF文件的全部文本内容。

**参数:**
- `file_path` (string): PDF文件的路径

**示例:**
```json
{
  "file_path": "/path/to/document.pdf"
}
```

### 2. get_pdf_info
获取PDF文件的详细元数据信息。

**参数:**
- `file_path` (string): PDF文件的路径

**返回信息:**
- 文件路径和文件名
- 文件大小
- 页数
- 标题、作者、创建者、制作者
- 创建和修改日期
- 文本字符数和行数

### 3. read_pages
读取PDF文件指定页面的内容。

**参数:**
- `file_path` (string): PDF文件的路径
- `start_page` (number): 起始页码（从1开始）
- `end_page` (number, 可选): 结束页码（从1开始）

**示例:**
```json
{
  "file_path": "/path/to/document.pdf",
  "start_page": 1,
  "end_page": 3
}
```

### 4. search_in_pdf
在PDF文件中搜索特定文本。

**参数:**
- `file_path` (string): PDF文件的路径
- `search_text` (string): 要搜索的文本
- `case_sensitive` (boolean, 可选): 是否区分大小写，默认为 false

**示例:**
```json
{
  "file_path": "/path/to/document.pdf",
  "search_text": "重要信息",
  "case_sensitive": false
}
```

## 技术特点

### 延迟加载机制
使用动态导入(`import()`)方式加载pdf-parse库，避免在服务器启动时发生初始化错误：

```typescript
const getPdfParser = async () => {
  if (!pdfParseCache) {
    const pdfParseModule = await import("pdf-parse");
    pdfParseCache = pdfParseModule.default || pdfParseModule;
  }
  return pdfParseCache;
};
```

### 错误处理
- 文件存在性检查
- PDF文件格式验证
- 页码范围验证
- 完善的异常捕获和错误消息

### 性能优化
- 搜索结果限制显示数量（最多10个）
- 缓存PDF解析器实例
- 内存友好的文件处理

## 开发和测试

### 构建项目
```bash
npm run build
```

### 监视模式
```bash
npm run watch
```

### 使用MCP Inspector测试
```bash
npm run inspector
```

### 测试搜索结果限制
搜索功能会自动限制显示结果数量，避免输出过长：
- 最多显示前10个匹配结果
- 显示总匹配数量
- 超过限制时提示"还有更多结果"

## 依赖项

- `@modelcontextprotocol/sdk`: MCP官方SDK
- `pdf-parse`: PDF文本解析库
- `canvas`: PDF渲染支持（解决pdf-parse依赖问题）

## 许可证

MIT License