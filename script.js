// Thanks to @Jubewe for some help, ideas and tipps! (https://github.com/jubewe/)

const follows = document.getElementById("follows");
const views = document.getElementById("views");
const total = document.getElementById("total");
const partners = document.getElementById("partners");
const modlookup = document.getElementById("modlookup");
const modchannels = document.getElementById("modchannels");

function format(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

fetch("https://modlookup.3v.fi/api/user-totals/lsco").then(response => response.json()).then(data => {
    modlookup.innerHTML = 
    `
    <div class="modlookup">
        <center>
        <table style="text-align: left">
        <thead>
        </thead>
        <tbody>
        <tr>
            <td class="td">Channels:</td>
            <td><a>${format(data.total)}</a></td>
        </tr>
        <tr>
            <td class="td">Partners:</td>
            <td><a>${format(data.partners)}</a></td>
        </tr>
        <tr>
            <td class="td">Followers total:</td>
            <td><a>${format(data.follows)}</a></td>
        </tr>
        <tr>
            <td class="td">Views total:</td>
            <td><a>${format(data.views)}</a></td>
        </tr>
        </tbody>
        </table>
        </center>
    </div>
    `;
}).catch(e => {
    console.error(e);
    modlookup.innerHTML = 
    `
    <div class="modlookup">
        <center>
            <text>Could not load modlookup</text>
            <br>
            <text>(${e.message})</text>
        </center>
    </div>
    `;
});

fetch("https://modlookup.3v.fi/api/user-v3/lsco").then(response => response.json()).then(data => {
    let channels = data.channels.map(res => res);
    let channelsList = "?login=lsco";
    for (const channel of channels) {
        if (channel.followers > 1) {
            channelsList += `%2C${channel.name}`;
        }
    }
    fetch(`https://api.ivr.fi/v2/twitch/user${channelsList}`).then(response => response.json()).then(request => {
        let statchannels = "";
        let data = request.sort((x, y) => Number(y.followers) - Number(x.followers));
        for (const channel of data) {
            if (channel.login && channel.login !== "lsco") {
                let islive = "";
                let badges = "";
                if (channel.stream) {
                    islive = 
                    `
                        <br>
                        <div class="game">
                            <center>
                            <text>LIVE:</text>
                                <a href="https://www.twitch.tv/directory/game/${encodeURI(channel.stream.game.displayName).toString()}/" target="_blank" rel="noopener noreferrer">${channel.stream.game.displayName}</a>
                                <text>~</text>
                                <text style="color: ${channel.chatColor ? channel.chatColor : "#123456"};">
                                ${format(channel.stream.viewersCount)}
                                </text>
                                <br>
                                <text>
                                ${channel.stream.title}
                                </text>
                            </center>
                        </div>
                    `;
                }
                if (channel.roles.isPartner) {
                    badges +=
                    `
                        <img title="Partner" class="badge" src="https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3">
                    `
                }
                let bgcolor = undefined;

                if(islive !== ""){
                    bgcolor = "#6441a5";
                }
                // modchannels.innerHTML += 
                statchannels += 
                `
                    <div class="line_2" ${bgcolor ? `style="background-color: ${bgcolor}"` : ''}>
                        <table>
                            <tbody>
                                <tr>
                                    <td class="td_1">
                                        <div class="spacer_"></div>
                                        <a href=${channel.logo} target="_blank" rel="noopener noreferrer"><img class="logo" src="${channel.logo}"></a>
                                        <div class="spacer_"></div>
                                    </td>
                                    <td class="td_2">
                                        <center>
                                        <a style="color: ${channel.chatColor ? channel.chatColor : "#123456"};" href="https://www.twitch.tv/${encodeURIComponent(channel.login)}/" target="_blank" rel="noopener noreferrer">${channel.displayName ? channel.displayName : channel.login}</a>
                                        <div class="spacer_"></div>
                                        ${badges}
                                        ${(badges !== "" ? `<div class="spacer_"></div>` : ``)}
                                        </center>
                                    </td>
                                    <td class="td_3">
                                        <text style="float:right">~${format(channel.followers)}</text>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        ${(islive !== "" ? `<div>${islive}</div>` : ``)}
                    </div>
                `;
            }
        }

        modchannels.innerHTML = 
        `
            <div class="modchannels">
                <center>
                    ${statchannels}
                </center>
            </div>
        `;
    })
})
.catch(e => {
    console.error(e);
    modchannels.innerHTML = 
    `
        <div class="modchannels">
            <center>
                <text>Error: Could not load stats </text>
                <br>
                <text>(${e.message})</text>
            </center>
        </div>
    `;
});