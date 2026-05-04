import { Client, GatewayIntentBits, Partials } from "discord.js";
import { TOKEN } from "./config.js";
import { registerMessageHandler }     from "./handlers/messageCreate.js";
import { registerInteractionHandler } from "./handlers/interactionCreate.js";
import { registerReadyHandler }       from "./handlers/ready.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

registerReadyHandler(client);
registerMessageHandler(client);
registerInteractionHandler(client);

await client.login(TOKEN);
