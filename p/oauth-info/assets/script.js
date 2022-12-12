const button = document.getElementById("button");

async function validierung() {
    const token = document.getElementById("oauth-token").value.replace(/oauth[:]/i, "");
    const response = document.getElementById("response");

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
            return response.innerHTML = `<div class="text">Login: ${result.login} (ID: ${result.user_id})<br><br>Token: <div class="token">${token}</div><br><br>Scopes: ${result.scopes.join(", ")}<br><br>Client ID: ${result.client_id}</div>`;
        }).catch(error => {
            return response.innerHTML = `<div class="text"><img src="https://cdn.7tv.app/emote/63071bb9464de28875c52531/1x" alt="FeelsDankMan" width="30">Error: ${error.message}</div>`;
        });
}

button.addEventListener("click", validierung);