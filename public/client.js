const fileInput = document.querySelector("#file-input");
const fileNameText = document.querySelector("#file-name-text");
const effectSelect = document.querySelector("#effect-select");

const errorBlock = document.querySelector(".error-block");
const errorText = document.querySelector("#error-text");

const BASE_URL = "http://localhost:3000/api";

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

function showFileName() {
    const file = fileInput.files[0];

    fileNameText.textContent = file.name;
}

function showError(error) {
    errorBlock.classList.add("error-block-visible");
    errorText.textContent = error;
    setTimeout(() => {
        errorBlock.classList.remove("error-block-visible");
    }, 3000);
}

async function sendFile() {
    const { files } = fileInput;

    if (files.length > 0) {
        const inputFile = files[0];

        const fileName = `output-${inputFile.name}`;

        const payload = new FormData();
        payload.append("effect", effectSelect.value);
        payload.append("audio", inputFile);

        const res = await fetch(BASE_URL + "/form", {
            method: "POST",
            body: payload,
        });

        const blob = await res.blob();

        if (blob != null && res.status == 200) {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            showError("An Error Has Occurred!");
        }
    } else {
        showError("Add File!");
    }
}

async function loadEffects() {
    const res = await fetch(BASE_URL + "/effects", {
        method: "GET",
    });

    const data = await res.json();

    effectSelect.innerHTML = "";
    for (let effect of data) {
        effectSelect.innerHTML += `<option class="effect-option" value="${effect}">${capitalize(effect)}</option>`;
    }
}

loadEffects();
