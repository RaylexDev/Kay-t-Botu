import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";
import { CV2, sep, txt } from "../utils/ui.js";

export const cmd = {
  name: "yardim",
  aliases: ["help", "h", "komutlar"],
  desc: "Tüm komutları listeler.",
  usage: `${PREFIX}yardim`,

  async execute(msg, args, client) {
    const c = new ContainerBuilder().setAccentColor(COLOR.PRIMARY);
    c.addTextDisplayComponents(txt(`# 📋 Kayıt Botu — Komutlar`));
    c.addSeparatorComponents(sep());

    c.addTextDisplayComponents(txt(
      `## 🚪 Kayıt\n` +
      `\`${PREFIX}k @kullanici İsim Yaş\` — Kullanıcıyı kayıt et\n` +
      `\`${PREFIX}history @kullanici\` — Kayıt geçmişini gör`
    ));
    c.addSeparatorComponents(sep(false));

    c.addTextDisplayComponents(txt(
      `## ${EMOJI.SETUP} Kurulum (Yönetici)\n` +
      `\`${PREFIX}setup\` — Mevcut ayarları gör\n` +
      `\`${PREFIX}setup logkanal #kanal\` — Log kanalı ayarla\n` +
      `\`${PREFIX}setup kayitkanal #kanal\` — Kayıt kanalı ayarla\n` +
      `\`${PREFIX}setup erkekrol @rol\` — Erkek rolü ayarla\n` +
      `\`${PREFIX}setup kadinrol @rol\` — Kadın rolü ayarla\n` +
      `\`${PREFIX}setup uyerol @rol\` — Üye rolü ayarla\n` +
      `\`${PREFIX}setup yetkilirol @rol\` — Kayıt yetkilisi rolü ekle/kaldır`
    ));
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(txt(`-# ${FOOTER} • Prefix: \`${PREFIX}\``));

    await msg.reply({ flags: CV2, components: [c] });
  },
};
