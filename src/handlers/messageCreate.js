import { Events } from "discord.js";
import { PREFIX } from "../constants.js";

import { cmd as kayit   } from "../commands/kayit.js";
import { cmd as history } from "../commands/history.js";
import { cmd as setup   } from "../commands/setup.js";
import { cmd as yardim  } from "../commands/yardim.js";

const ALL = [kayit, history, setup, yardim];

const commands = new Map();
for (const cmd of ALL) {
  commands.set(cmd.name, cmd);
  for (const alias of cmd.aliases ?? []) {
    commands.set(alias, cmd);
  }
}

export function registerMessageHandler(client) {
  client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild) return;
    if (!msg.content.startsWith(PREFIX)) return;

    const args = msg.content.slice(PREFIX.length).trim().split(/\s+/);
    const name = args.shift().toLowerCase();

    const cmd = commands.get(name);
    if (!cmd) return;

    try {
      await cmd.execute(msg, args, client);
    } catch (e) {
      console.error(`[cmd:${name}]`, e);
    }
  });
}
