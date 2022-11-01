const channel = document.getElementById("channel");
const size = document.getElementById("size");
const text = document.getElementById("text");

const cooldown = new Map();

function response(text) {
    const response_ = document.getElementById("response");
    if (!text) return `Error: Function response is " ${text} "`;
    return response_.innerHTML = text;
}

if (window.location.hash.includes("#access_token=")) {
    fetch(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
            "Authorization": `Bearer ${window.location.hash.split("#access_token=")[1].split("&")[0]}`,
        }
    }).then(response => response.json()).then(async (data) => {
        await setCookie("token", window.location.hash.split("#access_token=")[1].split("&")[0]);
        await setCookie("login", data.login);
        await setCookie("clientid", data.client_id).then(() => {
            const url = document.baseURI.split("#access_token=")
            window.location.replace(url[0]);
        })
    })
}

async function readCokie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return await c.substring(nameEQ.length, c.length);
    }
    return await null;
}

async function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function send(version) {
    if (cooldown.has("")) return;
    cooldown.set("", Date.now());
    setTimeout(() => {
        cooldown.delete("");
    }, 5000);


    if (await readCokie("token") === null || await readCokie("login") === null || await readCokie("clientid") === null) {
        const url = "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=oja440lzo9ek9ogxnymgtoq3j4m4yq&redirect_uri=https://devlsco.github.io/pyramid-tool&scope=chat:read+chat:edit+channel:moderate";
        return await response(`Token or clientID not found. (Click on <a href="${url}">Login</a> to request a new Token)`);
    }

    const channelRegEx = new RegExp("^\\w{1,25}$", "");
    if (!channelRegEx.test(String(channel.value))) {
        return await response(`Error: Channel must match pattern "${channelRegEx}".`);
    }
    const textRegEx = new RegExp("^.{1,35}$", "");
    if (!textRegEx.test(String(text.value))) {
        return await response(`Error: Text must match pattern "${textRegEx}".`);
    }
    const sizeRegEx = new RegExp("^[0-9]+$", "");
    if (!sizeRegEx.test(Number(size.value))) {
        return await response(`Error: Size must match pattern "${sizeRegEx}".`);
    }
    if (Number(size.value > 25)) {
        return await response(`Error: Size maximum. 25`);
    }

    await fetch(`https://api.twitch.tv/helix/users?login=${channel.value}`, {
        headers: {
            "Authorization": `Bearer ${await readCokie("token")}`,
            "Client-Id": `${await readCokie("clientid")}`
        }
    }).then(res => res.json()).then(async ({ data }) => {
        if (data.status !== undefined) return response(`Channel was not found `);
        if (version === 1) {
            new WebSocket("wss://irc-ws.chat.twitch.tv/").onopen = async function () {
                await this.send(`PASS oauth:${await readCokie("token")}`);
                await this.send(`NICK ${await readCokie("login")}`);
                for (let i = 1; i <= size.value; i++) {
                    await this.send(`PRIVMSG #${channel.value} :${text.value.repeat(i)}`);
                    await sleep(100)
                }
        
                for (let i = (size.value - 1); i > 0; i--) {
                    await this.send(`PRIVMSG #${channel.value} :${text.value.repeat(i)}`);
                    await sleep(100)
                }
                setTimeout(() => {
                    this.close();
                }, 5000);
            }
        }
        return response(`Successfully sent ${Number(size.value)} messages in ${String(channel.value)}`);
    }).catch(error => {
        console.log(error);
        return response(`Error: ${error.message}`)
    });
}