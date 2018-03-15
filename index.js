const Discord = require("discord.js");
const client = new Discord.Client();
const settings = require("./config/settings.json");

log = (msg) => {console.log(`[${new Date().toLocaleString()}] ${msg}`)};

function playSong(voiceChannel) {
  if (voiceChannel.guild.voiceConnection) if (voiceChannel.guild.voiceConnection.dispatcher) voiceChannel.guild.voiceConnection.dispatcher.end();
  voiceChannel.join()
    .then(connection => {
      log(`Joined ${connection.channel.name} (${connection.channel.id})`);

      let dispatcher = connection.playFile(settings.song);

      dispatcher.on("error", e => {
        console.error(e);
      });

      dispatcher.on("end", () => {
        if (voiceChannel.guild.loopSong) playSong(voiceChannel.guild.voiceConnection.channel);
      });
    })
    .catch(console.error);
}

client.on("ready", () => {
  log(`Bot ready! Logged in as ${client.user.tag} (${client.user.id})`);
  client.user.setActivity(settings.songTitle);
});

client.on("error", e => {
  console.error(e);
});

client.on("message", message => {
  let guild = message.guild,
      channel = message.channel,
      author = message.author,
      content = message.content,
      member = message.member;
  
  if (!message.isMemberMentioned(client.user)) return;
  if (!content.startsWith(`<@${client.user.id}>`)) return;
  if (content.split(" ").length < 2) return;

  let args = content.split(" ").slice(2),
      cmd = content.split(" ")[1].toLowerCase();

  switch (cmd) {
    case "join":
      if (!member.permissions.has("MOVE_MEMBERS")) return message.reply("Insufficient permission (You need the permission to move members)!");
      if (!member.voiceChannel) return message.reply("You have to be in a voice channel to use this command!");
      if (guild.voiceConnection) if (member.voiceChannel === guild.voiceConnection.channel) return;
      if (guild.voiceConnection) {
        guild.loopSong = false;
        guild.voiceConnection.disconnect();
        guild.loopSong = true;
        playSong(member.voiceChannel);
      } else {
        guild.loopSong = true;
        playSong(member.voiceChannel);
      }
      break;
    case "leave":
      if (!member.permissions.has("MOVE_MEMBERS")) return message.reply("Insufficient permission (You need the permission to move members)!");
      guild.loopSong = false;
      if (guild.voiceConnection) guild.voiceConnection.disconnect();
      break;
  }
});

client.on("voiceStateUpdate", () => {
  client.guilds.forEach(guild => {
    if (!guild.voiceConnection) return;
    if (!guild.voiceConnection.dispatcher) return;
    let members = guild.voiceConnection.channel.members.size,
        dispatcher = guild.voiceConnection.dispatcher;
    if (members > 1) {
      if (dispatcher.paused) {
        dispatcher.resume();
        log(`Music resumed in ${guild.voiceConnection.channel.name} (${guild.voiceConnection.channel.id})`);
      }
    } else {
      if (!dispatcher.paused) {
        dispatcher.pause();
        log(`Music paused in ${guild.voiceConnection.channel.name} (${guild.voiceConnection.channel.id})`);
      }
    }
  });
});

client.login(settings.token)
  .catch(e => {
    console.error(e);
  });
