
function response(text) {
    const response_ = document.getElementById("response");
    if (!text) return `Error: Function response is " ${text} "`;
    return response_.innerHTML = text;
}

async function send() {
    const token = document.getElementById("token").value.replace(/oauth[:]/gmi, "");
    await fetch(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    }).then(res => res.json()).then((data) => {
        if (data.status !== undefined) return response(`Error: ${data.message}`)
        let req = new XMLHttpRequest();
        req.open("post", "https://id.twitch.tv/oauth2/revoke");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(`client_id=${data.client_id}&token=${token}`);
        req.onload = async function () {
            return await response(`Token was successfully deleted`);
        }
    }).catch(error => {
        console.log(error);
        return response(`Error: ${error.message}`)
    });
}