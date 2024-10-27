import * as vscode from "vscode";
import RandExp from "randexp";

const regexPattern = /\/(.*?)\//g; // Matches regex literals of the form /pattern/

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("regexInsight");

  // Exit if the extension is disabled
  if (!config.get("enable")) {
    return;
  }

  // Define decoration type using highlight color from configuration
  const highlightColor = config.get("highlightColor", "rgba(255, 215, 0, 0.3)");
  const regexDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: highlightColor,
    border: "1px solid yellow",
  });

  const supportedLanguages = ["javascript", "typescript"];

  // Register hover provider
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

  // Register document change listener for highlighting
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (
        editor &&
        editor.document === event.document &&
        supportedLanguages.includes(editor.document.languageId)
      ) {
        highlightRegexPatterns(editor.document, regexDecorationType);
      }
    })
  );

  // Initial highlight for active editor
  const activeEditor = vscode.window.activeTextEditor;
  if (
    activeEditor &&
    supportedLanguages.includes(activeEditor.document.languageId)
  ) {
    highlightRegexPatterns(activeEditor.document, regexDecorationType);
  }

  // Register listener for active editor change
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && supportedLanguages.includes(editor.document.languageId)) {
        highlightRegexPatterns(editor.document, regexDecorationType);
      }
    })
  );
}

/**
 * Highlights regex patterns in the given document
 * @param document - The text document
 * @param decorationType - The decoration type to use for highlighting
 */
function highlightRegexPatterns(
  document: vscode.TextDocument,
  decorationType: vscode.TextEditorDecorationType
) {
  const text = document.getText();
  const regexRanges: vscode.DecorationOptions[] = [];

  let match;
  while ((match = regexPattern.exec(text)) !== null) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    regexRanges.push({ range: new vscode.Range(startPos, endPos) });
  }

  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document === document) {
    editor.setDecorations(decorationType, regexRanges);
  }
}

/**
 * Gets the full range of a regex pattern at a given position
 * @param document - The text document
 * @param position - The position in the document
 * @returns The range of the regex pattern at the given position
 */
export function getRegexRangeAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range | undefined {
  const text = document.getText();
  const offset = document.offsetAt(position);

  let match;
  while ((match = regexPattern.exec(text)) !== null) {
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

/**
 * Generates an example from a regex string
 * @param regexString - The regex string
 * @returns An example string that matches the regex pattern
 */
export function generateExampleFromRegex(regexString: string): string {
  const pattern = regexString.slice(1, -1); // Removes leading and trailing slashes
  try {
    const randExp = new RandExp(pattern);
    return randExp.gen();
  } catch {
    return "Invalid regex pattern.";
  }
}

export function deactivate() {}
