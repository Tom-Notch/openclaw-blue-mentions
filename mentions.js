// Pure mention-rewriting engine for the OpenClaw "blue mentions" harness.
//
// Goal: every reference to a known fleet member in an outbound Discord message
// becomes a native `<@ID>` mention (the only form that renders blue and is
// guaranteed to notify), no matter how the model wrote it — `@hk`, `@HK Bot`,
// `@cnrouter`, bare display name, etc. Existing `<@ID>` / `<@&ID>` / `<#ID>`,
// `@everyone`, `@here`, and anything inside code spans are left untouched.
//
// No dependencies so it can run as plain ESM in the plugin and under `node`.

/**
 * @typedef {Object} RosterEntry
 * @property {string} id      Discord user id
 * @property {string[]} aliases  Lowercased handles / display-name variants
 */

/**
 * Build a matcher from a roster. Aliases are matched longest-first so
 * "cn router bot" wins over "router" and "hkbot" wins over "hk".
 * @param {RosterEntry[]} roster
 */
export function buildMatcher(roster) {
  // An alias may map to MORE THAN ONE id — e.g. a shared title like `丞相`
  // (held by both Macbook + CN Desktop) or `部长` (the remote relays). Such a
  // token fans out to every holder's `<@id>` so the whole group gets pinged.
  const aliasToIds = new Map();
  for (const entry of roster) {
    for (const alias of entry.aliases) {
      const a = alias.trim().toLowerCase();
      if (!a) {
        continue;
      }
      const ids = aliasToIds.get(a) || [];
      if (!ids.includes(entry.id)) {
        ids.push(entry.id);
      }
      aliasToIds.set(a, ids);
    }
  }
  // Longest alias first so "cn router bot" wins over "router".
  const aliases = [...aliasToIds.keys()].sort((x, y) => y.length - x.length);
  const alternation = aliases.map(escapeRegex).join("|");
  // (?<![\w<&@]) — not already part of <@, <@&, an email, or a word.
  // @ then the alias, then a non-word boundary.
  const re = alternation
    ? new RegExp("(?<![\\w<&@])@(" + alternation + ")(?![\\w])", "giu")
    : null;
  return { re, aliasToIds };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Split text into code / non-code segments so we never rewrite inside
// `inline code` or ```fenced blocks```.
function splitCode(text) {
  const segments = [];
  const re = /(```[\s\S]*?```|`[^`\n]*`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ code: false, text: text.slice(last, m.index) });
    }
    segments.push({ code: true, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segments.push({ code: false, text: text.slice(last) });
  }
  return segments;
}

/**
 * @param {string} text
 * @param {{ roster: RosterEntry[], onUnresolved?: "leave"|"plaintext"|"cancel" }} cfg
 * @returns {{ text: string, changed: boolean, resolved: number, unresolved: string[], cancel?: boolean, reason?: string }}
 */
export function rewriteMentions(text, cfg) {
  const onUnresolved = cfg.onUnresolved || "leave";
  const { re, aliasToIds } = buildMatcher(cfg.roster || []);
  if (typeof text !== "string" || !text.includes("@")) {
    return { text, changed: false, resolved: 0, unresolved: [] };
  }

  let resolved = 0;
  const segments = splitCode(text);
  for (const seg of segments) {
    if (seg.code || !re) {
      continue;
    }
    seg.text = seg.text.replace(re, (_full, alias) => {
      const ids = aliasToIds.get(String(alias).toLowerCase());
      if (ids && ids.length) {
        resolved++;
        return ids.map((id) => "<@" + id + ">").join(" ");
      }
      return _full;
    });
  }
  let out = segments.map((s) => s.text).join("");

  // Find any leftover bare @handle that is not a resolved mention,
  // not @everyone/@here, and not an existing <@...> mention.
  const unresolved = findUnresolved(segments);

  if (unresolved.length && onUnresolved !== "leave") {
    if (onUnresolved === "cancel") {
      return {
        text: out,
        changed: out !== text,
        resolved,
        unresolved,
        cancel: true,
        reason:
          "blue-mentions: unresolved @mention(s) not allowed: " +
          unresolved.join(", "),
      };
    }
    if (onUnresolved === "plaintext") {
      // Neutralize the @ so it never renders as a broken mention.
      for (const seg of segments) {
        if (seg.code) {
          continue;
        }
        seg.text = seg.text.replace(
          /(?<![\w<&@])@(?!everyone\b|here\b)([A-Za-z0-9_]+)/giu,
          "$1",
        );
      }
      out = segments.map((s) => s.text).join("");
    }
  }

  return { text: out, changed: out !== text, resolved, unresolved };
}

function findUnresolved(segments) {
  const found = [];
  const re = /(?<![\w<&@])@(?!everyone\b|here\b)([A-Za-z0-9_][\w-]*)/giu;
  for (const seg of segments) {
    if (seg.code) {
      continue;
    }
    let m;
    while ((m = re.exec(seg.text)) !== null) {
      found.push(m[1]);
    }
  }
  return found;
}
