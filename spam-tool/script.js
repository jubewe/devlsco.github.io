const cooldown = new Map();

document.getElementById("button").addEventListener("click", run);

const url = "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=oja440lzo9ek9ogxnymgtoq3j4m4yq&redirect_uri=https://devlsco.github.io/spam-tool&scope=chat:read+chat:edit+channel:moderate";

if (window.location.hash.includes("#access_token")) {
    (async () => {
        await fetch("https://id.twitch.tv/oauth2/validate", {
            headers: {
                "Authorization": `Bearer ${window.location.hash.split("#access_token=")[1].split("&")[0]}`
            }
        }).then(response => response.json()).then(async (data) => {
            await setCookie("token", window.location.hash.split("#access_token=")[1].split("&")[0], 365);
            await setCookie("login", data.login, 365);
            await setCookie("clientid", data.client_id, 365).then(async () => {
                const url = document.baseURI.split("#access_token=");
                await window.location.replace(url[0]);
            })
        })
    })();
}

if (!readCokie("token") || !readCokie("clientid") || !readCokie("login")) response(`Click on <a href="${url}">Login</a> to request a Token`);

function response(message) {
    const res = document.getElementById("response");
    return res.innerHTML = message;
}

function readCokie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
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

async function run() {
    const channel = document.getElementById("channel").value;
    const message = document.getElementById("message").value;
    const number = document.getElementById("number").value;

    if (await !readCokie("token") || await !readCokie("clientid") || await !readCokie("login")) return;

    if (cooldown.has("lol")) return;
    cooldown.set("lol", Date.now());
    setTimeout(async () => {
        await cooldown.delete("lol");
    }, 2500);

    (async () => {
        await fetch("https://id.twitch.tv/oauth2/validate", {
            headers: {
                "Authorization": `Bearer ${await readCokie("token")}`
            }
        }).then(response => response.json()).then(async (data) => {

            if (data.status !== undefined) return await response(`Error: ${data.message} - Status: ${data.status} - [ Click on <a href="${url}">Login</a> to request a new Token ]`);

            const channelRegEx = new RegExp("^\\w{1,25}$", "");
            if (!channelRegEx.test(String(channel))) {
                return await response(`[ Error: Channel must match pattern "${channelRegEx}". ]`);
            }
            const messageRegEx = new RegExp("^.{1,450}$", "");
            if (!messageRegEx.test(String(message))) {
                return await response(`[ Error: Message must match pattern "${messageRegEx}". ]`);
            }
            const numberRegEx = new RegExp("^[0-9]+$", "");
            if (!numberRegEx.test(Number(number))) {
                return await response(`[ Error: Number must match pattern "${numberRegEx}". ]`);
            }
            if (Number(number > 25)) {
                return await response(`[ Error: Number maximum. 25 ]`);
            }

            await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
                headers: {
                    "Authorization": `Bearer ${readCokie("token")}`,
                    "Client-Id": `${readCokie("clientid")}`
                }
            }).then(res => res.json()).then(async ({ data }) => {

                if (data.status !== undefined) return response(`Channel was not found `);

                new WebSocket("wss://irc-ws.chat.twitch.tv/").onopen = async function () {
                    await this.send(`PASS oauth:${readCokie("token")}`);
                    await this.send(`NICK ${readCokie("login")}`);
                    (async () => {
                        for (d = 0; d < Number(number); d++) {
                            await this.send(`PRIVMSG #${channel} :${message}`);
                        }
                    })();

                    setTimeout(() => {
                        this.close();
                    }, 30000);
                }

                return response(`Successfully sent ${Number(number.replace(/</g, "&#60;").replace(/>/g, "&#62;"))} messages in ${String(channel.replace(/</g, "&#60;").replace(/>/g, "&#62;"))} | Message: ${message.replace(/</g, "&#60;").replace(/>/g, "&#62;")}`);

            }).catch(error => {
                console.log(error);
                return response(`Error: ${error.message}`)
            });
        })
    })();
}