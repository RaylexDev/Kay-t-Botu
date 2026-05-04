import { Events, MessageFlags } from "discord.js";
import {
  ContainerBuilder, TextDisplayBuilder,
  SeparatorBuilder, SeparatorSpacingSize,
} from "discord.js";
import { COLOR, EMOJI, FOOTER } from "../constants.js";
import { getSettings, addHistory } from "../db.js";
import { CV2, sep, txt, errContainer, successContainer } from "../utils/ui.js";

export function registerInteractionHandler(client) {
  client.on(Events.InteractionCreate, async (i) => {
    try {
      if (i.isStringSelectMenu() && i.customId.startsWith("kayit:cinsiyet:")) {
        await handleGenderSelect(i, client);
      }
    } catch (e) {
      console.error("[interaction]", e);
      await i.reply({ content: "Bir hata oluştu.", ephemeral: true }).catch(() => {});
    }
  });
}

async function handleGenderSelect(i, client) {
  // customId format: kayit:cinsiyet:{targetId}:{encodedLabel}:{registrarId}
  const parts       = i.customId.split(":");
  const targetId    = parts[2];
  const label       = decodeURIComponent(parts[3]);
  const registrarId = parts[4];

  // Only the original registrar can use this menu
  if (i.user.id !== registrarId) {
    return i.reply({
      flags: CV2 | MessageFlags.Ephemeral,
      components: [errContainer("Bu menüyü sadece kaydı başlatan yetkili kullanabilir.")],
    });
  }

  const choice = i.values[0];

  // Handle cancel
  if (choice === "iptal") {
    await i.update({
      flags: CV2,
      components: [(() => {
        const c = new ContainerBuilder().setAccentColor(COLOR.WARN);
        c.addTextDisplayComponents(txt(`${EMOJI.CANCEL} Kayıt iptal edildi.`));
        return c;
      })()],
    });
    return;
  }

  const s = getSettings(i.guild.id);
  if (!s.maleRole || !s.femaleRole) {
    return i.update({
      flags: CV2,
      components: [errContainer("Roller ayarlanmamış. Lütfen `.setup` komutunu kullan.")],
    });
  }

  const isMale  = choice === "erkek";
  const roleId  = isMale ? s.maleRole : s.femaleRole;
  const oppRoleId = isMale ? s.femaleRole : s.maleRole;

  // Fetch the target member
  const member = await i.guild.members.fetch(targetId).catch(() => null);
  if (!member) {
    return i.update({
      flags: CV2,
      components: [errContainer("Kullanıcı sunucuda bulunamadı.")],
    });
  }

  // Apply roles
  try {
    // Remove opposite gender role if present
    if (member.roles.cache.has(oppRoleId)) {
      await member.roles.remove(oppRoleId).catch(() => {});
    }
    // Add gender role
    await member.roles.add(roleId);
    // Add member role if set
    if (s.memberRole && !member.roles.cache.has(s.memberRole)) {
      await member.roles.add(s.memberRole).catch(() => {});
    }
    // Set nickname
    await member.setNickname(label).catch(() => {});
  } catch (e) {
    console.error("[kayit:roles]", e);
    return i.update({
      flags: CV2,
      components: [errContainer(`Rol/isim değiştirme başarısız: ${e.message}`)],
    });
  }

  // Save to history
  addHistory(i.guild.id, targetId, {
    name:      label,
    gender:    choice,
    registrar: `<@${i.user.id}>`,
    timestamp: Date.now(),
  });

  // Build success embed for the reply
  const genderEmoji = isMale ? EMOJI.MALE : EMOJI.FEMALE;
  const genderText  = isMale ? "Erkek" : "Kadın";
  const accentColor = isMale ? COLOR.MALE : COLOR.FEMALE;

  const successComp = new ContainerBuilder().setAccentColor(accentColor);
  successComp.addTextDisplayComponents(txt(`# ${genderEmoji} Kayıt Tamamlandı!`));
  successComp.addSeparatorComponents(sep());
  successComp.addTextDisplayComponents(txt(
    `👤 **Kullanıcı:** <@${targetId}>\n` +
    `✏️ **Yeni İsim:** \`${label}\`\n` +
    `${genderEmoji} **Cinsiyet:** ${genderText}\n` +
    `👮 **Kaydeden:** <@${i.user.id}>`
  ));
  successComp.addSeparatorComponents(sep(false));
  successComp.addTextDisplayComponents(txt(`-# ${FOOTER}`));

  await i.update({ flags: CV2, components: [successComp] });

  // Send log to log channel
  if (s.logChannel) {
    const logCh = await client.channels.fetch(s.logChannel).catch(() => null);
    if (logCh) {
      const logComp = new ContainerBuilder().setAccentColor(accentColor);
      logComp.addTextDisplayComponents(txt(`# ${EMOJI.LOG} Kayıt Logu`));
      logComp.addSeparatorComponents(sep());
      logComp.addTextDisplayComponents(txt(
        `👤 **Kullanıcı:** <@${targetId}> (\`${member.user.tag}\`)\n` +
        `✏️ **Verilen İsim:** \`${label}\`\n` +
        `${genderEmoji} **Cinsiyet:** ${genderText}\n` +
        `🎭 **Rol:** <@&${roleId}>\n` +
        `👮 **Kaydeden:** <@${i.user.id}>\n` +
        `🕐 **Zaman:** <t:${Math.floor(Date.now() / 1000)}:F>`
      ));
      logComp.addSeparatorComponents(sep(false));
      logComp.addTextDisplayComponents(txt(`-# ${FOOTER}`));
      await logCh.send({ flags: CV2, components: [logComp] }).catch(() => {});
    }
  }
}
