# ClashCloud routing configs

GitHub 仓库：

- https://github.com/eDawn28/shadowrocketUse

This repository stores Shadowrocket rule configs and FLClash script overrides.

Shadowrocket configs:

- `ios-mesl-shadowrocket.conf`
- `ios-oixcloud-shadowrocket.conf`

FLClash script overrides:

- `flclash-mesl-script-overwrite.js`
- `flclash-oixcloud-script-overwrite.js`

The configs do not embed airport subscription URLs. They reference server subscriptions already imported in Shadowrocket by name, then apply split-routing groups for AI, streaming, Telegram, Netflix, TikTok, Apple, Microsoft, domestic traffic, and final fallback.

Domestic mini-app and media traffic is placed before proxy rules and forced to `DIRECT`, including WeChat/Tencent, Alipay, Douyin, Bilibili, iQIYI, Youku, Tencent Video, NetEase Music, and common related CDN domains.

## 广告拦截说明

iOS Shadowrocket 配置采用保守广告拦截策略：在局域网直连规则之后、国内 App 直连规则之前放置 `Advertising.list` 并走 `REJECT`。

这样可以优先拦截已知广告域名，提升 App 开屏广告的域名级屏蔽命中率，同时不添加宽泛关键词规则，降低误伤登录、支付、图片、视频和统计接口的风险。

如果某个 App 仍有开屏广告，可以先在 Shadowrocket 日志中确认广告请求域名，再按需追加更精确的 `DOMAIN` 或 `DOMAIN-SUFFIX` 规则。

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
