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
  PrimeVideo: provider("primevideo", "PrimeVideo"),
  HBO: provider("hbo", "HBO"),
  Spotify: provider("spotify", "Spotify"),
  Telegram: provider("telegram", "Telegram"),
  Discord: provider("discord", "Discord"),
  Google: provider("google", "Google"),
  GitHub: provider("github", "GitHub"),
  Twitter: provider("twitter", "Twitter"),
  Facebook: provider("facebook", "Facebook"),
  Instagram: provider("instagram", "Instagram"),
  TikTok: provider("tiktok", "TikTok"),
  Apple: provider("apple", "Apple"),
  Microsoft: provider("microsoft", "Microsoft"),
  PayPal: provider("paypal", "PayPal"),
  Steam: provider("steam", "Steam"),
  Scholar: provider("scholar", "Scholar"),
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
  "RULE-SET,OpenAI,🤖 AI",
  "RULE-SET,Claude,🤖 AI",
  "RULE-SET,Gemini,🤖 AI",
  "RULE-SET,Copilot,🤖 AI",
  "RULE-SET,Bing,🤖 AI",
  "DOMAIN-SUFFIX,perplexity.ai,🤖 AI",
  "DOMAIN-SUFFIX,pplx.ai,🤖 AI",
  "DOMAIN-SUFFIX,x.ai,🤖 AI",
  "DOMAIN-SUFFIX,grok.com,🤖 AI",
  "RULE-SET,YouTube,🔍 Google",
  "RULE-SET,Netflix,📽️ Netflix",
  "RULE-SET,Disney,📽️ Disney",
  "RULE-SET,PrimeVideo,📽️ PrimeVideo",
  "RULE-SET,HBO,📽️ HBO",
  "RULE-SET,Spotify,🎵 Spotify",
  "RULE-SET,Telegram,📢 Telegram",
  "RULE-SET,Discord,📢 Discord",
  "RULE-SET,Google,🔍 Google",
  "RULE-SET,GitHub,MESL",
  "RULE-SET,Twitter,♥ Twitter",
  "RULE-SET,Facebook,📢 Facebook",
  "RULE-SET,Instagram,♥ Instagram",
  "RULE-SET,TikTok,👙 TikTok",
  "RULE-SET,Apple,🍎 Apple",
  "RULE-SET,Microsoft,🖥 Microsoft",
  "RULE-SET,PayPal,💳 Paypal",
  "RULE-SET,Steam,🎮 Steam",
  "RULE-SET,Scholar,MESL",
  "RULE-SET,Speedtest,MESL",
  "DOMAIN-SUFFIX,bilibili.com,📽️ Bilibili",
  "DOMAIN-SUFFIX,bilibili.tv,📽️ Bilibili",
  "DOMAIN-SUFFIX,bilivideo.com,📽️ Bilibili",
  "RULE-SET,ChinaMedia,DIRECT",
  "RULE-SET,China,DIRECT",
  "GEOIP,CN,DIRECT",
  "RULE-SET,Global,MESL",
  "MATCH,Final",
];

const GROUP_PREFIX = "CC-";

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
    path: `./ruleset/mesl/${file}.yaml`,
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

function ensureRuleTargetGroups(config, rules) {
  if (!Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"] = [];
  }

  const groupNames = collectGroupNames(config["proxy-groups"]);
  const targets = collectRuleTargets(rules);

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

function collectRuleTargets(rules) {
  const targets = [];
  const seen = {};

  for (const rule of rules) {
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

  if (DIRECT_FIRST_GROUPS[target] || DIRECT_FIRST_GROUPS[stripGroupPrefix(target)]) {
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

function buildRules() {
  return RULES.map(prefixRuleTarget);
}

function prefixRuleTarget(rule) {
  const parts = rule.split(",");
  const targetIndex = findRuleTargetIndex(parts);

  if (targetIndex < 0) {
    return rule;
  }

  const target = parts[targetIndex];
  if (BUILT_IN_POLICIES[target] || target.startsWith(GROUP_PREFIX)) {
    return rule;
  }

  parts[targetIndex] = `${GROUP_PREFIX}${target}`;
  return parts.join(",");
}

function findRuleTargetIndex(parts) {
  if (parts.length < 2) {
    return -1;
  }

  if (parts[0] === "MATCH" || parts[0] === "FINAL") {
    return 1;
  }

  return parts[parts.length - 1] === "no-resolve" ? parts.length - 2 : parts.length - 1;
}

function stripGroupPrefix(name) {
  return name.startsWith(GROUP_PREFIX) ? name.slice(GROUP_PREFIX.length) : name;
}

function main(config) {
  const rules = buildRules();

  mergeRuleProviders(config);
  ensureRuleTargetGroups(config, rules);
  config.rules = rules;
  return config;
}
