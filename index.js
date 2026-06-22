// OpenClaw plugin: blue-mentions
//
// Registers a `message_sending` hook that rewrites every known fleet-member
// reference in outbound Discord messages into a native `<@ID>` mention (the
// only form that renders blue and reliably notifies). See README.md.

import { rewriteMentions } from "./mentions.js";
import { DEFAULT_ROSTER } from "./roster.js";

// definePluginEntry is just an identity helper in the SDK. We keep a local
// identity wrapper so the entry is dependency-free ESM and the gateway loader
// (which does not support top-level await) parses it cleanly.
const definePluginEntry = (x) => x;

function resolveChannel(event) {
  return (
    event?.channel ||
    event?.surface ||
    event?.provider ||
    event?.ctx?.channel ||
    event?.context?.channel ||
    null
  );
}

function resolveContent(event) {
  if (typeof event?.content === "string") {
    return { get: () => event.content, set: (v) => ({ content: v }) };
  }
  if (typeof event?.message?.content === "string") {
    return { get: () => event.message.content, set: (v) => ({ content: v }) };
  }
  if (typeof event?.text === "string") {
    return { get: () => event.text, set: (v) => ({ text: v, content: v }) };
  }
  return null;
}

export default definePluginEntry({
  id: "blue-mentions",
  name: "Blue Mentions",
  description:
    "Rewrite fleet @mentions in outbound Discord messages to native <@ID> blue mentions.",
  register(api) {
    api.on(
      "message_sending",
      async (event) => {
        const channel = resolveChannel(event);
        // Only Discord uses <@ID> mention syntax. If channel is unknown, be safe
        // and skip rather than corrupt another channel's text.
        if (channel && String(channel).toLowerCase() !== "discord") {
          return;
        }
        if (!channel) {
          return;
        }

        const slot = resolveContent(event);
        if (!slot) {
          return;
        }
        const content = slot.get();
        if (typeof content !== "string" || !content.includes("@")) {
          return;
        }

        const cfg = event?.context?.pluginConfig || {};
        const roster =
          Array.isArray(cfg.roster) && cfg.roster.length
            ? cfg.roster
            : DEFAULT_ROSTER;
        const onUnresolved = cfg.onUnresolved || "leave";

        const result = rewriteMentions(content, { roster, onUnresolved });

        if (result.cancel) {
          return {
            cancel: true,
            cancelReason: result.reason,
            metadata: { plugin: "blue-mentions", unresolved: result.unresolved },
          };
        }
        if (result.changed) {
          return slot.set(result.text);
        }
        return;
      },
      { priority: 40 },
    );
  },
});
