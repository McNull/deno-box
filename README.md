# deno-box

A simple CLI app to quickly create new Deno sandbox/playground projects.

## Installation

### Deno

```bash
deno install -RWE --allow-run jsr:@mcnull/deno-box
```

### Manual installation

```bash
# Clone the repository
git clone https://github.com/mcnull/deno-box.git
cd deno-box

# Install the main entrypoint
deno task install
```

### Manual compilation

```bash
# Clone the repository
git clone https://github.com/mcnull/deno-box.git
cd deno-box

# Compile the binary
deno task compile

# Optional: Move the binary to a directory in your PATH
mv deno-box ~/.local/bin/
```

## Usage

```bash
deno-box [options] [name]
```

If no name is provided, a random name in the format of `adjective-animal-number` will be generated.

## Options

- `-h, --help`: Show help message
- `-r, --root <path>`: Root directory for new project (default: `~/tmp/deno-box`)
- `-c, --copy <name>`: Copy an existing project
- `-w, --writeConfig`: Write the default config to `~/.config/deno-box/config.json`
- `-a, --add <lib>`: Add a library to the project (can be used multiple times)
- `--vscode`: Open the project in VSCode

## Examples

### Create a new project with a random name

```bash
deno-box
```

This creates a new project with a randomly generated name (like `blue-elephant-42`) in the default root directory.

### Create a project with a specific name

```bash
deno-box my-project
```

### Create a project in a specific location

```bash
deno-box --root ~/projects/deno
```

### Create a project with additional libraries

```bash
deno-box --add jsr:@std/http --add jsr:@std/encoding
```

### Copy an existing project

```bash
deno-box --copy blue-elephant-42
```

This will create a copy of the `blue-elephant-42` project with a name like `blue-elephant-42-copy`.

### Create a project and open it in VSCode

```bash
deno-box --vscode
```

### Create a custom configuration file

```bash
deno-box --writeConfig
```

This writes the default configuration to `~/.config/deno-box/config.json`, which you can then customize.

## Configuration

You can customize the default behavior by creating a config file at `~/.config/deno-box/config.json`.

Example configuration:

```json
{
  "root": "~/projects/deno-sandboxes",
  "add": ["jsr:@std/http", "jsr:@std/encoding", "jsr:@std/fmt"],
  "vscode": true
}
```
