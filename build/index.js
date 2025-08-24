#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const server = new Server({
    name: "mcp-pdf-reader",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// 定义工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_pdf",
                description: "Read and extract text content from a PDF file",
                inputSchema: {
                    type: "object",
                    properties: {
                        file_path: {
                            type: "string",
                            description: "Path to the PDF file to read",
                        },
                    },
                    required: ["file_path"],
                },
            },
            {
                name: "get_pdf_info",
                description: "Get metadata information from a PDF file (title, author, pages, etc.)",
                inputSchema: {
                    type: "object",
                    properties: {
                        file_path: {
                            type: "string",
                            description: "Path to the PDF file to analyze",
                        },
                    },
                    required: ["file_path"],
                },
            },
            {
                name: "read_pages",
                description: "Read text content from specific pages of a PDF file",
                inputSchema: {
                    type: "object",
                    properties: {
                        file_path: {
                            type: "string",
                            description: "Path to the PDF file to read",
                        },
                        start_page: {
                            type: "number",
                            description: "Starting page number (1-based)",
                            minimum: 1,
                        },
                        end_page: {
                            type: "number",
                            description: "Ending page number (1-based, optional)",
                            minimum: 1,
                        },
                    },
                    required: ["file_path", "start_page"],
                },
            },
            {
                name: "search_in_pdf",
                description: "Search for specific text within a PDF file",
                inputSchema: {
                    type: "object",
                    properties: {
                        file_path: {
                            type: "string",
                            description: "Path to the PDF file to search in",
                        },
                        search_text: {
                            type: "string",
                            description: "Text to search for in the PDF",
                        },
                        case_sensitive: {
                            type: "boolean",
                            description: "Whether the search should be case sensitive",
                            default: false,
                        },
                    },
                    required: ["file_path", "search_text"],
                },
            },
        ],
    };
});
// 实现工具处理函数
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        switch (name) {
            case "read_pdf": {
                const { file_path } = args;
                if (!fs.existsSync(file_path)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `错误: 文件 ${file_path} 不存在`,
                            },
                        ],
                    };
                }
                if (!file_path.toLowerCase().endsWith(".pdf")) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `错误: ${file_path} 不是PDF文件`,
                            },
                        ],
                    };
                }
                try {
                    const dataBuffer = fs.readFileSync(file_path);
                    const data = await pdf(dataBuffer);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `PDF文件内容 (${data.numpages}页):\n\n${data.text}`,
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `读取PDF文件时出错: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
            case "get_pdf_info": {
                const { file_path } = args;
                if (!fs.existsSync(file_path)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `错误: 文件 ${file_path} 不存在`,
                            },
                        ],
                    };
                }
                try {
                    const dataBuffer = fs.readFileSync(file_path);
                    const data = await pdf(dataBuffer);
                    const info = {
                        文件路径: file_path,
                        文件名: path.basename(file_path),
                        文件大小: `${(dataBuffer.length / 1024 / 1024).toFixed(2)} MB`,
                        页数: data.numpages,
                        标题: data.info?.Title || "未知",
                        作者: data.info?.Author || "未知",
                        创建者: data.info?.Creator || "未知",
                        制作者: data.info?.Producer || "未知",
                        创建日期: data.info?.CreationDate || "未知",
                        修改日期: data.info?.ModDate || "未知",
                        文本字符数: data.text.length,
                        文本行数: data.text.split('\n').length,
                    };
                    return {
                        content: [
                            {
                                type: "text",
                                text: `PDF文件信息:\n${JSON.stringify(info, null, 2)}`,
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `获取PDF信息时出错: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
            case "read_pages": {
                const { file_path, start_page, end_page } = args;
                if (!fs.existsSync(file_path)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `错误: 文件 ${file_path} 不存在`,
                            },
                        ],
                    };
                }
                try {
                    const dataBuffer = fs.readFileSync(file_path);
                    const data = await pdf(dataBuffer);
                    if (start_page > data.numpages) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `错误: 起始页码 ${start_page} 超出了PDF总页数 ${data.numpages}`,
                                },
                            ],
                        };
                    }
                    const actualEndPage = end_page ? Math.min(end_page, data.numpages) : start_page;
                    // 这里简化处理，返回全文并标注页面范围
                    // 实际应用中可以使用更精确的页面分离方法
                    const pageRange = start_page === actualEndPage
                        ? `第${start_page}页`
                        : `第${start_page}-${actualEndPage}页`;
                    return {
                        content: [
                            {
                                type: "text",
                                text: `PDF文件 ${path.basename(file_path)} ${pageRange}的内容:\n\n${data.text}`,
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `读取PDF页面时出错: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
            case "search_in_pdf": {
                const { file_path, search_text, case_sensitive = false } = args;
                if (!fs.existsSync(file_path)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `错误: 文件 ${file_path} 不存在`,
                            },
                        ],
                    };
                }
                try {
                    const dataBuffer = fs.readFileSync(file_path);
                    const data = await pdf(dataBuffer);
                    const textToSearch = case_sensitive ? data.text : data.text.toLowerCase();
                    const searchTerm = case_sensitive ? search_text : search_text.toLowerCase();
                    const matches = [];
                    const lines = data.text.split('\n');
                    lines.forEach((line, index) => {
                        const lineToCheck = case_sensitive ? line : line.toLowerCase();
                        if (lineToCheck.includes(searchTerm)) {
                            matches.push(`第${index + 1}行: ${line.trim()}`);
                        }
                    });
                    if (matches.length === 0) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `在PDF文件 ${path.basename(file_path)} 中未找到 "${search_text}"`,
                                },
                            ],
                        };
                    }
                    // 限制显示结果数量，避免输出过长
                    const displayMatches = matches.slice(0, 10);
                    const hasMore = matches.length > 10;
                    return {
                        content: [
                            {
                                type: "text",
                                text: `在PDF文件 ${path.basename(file_path)} 中找到 ${matches.length} 个匹配项${hasMore ? ' (显示前10个)' : ''}:\n\n${displayMatches.join('\n')}${hasMore ? '\n\n...(还有更多结果)' : ''}`,
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `搜索PDF内容时出错: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `未知工具: ${name}`,
                        },
                    ],
                    isError: true,
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `执行工具时发生错误: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP PDF Reader server running on stdio");
}
main().catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map