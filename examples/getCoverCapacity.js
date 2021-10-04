const fetch = require('node-fetch');
require('custom-env').env();

const requestOptions = {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY
    },
};

const coverCapacityEndpoint = `${process.env.API_ENDPOINT}/covers/capacity/${process.env.QUOTE_CONTRACT_ADDRESS}`;

const main = async () => {
    try {
        console.log("Request options: ", requestOptions);
        console.log("Cover capacity endpoint: ", coverCapacityEndpoint);
        var coverCapacityResponse = await fetch(coverCapacityEndpoint, requestOptions);
        var coverCapacityAsText = await coverCapacityResponse.text();
        var coverCapacity = JSON.parse(coverCapacityAsText);

        console.log("Cover capacity: ", coverCapacity);

        return coverCapacity;
    } catch (e) {
        console.log("The following error occured:", e);
    }
}

main();