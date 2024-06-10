'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.generateFunctionAndQuery', async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        await query(selectedText);
    });

    context.subscriptions.push(disposable);
}

async function query(selectedText: string): Promise<void> {
    const response = await fetch(
        'http://127.0.0.1:8080/generate',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                'inputs': selectedText,
                'parameters': {
                    'max_new_tokens': 20
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(JSON.stringify(responseData));
}
