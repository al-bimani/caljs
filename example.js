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

    Caljs.calc(expression)
      .then((result) => {
        message.channel.send(result);
      })
      .catch((err) => {
        message.channel.send(`${err}`);
      });
  }
});

client.login(process.env.BOT_TOKEN);
