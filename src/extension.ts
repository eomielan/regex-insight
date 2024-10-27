import * as vscode from "vscode";
import RandExp from "randexp";

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("regexInsight");

  // Verify extension is enabled
  if (!config.get("enable")) {
    return;
  }

  // Use the highlight color from configuration
  const highlightColor = config.get("highlightColor", "rgba(255, 215, 0, 0.3)");
  const regexDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: highlightColor,
    border: "1px solid yellow",
  });

  // Register hover provider, document change listener, and active editor change listener
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

  const activeEditor = vscode.window.activeTextEditor;
  if (
    activeEditor &&
    supportedLanguages.includes(activeEditor.document.languageId)
  ) {
    highlightRegexPatterns(activeEditor.document, regexDecorationType);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && supportedLanguages.includes(editor.document.languageId)) {
        highlightRegexPatterns(editor.document, regexDecorationType);
      }
    })
  );
}

/**
 * Function to find and highlight regex patterns
 * @param document The text document
 * @param decorationType The decoration type to use for highlighting
 */
function highlightRegexPatterns(
  document: vscode.TextDocument,
  decorationType: vscode.TextEditorDecorationType
) {
  const text = document.getText();
  const regexPattern = /\/(.*?)\//g; // Match regex literals of the form /pattern/
  const regexRanges: vscode.DecorationOptions[] = [];

  let match;
  while ((match = regexPattern.exec(text)) !== null) {
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

/**
 * Helper function to get the full range of a regex pattern at a given position
 * @param document The text document
 * @param position The position in the document
 * @returns The range of the regex pattern at the given position
 */
function getRegexRangeAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range | undefined {
  const text = document.getText();
  const offset = document.offsetAt(position);
  const regexPattern = /\/(.*?)\//g; // Match regex literals of the form /pattern/

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
 * Function to generate an example from a regex string
 * @param regexString The regex string
 * @returns An example string that matches the regex pattern
 */
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
