import { REST, Routes, ApplicationCommandOptionType } from "discord.js";
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const commands = [
  {
    name: "about",
    description: "ข้อมูลเกี่ยวกับบอทนี้",
  },
  {
    name: "get",
    description: "ดึงข้อมูล Instagram stats",
    options: [
      {
        name: "username",
        description: "ชื่อผู้ใช้ Instagram (ถ้าไม่ใส่จะใช้ gethggtl)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
  console.error(error);
}