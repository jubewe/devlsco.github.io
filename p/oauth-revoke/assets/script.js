const button = document.getElementById("button");
const response = document.getElementById("response");

async function revoking() {
    const token = document.getElementById("oauth-token").value.replace(/oauth[:]/i, "");

    let options = {
        method: 'GET',
        headers: {
            'Authorization': 'OAuth ' + token
        }
    };

    await fetch("https://id.twitch.tv/oauth2/validate", options)
        .then(res => res.json())
        .then(result => {
            if (result.status) return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${result.message}</div>`;
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "https://id.twitch.tv/oauth2/revoke");
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(`client_id=${result.client_id}&token=${token}`);
            xhr.addEventListener("load", () => {
                if(xhr.status !== 200) return response.innerText = `Error: ${JSON.parse(xhr.responseText).message}`;
                return response.innerHTML = `<div class="text"><img src="https://cdn.frankerfacez.com/emote/250522/1" alt="FeelsOkayMan" width="30">Token was successfully deleted!</div>`;
            });
        }).catch(error => {
            return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${error.message}</div>`;
        });
}

button.addEventListener("click", revoking);
