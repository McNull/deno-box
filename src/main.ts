import { existsSync } from "@std/fs/exists";
import { getOptions, type Options } from "./options.ts";
import { RandomName } from "./random-name.ts";
import * as path from "@std/path";
import * as fs from "@std/fs";
import { ensureRoot } from "./utils.ts";
import { initVSCodeProject } from "./vscode.ts";

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
 * Adds the specified libraries to the Deno project.
 *
 * @param {Options} options - The options object containing the libraries to add.
 * @param {string} fullPath - The full path to the project directory.
 *
 * @returns {Promise<void>} A promise that resolves when the libraries have been added.
 *
 * @throws Will log an error and exit the process if adding libraries fails.
 */
async function addLibraries(options: Options, fullPath: string): Promise<void> {
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
}

/**
 * Initializes a new Deno project with the given project name and options.
 *
 * @param {string} projectName - The name of the project to initialize.
 * @param {Options} options - The options for initializing the project, including the root directory.
 * @returns {Promise<void>} A promise that resolves when the project initialization is complete.
 *
 * @throws {Error} If the project initialization fails, an error message is logged and the process exits with code 1.
 */
async function initProject(projectName: string, options: Options): Promise<void> {
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
    await initProject(projectName, options);

    // Add any additional libraries
    await addLibraries(options, fullPath);

    console.log(`Project created at "${fullPath}"`);

    if (options.vscode) {
      // create the .vscode directory

      await initVSCodeProject(fullPath);
    }
  }
}

if (import.meta.main) {
  await main();
}



