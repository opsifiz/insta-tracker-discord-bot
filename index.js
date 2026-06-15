import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Instaloader } from '@vicociv/instaloader';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const L = new Instaloader();

async function getInstagramStats(username) {
  const profile = await L.getProfile(username);

  return {
    followers: await profile.getFollowers(),
    following: await profile.getFollowees(),
  };
}

// async function getInstagramStats(username) {
//   const response = await fetch(
//     `https://www.instagram.com/${username}/`,
//     {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
//       },
//     }
//   );

//   if (!response.ok) {
//     throw new Error(`HTTP ${response.status}`);
//   }

//   const html = await response.text();

//   const match = html.match(
//     /content="([\d,]+)\sFollowers,\s([\d,]+)\sFollowing,\s([\d,]+)\sPosts/
//   );

//   if (!match) {
//     throw new Error("Unable to parse Instagram profile");
//   }

//   return {
//     followers: parseInt(match[1].replace(/,/g, ""), 10),
//     following: parseInt(match[2].replace(/,/g, ""), 10),
//     posts: parseInt(match[3].replace(/,/g, ""), 10),
//   };
// }

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'about') {
    await interaction.reply(
      `🤖 **Instagram Stats Bot**\n\n` +
      `บอทสำหรับดึงข้อมูล Instagram แบบ real-time\n\n` +
      `📋 **คำสั่งที่ใช้ได้:**\n` +
      `• \`/get\` — ดึง stats ของ \`${DEFAULT_USERNAME}\`\n` +
      `• \`/get username:<ชื่อผู้ใช้>\` — ดึง stats ของ username ที่ระบุ\n` +
      `• \`/about\` — แสดงข้อมูลบอทนี้`
    );
    return;
  }

  if (interaction.commandName === 'get') {
    await interaction.deferReply();

    const username = interaction.options.getString('username') ?? "gethggtl";
    
    try {
      const stats = await getInstagramStats(username);

      await interaction.editReply(
        `📸 Instagram: **${username}**\n` +
        `👥 Followers: ${stats.followers.toLocaleString()}\n` +
        `➡️ Following: ${stats.following.toLocaleString()}`
      );
    } catch (error) {
      console.error(error);

      await interaction.editReply(
        `❌ Failed to fetch Instagram stats.\n\`\`\`${error.message}\`\`\``
      );
    }
  }
});

client.login(TOKEN);