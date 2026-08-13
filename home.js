console.log("HOME JS LOADED");

function goToPractice(module) {
    console.log("Selected module:", module);
    window.location.href = "practice.html?module=" + module;
}