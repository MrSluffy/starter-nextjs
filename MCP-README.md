# starter-nextjs-mcp

MCP server for generating Next.js starter projects with customizable configurations.

![Transport: stdio](https://img.shields.io/badge/transport-stdio-blue)

## Tools

| Tool                   | Description                                                                                                          | Parameters                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate_project`     | Generate a Next.js starter project as a ZIP archive                                                                  | 13 parameters: `projectName` (required), `packageManager`, `language`, `nextVersion`, `router`, `styling`, `stateManagement`, `apiLayer`, `auth`, `database`, `orm`, `testing`, `extras` |
| `get_generation_count` | Retrieve the total number of projects generated so far                                                               | None                                                                                                                                                                                     |
| `list_templates`       | List all available project templates with their IDs, labels, descriptions, highlights, and preset configurations     | None                                                                                                                                                                                     |
| `get_config_schema`    | Retrieve the full configuration schema describing all available fields, their types, allowed values, and constraints | None                                                                                                                                                                                     |

## Installation

### Via npx (recommended)

```bash
npx @mrsluffy/starter-nextjs-mcp
```

### From source

```bash
git clone https://github.com/MrSluffy/starter-nextjs.git
cd starter-nextjs
npm install
npm run mcp
```

## Configuration

### Claude Desktop

Add the following to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "starter-nextjs": {
      "command": "npx",
      "args": ["@mrsluffy/starter-nextjs-mcp"]
    }
  }
}
```

### VS Code Copilot Chat

Add the following to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "starter-nextjs": {
        "command": "npx",
        "args": ["@mrsluffy/starter-nextjs-mcp"]
      }
    }
  }
}
```

## Requirements

| Variable            | Required | Description                                                                   |
| ------------------- | -------- | ----------------------------------------------------------------------------- |
| `GITHUB_GIST_TOKEN` | Optional | GitHub personal access token with gist scope for persisting generation counts |
| `GITHUB_GIST_ID`    | Optional | ID of the GitHub Gist used to store the generation counter                    |

When these environment variables are absent, the server starts normally. The `get_generation_count` tool returns `0` and `generate_project` skips recording generation counts.

## Development

### Build

Compile the MCP server TypeScript source into the `dist/` directory:

```bash
npm run build:mcp
```

### Test

Run the test suite:

```bash
npm run test
```

### Run from source

Start the server directly from TypeScript using tsx:

```bash
npm run mcp
```

### Distribution test

Build and verify the compiled entry point starts correctly:

```bash
npm run test:dist
```
