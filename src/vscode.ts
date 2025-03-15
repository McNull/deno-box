import launchSettings from "../assets/vscode/launch.json" with { type: "json" };
import * as path from "@std/path";

export async function initVSCodeProject(fullPath: string) {
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

  // Write settings.json
  const settingsFile = path.join(vscodeDir, "settings.json");
  writeJson(settingsFile, { "deno.enable": true });

  // Write launch.json
  const launchFile = path.join(vscodeDir, "launch.json");
  writeJson(launchFile, launchSettings);

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

// deno-lint-ignore no-explicit-any
function writeJson(path: string, o: any) {

  const json = JSON.stringify(o, null, 2);

  try {
    Deno.writeTextFileSync(path, json);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error creating settings.json: ${err.message}`);
    } else {
      console.error(`Error creating settings.json: ${String(err)}`);
    }
    Deno.exit(1);
  }
}
