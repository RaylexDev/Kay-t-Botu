import {
  ContainerBuilder, TextDisplayBuilder,
  SeparatorBuilder, SeparatorSpacingSize,
  ActionRowBuilder, StringSelectMenuBuilder,
  MessageFlags,
} from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";
import { getSettings } from "../db.js";
import { isStaff } from "../utils/perms.js";
import { CV2, sep, txt, replyErr } from "../utils/ui.js";

export const cmd = {
  name: "k",
  aliases: ["kayit", "kayıt", "register"],
  desc: "Kullanıcıyı sunucuya kayıt eder.",
  usage: `${PREFIX}k @kullanici İsim Yaş`,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isStaff(msg.member)) return replyErr(msg, "Bu komutu kullanmak için kayıt yetkilisi olmalısın.");

    const s = getSettings(msg.guild.id);
    if (!s.maleRole || !s.femaleRole) {
      return replyErr(msg, `Önce \`${PREFIX}setup\` komutuyla botу ayarla.`);
    }

    const target = msg.mentions.members?.first();
    if (!target) return replyErr(msg, `Kullanım: \`${PREFIX}k @kullanici İsim Yaş\``);

    if (target.user.bot) return replyErr(msg, "Bot hesabı kayıt edilemez.");

    // parse name and age from args after the mention
    const rest = args.filter((a) => !a.match(/^<@!?\d+>$/));
    const age  = rest.findIndex((a) => /^\d+$/.test(a));

    let name, ageVal;
    if (age === -1) {
      // no age provided — use all as name, age unknown
      name   = rest.join(" ").trim();
      ageVal = null;
    } else {
      ageVal = parseInt(rest[age]);
      name   = rest.slice(0, age).join(" ").trim() || rest.slice(age + 1).join(" ").trim();
    }

    if (!name) return replyErr(msg, `Kullanım: \`${PREFIX}k @kullanici İsim Yaş\``);
    if (ageVal !== null && (ageVal < 1 || ageVal > 100)) return replyErr(msg, "Geçerli bir yaş gir (1-100).");

    const label = ageVal ? `${name} | ${ageVal}` : name;

    // Build the confirmation container
    const c = new ContainerBuilder().setAccentColor(COLOR.PRIMARY);
    c.addTextDisplayComponents(txt(`# 📋 Kayıt Onayı`));
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(txt(
      `👤 **Kullanıcı:** ${target}\n` +
      `✏️ **Verilecek İsim:** \`${label}\`\n` +
      `🔖 **Kaydeden:** ${msg.author}`
    ));
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(txt(`Cinsiyet seçin veya iptal edin:`));
    c.addSeparatorComponents(sep(false));
    c.addTextDisplayComponents(txt(`-# ${FOOTER}`));

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`kayit:cinsiyet:${target.id}:${encodeURIComponent(label)}:${msg.author.id}`)
      .setPlaceholder("Cinsiyet seçin...")
      .addOptions([
        { label: "👦 Erkek", value: "erkek", description: "Erkek rolü ver", emoji: "👦" },
        { label: "👧 Kadın", value: "kadin", description: "Kadın rolü ver", emoji: "👧" },
        { label: "🚫 İptal", value: "iptal", description: "Kaydı iptal et", emoji: "🚫" },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await msg.reply({ flags: CV2, components: [c, row] });
  },
};
