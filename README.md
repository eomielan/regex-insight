# Regex Insight

Regex Insight helps you work with regex patterns by identifying and highlighting them in your code and providing quick, matching examples on hover.

## Features

- **Pattern Highlighting:** Automatically highlights regex patterns in yellow, making them easy to spot in your code.

  ![Pattern Highlighting](https://github.com/eomielan/regex-insight/raw/main/images/pattern-highlighting.png)

- **Hover Examples:** Displays example matches for regex patterns when you hover, making regex functionality easier to understand.

  ![Hover Examples](https://github.com/eomielan/regex-insight/raw/main/images/example-generation.png)

## Requirements

- Visual Studio Code **version 1.70.0 or later**
- Yarn package manager (install from [Yarn's official website](https://classic.yarnpkg.com/lang/en/docs/install))

## Settings

Regex Insight provides these configuration options:

- `regexInsight.enable`: Enable or disable regex highlighting and hover functionality.
- `regexInsight.highlightColor`: Customize the highlight color for regex patterns (default is yellow).

## Known Issues

- Limited support for multi-line regex patterns.
- Some complex regex patterns may not generate accurate examples.

## Release Notes

### 0.0.1

Initial release with basic regex pattern highlighting and hover-based example generation for JavaScript and TypeScript.
