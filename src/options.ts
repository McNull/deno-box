import * as path from "@std/path";
import { type Args, parseArgs } from "@std/cli";
import { expandPath } from "./utils.ts";
import constants from "./constants.ts";


/**
 * Configuration options for setting up a new project.
 * 
 * @property {string} root - The root directory for the new project.
 * @property {string[]} [add] - Optional additional libraries to add to the project.
 * @property {boolean} vscode - Whether to open the project in VSCode.
 */
type Config = {
  root: string;     // the root directory for the new project
  add?: string[];   // additional libraries to add to the project
  vscode: boolean;  // wether to open the project in VSCode
};

/**
 * Default configuration options.
 */
const defaultConfig: Config = {
  root: '~/tmp/deno-box',
  add: [
    "jsr:@std/cli",
    "jsr:@std/fs",
    "jsr:@std/path",
    "jsr:@std/random",
    "jsr:@std/collections",
    "jsr:@std/fmt",
    "jsr:@std/async",
  ],
  vscode: false,
};

/**
 * Reads the configuration from the config file.
 * 
 * @returns The configuration options.
 */
function getConfig(): Config {
  // try to read the config file from "~/.config/deno-box/config.json"
  let config: Config = defaultConfig;
  try {
    const configFile = expandPath('~/.config/deno-box/config.json');
    const data = Deno.readTextFileSync(configFile);
    // merge the default config with the user config
    config = { ...config, ...JSON.parse(data) };
  }
  // deno-lint-ignore no-unused-vars
  catch (e) {
    // ignore errors

  }

  return config;
}

/**
 * Command line options for setting up a new project.
 * 
 * @property {string | false} copy - The name of the project to copy.
 * @property {boolean} help - Show help message.
 * @property {string} root - The root directory for the new project.
 * @property {boolean} writeConfig - Write the default config to the config file.
 * @property {string} name - The name of the new project.
 * @property {string[]} add - Additional libraries to add to the project.
 * @property {boolean} vscode - Open the project in VSCode.
 */
export type Options = {
  copy?: string | false; // the name of the project to copy
  help?: boolean; // show help message
  root: string; // the root directory for the new project
  writeConfig?: boolean; // write the default config to the config file
  name?: string; // the name of the new project
  add?: string[]; // additional libraries to add to the project
  vscode?: boolean; // open the project in VSCode
};

/**
 * Default command line options.
 */
const defaultParseOptions: Options = {
  copy: false,
  help: false,
  root: "",
  writeConfig: false,
  name: "",
  vscode: false,
};

/**
 * Parses the command line options.
 * 
 * @returns The command line options.
 */
export function getOptions(): Options {
  const config = getConfig();
  const defaults = { ...defaultParseOptions, ...config, _: [] };
  const parsedOptions = parseArgs(Deno.args, {
    string: ['root', 'copy'],
    boolean: ['help', 'writeConfig', 'vscode'],
    collect: ['add'],
    alias: {
      h: 'help',
      c: 'copy',
      r: 'root',
      w: 'writeConfig',
      a: 'add',
    },
    default: defaults,
  });

  const options = parsedOptions as Options;

  if (options.help) {
    console.log(`
${constants.APP_NAME} v${constants.APP_VERSION}
${constants.APP_DESCRIPTION}

Usage: ${constants.APP_NAME} [options] [name]

Options:
  -r, --root <path>       Root directory for new project
  -c, --copy <name>       Copy an existing project
  -w, --writeConfig       Write the default config to the config file
  -h, --help              Show this help message
  -a, --add <lib>         Add a library to the project
  --vscode                Open the project in VSCode
`);
    Deno.exit(0);
  }

  if (options.writeConfig) {
    const configFile = expandPath('~/.config/deno-box/config.json');
    const configDir = path.dirname(configFile);
    Deno.mkdirSync(configDir, { recursive: true });

    Deno.writeTextFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    console.log(`Config written to ${configFile}`);
    Deno.exit(0);
  }

  // expand the root directory
  options.root = expandPath(options.root || defaultConfig.root);

  // check if the parsedOptions contain the project name
  const args = (parsedOptions as Args)._;

  if (args.length > 0) {
    options.name = args[0] as string;
  }

  return options;
}
