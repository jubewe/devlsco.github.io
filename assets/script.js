const channelName = "lsco";
const channelID = 617309984;
const minChannelFollowers = 20000;

const modlookup = document.getElementById("modlookup");
const channels = document.getElementById("channels");
const chat = document.getElementById("chat");

let map = new Map();

(async () => {
    const modlookupChannels = [];

    await fetch(`https://modlookup.3v.fi/api/user-totals/${channelName}`).then(res => res.json()).then(async fetch => {
        modlookup.innerHTML = `<tr><td>Follow total: <div class="number">${format(await fetch.follows)}</div></td><td>Views total: <div class="number">${format(await fetch.views)}</div></td></tr><tr><td>Channels: <div class="number">${format(await fetch.total)}</div></td><td>Partners: <div class="number">${format(await fetch.partners)}</div></td></tr>`;
    }).catch(error => {
        console.error(error);
    });

    await fetch(`https://modlookup.3v.fi/api/user-v3/${channelName}?limit=5000`).then(res => res.json()).then(async (data) => {
        return data.channels.map(res => res).forEach(i => {
            if (i.followers >= minChannelFollowers) {
                modlookupChannels.push(i.name);
            }
        });
    }).catch(e => console.error(e));

    await fetch(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(modlookupChannels.join(","))}`).then(res => res.json()).then(async (data) => {
        if (await data.error) return channels.innerText = `Error: ${await data.error.message}`;
        return channels.innerHTML = await data.sort((x, y) => Number(y.followers) - Number(x.followers)).map((data) => `<div class="line"><img style="border-radius: 25px;" src="${data.logo}" alt="Image"><a style="color: ${data.chatColor ? data.chatColor : "#1976D2"}; text-decoration: unset;" href="https://www.twitch.tv/${data.login}" target="_blank" rel="noopener noreferrer">${data.displayName ? data.displayName : data.login}</a><followers style="color: #009dff; font-style: italic; float: inline-end;">~${format(data.followers)}</followers>${data.stream ? `<table><tr><td><div><a class="game" href="https://www.twitch.tv/directory/game/${encodeURI(data.stream.game.displayName)}/" target="_blank" rel="noopener noreferrer">${data.stream.game.displayName}</a></div></td><td><div>${format(data.stream.viewersCount)}</div></td><td><div>${data.stream.title}</div></td></tr></table>` : ""}</div>`).join("");
    }).catch(e => console.error(e));

    function format(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

})();