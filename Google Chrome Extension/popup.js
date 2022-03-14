const saveInfo = document.getElementById("saveInfo");
const openPage = document.getElementById("openPage");


saveInfo.addEventListener("click", () => {
    chrome.runtime.sendMessage(pageDOM, (response) => {
        console.log(response);
    })
})




// Opens new tab to see the saved results
openPage.addEventListener("click", () => {
    chrome.tabs.create({ url: "display.html" });
});