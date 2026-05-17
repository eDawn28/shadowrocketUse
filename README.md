# ClashCloud routing configs

This repository stores Shadowrocket rule configs and FLClash script overrides.

Shadowrocket configs:

- `ios-mesl-shadowrocket.conf`
- `ios-oixcloud-shadowrocket.conf`

FLClash script overrides:

- `flclash-mesl-script-overwrite.js`
- `flclash-oixcloud-script-overwrite.js`

The configs do not embed airport subscription URLs. They reference server subscriptions already imported in Shadowrocket by name, then apply split-routing groups for AI, streaming, Telegram, Netflix, TikTok, Apple, Microsoft, domestic traffic, and final fallback.

## Use In Shadowrocket

1. In Shadowrocket, import your airport server subscription first.
2. Name the server subscription exactly `MESL` or `oixCloud`.
3. Import the matching rule config file.
4. Select the imported rule config under `Config`.
5. Open `Proxy Group` and update/select nodes inside `MESL Nodes` or `oixCloud Nodes`.

Suggested usage:

- Use `ios-mesl-shadowrocket.conf` when you want MESL nodes.
- Use `ios-oixcloud-shadowrocket.conf` when you want oixCloud nodes.

If `MESL Nodes` or `oixCloud Nodes` shows `None`, the server subscription name does not match, the server subscription was imported as a local config instead of a server subscription, or the server subscription has not updated successfully.

Do not merge these two configs inside Shadowrocket unless you specifically want to debug node/provider behavior.

## Use In FLClash

Use the matching `.js` file as the script overwrite for the corresponding airport subscription.

The FLClash scripts merge rule providers into the original profile, replace rules with the custom split-routing rules, and auto-create any missing proxy groups referenced by the rules. This avoids import failures like `proxy not found` when an airport profile changes or omits a group.

## GitHub Private Repo Note

Shadowrocket usually cannot download raw files from a private GitHub repository without an authenticated URL or supported request headers.

A private repository is good for backup, but it may not work as a direct Shadowrocket URL. If direct URL update fails, import the file manually or use a private file host that supports stable authenticated download links.
