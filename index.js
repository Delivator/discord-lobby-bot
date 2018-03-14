const Discord = require("discord.js");
const client = new Discord.Client();
const settings = require("./config/settings.json");

log = (msg) => {console.log(`[${new Date().toLocaleString()}] ${msg}`)};

function playSong() {
  let server = client.guilds.get("122778177754890241"),
      channel = false;
  if (server) channel = server.channels.get("423266650293272586")
  if (channel) {
    channel.join()
      .then(connection => {
        log("Successfully connected to a voice channel!");
        let members = channel.members.size;
        let dispatcher = connection.playFile(settings.song);

        dispatcher.on("error", e => {
          console.error(e);
        });

        dispatcher.on("end", () => {
          playSong();
        });

        client.on("voiceStateUpdate", (oldMember, newMember) => {
          members = channel.members.size;
          if (members > 1) {
            if (dispatcher.paused) {
              dispatcher.resume();
              client.user.setActivity("▶ Mii Plaza");
              log("Streaming resumed");
            }
          } else {
            if (!dispatcher.paused) {
              dispatcher.pause();
              client.user.setActivity("⏸ Mii Plaza");
              log("Streaming paused");
            }
          }
        });
      })
      .catch(console.log);
  }
}

client.on("ready", () => {
  log(`Bot ready! Logged in as ${client.user.tag} (${client.user.id})`);
  playSong();
});

client.on("error", (e) => {
  console.error(e);
});

client.login(settings.token)
  .catch(e => {
    console.error(e);
  });
