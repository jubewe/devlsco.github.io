const channelName = "lsco";
const channelID = 617309984;
const minChannelFollowers = 5000;

window.onload = ModLookUp(), ModChannels();

function format(number) { // Formatter Function
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 1000 => 1,000
}

async function ModLookUp() { // ModLookUp Function
    await fetch(`https://modlookup.3v.fi/api/user-totals/${channelName}`).then(response => response.json()).then(data => {
        modlookup.innerHTML =
            `
            <div class="modlookup">
                <table>
                    <tr>
                        <td>
                            Follow total:
                            <highlight>
                                ${format(data.follows)}
                            </highlight>
                        </td>
                        <td>
                            Views total:
                            <highlight>
                                ${format(data.views)}
                            </highlight>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            Channels:
                            <highlight>
                                ${format(data.total)}
                            </highlight>
                        </td>
                        <td>
                            Partners:
                            <highlight>
                                ${format(data.partners)}
                            </highlight>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }).catch(error => {
        modlookup.innerHTML +=
            `
            <div>
                <text>
                    Error:
                        <text style="color: #FF0000;">
                            ${error.message}
                        </text>
                </text>
            </div>
        `;
        console.error(error);
    });
}

async function ModChannels() {
    await fetch(`https://modlookup.3v.fi/api/user-v3/${channelName}?limit=5000`).then(res => res.json()).then(data => {
        let channelsArray = [];
        for (const channel of data.channels.map(res => res)) {
            if (channel.followers > minChannelFollowers) {
                channelsArray.push(channel.name);
            }
        }
        fetch(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(channelsArray.join(","))}`).then(res => res.json()).then(data => {
            if (data.error) {
                return modChannels.innerHTML = `<div><text>Error: <highlight>${data.message ? data.message : data.error.message}<highlight></div>`;
            }
            for (const channel of data.sort((x, y) => Number(y.followers) - Number(x.followers))) {
                if (channel.login) {
                    modChannels.innerHTML +=
                        `
                        <div class="line">
                            <table>
                                <tr>
                                    <td>
                                        <div class="image-area">
                                            <div class="image">
                                                <img class="logo" src="${channel.logo.replace("600x600", "300x300")}" alt="${channel.login.slice(0, 1).toUpperCase()}">
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="text">
                                            <a style="color: ${channel.chatColor ? channel.chatColor : "#FFF"};" href="https://www.twitch.tv/${encodeURIComponent(channel.login)}/" target="_blank" rel="noopener noreferrer">
                                                ${channel.displayName ? channel.displayName : channel.login}
                                            </a>
                                        </div>
                                    </td>
                                    <div class="followers">
                                        ${format(channel.followers)}
                                    </div>
                                </tr>
                            </table>
                            ${channel.stream ? `
                                    <br>
                                    <table>
                                        <tr>
                                            <td>
                                                <div class="text">
                                                    <a class="game" href="https://www.twitch.tv/directory/game/${encodeURI(channel.stream.game.displayName)}/" target="_blank" rel="noopener noreferrer">
                                                        ${channel.stream.game.displayName}
                                                    </a>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="text margin">
                                                    ${format(channel.stream.viewersCount)}
                                                </div>
                                            </td>
                                            <td>
                                                <div class="text">
                                                    ${channel.stream.title}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                            ` : ""}
                        </div>
                    `;
                }
            }
        }).catch(e => {
            console.error(e);
            return modChannels.innerHTML = `<div><text>Error: <highlight>${e.message}<highlight></div>`;
        });
    }).catch(e => {
        console.error(e);
        return modChannels.innerHTML = `<div><text>Error: <highlight>${e.message}<highlight></div>`;
    });
}

let ws = new WebSocket("wss://irc-ws.chat.twitch.tv/");

ws.onopen = async function () {
    this.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
    this.send("PASS SCHMOOPIIE");
    this.send("NICK justinfan123");
    this.send(`JOIN #${channelName}`);
    setInterval(() => {
        this.send("PING");
    }, 25000);
}

let SevenTV = new Map();
let BetterTTV = new Map();
let FFZ = new Map();

let GlobalSevenTV = new Map();
let GlobalBetterTTV = new Map();
let GlobalFFZ = new Map();

let Badges = new Map();

(async () => {

    // Channel Emotes
    await fetch(`https://api.7tv.app/v2/users/${channelName}/emotes`).then(response => response.json()).then(data => {
        SevenTV.set("emotes", data)
    });
    await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelID}`).then(response => response.json()).then(data => {
        BetterTTV.set("emotes", data)
    });
    await fetch(`https://api.frankerfacez.com/v1/room/id/${channelID}`).then(response => response.json()).then(data => {
        FFZ.set("emotes", data)
    });

    // global Emotes
    await fetch(`https://7tv.io/v3/emote-sets/global`).then(response => response.json()).then(data => {
        GlobalSevenTV.set("emotes", data)
    });
    await fetch(`https://api.betterttv.net/3/cached/emotes/global`).then(response => response.json()).then(data => {
        GlobalBetterTTV.set("emotes", data)
    });
    await fetch(`https://api.frankerfacez.com/v1/set/global`).then(response => response.json()).then(data => {
        GlobalFFZ.set("emotes", data)
    });

    // Badges
    await fetch(`https://badges.twitch.tv/v1/badges/global/display?language=en`).then(response => response.json()).then(data => {
        Badges.set("badges", data)
    });

    // recent-messages
    await fetch(`https://recent-messages.zneix.eu/api/v2/recent-messages/${channelName}`).then(response => response.json()).then(data => {
        var lol = "";
        for (const i of data.messages) {
            if (i.includes("@badge-info")) {
                let id = i.split("user-id=")[1].split(";")[0]
                let color = i.split("color=")[1].split(";")[0]
                let message = i.split(`PRIVMSG #${channelName}`)[1];
                let displayName = i.split("display-name=")[1].split(";")[0]
                let badges = i.split("badges=")[1].split(";")[0].replace(/\/[0-9]+/g, "")
                let time = Number(i.split("rm-received-ts=")[1].split(";")[0])

                let TwitchBadges = ``;

                if(badges !== "") {
                    for (const i of badges.split(",")) {
                        TwitchBadges += `<img src="${Badges.get("badges").badge_sets[i].versions[1].image_url_1x}"> `
                    }
                }
    
                for (const i of SevenTV.get("emotes")) {
                    message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.7tv.app/emote/${i.id}/1x.webp">`);
                }
    
                for (const i of BetterTTV.get("emotes").sharedEmotes) {
                    message = message.replace(new RegExp(`\\b${i.code}\\b`, "g"), `<img class="emote" src="https://cdn.betterttv.net/emote/${i.id}/1x">`);
                }
    
                for (const i of FFZ.get("emotes").sets[FFZ.get("emotes").room.set].emoticons) {
                    message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.frankerfacez.com/emoticon/${i.id}/1">`);
                }
    
                for (const i of GlobalSevenTV.get("emotes").emotes) {
                    message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.7tv.app/emote/${i.id}/1x.webp">`);
                }
    
                for (const i of GlobalBetterTTV.get("emotes")) {
                    message = message.replace(new RegExp(`\\b${i.code}\\b`, "g"), `<img class="emote" src="https://cdn.betterttv.net/emote/${i.id}/1x">`);
                }
    
                for (const i of GlobalFFZ.get("emotes").sets["3"].emoticons) {
                    message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.frankerfacez.com/emoticon/${i.id}/1">`);
                }

                lol +=
                    `
                <div>
                    <div class="inner-chat-message">
                        <div class="inner-chat-message date">
                            ${new Date(time).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
                        </div>
                        <div class="inner-chat-message message badge">${TwitchBadges}</div>
                        <div  style="color: ${color ? color : "#FFFFFF"};" class="inner-chat-message user">${displayName}: </div>
                        <div class="inner-chat-message message">${message}</div>
                    </div>
                    <p></p>
                </div>
            `;
            }
        }
        chat.innerHTML = lol;
    });

    ws.onmessage = async function (event) {
        if (event.data.includes("PRIVMSG")) {

            let id = event.data.split("user-id=")[1].split(";")[0]
            let color = event.data.split("color=")[1].split(";")[0]
            let message = event.data.split(`PRIVMSG #${channelName} :`)[1].replace(/</g, " < ").replace(/>/g, " > ");
            let displayName = event.data.split("display-name=")[1].split(";")[0]
            let badges = event.data.split("badges=")[1].split(";")[0].replace(/\/[0-9]+/g, "")

            let TwitchBadges = ``;

            if(badges !== "") {
                for (const i of badges.split(",")) {
                    TwitchBadges += `<img src="${Badges.get("badges").badge_sets[i].versions[1].image_url_1x}"> `
                }
            }

            for (const i of SevenTV.get("emotes")) {
                message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.7tv.app/emote/${i.id}/1x.webp">`);
            }

            for (const i of BetterTTV.get("emotes").sharedEmotes) {
                message = message.replace(new RegExp(`\\b${i.code}\\b`, "g"), `<img class="emote" src="https://cdn.betterttv.net/emote/${i.id}/1x">`);
            }

            for (const i of FFZ.get("emotes").sets[FFZ.get("emotes").room.set].emoticons) {
                message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.frankerfacez.com/emoticon/${i.id}/1">`);
            }

            for (const i of GlobalSevenTV.get("emotes").emotes) {
                message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.7tv.app/emote/${i.id}/1x.webp">`);
            }

            for (const i of GlobalBetterTTV.get("emotes")) {
                message = message.replace(new RegExp(`\\b${i.code}\\b`, "g"), `<img class="emote" src="https://cdn.betterttv.net/emote/${i.id}/1x">`);
            }

            for (const i of GlobalFFZ.get("emotes").sets["3"].emoticons) {
                message = message.replace(new RegExp(`\\b${i.name}\\b`, "g"), `<img class="emote" src="https://cdn.frankerfacez.com/emoticon/${i.id}/1">`);
            }

            chat.innerHTML +=
                `
                <div>
                    <div class="inner-chat-message">
                        <div class="inner-chat-message date">
                            ${new Date(new Date(new Date()).setHours(new Date().getHours() + 2)).toISOString().replace("T", " ").replace("Z", "").split(".")[0].split(" ")[1]}
                        </div>
                        <div class="inner-chat-message message badge">${TwitchBadges}</div>
                        <div  style="color: ${color ? color : "#FFFFFF"};" class="inner-chat-message user">${displayName}: </div>
                        <div class="inner-chat-message message">${message}</div>
                    </div>
                    <p></p>
                </div>
            `;
        };
    };

})().catch(((error) => {
    console.log(error)
}));

ws.onerror = function () {
    console.log(`An error has occurred.`)
};