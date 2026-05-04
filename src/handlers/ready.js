import { Events } from "discord.js";
import { FOOTER } from "../constants.js";

export function registerReadyHandler(client) {
  client.once(Events.ClientReady, () => {
    console.log(`╔══════════════════════════════════════╗`);
    console.log(`║   ${FOOTER}`);
    console.log(`║   Bot: ${client.user.tag}`);
    console.log(`║   ID:  ${client.user.id}`);
    console.log(`╚══════════════════════════════════════╝`);
  });
}
