const fetch = require('node-fetch');
require('custom-env').env();

const requestOptions = {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY
    },
};

const coversEndpoint = `${process.env.API_ENDPOINT}/covers`;

const main = async () => {
    try {
        console.log("Request options: ", requestOptions);
        console.log("Covers endpoint: ", coversEndpoint);
        var coversResponse = await fetch(coversEndpoint, requestOptions);
        var coversAsText = await coversResponse.text();
        var covers = JSON.parse(coversAsText);

        console.log("Covers: ", covers);

        return covers;
    } catch (e) {
        console.log("The following error occured:", e);
    }
}

main();