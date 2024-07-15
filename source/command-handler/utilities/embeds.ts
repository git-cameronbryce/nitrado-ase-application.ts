import { EmbedBuilder } from "discord.js";


export const playerActionEmbed = (success: number, overall: number, token: string): EmbedBuilder => {
  return new EmbedBuilder()
    .setDescription(`**Ark Survival Evolved**\n**Game Command Success**\nGameserver action completed.\nExecuted on \`${success}\` of \`${overall}\` servers.\n\`\`\`...${token.slice(0, 12)}\`\`\``)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setThumbnail('https://i.imgur.com/CzGfRzv.png')
    .setColor(0x2ecc71);
};

export const statusMessageEmbed = (): EmbedBuilder => {
  return new EmbedBuilder()
    .setDescription("**Server Status Information**\nStatus page installing. Every few minutes, this page will update. Displaying accurate and updated server information. \n\n(e.g., Server state, Player data, etc.)\n\n**[Partnership Commission](https://nitra.do/obeliskdevelopment)**\nConsider purchasing your servers via our link, we will receive partial commission to assist with ongoing development.")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/bFyqkUS.png')
    .setColor(0x2ecc71);
};