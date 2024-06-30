import { Events, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, Client, Interaction, ModalBuilder, Embed, EmbedBuilder, ButtonStyle } from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import { ButtonKit } from 'commandkit';
import { supabase } from '../../../script';

export default function (client: Client<true>) {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === 'ase-setup-token') {
        const modal = new ModalBuilder()
          .setCustomId('ase-modal-setup')
          .setTitle('Token Integration Process');

        const modalTokenRequired = new TextInputBuilder()
          .setCustomId('ase-nitrado-token-required').setLabel('Required Nitrado Token').setMinLength(25).setMaxLength(100)
          .setPlaceholder('...xMk99ZfXDRtKZDEq24B098-X42zX8kHqo3')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const modalTokenOptional = new TextInputBuilder()
          .setCustomId('ase-nitrado-token-optional').setLabel('Optional Nitrado Token').setMinLength(25).setMaxLength(100)
          .setPlaceholder('...oAg66TcQYUnYXBQn17A161-N86cN5jWDp7')

          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const modalRequiredParameter = new ActionRowBuilder<ModalActionRowComponentBuilder>()
          .addComponents(modalTokenRequired);

        const modalOptionalParameter = new ActionRowBuilder<ModalActionRowComponentBuilder>()
          .addComponents(modalTokenOptional);

        modal.addComponents(modalRequiredParameter, modalOptionalParameter);
        await interaction.showModal(modal);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ase-modal-setup') {
        await interaction.deferReply({ ephemeral: false })
        const required: string = interaction.fields.getTextInputValue('ase-nitrado-token-required');
        const optional: string = interaction.fields.getTextInputValue('ase-nitrado-token-optional');

        if (required) {
          try {
            const url: string = 'https://oauth.nitrado.net/token'
            const response = await axios.get(url, { headers: { 'Authorization': required } })
            console.log(response.data)
          } catch (error) {
            return await interaction.followUp({ content: 'Token Verification: Error' })
          }
        }

        if (optional) {
          try {
            const url: string = 'https://oauth.nitrado.net/token'
            const response = await axios.get(url, { headers: { 'Authorization': optional } })
            console.log(response.data)
          } catch (error) {
            return await interaction.followUp({ content: 'Token Verification: Error' })
          }
        }

        const installation = new ButtonKit()
          .setCustomId('ase-setup-token')
          .setStyle(ButtonStyle.Success)
          .setLabel('Setup Token')
          .setDisabled(true);

        const support = new ButtonKit()
          .setURL('https://discord.gg/VQanyb23Rn')
          .setStyle(ButtonStyle.Link)
          .setLabel('Support Server');

        const row: ActionRowBuilder<ButtonKit> = new ActionRowBuilder<ButtonKit>()
          .addComponents(installation, support);

        const embed: EmbedBuilder = new EmbedBuilder()
          .setDescription("**Ark Survival Evolved**\n**Cluster Setup & Overview**\nThank you for choosing our service. Below, you'll have the option to link your token, along with a [video preview](https://imgur.com/a3b9GkZ) to display the process.\n\n**Additional Information**\nEnsure this guild is a [community](https://i.imgur.com/q8ElPKj.mp4) server, otherwise, the bot will not be able to integrate properly.\n\n**[Partnership & Affiliation](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will recieve partial commission!")
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setImage('https://i.imgur.com/bFyqkUS.png')
          .setColor(0x2ecc71);

        await interaction.message?.edit({ embeds: [embed], components: [row] })
          .then(async () => await interaction.followUp({ content: "Proceeding with installation...", ephemeral: true }));
      }
    }
  });
}