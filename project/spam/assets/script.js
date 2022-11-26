const button = document.getElementById("button");

const url = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=oja440lzo9ek9ogxnymgtoq3j4m4yq&redirect_uri=${window.location}&scope=chat:read+chat:edit+channel:moderate`;

window.onload = async function () {
    if (new RegExp(/#access_token=\w+&/).test(window.location.hash)) {
        const token = window.location.hash.split("#access_token=")[1].split("&")[0];

        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'OAuth ' + token
            }
        };

        await fetch("https://id.twitch.tv/oauth2/validate", options)
            .then(res => res.json())
            .then(result => {
                if (result.status) return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${result.message} &#8658; [ <a href="${url}" target="_blank" rel="noopener noreferrer">Request a new Token</a> ]</div>`;

                new Promise(async (resolve) => {
                    await setCookie("access_login", String(result.login), 365);
                    await setCookie("access_token", window.location.hash.split("#access_token=")[1].split("&")[0], 365);
                    await setCookie("access_client_id", result.client_id, 365);
                    resolve("Successfully verified & -access saved!")
                }).then(async (value) => {
                    console.log(value);
                    return await window.location.replace(document.baseURI.split("#access_token=")[0]);
                });

            }).catch(error => {
                return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${error.message}</div>`;
            });
    } else {
        if (!(await readCokie("access_login") || await readCokie("access_token") || await readCokie("access_client_id"))) {
            document.querySelector('#button').disabled = true
            return response.innerHTML = `<div class="text"><img src="https://cdn.frankerfacez.com/emote/250522/1" alt="FeelsOkayMan" width="30"><a href="${url}" target="_blank" rel="noopener noreferrer">Login</a> </div>`;
        }
    }
};


async function send() {
    const channel = document.getElementById("channel").value;
    const number = document.getElementById("number").value;
    const text = document.getElementById("text").value;

    if (!(await readCokie("access_login") || await readCokie("access_token") || await readCokie("access_client_id"))) return response.innerHTML = `<div class="text"><img src="https://cdn.frankerfacez.com/emote/250522/1" alt="FeelsOkayMan" width="30"><a href="${url}" target="_blank" rel="noopener noreferrer">Please login</a> </div>`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': 'OAuth ' + await readCokie("access_token")
        }
    };

    await fetch("https://id.twitch.tv/oauth2/validate", options)
        .then(res => res.json())
        .then(async result => {
            if (result.status) return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${result.message}</div>`;

            const channelRegEx = new RegExp("^\\w{1,25}$", "");
            const numberRegEx = new RegExp("^[0-9]+$", "");
            const textRegEx = new RegExp("^.{1,450}$", "");

            if (!channelRegEx.test(String(channel))) return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: channel must match pattern "${channelRegEx}".</div>`;

            if (!numberRegEx.test(String(number))) return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: number must match pattern "${numberRegEx}".</div>`;
            if (Number(number > 25)) return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: number maximum. 25</div>`;

            if (!textRegEx.test(String(text))) return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: text must match pattern "${textRegEx}".</div>`;

            const options = {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${await readCokie("access_token")}`,
                    "Client-Id": `${await readCokie("access_client_id")}`
                }
            };

            await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, options)
                .then(res => res.json())
                .then(helix => {
                    if (helix === "[]") return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: channel not found</div>`;

                    new WebSocket("wss://irc-ws.chat.twitch.tv/").onopen = async function () {
                        await this.send(`PASS oauth:${await readCokie("access_token")}`);
                        await this.send(`NICK ${await readCokie("access_login")}`);
                        new Promise(async (resolve) => {
                            for (d = 0; d < Number(number); d++) {
                                await this.send(`PRIVMSG #${channel} :${text}`);
                            }
                            resolve(`<div class="text"><img src="https://cdn.frankerfacez.com/emote/250522/1" alt="FeelsOkayMan" width="30">Successfully sending ${Number(number.replace(/</g, "&#60;").replace(/>/g, "&#62;"))}. messages in ${String(channel.replace(/</g, "&#60;").replace(/>/g, "&#62;"))}!</div>`);
                        }).then(async (value) => {
                            this.close();
                            document.querySelector('#button').disabled = true
                            setTimeout(() => {
                                document.querySelector('#button').disabled = false
                            }, 5000);
                            return response.innerHTML = value;
                        });
                    }
                    
                }).catch(error => {
                    return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${error.message}</div>`;
                });
        }).catch(error => {
            return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${error.message}</div>`;
        });
}

async function readCokie(name) {
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

button.addEventListener("click", send);