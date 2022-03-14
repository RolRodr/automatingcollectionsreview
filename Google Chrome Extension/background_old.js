// Initializes extension and sets badge to off 
let buttonOn = false;
chrome.action.setBadgeBackgroundColor({ color: 'red' });
chrome.action.setBadgeText({ text: "off" });

// need to inject css script only when the button is on &
// remove it when the button is set to off

// Object that contains classes specific to each database
const databases = {
    "Proquest": {
        "title": "truncatedResultsTitle",
        "author": "titleAuthorETC"
    }
};

//Turns extension on/off
chrome.action.onClicked.addListener((tab) => {

    // turns on extension 
    if (buttonOn == false) {
        buttonOn = true;
        chrome.action.setBadgeBackgroundColor({ color: 'green' });
        chrome.action.setBadgeText({ text: "on" });
        console.log("extension is on.");
        mainfunc;
    }

    // shuts off extension and opens page with the saved information 
    else if (buttonOn == true) {
        buttonOn = false;
        chrome.action.setBadgeBackgroundColor({ color: 'red' });
        chrome.action.setBadgeText({ text: "off" });
        console.log("extension is off.")
    }
})

// Parses DOM and returns only div elements -- this is just a test function
function getDOM() {
    let domAr = Array.from(
        document.querySelectorAll('.truncatedResultsTitle, .titleAuthorETC'),
        el => {
            return el.textContent

        }
    );
    return domAr
};

// Organizes initialy extracted array to a 2-d array of work titles+authors
// // Only adapted for Proquest Lit
async function organizeArr(arr) {
    let newAr = []
    for (let i = 0; i < arr.length; i++) {
        if (i % 2 == 0) {
            newAr.push([arr[i], arr[i + 1]])
        }
    }
    return newAr
};


// creates in-browser buttons 
function createBlocks() {

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

    // Creates in-block table 
    let exTable = newDiv.appendChild(document.createElement("table"));
    exTable.setAttribute("id", "extTable");

    let firstRow = exTable.appendChild(document.createElement("tr"));
    firstRow.appendChild(document.createElement("th")).textContent = "Title";
    firstRow.appendChild(document.createElement("th")).textContent = "Author";

    // Creates save-as-csv button below the list 
    newDiv.appendChild(document.createElement("button")).setAttribute("id", "saveButton")
    document.getElementById("saveButton").innerHTML = "Save as CSV";

    // Sends message that th elist was successfully created
    console.log('Blocks are created');
};

// Function that Updates the list whenever new information is extracted
// For each item, it creates a new row in the table with the work title in the first cell and the author in the next
async function updateBlock(arr) {
    arr.forEach((work, i) => {
        let table = document.getElementById('extTable');
        let row = document.createElement("tr");
        row.appendChild(document.createElement("td")).textContent = work[0];
        row.appendChild(document.createElement("td")).textContent = work[1];
        table.appendChild(row);
    });
}

// Automatically creates blocks if the extension button is turned on 
if (buttonOn == true) {
    let actTab = chrome.tabs.query({ active: true, currentWindow: true })
        .catch(console.error)

    chrome.scripting.executeScript({
        target: { tabId: actTab.id },
        func: createBlocks
    }).catch(console.error)
};


// loading event listeners --- this is where the most work needs to be done
async function loadListeners() {

    console.log("listeners are being loaded...")

    // Show list of information
    document.getElementById("listInfo").addEventListener("click", () => {

        const listBlock = document.getElementById("listBlock")

        if (listBlock.style.display == "none") {
            listBlock.style.display = "block";
            listBlock.style.right = "65px";
        } else {
            listBlock.style.display = "none";
            listBlock.style.right = -300;
        }
    })

    // Get information
    let workArr = document.getElementById("getInfo").addEventListener("click", () => {

        let domAr = Array.from(
            document.querySelectorAll('.truncatedResultsTitle, .titleAuthorETC'),
            el => {
                return el.textContent

            }
        );

        let newAr = []
        for (let i = 0; i < domAr.length; i++) {
            if (i % 2 == 0) {
                newAr.push([domAr[i], domAr[i + 1]])
            }
        }


        newAr.forEach((work, i) => {
            let table = document.getElementById('extTable');
            let row = document.createElement("tr");
            row.appendChild(document.createElement("td")).textContent = work[0];
            row.appendChild(document.createElement("td")).textContent = work[1];
            table.appendChild(row);
        });

        return newAr
    });

    return workArr

}

// calls function when event fires
chrome.tabs.onUpdated.addListener(onTabUpdated);

// main function
let onTabUpdated = async(tabId, info, tab) => {

    if (info.status == 'complete' &&
        buttonOn == true) {

        console.log("The page is " + changeInfo.status)

        // if (buttonOn == true) {
        //     let actTab = await chrome.tabs.query({
        //         active: true,
        //         currentWindow: true,
        //         status: "complete"
        //     }).catch(console.log(console.error()));
        //     if (!actTab) {
        //         console.log("Could not get URL. Turn extension off and on again.");
        //     } else {
        //         console.log("Tab information recieved.")
        //     };

        // console.log(actTab);

        let blocksF = await chrome.scripting.executeScript({
                target: { tabId: id },
                func: createBlocks
            })
            .catch(console.error)
        if (!blocksF) {
            console.log("Something went wrong.")
        } else {
            console.log("Buttons have been created.")
        };

        /*
        Adds listeners and should return value of the works array if the user chose to get the information
        */
        let listenersF = await chrome.scripting.executeScript({
                target: { tabId: id },
                func: loadListeners
            })
            .catch(console.error)
        if (!listenersF) {
            console.log("Listeners failed to load.")
        } else {
            console.log("Listeners loaded successfully.")
        };
        console.log(listenersF)

    };


};




// Controls download to CSV button 
//document.getElementById("blockButton").addEventListener("click", (arr) => {

// CSV export code  Credit: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
//   let csvContent = "data:text/csv;charset=utf-8," + arr.map((e, i) => { i % 2 == 0 ? e.join(",") : e.join("\n") });

//})





// -------------- Manifest stuff

//     "content_scripts": [{
//         "matches": ["<all_urls>"],
//         "css": ["display.css"],
//         "run_at": "document_start"
//     }],
//     "web_accessible_resources": [{
//         "resources": ["script.js"],
//         "matches": ["<all_urls>"]
//     }]