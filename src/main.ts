import { existsSync } from "@std/fs/exists";
import { getOptions, type Options } from "./options.ts";
import { RandomName } from "./random-name.ts";
import * as path from "@std/path";
import * as fs from "@std/fs";
import { ensureRoot } from "./utils.ts";

/**
 * Generates a project name based on the provided options.
 * 
 * @param {Options} options - The options for generating the project name.
 * @param {string} options.name - The name of the project, if provided.
 * @param {string} options.copy - The base name to copy, if provided.
 * @param {string} options.root - The root directory where the project will be created.
 * 
 * @returns {string} - The generated project name.
 * 
 * The function follows these steps:
 * 1. If `options.name` is provided, it returns that name.
 * 2. If `options.copy` is provided, it generates a unique name based on the copy name.
 * 3. If neither `options.name` nor `options.copy` is provided, it generates a random name and ensures it is unique within the specified root directory.
 */
function getProjectName(options: Options): string {

  if (options.name) {
    return options.name;
  }

  if (options.copy) {
    let x = `${options.copy}-copy`;
    let i = 1;
    while (existsSync(`${options.root}/${x}`)) {
      x = `${options.copy}-copy-${i}`;
      i++;
    }
    return x;
  }

  const randomName = new RandomName({
    separator: '-',
    addNumbers: true,
  });

  // loop until we find a unique project name directory
  let projectName = "";

  do {
    projectName = randomName.next();
  } while (existsSync(`${options.root}/${projectName}`));

  return projectName;
}

/**
 * Main function to create a new project.
 */
async function main() {
  // Combine config and options
  const options = getOptions();

  // Ensure the root directory exists
  ensureRoot(options.root);

  const projectName = getProjectName(options);

  if (options.copy) {
    console.log(`Copying project: ${options.copy} to ${projectName}`);

    const src = path.join(options.root, options.copy);
    const dest = path.join(options.root, projectName);

    fs.copySync(src, dest);
  } else {

    const fullPath = path.join(options.root, projectName);

    console.log(`Creating project: ${projectName}`);

    // Initialize the project by running deno init ${projectName}

    const denoInit = new Deno.Command("deno", {
      args: ["init", projectName],
      cwd: options.root,
    });;

    const output = await denoInit.output();

    // console.log(output.code);

    if (!output.success) {
      console.error("Error initializing project");
      console.log(new TextDecoder().decode(output.stderr));
      Deno.exit(1);
    }

    // Add any additional libraries
    if (options.add && options.add.length) {
      console.log("Adding libraries:", options.add.join(", "));

      // run deno add $add1 $add2 ...
      const denoAdd = new Deno.Command("deno", {
        args: ["add", ...options.add],
        cwd: fullPath,
      });

      const output = await denoAdd.output();

      if (!output.success) {
        console.error("Error adding libraries");
        console.log(new TextDecoder().decode(output.stderr));
        Deno.exit(1);
      }
    }

    console.log(`Project created at "${fullPath}"`);

    if (options.vscode) {
      // create the .vscode directory

      const vscodeDir = path.join(fullPath, ".vscode");

      try {
        Deno.mkdirSync(vscodeDir);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(`Error creating .vscode directory: ${err.message}`);
        } else {
          console.error(`Error creating .vscode directory: ${String(err)}`);
        }
        Deno.exit(1);
      }

      // create the settings.json file
      // { "deno.enable": true }

      const settings = JSON.stringify({ "deno.enable": true }, null, 2);
      const settingsFile = path.join(vscodeDir, "settings.json");

      try {
        Deno.writeTextFileSync(settingsFile, settings);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(`Error creating settings.json: ${err.message}`);
        } else {
          console.error(`Error creating settings.json: ${String(err)}`);
        }
        Deno.exit(1);
      }

      console.log("Opening project in VSCode");

      const vscode = new Deno.Command("code", {
        args: [fullPath],
      });

      const output = await vscode.output();

      if (!output.success) {
        console.error("Error opening project in VSCode");
        console.log(new TextDecoder().decode(output.stderr));
        Deno.exit(1);
      }
    }
  }
}

if (import.meta.main) {
  await main();
}

