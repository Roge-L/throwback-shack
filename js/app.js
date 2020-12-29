$(document).foundation();
let earliestYear = 1946;
let currentAvailableYear = new Date().getFullYear() - 1;
let years = "";
initializeDropdown();
let selObj = document.getElementById("year");
let selValue = selObj.options[selObj.selectedIndex].value;
formSubmit();

/**
 * Make call to Wikipedia API and return Promise with string content
 * @param {Number} year The year chosen for observation
 * @return {Promise} The promise with the string content from Wikipedia API
 */
async function getTop10(year) {
    try {
        let APILocator = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=Billboard%20Year-End%20Hot%20100%20singles%20of%20" + year + "&formatversion=latest&rvprop=content&rvslots=*&origin=*"
        let response = await fetch(APILocator, {
        method: "GET"
    });
    let data = await response.json();
    let content = data.query.pages[0].revisions[0].slots.main.content;
    let top10 = content.substring(content.indexOf("|1 ||"), content.indexOf("\n|-\n|11 ||"));
    return top10;
    } catch (err) {
        console.log(err);
    }
    
}

/**
 * Update the currently displayed top 10 songs
 * @param {Object} formattedDictionary A formatted dictionary of the top 10 songs with key-value of ranking-array of song and artist
 */
function updateTop10(formattedDictionary) {
    for (i = 1; i <= 10; i++) {
        document.getElementById(`song${i}`).innerHTML = formattedDictionary[i][0];
        document.getElementById(`artist${i}`).innerHTML = formattedDictionary[i][1];
    }
}

/**
 * Populate the dropdown menu and default selected value to 2020
 */
function initializeDropdown() {
    years += "<option value=2019 selected>" + 2019 + "</option>";

    for(let year = currentAvailableYear; year >= earliestYear; year--){
      years += `<option value=\"${year}\">`+ year +"</option>";
    }
    document.getElementById("year").innerHTML = years;
}

/**
 * Update the currently selected year from dropdown menu
 */
function updateChoice() {
    selObj = document.getElementById("year");
    selValue = selObj.options[selObj.selectedIndex].value;
}

/**
 * Format the Wikipedia API's string of top 10 songs
 * @param {String} top10String Unformatted string of top 10 songs
 * @return {Object} A formatted dictionary of top 10 songs
 */
function formatTop10(top10String) {
    let top10List = top10String.split("\n");
    let top10Dict = {};

    if (top10List[0] == "") {
        return "Year Unavailable";
    }

    for (i = 0; i < top10List.length; i++) {
        top10List.splice(i + 1, 1);
    }

    for (i = 1; i <= 10; i++) {
        currentString = top10List[i - 1];
        let songTitlePos = [currentString.indexOf("[[") + 2, currentString.indexOf("]")];

        let songTitle = currentString.substring(songTitlePos[0], songTitlePos[1]);

        let songArtist;

        if (songTitle.includes("|")) {
            songTitle = songTitle.substring(songTitle.indexOf("|") + 1, songTitle.length);
        }

        if (currentString.includes("featuring")) {
            songArtist = currentString.substring(getPosition(currentString, "[[", 2) + 2, getPosition(currentString, "]]", 3));
            songArtist = songArtist.replace("[[", "");
            songArtist = songArtist.replace("]]", "");
        } else {
            songArtist = currentString.substring(getPosition(currentString, "[[", 2) + 2, getPosition(currentString, "]]", 2));
        }

        top10Dict[i] = [songTitle, songArtist];
    }

    return top10Dict;
}

/**
 * Return position of the n-th occurrence of a string
 * @param {String} string The string of which to manipulate
 * @param {String} subString The substring that we want to count occurrences for
 * @param {Number} index The number of occurrences to split at
 */
function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

/**
 * Listen and react to the main submit button
 */
function formSubmit() {
    document.getElementById("submit").addEventListener("click", changeYear());
}

/**
 * Update the top 10 songs based on the selected year
 */
function changeYear() {
    selValue = selObj.options[selObj.selectedIndex].value;
    getTop10(selValue).then(data => {
        let top10Dict = formatTop10(data);
        if (top10Dict == "Year Unavailable") {
            window.alert(top10Dict);
        }
        updateTop10(top10Dict);
    }).catch(err => console.log(err))
}