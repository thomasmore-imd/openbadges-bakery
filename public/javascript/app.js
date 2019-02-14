var inputAssertion = document.querySelector("#inputAssertion");
var bakeResult = document.querySelector(".bake__result");
var dropZone = document.querySelector(".unbake__dropzone");

/*
    Baking of a badge JSON into an image
*/
document.querySelector("#btnBake").addEventListener("click", function (e) {
    // grab the Badge Assertion JSON 
    var txtAssertion = JSON.parse(inputAssertion.value);

    axios.post('/api/bake', {
            badge: txtAssertion
        })
        .then(function (response) {
            if (response.data.status === "success") {
                bakeResult.innerHTML = ";;"
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


/*
    Unbaking / Validating an image by extracting the badge assertion
*/
dropZone.addEventListener("drop", function (e) {
    this.classList.remove("dragging");

    var file = e.dataTransfer.files[0];

    var formData = new FormData();
    formData.append('badge', file);

    axios.post('/api/unbake', formData)
        .then(function (res) {
            console.log(res);
        }).catch(function (e) {
            console.log(e);
        })

    e.preventDefault();
});

dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
});

dropZone.addEventListener("dragenter", function (e) {
    this.classList.toggle("dragging");
    e.preventDefault();
});

dropZone.addEventListener("dragleave", function (e) {
    this.classList.toggle("dragging");
    e.preventDefault();
});