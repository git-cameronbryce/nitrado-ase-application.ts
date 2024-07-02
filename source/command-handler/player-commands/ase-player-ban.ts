import { InputProps, SupabaseProps, TokenProps, ServiceProps, ActionProps, } from '../command-interface/interface';
import { SlashCommandProps, CommandOptions } from 'commandkit';
import { playerActionEmbed } from '../utilities/embeds';
import { SlashCommandBuilder } from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../../script';

export const data = new SlashCommandBuilder()
  .setName('ase-player-ban')
  .setDescription('Performs an in-game player action.')
  .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Required to submit ban action.').setRequired(true)
    .addChoices({ name: 'Breaking Rules', value: 'breaking rules' }, { name: 'Cheating', value: 'cheating' }, { name: 'Behavior', value: 'behavior' }, { name: 'Meshing', value: 'meshing' }, { name: 'Other', value: 'other reasons' }))

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ ephemeral: false });
  const platforms: string[] = ['arkxb', 'arksps'];

  const input: InputProps = {
    username: interaction.options.getString('username')!,
    reason: interaction.options.getString('reason')!,
    guild: interaction.guild!.id
  }

  let success: number = 0, overall: number = 0;
  const getServiceInformation = async (token: string) => {
    const url: string = 'https://api.nitrado.net/services';
    const response: AxiosResponse<ServiceProps> = await axios.get(url,
      { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

    const tasks = response.data.data.services.map(async service => {
      if (!platforms.includes(service.details.folder_short)) return;
      overall++;

      try {
        const url: string = `https://api.nitrado.net/services/${service.id}/gameservers/games/banlist`;
        const response: AxiosResponse<ActionProps> = await axios.post(url, { identifier: input.username },
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        response.status === 200 && success++;
      } catch (error: any) { if (error.response.data.message === "Can't add the user to the banlist.") success++ };
    });

    await Promise.all(tasks).then(async () => {
      const embed = playerActionEmbed(success, overall);
      await interaction.followUp({ embeds: [embed] });
    });
  }

  const verification = async (token: string) => {
    const url: string = 'https://oauth.nitrado.net/token';
    const response: AxiosResponse<TokenProps> = await axios.get(url,
      { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

    const { scopes } = response.data.data.token;
    response.status === 200 && scopes.includes('service')
      && await getServiceInformation(token);
  }

  const { error, data } = await supabase
    .from('ase-configuration')
    .select('guild, nitrado').eq('guild', input.guild)

  data?.forEach(async (document: SupabaseProps) => {
    if (document.guild && document.nitrado) {
      const tokens: string[] = Object.values(document.nitrado);
      tokens.map(token => verification(token));
    }
  });
}

export const options: CommandOptions = {
  userPermissions: ['Administrator'],
}; 