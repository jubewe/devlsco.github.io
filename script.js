// Thanks to @Jubewe for some help, ideas and tipps! (https://github.com/jubewe/)

const follows = document.getElementById("follows");
const views = document.getElementById("views");
const total = document.getElementById("total");
const partners = document.getElementById("partners");
const modlookup = document.getElementById("modlookup");
const modChannels = document.getElementById("modChannels");

function format(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

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
});

fetch("https://modlookup.3v.fi/api/user-v3/lsco").then(response => response.json()).then(data => {
    let channels = data.channels.map(res => res);
    let channelsList = "?login=lsco";
    for (const channel of channels) {
        if (channel.followers > 10000) {
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
                        <i>~</i>
                        <i style="color: ${channel.chatColor ? channel.chatColor : "#123456"};">
                        ${format(channel.stream.viewersCount)}
                        </i>
                        <i>~</i>
                        <i>
                        ${channel.stream.title}
                        </i>
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
    })
});