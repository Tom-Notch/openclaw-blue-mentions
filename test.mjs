// Unit tests for the rewrite engine. Run: node test.mjs
import { rewriteMentions } from "./mentions.js";
import { DEFAULT_ROSTER } from "./roster.js";

let pass = 0;
let fail = 0;

function eq(name, got, want) {
  if (got === want) {
    pass++;
  } else {
    fail++;
    console.error(`✗ ${name}\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`);
  }
}

const r = (text, onUnresolved = "leave") =>
  rewriteMentions(text, { roster: DEFAULT_ROSTER, onUnresolved });

const LA = "1515608451957391411";
const HK = "1515611687871447090";
const ROUTER = "1515618342680002700";
const DESK = "1515619018600611880";
const MAC = "1515220173336875030";
const TOM = "698118851388243999";

// short handles
eq("short @hk", r("ping @hk done").text, `ping <@${HK}> done`);
eq("short @la", r("@la 收到").text, `<@${LA}> 收到`);
// handle that is a prefix of another (hkbot vs hk)
eq("@hkbot", r("@hkbot up").text, `<@${HK}> up`);
eq("@cnrouter", r("@cnrouter restart").text, `<@${ROUTER}> restart`);
// multi-word display name
eq("@CN Router Bot", r("hey @CN Router Bot fix it").text, `hey <@${ROUTER}> fix it`);
eq("@CN Desktop Bot", r("@CN Desktop Bot 在吗").text, `<@${DESK}> 在吗`);
eq("@Macbook Bot", r("@Macbook Bot review").text, `<@${MAC}> review`);
// chinese alias
eq("@丞相", r("@丞相 你看下").text, `<@${DESK}> 你看下`);
// case-insensitive
eq("case @HK", r("@HK ok").text, `<@${HK}> ok`);
// operator
eq("@tomnotch", r("@tomnotch ack").text, `<@${TOM}> ack`);

// already-blue mention is left intact
eq("existing <@id>", r(`<@${HK}> hi`).text, `<@${HK}> hi`);
// role mention left intact
eq("role mention", r("<@&1515620495104671747> down").text, "<@&1515620495104671747> down");
// @everyone / @here untouched
eq("@everyone", r("@everyone listen").text, "@everyone listen");
eq("@here", r("@here now").text, "@here now");

// code spans are protected
eq("inline code", r("run `@hk` literally").text, "run `@hk` literally");
eq(
  "fenced code",
  r("```\n@hk in block\n```").text,
  "```\n@hk in block\n```",
);
// but text outside code is still rewritten
eq(
  "mixed code + text",
  r("ping @hk see `@la`").text,
  `ping <@${HK}> see \`@la\``,
);

// multiple mentions in one message
eq(
  "multi",
  r("@la @hk @cnrouter sync").text,
  `<@${LA}> <@${HK}> <@${ROUTER}> sync`,
);

// no @ at all -> unchanged, no work
eq("no mentions", r("just a normal message").text, "just a normal message");
eq("no mentions changed flag", r("hello world").changed, false);

// email-ish text should not be mangled (no leading word boundary)
eq("email left", r("mail me at bob@hk").text, "mail me at bob@hk");

// unresolved handling
eq("unresolved leave", r("@randomguy hi", "leave").text, "@randomguy hi");
eq("unresolved plaintext", r("@randomguy hi", "plaintext").text, "randomguy hi");
const cancelled = r("@randomguy hi", "cancel");
eq("unresolved cancel flag", cancelled.cancel, true);
eq("known not flagged unresolved", r("@hk hi").unresolved.length, 0);

// resolved count
eq("resolved count", r("@la and @hk").resolved, 2);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
