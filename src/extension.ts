import * as vscode from "vscode";
import RandExp from "randexp";

const REGEX_PATTERN = /\/(.*?)\//g;

export function activate(context: vscode.ExtensionContext) {
  const regexDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255, 215, 0, 0.3)", // Light yellow
    border: "1px solid yellow",
  });

  // Register the hover provider for supported languages
  const supportedLanguages = ["javascript", "typescript"];
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(supportedLanguages, {
      provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const wordRange = getRegexRangeAtPosition(document, position);
        if (wordRange) {
          const word = document.getText(wordRange);
          const example = generateExampleFromRegex(word);
          return new vscode.Hover(`Example Match: \`${example}\``);
        }
      },
    })
  );

  // Highlight regex patterns when the document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document === event.document) {
        highlightRegexPatterns(editor.document, regexDecorationType);
      }
    })
  );

  // Initial highlighting for the active text editor
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    highlightRegexPatterns(activeEditor.document, regexDecorationType);
  }

  // Listen for active editor change and highlight regex patterns
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        highlightRegexPatterns(editor.document, regexDecorationType);
      }
    })
  );
}

// Function to find and highlight regex patterns
function highlightRegexPatterns(
  document: vscode.TextDocument,
  decorationType: vscode.TextEditorDecorationType
) {
  const text = document.getText();
  const regexRanges: vscode.DecorationOptions[] = [];

  let match;
  while ((match = REGEX_PATTERN.exec(text)) !== null) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    const range = new vscode.Range(startPos, endPos);
    regexRanges.push({ range });
  }

  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document === document) {
    editor.setDecorations(decorationType, regexRanges);
  }
}

// Helper function to get the full range of a regex pattern at a given position
function getRegexRangeAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range | undefined {
  const text = document.getText();
  const offset = document.offsetAt(position);

  let match;
  while ((match = REGEX_PATTERN.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (offset >= start && offset <= end) {
      return new vscode.Range(
        document.positionAt(start),
        document.positionAt(end)
      );
    }
  }

  return undefined;
}

// Function to generate an example from a regex string
function generateExampleFromRegex(regexString: string): string {
  const pattern = regexString.slice(1, -1); // Remove leading and trailing slashes
  try {
    const randExp = new RandExp(pattern);
    return randExp.gen();
  } catch (error) {
    return "Invalid regex pattern.";
  }
}

export function deactivate() {}
