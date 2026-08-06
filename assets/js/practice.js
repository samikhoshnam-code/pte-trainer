const params = new URLSearchParams(window.location.search);

const module =
params.get("module");

document.getElementById("module-title")
.innerText = module;
