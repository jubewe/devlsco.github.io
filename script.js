// Thanks to @Jubewe for some help, ideas and tipps! (https://github.com/jubewe/)

const follows = document.getElementById("follows");
const views = document.getElementById("views");
const total = document.getElementById("total");
const partners = document.getElementById("partners");
const modlookup = document.getElementById("modlookup");
const modchannels = document.getElementById("modchannels");
const offcolor = "#6e4c4c";
const oncolor = "green";
let modchannels_switch = false;

window.onload = loadmodlookup(),loadmodchannels();

function format(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function loadmodlookup(){
    modlookup.innerHTML = `
        <div class="modlookup">
            <center><progress></progress></center>
        </div>
    `
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
};

function loadmodchannels(){
    modchannels.innerHTML = `
        <div class="modchannels">
            <center><progress></progress></center>
        </div>
    `;
    fetch("https://modlookup.3v.fi/api/user-v3/lsco").then(response => response.json()).then(data => {
        let channels = data.channels.map(res => res);
        let channelsList = "?login=lsco";
        for (const channel of channels) {
            let modchannels_opt = (modchannels_switch ? (channel.followers > 10000) : (channel.followers > 1))
            if (modchannels_opt) {
                channelsList += `%2C${channel.name}`;
            }
        }
        fetch(`https://api.ivr.fi/v2/twitch/user${channelsList}`).then(response => response.json()).then(request => {
            let statchannels = "";
            let data = request.sort((x, y) => Number(y.followers) - Number(x.followers));
            for (const channel of data) {
                if (channel.login && channel.login !== "lsco") {
                    let islive = undefined;
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

                    if(islive){
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
                            ${(islive ? `<div>${islive}</div>` : ``)}
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
}

function switchshowhide(shsaction){
    window.scrollbars.visible = false;
    let cselem_container = document.getElementById("mc_toggle-container");
    let cselem_switch = document.getElementById("mc_toggle-switch");
    if(cselem_container.style.backgroundColor === oncolor || shsaction === true){
        modchannels_switch = false;
        cselem_container.style.backgroundColor = offcolor;
        cselem_switch.className = "mc_toggle-off";
        loadmodchannels();
        loadmodlookup();
    } else {
        modchannels_switch = true;
        cselem_container.style.backgroundColor = oncolor;
        cselem_switch.className = "mc_toggle-on";
        loadmodchannels();
        loadmodlookup();
    }
};

switchshowhide();