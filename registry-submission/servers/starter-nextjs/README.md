# starter-nextjs

An MCP server that generates complete Next.js starter projects as downloadable ZIP archives. It supports highly customizable configurations including package managers, styling solutions, state management, API layers, authentication, databases, ORMs, testing frameworks, and extras — all accessible through the Model Context Protocol.

## Features

- Generates complete Next.js projects with customizable configurations
- Supports multiple package managers, styling solutions, state management, API layers, and testing frameworks
- Template-based generation with preset configurations
- Tracks generation count via GitHub Gists

## Tools

| Tool Name              | Description                                            | Parameters                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate_project`     | Generate a Next.js starter project as a ZIP archive    | 13 parameters: `projectName`, `packageManager`, `language`, `nextVersion`, `router`, `styling`, `stateManagement`, `apiLayer`, `auth`, `database`, `orm`, `testing`, `extras` |
| `get_generation_count` | Retrieve the total number of projects generated so far | None                                                                                                                                                                          |
| `list_templates`       | List all available project templates                   | None                                                                                                                                                                          |
| `get_config_schema`    | Retrieve the full configuration schema                 | None                                                                                                                                                                          |

## Installation

Run the server directly via npx:

```bash
npx @mrsluffy/starter-nextjs-mcp
```

Or install globally:

```bash
npm install -g @mrsluffy/starter-nextjs-mcp
```

## Configuration

Add to your MCP client configuration (stdio transport):

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

## Metadata

| Field     | Value                                      |
| --------- | ------------------------------------------ |
| Name      | starter-nextjs                             |
| Author    | MrSluffy                                   |
| Transport | stdio                                      |
| Language  | TypeScript                                 |
| Source    | https://github.com/MrSluffy/starter-nextjs |
