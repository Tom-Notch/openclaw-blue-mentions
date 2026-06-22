<h1 align="center">OpenClaw Blue Mentions</h1>

<p align="center">
  <em>Force every fleet @mention in outbound Discord messages to a native <code>&lt;@ID&gt;</code> blue mention.</em>
</p>

A hook plugin for the bot fleet. It registers a `message_sending` hook that runs
on every outbound Discord message and rewrites any known fleet-member reference —
`@hk`, `@HK Bot`, `@cnrouter`, `@丞相`, bare display names — into the canonical
`<@ID>` form, which is the **only** form Discord renders blue and reliably
delivers as a notification.

Why a plugin and not just `mentionAliases`: the built-in `channels.discord.mentionAliases`
only rewrites single-token `@handle` text, so multi-word display names like
`@CN Router Bot` never match and silently stay grey. This plugin matches the full
roster (multi-word and CJK aliases included), longest-alias-first, and leaves
`<@ID>` / `<@&ROLE>` / `<#CHANNEL>`, `@everyone`, `@here`, and anything inside
`` `code` `` untouched.

## Install (per bot)

```bash
openclaw plugins install git:github.com/Tom-Notch/openclaw-blue-mentions@v1
# restart if the gateway didn't auto-reload:
openclaw gateway restart
```

Verify it loaded:

```bash
openclaw plugins list --enabled | grep blue-mentions
```

That's all — the fleet roster is built in, so it works out of the box.

## Config (optional)

```json5
{
  plugins: {
    entries: {
      "blue-mentions": {
        enabled: true,
        config: {
          // What to do with a bare @handle that is NOT a known fleet member:
          //   "leave"     - untouched (default)
          //   "plaintext" - strip the @ so it can't render as a broken mention
          //   "cancel"    - refuse to send the whole message (hard enforcement)
          onUnresolved: "leave",
          // Optional: override the built-in roster
          // roster: [{ id: "123...", aliases: ["foo", "foo bot"] }],
        },
      },
    },
  },
}
```

## Roster

Built-in (`roster.js`):

| Member         | ID                    | Aliases matched                                            |
| -------------- | --------------------- | --------------------------------------------------------- |
| LA Bot         | `1515608451957391411` | `la bot`, `labot`, `la`                                   |
| HK Bot         | `1515611687871447090` | `hk bot`, `hkbot`, `hk`                                   |
| CN Router Bot  | `1515618342680002700` | `cn router bot`, `cnrouterbot`, `cnrouter`, `router`      |
| CN Desktop Bot | `1515619018600611880` | `cn desktop bot`, `cndesktopbot`, `cndesktop`, `desktop`, `chancellor`, `丞相` |
| Macbook Bot    | `1515220173336875030` | `macbook bot`, `macbook`, `mac`                           |
| Tom Notch      | `698118851388243999`  | `tom notch`, `tomnotch`, `tom`                            |

## Test

```bash
node test.mjs
```

Pure rewrite engine (`mentions.js`), no dependencies.

## License

MIT
