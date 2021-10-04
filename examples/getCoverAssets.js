const fetch = require('node-fetch');
const Web3 = require("web3");
require('custom-env').env();

const web3 = new Web3( new Web3.providers.HttpProvider(process.env.NODE_URL) );
const account = web3.eth.accounts.privateKeyToAccount(process.env.PURCHASER_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

const coversRequestOptions = {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY
    }
};

const getCoversEndpoint = `${process.env.API_ENDPOINT}/covers/`;

const main = async () => {
    try {
      console.log("API endpoint: ", `${getCoversEndpoint}cover-assets`);
      var coverAssetsResponse = await fetch(`${getCoversEndpoint}cover-assets`, coversRequestOptions);
      var coverAssetsAsText = await coverAssetsResponse.text();
      var coverAssets = JSON.parse(coverAssetsAsText);

      console.log("Cover Assets", coverAssets);

    } catch (e) {
        console.log("The following error occured:", e);
    }
}

main();