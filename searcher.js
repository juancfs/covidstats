let loadISO2File = new Promise((resolve, reject) => {
    fetch('/JSON/countriesIsoAlpha2.json')
    .then(response => response.json())
    .then(ISO2JSON => resolve(ISO2JSON));
});

let loadISO3File = new Promise((resolve, reject) => {
    fetch('/JSON/countriesIsoAlpha3.json')
    .then(response => response.json())
    .then(ISO3JSON => resolve(ISO3JSON));
});

let loadCovidFile = new Promise((resolve, reject) => {
    fetch('https://covid.ourworldindata.org/data/owid-covid-data.json')
    .then(response => response.json())
    .then(covidJSON => resolve(covidJSON));
});

let JSONFiles;

// Executes this once JSON files are loaded
Promise.all([loadISO2File, loadISO3File, loadCovidFile]).then(files => {
    JSONFiles = files;
    document.querySelector(".loading-box").style.display = "none";
    document.querySelector(".shadow").style.display = "none";

    document.querySelector(".search-field").focus();

    // Sets max date and default date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const defaultDate = yesterday.getFullYear()+'-'+("0"+(yesterday.getMonth() + 1)).slice(-2)+'-'+
    ("0"+yesterday.getDate()).slice(-2);
    document.querySelector("#date-field").setAttribute("max", defaultDate);
    document.querySelector("#date-field").value = defaultDate;

    document.querySelector(".search-btn").addEventListener("click", (() => {
        checkInput();
    }));

    document.querySelector(".close-btn").addEventListener("click", () => {
        document.querySelector(".shadow").style.display = "none";
        document.querySelector(".close-btn").style.display = "none";
        document.querySelector(".results").style.display = "none";
    });
});

// -------- Functions definitions --------

// Checks whether or not input is valid
function checkInput() {
    let country = document.querySelector(".search-field").value;
    country = country.toLowerCase();
    countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);
    if (JSONFiles[1][country] !== undefined) {
        document.querySelector(".input-error").style.display = "none";
        document.querySelector(".loading-box").style.display = "inline-block";
        document.querySelector(".shadow").style.display = "inline-block";
        const countryIso2 = JSONFiles[0][country];
        const countryIso3 = JSONFiles[1][country];
        checkExistence(countryIso2, countryIso3);
    } else {
        document.querySelector(".input-error").innerHTML = `Oops! It seems that something went wrong.<br>
        Make sure you are writing the country's name properly.`;
        document.querySelector(".input-error").style.display = "inline-block";
    }
}

// Checks if data is available for the provided date
function checkExistence(countryIso2, countryIso3) {
    const askedDate = document.querySelector("#date-field").value;
    let covidDataContainer = JSONFiles[2][countryIso3]["data"];
    let dataKey;
    let dataExists = false;
 
    for (let i = 0; i < covidDataContainer.length; i++) {
        if (covidDataContainer[i]["date"] === askedDate) {
            dataKey = covidDataContainer[i];
            dataExists = true;
            break;
        }
    }
    if (dataExists) {
        generateResults(countryIso2, countryIso3, dataKey);   
    } else {
        document.querySelector(".loading-box").style.display = "none";
        document.querySelector(".shadow").style.display = "none";
        document.querySelector(".input-error").innerHTML = "There's no available data for " + countryCapitalized + " on the required date. <br> Try by entering another date.";
        document.querySelector(".input-error").style.display = "inline-block";
    }
}

// Builds the results section.
function generateResults(countryIso2, countryIso3, dataKey) {
    // ISO code Alpha 2 is used for fetching the flagLoad. ISO code alpha 3 for fetching country's covid data
        
    document.querySelector(".country-covid-th").innerText = countryCapitalized + "'s COVID-19 data updated to " + dataKey["date"];

    for (let cell of document.querySelectorAll(".table-content.covid > td")) {
        if (dataKey[cell.className.replaceAll("-", "_")] === undefined) { // Each element's class's used to fetch the data
            cell.innerText = "N/A"; // For not available data
        } else {
            cell.innerText = dataKey[cell.className.replaceAll("-", "_")];
            }
    }

        // Fills data in for overall country's data
    document.querySelector(".flag").setAttribute("src", "https://flagcdn.com/" + countryIso2.toLowerCase() + ".svg"); // Flag
    document.querySelector(".flag").setAttribute("alt", countryCapitalized + "'s flag")

    document.querySelector(".country-heading").innerText = countryCapitalized + "'s COVID-19 profile";
    document.querySelector(".country-overall-th").innerText = countryCapitalized + "'s overall data";

    for (let cell of document.querySelectorAll(".table-content.overall > td")) { 
        if (JSONFiles[2][countryIso3][cell.className.replaceAll("-", "_")] === undefined) {
            cell.innerText = "N/A";
        } else {
                cell.innerText = JSONFiles[2][countryIso3][cell.className.replaceAll("-", "_")];
        }
    }

    document.querySelector(".iso-code").innerText = countryIso3; // Ads ISO alpha3 code of the country to the table

    let flagLoad = new Promise((resolve) => { // Prevents table from showing before image loads
        document.querySelector(".flag").addEventListener("load", () => {
            resolve()
        });
    });

    flagLoad.then(() => {
        document.querySelector(".loading-box").style.display = "none";
        document.querySelector(".shadow").style.display = "none";
        showResults();
    });

    }

function showResults() {
    document.querySelector(".shadow").style.display = "inline-block";
    document.querySelector(".close-btn").style.display = "inline-block";
    document.querySelector(".results").style.display = "inline-block";
}