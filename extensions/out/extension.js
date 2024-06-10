'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const openai_1 = __importDefault(require("openai"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
const openai = new openai_1.default({ apiKey: process.env.API_KEY });
async function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.generateFunction', async () => {
        // Get the selected text
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No file is currently open.');
            return;
        }
        let uri = editor.document.uri;
        let filePath = uri.fsPath;
        let fileExtension = filePath.split('.').pop() ?? ''; // Sử dụng '' nếu `pop()` trả về `undefined`
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showErrorMessage('Function name not provided.');
            return;
        }
        try {
            // Generate the function code based on function name and selected text
            const functionCode = await generateFunction(selectedText, fileExtension);
            // Insert the generated function at the current cursor position
            editor.edit(editBuilder => {
                editBuilder.replace(selection, functionCode);
            });
        }
        catch (error) {
            console.error("Error generating function code:", error);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
async function generateFunction(functionName, fileExtension) {
    try {
        const a = "I want you create only code in file ";
        const b = " (Do not have any explain and example. Do not have example using. JUST CODE) about: ";
        const fixPromt = a + fileExtension + b;
        functionName = fixPromt + functionName;
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: functionName }],
            model: "gpt-3.5-turbo",
            max_tokens: 200, // Adjust max tokens as needed
            stop: [] // Stop generation at the end of the line
        });
        // Kiểm tra xem completion.choices[0] có tồn tại không trước khi truy cập message
        if (completion.choices && completion.choices.length > 0) {
            const messageContent = completion.choices[0].message?.content;
            if (messageContent) {
                return messageContent.trim();
            }
        }
        // Nếu không có message hoặc content là null, trả về chuỗi mặc định
        return ``;
    }
    catch (error) {
        console.error("Error generating function code:", error);
        vscode.window.showErrorMessage('Can not generate code.');
        return ``;
    }
}
//# sourceMappingURL=extension.js.map