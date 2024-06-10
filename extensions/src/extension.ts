'use strict';

import * as vscode from 'vscode';
import OpenAI from "openai";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.API_KEY});

export async function activate(context: vscode.ExtensionContext) {
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
        } catch (error) {
            console.error("Error generating function code:", error);
        }
    });

    context.subscriptions.push(disposable);
}


async function generateFunction(functionName: string, fileExtension: string): Promise<string> {
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
    } catch (error) {
        console.error("Error generating function code:", error);
        vscode.window.showErrorMessage('Can not generate code.');
        return ``;
    }
}
