const fetch = require('node-fetch');
require('custom-env').env();

const quoteData = {
    email: process.env.QUOTE_EMAIL,
    coverAmount: process.env.QUOTE_COVER_AMOUNT,
    currency: process.env.QUOTE_CURRENCY,
    period: process.env.QUOTE_PERIOD,
    contractAddress: process.env.QUOTE_CONTRACT_ADDRESS
};

const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY
    },
    body: JSON.stringify(quoteData),
};

const quoteEndpoint = `${process.env.API_ENDPOINT}/quote`;

const main = async () => {
    try {
        console.log("Quote data: ", quoteData);
        console.log("Request options: ", requestOptions);
        console.log("API endpoint: ", quoteEndpoint);
        var quoteResponse = await fetch(quoteEndpoint, requestOptions);
        var quoteAsText = await quoteResponse.text();
        var quote = JSON.parse(quoteAsText);

        console.log("Quote: ", quote);

        return quote;
    } catch (e) {
        console.log("The following error occured:", e);
    }
}

main();