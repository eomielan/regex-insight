import * as assert from "assert";
import * as vscode from "vscode";
import {
  generateExampleFromRegex,
  getRegexRangeAtPosition,
} from "../extension";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Generate example from valid regex", () => {
    const example = generateExampleFromRegex("/[A-Za-z]{3}/");
    assert.match(
      example,
      /^[A-Za-z]{3}$/,
      `Example '${example}' should match the regex pattern`
    );
  });

  test("Generate example from invalid regex", () => {
    const example = generateExampleFromRegex("/[A-");
    assert.strictEqual(
      example,
      "Invalid regex pattern.",
      "Should return an error message for invalid regex"
    );
  });

  test("Highlight regex pattern in document", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: "This is a test /regex/ pattern",
    });
    const position = new vscode.Position(0, 15); // Position within the regex pattern
    const range = getRegexRangeAtPosition(document, position);
    assert.ok(range, "Range should be found for valid regex position");
    assert.strictEqual(
      document.getText(range),
      "/regex/",
      "Should match the regex pattern in text"
    );
  });

  test("No highlight for position outside regex pattern", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: "This is a test /regex/ pattern",
    });
    const position = new vscode.Position(0, 5); // Position outside the regex pattern
    const range = getRegexRangeAtPosition(document, position);
    assert.strictEqual(
      range,
      undefined,
      "Range should be undefined for position outside regex"
    );
  });
});
