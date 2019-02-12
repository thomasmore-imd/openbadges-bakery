var inputAssertion = document.querySelector("#inputAssertion");
var bakeResult = document.querySelector(".bake__result");

document.querySelector("#btnBake").addEventListener("click", function (e) {
    var txtAssertion = JSON.parse(inputAssertion.value);

    axios.post('/bake', {
            badge: txtAssertion
        })
        .then(function (response) {
            if (response.data.status === "success") {
                var imgBadge = document.createElement("img");
                imgBadge.setAttribute("src", "tempbadges/" + response.data.downloadUrl);
                imgBadge.setAttribute("alt", "Download your badge");
                bakeResult.appendChild(imgBadge);
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    e.preventDefault();
});