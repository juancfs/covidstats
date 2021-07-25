let loadISO2File = new Promise((resolve, reject) => {
    $.getJSON("/JSON/countriesIsoAlpha2.json", (ISO2JSON) => {
        resolve(ISO2JSON);
})
    .fail(() => reject("Failed to load ISO2"));
});

let loadISO3File = new Promise((resolve, reject) => {
    $.getJSON("/JSON/countriesIsoAlpha3.json", (ISO3JSON) => {
        resolve(ISO3JSON);
})
    .fail(() => reject("Failed to load ISO3"));
});

let loadCovidFile = new Promise((resolve, reject) => {
    $.getJSON("https://covid.ourworldindata.org/data/owid-covid-data.json", (covidJSON) => {
        resolve(covidJSON);
})
    .fail(() => reject("Failed to load covid data"));
});

let JSONFiles;

// Executes this once JSON files are loaded
Promise.all([loadISO2File, loadISO3File, loadCovidFile]).then(files => {
    JSONFiles = files;
    $(".loading-box, .shadow").fadeOut();

    $(".search-field").focus();

    // Sets max date and default date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const defaultDate = yesterday.getFullYear()+'-'+("0"+(yesterday.getMonth() + 1)).slice(-2)+'-'+
    ("0"+yesterday.getDate()).slice(-2);
    $("#date-field").attr("max", defaultDate);
    $("#date-field").val(defaultDate);

    $(".search-btn").on("click", (() => {
        checkInput();
    }));

    $(".close-btn").on("click", () => {
        $(".shadow, .close-btn, .results").fadeOut();
    });
});

// -------- Functions definitions --------

// Function's objective: to check whether or not input is valid
function checkInput() {
    let country = $(".search-field").val();
    country = country.toLowerCase();
    countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);
    if (JSONFiles[1][country] !== undefined) {
        $(".input-error").hide();
        $(".loading-box, .shadow").fadeIn();
        const countryIso2 = JSONFiles[0][country];
        const countryIso3 = JSONFiles[1][country];
        checkExistence(countryIso2, countryIso3);
    } else {
        $(".input-error").html(`Oops! It seems that something went wrong.<br>
        Make sure you are writing the country's name properly.`);
        $(".input-error").css("display", "inline-block");
    }
}

// Function's objective: to check if data is available for the provided date
function checkExistence(countryIso2, countryIso3) {
    // 
    const askedDate = $("#date-field").val();
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
        $(".loading-box, .shadow").fadeOut();
        $(".input-error").html("There's no available data for " + countryCapitalized + " on the required date. <br> Try by entering another date.");
        $(".input-error").css("display", "inline-block");
    }
}

// Function's objective: to build the results section.
function generateResults(countryIso2, countryIso3, dataKey) {
    // ISO code Alpha 2 is used for fetching the flagLoad. ISO code alpha 3 for fetching country's covid data
        
    $(".country-covid-th").text(countryCapitalized + "'s COVID-19 data updated to " + dataKey["date"]);

    for (let cell of $(".table-content.covid > td")) {
        if (dataKey[$(cell).attr("class").replaceAll("-", "_")] === undefined) { // Each element's class's used to fetch the data
            $(cell).text("N/A"); // For not available data
        } else {
            $(cell).text(dataKey[$(cell).attr("class").replaceAll("-", "_")]);
            }
    }

        // Fills data in for overall country's data
    $(".flag").attr("src", "https://flagcdn.com/" + countryIso2.toLowerCase() + ".svg"); // Flag
    $(".flag").attr("alt", countryCapitalized + "'s flag")

    $(".country-heading").text(countryCapitalized + "'s COVID-19 profile");
    $(".country-overall-th").text(countryCapitalized + "'s overall data");

    for (let cell of $(".table-content.overall > td")) { 
        if (JSONFiles[2][countryIso3][$(cell).attr("class").replaceAll("-", "_")] === undefined) {
            $(cell).text("N/A");
        } else {
                $(cell).text(JSONFiles[2][countryIso3][$(cell).attr("class").replaceAll("-", "_")]);
        }
    }

    $(".iso-code").text(countryIso3); // Ads ISO alpha3 code of the country to the table

    let flagLoad = new Promise((resolve) => { // Prevents table from showing before image loads
        $(".flag").on("load", () => {
            resolve()
        });
    });

    flagLoad.then(() => {
        $(".loading-box, .shadow").fadeOut();
        showResults();
    });

    }

function showResults() {
    $(".shadow, .close-btn, .results").fadeIn();
}