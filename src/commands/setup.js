import {
  ContainerBuilder, TextDisplayBuilder,
  SeparatorBuilder, SeparatorSpacingSize,
  PermissionFlagsBits,
} from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";
import { getSettings, saveSettings } from "../db.js";
import { CV2, sep, txt, replyErr, replySuccess } from "../utils/ui.js";

export const cmd = {
  name: "setup",
  aliases: ["ayarla", "konfigur"],
  desc: "Kayıt botunu ayarlar.",
  usage: `${PREFIX}setup <alt-komut>`,
  adminOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return replyErr(msg, "Bu komutu sadece Yöneticiler kullanabilir.");
    }

    const s   = getSettings(msg.guild.id);
    const sub = args[0]?.toLowerCase();

    // ── .setup logkanal #kanal ────────────────────────────────────────────────
    if (sub === "logkanal") {
      const ch = msg.mentions.channels.first();
      if (!ch) return replyErr(msg, `Kullanım: \`${PREFIX}setup logkanal #kanal\``);
      saveSettings(msg.guild.id, { logChannel: ch.id });
      return replySuccess(msg, `Log kanalı ayarlandı: ${ch}`);
    }

    // ── .setup kayitkanal #kanal ──────────────────────────────────────────────
    if (sub === "kayitkanal") {
      const ch = msg.mentions.channels.first();
      if (!ch) return replyErr(msg, `Kullanım: \`${PREFIX}setup kayitkanal #kanal\``);
      saveSettings(msg.guild.id, { registerChannel: ch.id });
      return replySuccess(msg, `Kayıt kanalı ayarlandı: ${ch}`);
    }

    // ── .setup erkekrol @rol ──────────────────────────────────────────────────
    if (sub === "erkekrol") {
      const role = msg.mentions.roles.first();
      if (!role) return replyErr(msg, `Kullanım: \`${PREFIX}setup erkekrol @rol\``);
      saveSettings(msg.guild.id, { maleRole: role.id });
      return replySuccess(msg, `Erkek rolü ayarlandı: ${role}`);
    }

    // ── .setup kadinrol @rol ──────────────────────────────────────────────────
    if (sub === "kadinrol") {
      const role = msg.mentions.roles.first();
      if (!role) return replyErr(msg, `Kullanım: \`${PREFIX}setup kadinrol @rol\``);
      saveSettings(msg.guild.id, { femaleRole: role.id });
      return replySuccess(msg, `Kadın rolü ayarlandı: ${role}`);
    }

    // ── .setup uyerol @rol ────────────────────────────────────────────────────
    if (sub === "uyerol") {
      const role = msg.mentions.roles.first();
      if (!role) return replyErr(msg, `Kullanım: \`${PREFIX}setup uyerol @rol\``);
      saveSettings(msg.guild.id, { memberRole: role.id });
      return replySuccess(msg, `Üye rolü ayarlandı: ${role}`);
    }

    // ── .setup yetkilirol @rol ────────────────────────────────────────────────
    if (sub === "yetkilirol") {
      const role = msg.mentions.roles.first();
      if (!role) return replyErr(msg, `Kullanım: \`${PREFIX}setup yetkilirol @rol\``);
      const roles = s.staffRoles.includes(role.id)
        ? s.staffRoles.filter((r) => r !== role.id)
        : [...s.staffRoles, role.id];
      saveSettings(msg.guild.id, { staffRoles: roles });
      return replySuccess(msg,
        s.staffRoles.includes(role.id)
          ? `Yetkili rol kaldırıldı: ${role}`
          : `Yetkili rol eklendi: ${role}`
      );
    }

    // ── .setup (no sub) — show current settings ───────────────────────────────
    const fresh = getSettings(msg.guild.id);
    const c = new ContainerBuilder().setAccentColor(COLOR.INFO);
    c.addTextDisplayComponents(txt(`# ${EMOJI.SETUP} Kayıt Botu Ayarları`));
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(txt(
      `📋 **Log Kanalı:** ${fresh.logChannel ? `<#${fresh.logChannel}>` : "❌ Ayarlanmamış"}\n` +
      `🚪 **Kayıt Kanalı:** ${fresh.registerChannel ? `<#${fresh.registerChannel}>` : "❌ Ayarlanmamış"}\n` +
      `👦 **Erkek Rolü:** ${fresh.maleRole ? `<@&${fresh.maleRole}>` : "❌ Ayarlanmamış"}\n` +
      `👧 **Kadın Rolü:** ${fresh.femaleRole ? `<@&${fresh.femaleRole}>` : "❌ Ayarlanmamış"}\n` +
      `👤 **Üye Rolü:** ${fresh.memberRole ? `<@&${fresh.memberRole}>` : "❌ Ayarlanmamış"}\n` +
      `🔑 **Yetkili Roller:** ${fresh.staffRoles.length ? fresh.staffRoles.map((r) => `<@&${r}>`).join(", ") : "❌ Ayarlanmamış"}`
    ));
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(txt(
      `## Komutlar\n` +
      `\`${PREFIX}setup logkanal #kanal\`\n` +
      `\`${PREFIX}setup kayitkanal #kanal\`\n` +
      `\`${PREFIX}setup erkekrol @rol\`\n` +
      `\`${PREFIX}setup kadinrol @rol\`\n` +
      `\`${PREFIX}setup uyerol @rol\`\n` +
      `\`${PREFIX}setup yetkilirol @rol\``
    ));
    c.addSeparatorComponents(sep(false));
    c.addTextDisplayComponents(txt(`-# ${FOOTER}`));
    await msg.reply({ flags: CV2, components: [c] });
  },
};
