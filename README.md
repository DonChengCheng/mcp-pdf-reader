# MCP PDF Reader

一个基于 Model Context Protocol (MCP) 的 PDF 文件读取服务器，为 AI 助手（如 Claude）提供强大的 PDF 文件处理能力。

## 功能特性

- 📖 **读取 PDF 文件**：提取 PDF 文件的完整文本内容
- 📊 **获取 PDF 元数据**：获取文件信息（标题、作者、页数、创建日期等）
- 📄 **按页读取**：支持读取指定页面范围的内容
- 🔍 **文本搜索**：在 PDF 中搜索特定文本，支持大小写敏感搜索
- ⚡ **稳定可靠**：使用 CommonJS 方式加载 pdf-parse，避免 ESM 兼容性问题
- 🛡️ **错误处理**：完善的错误处理和用户友好的错误信息

## 安装

### 前置要求

- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/DonChengCheng/mcp-pdf-reader.git
cd mcp-pdf-reader
```

2. 安装依赖：
```bash
npm install
```

3. 构建项目：
```bash
npm run build
```

## 配置使用

### 在 Claude Desktop 中使用

在 Claude Desktop 的配置文件中添加以下配置：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "node",
      "args": ["/path/to/mcp-pdf-reader/build/index.js"]
    }
  }
}
```

将 `/path/to/mcp-pdf-reader` 替换为实际的项目路径。

重启 Claude Desktop 后，即可在对话中使用 PDF 读取功能。

## 可用工具

### 1. read_pdf
读取 PDF 文件的完整文本内容。

**参数：**
- `file_path` (string, 必需): PDF 文件的路径

**使用示例：**
```
请读取文件 /Users/xxx/Documents/report.pdf
```

**返回：**
- PDF 文件的完整文本内容
- 总页数信息

### 2. get_pdf_info
获取 PDF 文件的元数据信息。

**参数：**
- `file_path` (string, 必需): PDF 文件的路径

**返回信息：**
- 文件路径、文件名、文件大小
- 页数
- 标题、作者、创建者、制作者
- 创建日期、修改日期
- 文本字符数、文本行数

**使用示例：**
```
获取 /Users/xxx/Documents/report.pdf 的详细信息
```

### 3. read_pages
读取 PDF 文件的特定页面范围。

**参数：**
- `file_path` (string, 必需): PDF 文件的路径
- `start_page` (number, 必需): 起始页码（从 1 开始）
- `end_page` (number, 可选): 结束页码（从 1 开始）

**使用示例：**
```
读取文件 /Users/xxx/Documents/report.pdf 的第 5 到第 10 页
```

### 4. search_in_pdf
在 PDF 文件中搜索特定文本。

**参数：**
- `file_path` (string, 必需): PDF 文件的路径
- `search_text` (string, 必需): 要搜索的文本
- `case_sensitive` (boolean, 可选): 是否大小写敏感，默认为 false

**使用示例：**
```
在文件 /Users/xxx/Documents/report.pdf 中搜索 "重要数据"
```

**返回：**
- 匹配项的总数
- 包含匹配文本的行（最多显示前 10 个）
- 每个匹配项的行号

## 开发

### 项目结构

```
mcp-pdf-reader/
├── src/
│   └── index.ts        # 主服务器代码
├── build/              # 编译后的 JavaScript 文件
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
├── .gitignore         # Git 忽略文件
└── README.md          # 本文档
```

### 开发命令

- `npm run build` - 构建项目
- `npm run watch` - 监视文件变化并自动重新构建
- `npm run inspector` - 运行 MCP 检查器进行调试

### 技术实现

#### ESM 与 CommonJS 兼容性处理

项目使用 ESM 模块系统，但通过 `createRequire` 方法加载 CommonJS 模块：

```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
```

这种方式确保了与 pdf-parse 库的完美兼容。

#### 错误处理机制

- 文件存在性检查
- PDF 文件格式验证
- 页码范围验证
- 详细的错误信息返回

#### 性能优化

- 搜索结果限制（最多显示前 10 个匹配项）
- 大文件处理优化
- 内存友好的流式处理

### 技术栈

- **TypeScript**: 类型安全的开发语言
- **@modelcontextprotocol/sdk**: MCP 官方 SDK
- **pdf-parse**: PDF 文件解析库
- **canvas**: PDF 渲染支持（pdf-parse 的依赖）

## 限制和注意事项

1. **文本提取限制**：目前只支持文本内容提取，不支持：
   - 图片提取
   - 表格结构保持
   - 复杂格式保留

2. **页面分离**：由于 pdf-parse 库的限制，按页读取功能目前返回的是全文内容

3. **搜索结果**：为避免输出过长，搜索结果最多显示前 10 个匹配项

4. **文件大小**：处理超大 PDF 文件时可能需要更多内存

## 故障排除

### 常见问题

1. **Canvas 编译错误**
   - 确保系统安装了必要的编译工具
   - macOS: 安装 Xcode Command Line Tools
   - Windows: 安装 windows-build-tools
   - Linux: 安装 build-essential

2. **PDF 解析失败**
   - 检查 PDF 文件是否损坏
   - 确认文件路径是否正确
   - 验证文件权限

3. **MCP 连接失败**
   - 检查配置文件路径是否正确
   - 确保构建后的文件存在
   - 重启 Claude Desktop

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 作者

**dongchengcheng**

## 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - 提供协议标准
- [MCP SDK](https://github.com/modelcontextprotocol/sdk) - 官方 SDK
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF 解析库

## 更新日志

### v1.0.0 (2024)
- 初始版本发布
- 实现基础 PDF 读取功能
- 添加元数据获取
- 实现文本搜索功能
- 解决 ESM/CommonJS 兼容性问题

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/DonChengCheng/mcp-pdf-reader/issues)
- 发起 [Discussion](https://github.com/DonChengCheng/mcp-pdf-reader/discussions)