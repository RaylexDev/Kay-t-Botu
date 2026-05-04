import {
  ContainerBuilder, TextDisplayBuilder,
  SeparatorBuilder, SeparatorSpacingSize,
} from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";
import { getHistory } from "../db.js";
import { CV2, sep, txt, replyErr } from "../utils/ui.js";

export const cmd = {
  name: "history",
  aliases: ["gecmis", "geçmiş", "kayitgecmis"],
  desc: "Kullanıcının kayıt geçmişini gösterir.",
  usage: `${PREFIX}history @kullanici`,

  async execute(msg, args, client) {
    if (!msg.guild) return;

    const target = msg.mentions.members?.first();
    if (!target) return replyErr(msg, `Kullanım: \`${PREFIX}history @kullanici\``);

    const records = getHistory(msg.guild.id, target.id);

    const c = new ContainerBuilder().setAccentColor(COLOR.INFO);
    c.addTextDisplayComponents(txt(`# ${EMOJI.HISTORY} Kayıt Geçmişi — ${target.user.username}`));
    c.addSeparatorComponents(sep());

    if (!records.length) {
      c.addTextDisplayComponents(txt(`Bu kullanıcının kayıt geçmişi bulunmuyor.`));
    } else {
      records.forEach((r, i) => {
        const genderEmoji = r.gender === "erkek" ? EMOJI.MALE : EMOJI.FEMALE;
        const genderText  = r.gender === "erkek" ? "Erkek" : "Kadın";
        const date = `<t:${Math.floor(r.timestamp / 1000)}:f>`;
        c.addTextDisplayComponents(txt(
          `**${i + 1}.** ${genderEmoji} \`${r.name}\` • ${genderText}\n` +
          `-# 👮 ${r.registrar} • ${date}`
        ));
        if (i < records.length - 1) c.addSeparatorComponents(sep(false));
      });
    }

    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(txt(`-# ${FOOTER} • Toplam: **${records.length}** kayıt`));
    await msg.reply({ flags: CV2, components: [c] });
  },
};
