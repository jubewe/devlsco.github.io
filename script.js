// Thanks to @Jubewe for some help, ideas and tipps! (https://github.com/jubewe/)

const follows = document.getElementById("follows");
const views = document.getElementById("views");
const total = document.getElementById("total");
const partners = document.getElementById("partners");
const modlookup = document.getElementById("modlookup");
const modChannels = document.getElementById("modChannels");
const refresh_icon_ml = document.getElementById("refresh_icon_ml");
const refresh_icon_mc = document.getElementById("refresh_icon_mc");

window.onload = ModLookUp(), ModChannels();

const cooldownModLookUp = new Map();
const cooldownModChannels = new Map();


function format(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ModLookUp
function ModLookUp() {
    fetch("https://modlookup.3v.fi/api/user-totals/lsco").then(response => response.json()).then(data => {
        modlookup.innerHTML =
            `
            <div class="modlookup main">
                <table>
                <tr>
                    <td>Follow total: <a>${format(data.follows)}</a></td>
                    <td>Views total: <a>${format(data.views)}</a></td>
                </tr>
                <tr>
                    <td>Channels: <a>${format(data.total)}</a></td>
                    <td>Partners: <a>${format(data.partners)}</a></td>
                </tr>
                </table>
            </div>
            `;
    }).catch(e => {
        console.error(e);
        modlookup.innerHTML =
            `
        <div class="modlookup">
            <text>Could not load modlookup</text>
            <br>
            <text>(${e.message})</text>
        </div>
        `;
    });
}

function reLoadModLookUp() {

    if (cooldownModLookUp.has("delay")) return;
    cooldownModLookUp.set("delay", Date.now() + 5000);
    setTimeout(() => {
        cooldownModLookUp.delete("delay");
    }, 5000);
    refresh_icon_ml.style = 'transform: rotate(360deg); transition: transform 1s;';
    setTimeout(() => {
        refresh_icon_ml.style = "";
    }, 1000);

    modlookup.style = "filter: blur(3px);";
    fetch("https://modlookup.3v.fi/api/user-totals/lsco").then(response => response.json()).then(data => {
        modlookup.innerHTML =
            `
            <div class="modlookup main">
                <table>
                <tr>
                    <td>Follow total: <a>${format(data.follows)}</a></td>
                    <td>Views total: <a>${format(data.views)}</a></td>
                </tr>
                <tr>
                    <td>Channels: <a>${format(data.total)}</a></td>
                    <td>Partners: <a>${format(data.partners)}</a></td>
                </tr>
                </table>
            </div>
            `;
        modlookup.style = "";
    }).catch(e => {
        console.error(e);
        modlookup.innerHTML =
            `
        <div class="modlookup">
            <text>Could not load modlookup</text>
            <br>
            <text>(${e.message})</text>
        </div>
        `;
    });
}

// ModChannels
function ModChannels() {
    fetch("https://modlookup.3v.fi/api/user-v3/lsco").then(response => response.json()).then(data => {
        let channels = data.channels.map(res => res);
        let channelsList = "?login=lsco";
        for (const channel of channels) {
            if (channel.followers > 5000) {
                channelsList += `%2C${channel.name}`;
            }
        }
        fetch(`https://api.ivr.fi/v2/twitch/user${channelsList}`).then(response => response.json()).then(request => {
            let data = request.sort((x, y) => Number(y.followers) - Number(x.followers));
            for (const channel of data) {
                if (channel.login && channel.login !== "lsco") {
                    let islive = "";
                    let badges = "";
                    if (channel.stream) {
                        islive =
                            `
                            <br><br>
                            <a class="game" href="https://www.twitch.tv/directory/game/${encodeURI(channel.stream.game.displayName)}/" target="_blank" rel="noopener noreferrer">
                            ${channel.stream.game.displayName}
                            </a>
                            <text>~</text>
                            <text style="color: ${channel.chatColor ? channel.chatColor : "#123456"};">
                            ${format(channel.stream.viewersCount)}
                            </text>
                            <text>~</text>
                            <text>
                            ${channel.stream.title}
                            </text>
                        `;
                    }
                    if (channel.roles.isPartner) {
                        badges +=
                            `
                            <img class="badge" src="https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3">
                        `
                    }
                    modChannels.innerHTML +=
                        `
                        <div class="line">
                            <img class="logo" src="${channel.logo}">
                            ${badges}
                            <a style="color: ${channel.chatColor ? channel.chatColor : "#123456"};" href="https://www.twitch.tv/${encodeURIComponent(channel.login)}/" target="_blank" rel="noopener noreferrer">
                            ${channel.displayName ? channel.displayName : channel.login}
                            </a>
                            <i class="followers"> ~${format(channel.followers)}</i>
                            ${islive}
                        </div>
                    `;
                }
            }
        }).catch(e => {
            console.error(e);
        });
    });
}

function reLoadModChannels() {
    if (cooldownModChannels.has("delay")) return;
    cooldownModChannels.set("delay", Date.now() + 5000);
    setTimeout(() => {
        cooldownModChannels.delete("delay");
    }, 5000);
    refresh_icon_mc.style = 'transform: rotate(360deg); transition: transform 1s;';
    setTimeout(() => {
        refresh_icon_mc.style = "";
    }, 1000);

    modChannels.style = "filter: blur(3px);";
    fetch("https://modlookup.3v.fi/api/user-v3/lsco").then(response => response.json()).then(data => {
        modChannels.innerHTML = "";
        let channels = data.channels.map(res => res);
        let channelsList = "?login=lsco";
        for (const channel of channels) {
            if (channel.followers > 5000) {
                channelsList += `%2C${channel.name}`;
            }
        }
        fetch(`https://api.ivr.fi/v2/twitch/user${channelsList}`).then(response => response.json()).then(request => {
            let data = request.sort((x, y) => Number(y.followers) - Number(x.followers));
            for (const channel of data) {
                if (channel.login && channel.login !== "lsco") {
                    let islive = "";
                    let badges = "";
                    if (channel.stream) {
                        islive =
                            `
                            <br><br>
                            <a class="game" href="https://www.twitch.tv/directory/game/${encodeURI(channel.stream.game.displayName)}/" target="_blank" rel="noopener noreferrer">
                            ${channel.stream.game.displayName}
                            </a>
                            <text>~</text>
                            <text style="color: ${channel.chatColor ? channel.chatColor : "#123456"};">
                            ${format(channel.stream.viewersCount)}
                            </text>
                            <text>~</text>
                            <text>
                            ${channel.stream.title}
                            </text>
                        `;
                    }
                    if (channel.roles.isPartner) {
                        badges +=
                            `
                            <img class="badge" src="https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3">
                        `
                    }
                    modChannels.innerHTML +=
                        `
                        <div class="line">
                            <img class="logo" src="${channel.logo}">
                            ${badges}
                            <a style="color: ${channel.chatColor ? channel.chatColor : "#123456"};" href="https://www.twitch.tv/${encodeURIComponent(channel.login)}/" target="_blank" rel="noopener noreferrer">
                            ${channel.displayName ? channel.displayName : channel.login}
                            </a>
                            <i class="followers"> ~${format(channel.followers)}</i>
                            ${islive}
                        </div>
                    `;
                }
            }
        }).catch(e => {
            console.error(e);
        });
        modChannels.style = "";
    }).catch(e => {
        console.error(e);
    });
}