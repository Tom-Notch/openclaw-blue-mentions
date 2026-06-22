// Fleet roster: Discord user id -> alias/display-name variants the model might
// emit. Lowercased; multi-word display names are allowed and matched first.
//
// Override or extend at install time via plugin config `roster` (see README);
// this is the built-in default so the plugin works out of the box.

export const DEFAULT_ROSTER = [
  { id: "1515608451957391411", aliases: ["la bot", "labot", "la"] }, // LA Bot 🛰️
  { id: "1515611687871447090", aliases: ["hk bot", "hkbot", "hk"] }, // HK Bot 🇭🇰
  {
    id: "1515618342680002700",
    aliases: ["cn router bot", "cnrouterbot", "cnrouter", "router"],
  }, // CN Router Bot
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
  }, // CN Desktop Bot
  { id: "1515220173336875030", aliases: ["macbook bot", "macbook", "mac"] }, // Macbook Bot
  { id: "698118851388243999", aliases: ["tom notch", "tomnotch", "tom"] }, // Tom Notch (operator)
];
