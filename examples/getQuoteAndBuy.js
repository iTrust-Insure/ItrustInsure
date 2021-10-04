const fetch = require('node-fetch');
const Web3 = require("web3");
require('custom-env').env();

// quote-api signed quotes are cover type = 0; only one cover type is supported at this point.
const COVER_TYPE = 0;

const iTrustInsureAbi = require("./../abi/iTrustInsure.json");
const ierc20Abi = require("./../abi/IERC20.json");
const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const web3 = new Web3( new Web3.providers.HttpProvider(process.env.NODE_URL) );
const account = web3.eth.accounts.privateKeyToAccount(process.env.PURCHASER_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

const itrustContract = new web3.eth.Contract(
    iTrustInsureAbi,
    process.env.ITRUST_CONTRACT_ADDRESS
);

const quoteData = {
    email: process.env.QUOTE_EMAIL,
    coverAmount: process.env.QUOTE_COVER_AMOUNT,
    currency: process.env.QUOTE_CURRENCY,
    period: process.env.QUOTE_PERIOD,
    contractAddress: process.env.QUOTE_CONTRACT_ADDRESS
};

const quoteRequestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY
    },
    body: JSON.stringify(quoteData),
};

const coversRequestOptions = {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY
    }
};

const quoteEndpoint = `${process.env.API_ENDPOINT}/quote`;
const getCoversEndpoint = `${process.env.API_ENDPOINT}/covers/`;

const main = async () => {
    try {
        console.log("Quote data: ", quoteData);
        console.log("Request options: ", quoteRequestOptions);
        console.log("API endpoint: ", quoteEndpoint);

        var coverAssetsResponse = await fetch(`${getCoversEndpoint}cover-assets`, coversRequestOptions);
        var coverAssetsAsText = await coverAssetsResponse.text();
        var coverAssets = JSON.parse(coverAssetsAsText);

        console.log("Cover Assets", coverAssets);

        var coverAsset = coverAssets.filter(c => c.symbol == process.env.QUOTE_CURRENCY).length > 0 
                          ? coverAssets.filter(c => c.symbol == process.env.QUOTE_CURRENCY)[0] 
                          : null;

        if(coverAsset == null){
          console.log("Unable to find cover asset for currency", process.env.QUOTE_CURRENCY);
        }

        console.log("Selected cover asset", coverAsset);

        var quoteResponse = await fetch(quoteEndpoint, quoteRequestOptions);
        var quoteAsText = await quoteResponse.text();
        var quote = JSON.parse(quoteAsText);

        console.log("Quote: ", quote);

        var nonce = await web3.eth.getTransactionCount(account.address, "pending");

        if(coverAsset.address != ethAddress){

          const tokenContract = new web3.eth.Contract(
              ierc20Abi,
              coverAsset.address
          );

          console.log("Approving iTrust to spend", quote.price);

          var approveResult = await tokenContract.methods.approve(
            process.env.ITRUST_CONTRACT_ADDRESS, quote.price
          ).send(
            {
              from: account.address, 
              gas: 6000000,
              nonce
            }
          );

          console.log("Approved iTrust to spend", quote.price);

        }

        
        console.log("Buying cover");

        const amountInWei =  web3.utils.toWei(quote.amount);

        console.log("Buy params", { 
            treasuryAddress: process.env.TREASURY_ADDRESS,
            contract: quote.contract,
            currency: coverAsset.address,
            ammountInWei: amountInWei,
            quoteAmount: quote.period,
            coverType: COVER_TYPE,      
            quoteSignature: quote.signature,
            price: quote.price
        });

        nonce = await web3.eth.getTransactionCount(account.address, "pending");
// console.log(quote.currency == 'ETH' ? quote.price : '0');
        var tx = await itrustContract.methods.buyCover(
            process.env.TREASURY_ADDRESS,
            quote.contract,
            coverAsset.address,
            amountInWei,
            quote.period,
            COVER_TYPE,
            quote.id,
            quote.signature)
          .send(
            {
              from: account.address, 
              value: (coverAsset.address == ethAddress ? quote.price : '0'),
              gas: 6000000,
              nonce
            }
          );


        console.log("Cover purchased");

        console.log("Getting Covers For User ", quote.id);
        var coversResponse = await fetch(`${getCoversEndpoint}${quote.id}`, coversRequestOptions);
        var coversAsText = await coversResponse.text();
        var covers = JSON.parse(coversAsText);
        console.log("Covers", covers);

    } catch (e) {
        console.log("The following error occured:", e);
    }
}

main();