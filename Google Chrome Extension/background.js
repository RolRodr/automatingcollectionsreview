let buttonOn = false;
chrome.action.setBadgeBackgroundColor({ color: 'red' });
chrome.action.setBadgeText({ text: "off" });

const databases = {
    "Proquest": {
        "title": "truncatedResultsTitle",
        "author": "titleAuthorETC"
    }
};


async function onTabUpdated(tabId, info, tab) {

    console.log(info.status);
    if (info.status === 'complete' &&
        await exec(tabId, createBlocks)) {

        await exec(tabId, loadShowListener);
        // adds listeners and returns results when the user
        // clicks on the 'extract information' button
        const [{ result }] = await exec(tabId, loadGetListener);
        console.log(result);

        await exec(tabId, updateBlock, result);

        await exec(tabId, downloadCSV, result);

        // saving information to Chrome storage
        chrome.storage.sync.get(['dbSheet'], (res) => {
            // if there's previous information, new info gets appended
            if (res != null && result != undefined) {
                res.push(...result)
            }
            // updates storage
            chrome.storage.sync.set({
                "dbSheet": res
            }, () => {
                console.log(`Result information has been stored under storage key.`)
            })

        })
    };
};

function loadShowListener() {
    document.getElementById("listInfo").addEventListener("click", () => {

        const listBlock = document.getElementById("listBlock")

        if (listBlock.style.display == "none") {
            listBlock.style.display = "block";
            listBlock.style.right = "15px";
        } else {
            listBlock.style.display = "none";
            listBlock.style.right = -200;
        }
    });

}

function exec(tabId, funct, arg = 0) {
    return chrome.scripting.executeScript({
        target: { tabId },
        func: funct,
        args: [arg]
    }).catch(console.error);
};

function updateBlock(arr) {
    let table = document.getElementById('extTable');
    arr.map(res => {
        let row = document.createElement("tr");
        row.appendChild(document.createElement("td")).textContent = res[0];
        row.appendChild(document.createElement("td")).textContent = res[1];
        table.appendChild(row);
    })
};



function loadGetListener() {
    console.log("loading extract listener...")

    let promResults = new Promise(resolve => {
        document.getElementById('getInfo')
            .addEventListener('click', () => {
                    console.log("getting information");
                    const result = Array.from(
                        document.querySelectorAll('.truncatedResultsTitle, .titleAuthorETC'),
                        el => el.textContent)

                    let organizedResult = []
                    for (let i = 0; i < result.length; i++) {
                        if (i % 2 == 0) {
                            organizedResult.push([result[i].trim(), result[i + 1].trim()])
                        }
                    }

                    resolve(organizedResult)
                }

            );
    });

    return promResults
}



function createBlocks() {

    console.log("test")
        // First button that extracts html information if pressed 
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(document.createElement("button")).setAttribute("id", "getInfo");
    document.getElementById("getInfo").textContent = "Extract";

    // Second button that shows list of works if pressed 
    body.appendChild(document.createElement("button")).setAttribute("id", "listInfo");
    document.getElementById("listInfo").textContent = "Show List";

    // Creation of list block
    let newDiv = body.appendChild(document.createElement("div"));
    newDiv.setAttribute("id", "listBlock");

    // Creates table within block element
    let exTable = newDiv.appendChild(document.createElement("table"));
    exTable.setAttribute("id", "extTable");

    // Creates header for table
    let firstRow = exTable.appendChild(document.createElement("tr"));
    firstRow.appendChild(document.createElement("th")).textContent = "Title";
    firstRow.appendChild(document.createElement("th")).textContent = "Author";

    // Creates save-as-csv button below the list 
    newDiv.appendChild(document.createElement("a")).setAttribute("id", "buttonLink")
    document.getElementById("buttonLink").appendChild(document.createElement("button")).setAttribute("id", "saveButton")
    document.getElementById("saveButton").innerHTML = "Save as CSV";

    // Sends message that the list was successfully created
    console.log('Blocks are created');
    return true
};

function downloadCSV(arr) {

    let csvContent = "data:text/csv;charset=utf-8," + arr.map(e => e.join(",")).join("\n");
    let encodedURI = encodeURI(csvContent)
    let link = document.getElementById("buttonLink")
    link.setAttribute("href", encodedURI)
    link.setAttribute("download", "list.csv");

}

// Main function
chrome.action.onClicked.addListener(async(tab) => {

    // turns on extension and begins extension functions
    if (buttonOn == false) {
        buttonOn = true;
        chrome.action.setBadgeBackgroundColor({ color: 'green' });
        chrome.action.setBadgeText({ text: "on" });
        console.log("extension is on.");

        // calls css-injector function upon event firing

        chrome.tabs.onUpdated.addListener(onTabUpdated);
        await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['display.css']
        }, () => {
            console.log("CSS has been injected.")
        })

    }

    // shuts off extension and opens page with the saved information 
    else if (buttonOn == true) {
        buttonOn = false;
        chrome.action.setBadgeBackgroundColor({ color: 'red' });
        chrome.action.setBadgeText({ text: "off" });

        //disables injected css
        chrome.scripting.unregisterContentScripts(() => {
            console.log("Injected CSS scripts have been removed.")
        })
        console.log("The extension is no longer running.")
    }
})