export interface ExportName {
  readonly documentTitle: string;
  readonly filenameStem: string;
}

export const DEFAULT_EXPORT_TITLE = "realsecurepdf-merged";

const MAX_TITLE_LENGTH = 80;
const TRAILING_EXPORT_EXTENSION = /(?:(?:\.pdf|\.zip))+$/i;
const UNSAFE_FILENAME_CHARACTERS = /[<>:"/\\|?*]/g;
const REPEATED_WHITESPACE = /\s+/g;
const TRAILING_DOTS_OR_SPACES = /[.\s]+$/;

function replaceControlCharacters(value: string): string {
  return Array.from(value, (character) =>
    character.charCodeAt(0) < 32 ? " " : character,
  ).join("");
}

export function resolveExportName(requestedTitle: string): ExportName {
  const withoutExtension = requestedTitle
    .trim()
    .replace(TRAILING_EXPORT_EXTENSION, "");
  const filenameStem =
    replaceControlCharacters(withoutExtension)
      .replace(UNSAFE_FILENAME_CHARACTERS, " ")
      .replace(REPEATED_WHITESPACE, " ")
      .replace(TRAILING_DOTS_OR_SPACES, "")
      .slice(0, MAX_TITLE_LENGTH)
      .trim() || DEFAULT_EXPORT_TITLE;

  return {
    documentTitle: filenameStem,
    filenameStem,
  };
}
