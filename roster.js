// Fleet roster: Discord user id -> alias/display-name variants the model might
// emit. Lowercased; multi-word display names are allowed and matched first.
//
// Override or extend at install time via plugin config `roster` (see README);
// this is the built-in default so the plugin works out of the box.

// Tom's ruling (2026-06-22): titles are SHARED, not unique handles.
//   丞相 / chancellor = the bots that directly touch Tom's own machines
//                       -> Macbook Bot + CN Desktop Bot
//   部长 / minister   = the remote relay servers
//                       -> LA Bot + HK Bot + CN Router Bot
// A title alias appears on every holder's row; buildMatcher fans it out to all
// of their `<@id>` so `@丞相` / `@部长` pings the whole group.
export const DEFAULT_ROSTER = [
  {
    id: "1515608451957391411",
    aliases: ["la bot", "labot", "la", "minister", "部长"],
  }, // LA Bot 🛰️ (relay -> 部长)
  {
    id: "1515611687871447090",
    aliases: ["hk bot", "hkbot", "hk", "minister", "部长"],
  }, // HK Bot 🇭🇰 (relay -> 部长)
  {
    id: "1515618342680002700",
    aliases: [
      "cn router bot",
      "cnrouterbot",
      "cnrouter",
      "router",
      "minister",
      "部长",
    ],
  }, // CN Router Bot (relay -> 部长)
  {
    id: "1515619018600611880",
    aliases: [
      "cn desktop bot",
      "cndesktopbot",
      "cndesktop",
      "desktop",
      "chancellor",
      "丞相",
    ],
  }, // CN Desktop Bot (direct -> 丞相)
  {
    id: "1515220173336875030",
    aliases: ["macbook bot", "macbook", "mac", "chancellor", "丞相"],
  }, // Macbook Bot (direct -> 丞相)
  {
    id: "698118851388243999",
    aliases: ["tom notch", "tomnotch", "tom", "mukai", "mukaiy"],
  }, // Tom Notch (operator)
];
