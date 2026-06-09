const RULE_PROVIDERS = {
  Advertising: provider("advertising", "Advertising"),
  OpenAI: provider("openai", "OpenAI"),
  Claude: provider("claude", "Claude"),
  Gemini: provider("gemini", "Gemini"),
  Copilot: provider("copilot", "Copilot"),
  Bing: provider("bing", "Bing"),
  YouTube: provider("youtube", "YouTube"),
  Netflix: provider("netflix", "Netflix"),
  Disney: provider("disney", "Disney"),
  HBO: provider("hbo", "HBO"),
  Spotify: provider("spotify", "Spotify"),
  Telegram: provider("telegram", "Telegram"),
  Discord: provider("discord", "Discord"),
  Google: provider("google", "Google"),
  GoogleFCM: provider("googlefcm", "GoogleFCM"),
  GitHub: provider("github", "GitHub"),
  Twitter: provider("twitter", "Twitter"),
  Facebook: provider("facebook", "Facebook"),
  TikTok: provider("tiktok", "TikTok"),
  Apple: provider("apple", "Apple"),
  Microsoft: provider("microsoft", "Microsoft"),
  PayPal: provider("paypal", "PayPal"),
  Crypto: provider("crypto", "Crypto"),
  Scholar: provider("scholar", "Scholar"),
  Steam: provider("steam", "Steam"),
  Speedtest: provider("speedtest", "Speedtest"),
  China: provider("china", "China"),
  ChinaMedia: provider("chinamedia", "ChinaMedia"),
  Global: provider("global", "Global"),
};

const RULES = [
  "DOMAIN-SUFFIX,local,DIRECT",
  "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
  "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
  "RULE-SET,Advertising,REJECT",
  "RULE-SET,OpenAI,AI Suite",
  "RULE-SET,Claude,AI Suite",
  "RULE-SET,Gemini,AI Suite",
  "RULE-SET,Copilot,AI Suite",
  "RULE-SET,Bing,AI Suite",
  "DOMAIN-SUFFIX,perplexity.ai,AI Suite",
  "DOMAIN-SUFFIX,pplx.ai,AI Suite",
  "DOMAIN-SUFFIX,x.ai,AI Suite",
  "DOMAIN-SUFFIX,grok.com,AI Suite",
  "RULE-SET,YouTube,YouTube",
  "RULE-SET,Netflix,Netflix",
  "RULE-SET,Disney,Disney Plus",
  "RULE-SET,HBO,Max",
  "RULE-SET,Spotify,Spotify",
  "RULE-SET,Telegram,Telegram",
  "RULE-SET,Discord,Discord",
  "RULE-SET,GoogleFCM,Google FCM",
  "RULE-SET,Google,Proxy",
  "RULE-SET,GitHub,Proxy",
  "RULE-SET,Twitter,Proxy",
  "RULE-SET,Facebook,Proxy",
  "RULE-SET,TikTok,TikTok",
  "RULE-SET,Apple,Apple Services",
  "RULE-SET,Microsoft,Microsoft",
  "RULE-SET,PayPal,PayPal",
  "RULE-SET,Crypto,Crypto",
  "RULE-SET,Scholar,Scholar",
  "RULE-SET,Steam,Steam",
  "RULE-SET,Speedtest,Speedtest",
  "RULE-SET,ChinaMedia,Domestic",
  "RULE-SET,China,Domestic",
  "GEOIP,CN,Domestic",
  "RULE-SET,Global,Others",
  "MATCH,Others",
];

const BUILT_IN_POLICIES = {
  DIRECT: true,
  REJECT: true,
  "REJECT-DROP": true,
  PASS: true,
};

const DIRECT_FIRST_GROUPS = {
  Domestic: true,
  "CN Mainland TV": true,
};

const PREFERRED_GROUPS = [
  "Proxy",
  "FlyBird",
  "FlyBird Auto",
  "FlyBird Fallback",
  "MESL",
  "MESL Auto",
  "MESL Fallback",
  "oixCloud",
  "oixCloud Auto",
  "oixCloud Fallback",
  "Auto - UrlTest",
  "Auto",
  "Fallback",
];

function provider(file, name) {
  return {
    type: "http",
    behavior: "classical",
    format: "yaml",
    interval: 86400,
    path: `./ruleset/flybird/${file}.yaml`,
    url: `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/${name}/${name}.yaml`,
  };
}

function mergeRuleProviders(config) {
  if (!config["rule-providers"] || typeof config["rule-providers"] !== "object") {
    config["rule-providers"] = {};
  }

  for (const name in RULE_PROVIDERS) {
    config["rule-providers"][name] = RULE_PROVIDERS[name];
  }
}

function ensureRuleTargetGroups(config) {
  if (!Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"] = [];
  }

  const groupNames = collectGroupNames(config["proxy-groups"]);
  const targets = collectRuleTargets();

  for (const target of targets) {
    if (BUILT_IN_POLICIES[target] || groupNames[target]) {
      continue;
    }

    config["proxy-groups"].push({
      name: target,
      type: "select",
      proxies: buildGroupCandidates(config, groupNames, target),
    });
    groupNames[target] = true;
  }
}

function collectRuleTargets() {
  const targets = [];
  const seen = {};

  for (const rule of RULES) {
    const target = parseRuleTarget(rule);
    if (target && !seen[target]) {
      targets.push(target);
      seen[target] = true;
    }
  }

  return targets;
}

function parseRuleTarget(rule) {
  const parts = rule.split(",");
  if (parts.length < 2) {
    return "";
  }

  if (parts[0] === "MATCH" || parts[0] === "FINAL") {
    return parts[1];
  }

  const last = parts[parts.length - 1];
  return last === "no-resolve" ? parts[parts.length - 2] : last;
}

function collectGroupNames(proxyGroups) {
  const names = {};

  for (const group of proxyGroups) {
    if (group && group.name) {
      names[group.name] = true;
    }
  }

  return names;
}

function buildGroupCandidates(config, groupNames, target) {
  const candidates = [];

  if (DIRECT_FIRST_GROUPS[target]) {
    candidates.push("DIRECT");
  }

  for (const groupName of PREFERRED_GROUPS) {
    if (groupName !== target && groupNames[groupName]) {
      candidates.push(groupName);
    }
  }

  if (Array.isArray(config.proxies)) {
    for (const proxy of config.proxies) {
      if (proxy && proxy.name) {
        candidates.push(proxy.name);
      }
    }
  }

  candidates.push("DIRECT");
  return uniqueCandidates(candidates, target);
}

function uniqueCandidates(candidates, target) {
  const result = [];
  const seen = {};

  for (const name of candidates) {
    if (!name || name === target || seen[name]) {
      continue;
    }

    result.push(name);
    seen[name] = true;
  }

  return result.length > 0 ? result : ["DIRECT"];
}

function main(config) {
  mergeRuleProviders(config);
  ensureRuleTargetGroups(config);
  config.rules = RULES;
  return config;
}
