import { ActionRowBuilder, ButtonStyle, Channel, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { supabase } from '../../../script';
import { SupabaseProps, TokenProps, ServiceProps, GameserverProps } from '../../../interface';
import axios, { AxiosResponse } from 'axios';
import { ButtonKit } from 'commandkit';

export default async function (client: Client<true>) {
  const platforms: string[] = ['arkxb', 'arksps'];

  const { data } = await supabase
    .from('ase-configuration')
    .select('nitrado, status');

  let output: string = '';
  let counter: number = 0, current: number = 0, maximum: number = 0;
  const servers: { output: string, playerCurrent: number }[] = [];

  const getServiceInformation = async (token: string) => {
    const url: string = 'https://api.nitrado.net/services';
    const response: AxiosResponse<ServiceProps> = await axios.get(url,
      { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

    await Promise.all(response.data.data.services.map(async service => {
      if (!platforms.includes(service.details.folder_short)) return;

      const { suspend_date } = service;

      const url: string = `https://api.nitrado.net/services/${service.id}/gameservers`;
      const response: AxiosResponse<GameserverProps> = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      const { query } = response.data.data.gameserver;

      query?.player_current ? current += query.player_current : null;
      query?.player_max ? maximum += query.player_max : null;

      if (counter >= 25) return;
      let serverOutput = '';
      switch (response.data.data.gameserver.status) {
        case 'started':
          serverOutput = `\`🟢\` \`Service Online\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'restarting':
          serverOutput = `\`🟠\` \`Service Restarting\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'updating':
          serverOutput = `\`🟠\` \`Service Updating\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'stopping':
          serverOutput = `\`🔴\` \`Service Stopping\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'stopped':
          serverOutput = `\`🔴\` \`Service Stopped\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;

        default:
          break;
      }

      servers.push({ output: serverOutput, playerCurrent: query?.player_current || 0 });
    }));
  };

  const verification = async (token: string) => {
    try {
      const url: string = 'https://oauth.nitrado.net/token';
      const response: AxiosResponse<TokenProps> = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      const { scopes } = response.data.data.token;
      response.status === 200 && scopes.includes('service')
        && await getServiceInformation(token);

    } catch (error) { console.log('Invalid Token'), null };
  };

  data?.forEach(async (document: SupabaseProps) => {
    if (document.nitrado && document.status) {
      const tokens: string[] = Object.values(document.nitrado);
      await Promise.all(tokens.map(token => verification(token)));

      try {
        const channel = await client.channels.fetch(document.status?.channel) as TextChannel;
        const message = await channel.messages.fetch(document.status?.message);

        // Sort servers by player current count
        servers.sort((a, b) => b.playerCurrent - a.playerCurrent);

        // Build the output string from the sorted servers
        output = servers.map(server => server.output).join('');

        const cluster = new ButtonKit()
          .setCustomId('ase-cluster-command')
          .setLabel('Cluster Command')
          .setStyle(ButtonStyle.Success);

        const support = new ButtonKit()
          .setURL('https://discord.gg/VQanyb23Rn')
          .setLabel('Support Server')
          .setStyle(ButtonStyle.Link);

        const row: ActionRowBuilder<ButtonKit> = new ActionRowBuilder<ButtonKit>()
          .addComponents(cluster, support);

        const embed: EmbedBuilder = new EmbedBuilder()
          .setDescription(`${output}**Cluster Player Count**\n \`🌐\` \`(${current}/${maximum})\`\n\n<t:${Math.floor(Date.now() / 1000)}:R>\n**[Partnership & Information](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your gameservers, it will help fund development.`)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setImage('https://i.imgur.com/2ZIHUgx.png')
          .setColor(0x2ecc71);

        await message.edit({ embeds: [embed], components: [row] });
      } catch (error) { console.log('Cannot edit status page.'), null }
    }
  });
}
