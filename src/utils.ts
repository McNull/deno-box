
/**
 * Expands a given file path by handling tilde expansion, relative paths, and environment variables.
 *
 * - Tilde expansion: Replaces `~` with the user's home directory.
 * - Relative paths: Converts paths starting with `.` to absolute paths based on the current working directory.
 * - Environment variables: Replaces occurrences of `$VAR` or `${VAR}` with the value of the environment variable `VAR`.
 *
 * @param path - The file path to expand.
 * @returns The expanded file path.
 */
export function expandPath(path: string): string {
  // Handle tilde expansion
  if (path.startsWith('~')) {
    const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (home) {
      path = path.replace(/^~/, home);
    }
  }

  if (path.startsWith('.')) {
    path = Deno.cwd() + path.slice(1);
  }

  // Handle environment variables (optional)
  path = path.replace(/\$(\w+)|\${(\w+)}/g, (_, name1, name2) => {
    const name = name1 || name2;
    return Deno.env.get(name) || '';
  });

  return path;
}

/**
 * Ensures that the specified root directory exists. If the directory does not exist,
 * it will be created recursively. If an error occurs during the creation of the directory,
 * an error message will be logged to the console and the process will exit with a status code of 1.
 *
 * @param {string} root - The path of the root directory to ensure.
 */
export function ensureRoot(root: string) {
  try {
    Deno.mkdirSync(root, { recursive: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error creating root directory: ${err.message}`);
    } else {
      console.error(`Error creating root directory: ${String(err)}`);
    }
    Deno.exit(1);
  }
}


if (import.meta.main) {
  console.log(expandPath('./tmp'));
  console.log(expandPath('~/tmp'));
  console.log(expandPath('$HOME/tmp'));
}