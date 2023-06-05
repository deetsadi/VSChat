// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode");
const path = require('path');
const fs = require('fs');
const chat = require("./generate.js");
const { start } = require("repl");

module.exports = {
  activate,
  deactivate,
};

// create a decorator type that we use to decorate small numbers
const numberDecorationType = vscode.window.createTextEditorDecorationType({
  borderWidth: "1px",
  borderStyle: "solid",
  overviewRulerColor: "blue",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: {
    // this color will be used in light color themes
    borderColor: "darkblue",
  },
  dark: {
    // this color will be used in dark color themes
    borderColor: "lightblue",
  },
});
let timeout;
let activeEditor;

function waitForApiKey(context) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      checkAPIKey(context);
      if (process.env.OPENAI_API_KEY) {
        console.log("API key recognized! " + process.env.OPENAI_API_KEY)
        clearInterval(interval);
        resolve();
      }
    }, 1000); 

    process.on("env", () => {
      if (process.env.OPENAI_API_KEY) {
        clearInterval(interval);
        resolve();
        console.log("API key entered!")
      }
    });
  });
}

async function deleteAPIKey(context) {
  const secrets = context.secrets;
  await secrets.delete("apiKey");
  delete process.env.OPENAI_API_KEY;

  console.log("API Key deleted.")
}

async function checkAPIKey(context) {
  const secrets = context.secrets;
  userToken = await secrets.get("apiKey");
  if (userToken) process.env.OPENAI_API_KEY = userToken;

  console.log("API Key: " + process.env.OPENAI_API_KEY);
}


// This method is called when your extension is activated
function activate(context) {

  console.log("CodeSearch is running!");
  const secrets = context.secrets;

  let disposable = vscode.commands.registerCommand('extension.setAPIKey', async () => {
      const secrets = context.secrets;
      let userToken = await secrets.get("apiKey");
      userToken = await vscode.window.showInputBox({ title: 'Enter your OpenAI API key', password: true });
      await secrets.store("apiKey", userToken);
      process.env.OPENAI_API_KEY = await secrets.get("apiKey"); 
  });

  let disposableMaxTokens = vscode.commands.registerCommand('extension.setMaxTokens', async () => {
    const secrets = context.secrets;
    let userToken = await secrets.get("maxTokens");
    userToken = await vscode.window.showInputBox({ title: 'Enter the max tokens to include in responses.', password: false });
    await secrets.store("maxTokens", userToken);
    process.env.MAX_TOKENS = await secrets.get("maxTokens"); 
});

  waitForApiKey(context).then(() => {
    activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
      triggerDecoratorCheck();
    }

    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        activeEditor = editor;
        if (editor) {
          triggerDecoratorCheck();
        }
      },
      null,
      context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (activeEditor && event.document === activeEditor.document) {
          triggerDecoratorCheck(true);
        }
      },
      null,
      context.subscriptions
    );
  });
}

function decorateText(lineIndex, startIndex, endIndex) {
  const text_to_highlight = [];
  const decoration = {
    range: new vscode.Range(lineIndex, startIndex+2, lineIndex, endIndex),
  };

  text_to_highlight.push(decoration);

  activeEditor.setDecorations(numberDecorationType, text_to_highlight);
}

function revertDecoration(lineIndex, startIndex, endIndex) {
  const text_to_highlight = [];
  const decoration = {
    range: new vscode.Range(lineIndex, startIndex+2, lineIndex, endIndex),
  };

  text_to_highlight.push(decoration);

  activeEditor.setDecorations(numberDecorationType, []);
}

async function codeSearch(activeEditor,lineIndex,context) {

  const document = activeEditor.document;
  const line = document.lineAt(lineIndex);
  const selection = activeEditor.selection;
  const lineCount = document.lineCount;

  const lineText = line.text
  const range = line.range;

  const startIndex = lineText.indexOf('@s');
  const endIndex = lineText.indexOf('@e');
  const codeSearchSnippet = lineText.slice(startIndex, endIndex).replace('@s','').replace('@e','');
  const cleanedLine = lineText.slice(0, startIndex) + lineText.slice(startIndex + 2, endIndex) + lineText.slice(endIndex+2, lineText.length);

  // decorateText(lineIndex, startIndex, endIndex);
  decorateText(lineIndex, startIndex, endIndex);

  if (!process.env.MAX_TOKENS) process.env.MAX_TOKENS = 200;
  response = await chat.generate(codeSearchSnippet, process.env.OPENAI_API_KEY, parseInt(process.env.MAX_TOKENS));
  // numberDecorationType.dispose();
  revertDecoration(lineIndex, startIndex, endIndex);

  // Calculate the position of the next line
  const nextLine = Math.min(lineIndex + 1, lineCount);

  // Create a range for the next line
  const nextLineRange = new vscode.Range(nextLine, 0, nextLine, 0);

  const editedLine = new vscode.TextEdit(range, cleanedLine);
  const output = new vscode.TextEdit(nextLineRange, response);
  const workspaceEditOriginalLine = new vscode.WorkspaceEdit();
  workspaceEditOriginalLine.set(document.uri, [editedLine, output]);
  vscode.workspace.applyEdit(workspaceEditOriginalLine);
  
}

function decoratorCheck() {
  if (!activeEditor) {
    return;
  }

  const regEx = /\d+/g;
  const text = activeEditor.document.getText();

  const document = activeEditor.document;
  const lineCount = document.lineCount;

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const line = document.lineAt(lineIndex);
    const lineText = line.text;

    if (lineText.includes('@s') && lineText.includes('@e') && lineText.indexOf('@s') < lineText.indexOf('@e')) {
      console.log("Calling codesearch!")
      codeSearch(activeEditor, lineIndex);
    }
  }
}

function triggerDecoratorCheck(throttle = false) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }

  if (throttle) {
    timeout = setTimeout(decoratorCheck, 500);
  } else {
    decoratorCheck();
  }
}

// this method is called when your extension is deactivated
function deactivate() {}
