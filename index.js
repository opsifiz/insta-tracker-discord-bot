import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TOKEN;
const DEFAULT_USERNAME = process.env.INSTAGRAM_USERNAME;
const APIFY_TOKEN = process.env.APIFY_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function getInstagramStats(username) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [username],
        resultsLimit: 1,
      }),
    }
  );

  const data = await res.json();

  const item = data?.[0];
  const profile = item?.profile_results;

  if (!profile) {
    throw new Error("No profile_results found from Apify response");
  }

  return {
    followers: profile.followers ?? 0,
    following: profile.following ?? 0,
    fullName: profile.full_name ?? username,
    bio: profile.biography ?? "",
    isPrivate: profile.is_private ?? false,
  };
}

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'about') {
    try {
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
    } catch (e) {
      console.error(e);
    }
  }

  if (interaction.commandName === 'get') {
    try {
      // MUST be first async call (no await before this)
      await interaction.deferReply();

      const username =
        interaction.options.getString('username') ?? DEFAULT_USERNAME;

      const stats = await getInstagramStats(username);

      await interaction.editReply(
        `📸 Instagram: **${username}**\n` +
        `👥 Followers: ${stats.followers.toLocaleString()}\n` +
        `➡️ Following: ${stats.following.toLocaleString()}`
      );
    } catch (error) {
      console.error(error);

      // if deferReply already failed, fallback to reply
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          `❌ Failed to fetch Instagram stats.\n\`\`\`${error.message}\`\`\``
        );
      } else {
        await interaction.reply(
          `❌ Failed to fetch Instagram stats.\n\`\`\`${error.message}\`\`\``
        );
      }
    }
  }
});

client.login(TOKEN);