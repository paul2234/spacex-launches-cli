# spacex-launches-cli

CLI tool for tracking upcoming SpaceX launches.

## Quick Start

```sh
npx spacex-launches-cli next
```

## Installation

```sh
# Run directly with npx (no install needed)
npx spacex-launches-cli <command>

# Or install globally
npm install -g spacex-launches-cli
spacex-launches <command>
```

Requires **Node.js 18** or later.

## Commands

### `spacex-launches next`

Show the next upcoming SpaceX launch with a live countdown.

```sh
spacex-launches next
spacex-launches --local next   # times in your local timezone
```

### `spacex-launches list`

List upcoming launches in a table.

```sh
spacex-launches list
spacex-launches list --limit 5
```

| Option                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `-l, --limit <number>` | Number of launches to show (default: 10) |

### `spacex-launches detail <id>`

Show full details for a specific launch.

```sh
spacex-launches detail <id>
```

| Argument | Description                                                |
| -------- | ---------------------------------------------------------- |
| `id`     | Launch ID or slug (find these with `spacex-launches list`) |

## Global Options

These options work with any command:

| Option          | Description                                             |
| --------------- | ------------------------------------------------------- |
| `--local`       | Show launch times in your local timezone instead of UTC |
| `-V, --version` | Show version number                                     |
| `-h, --help`    | Show help                                               |

## How It Works

Launch data comes from [Launch Library 2](https://thespacedevs.com/llapi) by
[The Space Devs](https://thespacedevs.com). A GitHub Action fetches data
periodically and caches it as static JSON on GitHub Pages. The CLI reads this
cached data — no API keys or accounts needed.

## Support The Space Devs

This project relies on The Space Devs' Launch Library 2 API. Consider
supporting their work on [Patreon](https://www.patreon.com/TheSpaceDevs).

## Development

```sh
npm install        # install dependencies
npm run build      # build CLI to dist/
npm test           # run tests
npm run lint       # check linting and formatting
```

Run the CLI during development without building:

```sh
npx tsx src/cli/index.ts next
npx tsx src/cli/index.ts list
npx tsx src/cli/index.ts detail <id>
```

## License

MIT
