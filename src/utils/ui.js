import {
  ContainerBuilder, TextDisplayBuilder,
  SeparatorBuilder, SeparatorSpacingSize,
  MessageFlags,
} from "discord.js";
import { COLOR, EMOJI } from "../constants.js";

export const CV2 = MessageFlags.IsComponentsV2;

export function sep(divider = true) {
  return new SeparatorBuilder()
    .setDivider(divider)
    .setSpacing(SeparatorSpacingSize.Small);
}

export function txt(content) {
  return new TextDisplayBuilder().setContent(content);
}

export function errContainer(text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(txt(`${EMOJI.CROSS} ${text}`));
  return c;
}

export function successContainer(text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
  c.addTextDisplayComponents(txt(`${EMOJI.CHECK} ${text}`));
  return c;
}

export async function replyErr(msg, text) {
  await msg.reply({ flags: CV2, components: [errContainer(text)] });
}

export async function replySuccess(msg, text) {
  await msg.reply({ flags: CV2, components: [successContainer(text)] });
}
