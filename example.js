require("dotenv").config();

const Discord = require("discord.js");
const Caljs = require("./caljs");

const client = new Discord.Client();
const prefix = ".";

client.on("message", (message) => {
  if (message.author.bot) return;

  if (message.content.indexOf(prefix) != 0) return;

  const [command, ...args] = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);

  if (command == "calc") {
    let expression = message.content
      .slice(prefix.length)
      .trim()
      .slice(command.length)
      .trim();

    let result = Caljs.calc(expression);
    message.channel.send(result);
  }
});

client.login(process.env.BOT_TOKEN);
