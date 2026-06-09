# ClashCloud routing configs

GitHub 仓库：

- https://github.com/eDawn28/shadowrocketUse

本仓库存放 Shadowrocket 分流配置和 FLClash 脚本覆写。

Shadowrocket 配置：

- `ios-mesl-shadowrocket.conf`
- `ios-oixcloud-shadowrocket.conf`
- `ios-flybird-shadowrocket.conf`
- `ios-app-splash-ad-shadowrocket.module`

FLClash 脚本覆写：

- `flclash-mesl-script-overwrite.js`
- `flclash-oixcloud-script-overwrite.js`
- `flclash-flybird-script-overwrite.js`

这些配置不会内置机场订阅 URL。它们会通过名称引用已经导入 Shadowrocket 的节点订阅，然后应用 AI、流媒体、Telegram、Netflix、TikTok、Apple、Microsoft、国内流量和最终兜底的分流分组。

国内小程序和媒体流量会放在代理规则之前并强制走 `DIRECT`，包括微信 / 腾讯、支付宝、抖音、Bilibili、爱奇艺、优酷、腾讯视频、网易云音乐及其常见 CDN 域名。

## 广告拦截说明

iOS Shadowrocket 配置采用保守广告拦截策略：在局域网直连规则之后、国内 App 直连规则之前放置 `Advertising.list` 并走 `REJECT`。

这样可以优先拦截已知广告域名，提升 App 开屏广告的域名级屏蔽命中率，同时不添加宽泛关键词规则，降低误伤登录、支付、图片、视频和统计接口的风险。

如果某个 App 仍有开屏广告，可以先在 Shadowrocket 日志中确认广告请求域名，再按需追加更精确的 `DOMAIN` 或 `DOMAIN-SUFFIX` 规则。

## 开屏广告增强模块

`ios-app-splash-ad-shadowrocket.module` 是可选增强模块，参考公开 Shadowrocket 去开屏广告规则的常见做法，加入了部分 `URL Rewrite` 和常见广告 SDK 域名拦截，用来处理 Bilibili、知乎、高德、京东、阿里系、网易云音乐等 App 的开屏广告接口。

这个模块不是主配置的一部分，需要在 Shadowrocket 的模块页面单独添加并启用：

- Raw：`https://raw.githubusercontent.com/eDawn28/shadowrocketUse/main/ios-app-splash-ad-shadowrocket.module`
- jsDelivr：`https://cdn.jsdelivr.net/gh/eDawn28/shadowrocketUse@main/ios-app-splash-ad-shadowrocket.module`

注意：URL Rewrite 处理 HTTPS 请求时通常需要开启 HTTPS 解密，并在 iOS 中安装、信任 Shadowrocket 证书。部分 App 使用证书固定，开启解密后可能失效、报错或无法联网；如果出现异常，优先关闭这个模块。

模块内已放置微信、支付宝、银联支付相关白名单，并且没有对微信、支付宝、小程序支付相关域名开启 MITM。不要自行添加 `qq.com`、`tencent.com`、`alipay.com`、`alicdn.com` 这类过宽的拦截规则，否则容易影响小程序、登录或支付。

## Shadowrocket 使用方式

1. 先在 Shadowrocket 中导入机场节点订阅。
2. 将节点订阅名称精确设置为 `MESL`、`oixCloud` 或 `FlyBird`。
3. 导入对应的分流配置文件。
4. 在 `Config` 中选择导入的分流配置。
5. 打开 `Proxy Group`，在 `MESL Nodes`、`oixCloud Nodes` 或 `FlyBird Nodes` 中更新并选择节点。

建议用法：

- 使用 MESL 节点时选择 `ios-mesl-shadowrocket.conf`。
- 使用 oixCloud 节点时选择 `ios-oixcloud-shadowrocket.conf`。
- 使用 FlyBird 节点时选择 `ios-flybird-shadowrocket.conf`。

如果 `MESL Nodes`、`oixCloud Nodes` 或 `FlyBird Nodes` 显示 `None`，通常是节点订阅名称不匹配、节点订阅被导入成了本地配置而不是服务器订阅，或节点订阅尚未成功更新。

除非需要调试节点或 provider 行为，否则不要在 Shadowrocket 内合并这些配置。

## 分组选择保留

Shadowrocket 的分组配置不再写入 `select=0`，避免每次更新远端 `.conf` 时强制恢复到第一个选项。只要分组名称和候选项保持稳定，小火箭通常会尽量沿用本地已有选择；如果机场节点被删除或订阅异常导致选项丢失，再手动重新选择节点或兜底策略即可。

## FLClash 使用方式

将对应的 `.js` 文件作为相应机场订阅的脚本覆写。

FLClash 脚本会把 rule providers 合并进原始配置，用自定义分流规则替换原规则，并自动创建规则中引用但原配置缺失的代理分组。这样可以避免机场配置变化或漏掉分组时出现 `proxy not found` 之类的导入失败。

## GitHub 私有仓库说明

如果 GitHub 仓库是私有仓库，Shadowrocket 通常无法在没有认证 URL 或请求头支持的情况下直接下载 raw 文件。

私有仓库适合备份，但不一定适合作为 Shadowrocket 的直接订阅地址。如果直接 URL 更新失败，请手动导入文件，或改用支持稳定认证下载链接的私有文件托管服务。
