var inputAssertion = document.querySelector("#inputAssertion");
var bakeResult = document.querySelector(".bake__result");
var dropZone = document.querySelector(".unbake__dropzone");

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function showSweetAlert(title, type, message) {
    Swal.fire({
        title: title,
        text: message,
        type: type,
        confirmButtonText: 'Got it',
        confirmButtonClass: 'btn btn--primary',
        buttonsStyling: false
    });
}

/*
    Baking of a badge JSON into an image
*/
document.querySelector("#btnBake").addEventListener("click", function (e) {
    // grab the Badge Assertion JSON 
    if (IsJsonString(inputAssertion.value)) {
        var txtAssertion = JSON.parse(inputAssertion.value);

        axios.post('/api/bake', {
                badge: txtAssertion
            })
            .then(function (response) {
                if (response.data.status === "success") {
                    bakeResult.innerHTML = "";
                    var imgBadge = document.createElement("img");
                    imgBadge.setAttribute("src", "tempbadges/" + response.data.downloadUrl);
                    imgBadge.setAttribute("alt", "Download your badge");
                    imgBadge.setAttribute("class", "badge--baked");
                    bakeResult.appendChild(imgBadge);

                    Swal.fire({
                        title: "Right-click to download",
                        html: imgBadge,
                        confirmButtonText: 'Got it!',
                        confirmButtonClass: 'btn btn--primary',
                        buttonsStyling: false
                    });


                }
            })
            .catch(function (error) {
                var errorMessage = error.response.data.error;
                showSweetAlert("Oops", "error", errorMessage);
            });
    } else {
        showSweetAlert("Invalid badge", "error", "The badge JSON you entered is not a valid JSON string.");
    }
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
            if (res.data.status === "success") {
                Swal.fire({
                    type: "success",
                    html: `
                        <div class="unbake__result">
                        <h3 class="unbake__result__title">This badge looks legit!</h3>
                        <pre class="unbake__result__assertion">${res.data.assertion}</pre>
                        </div>
                    `,
                    confirmButtonText: 'Got it!',
                    confirmButtonClass: 'btn btn--primary',
                    buttonsStyling: false
                });
            }
        }).catch(function (error) {
            var errorMessage = error.response.data.error;
            showSweetAlert("Oops", "error", errorMessage);
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