'use strict';

const SoatToken = artifacts.require("./SoatToken.sol");
const helper = require("./common-functions");

module.exports = (callback) => {
    SoatToken.deployed()
        .then(async (contractInstance) => {
            helper.bind(contractInstance, web3);

            var balances = await helper.getBalances();
            console.log(SoatToken.contractName + " balance summary\n");
            console.log("**************************************************************************************");
            console.log("  Account ID          Account address                                        Balance  ");
            console.log("**************************************************************************************");
            balances.forEach((balance, id) => console.log(`  ${id}                   ${balance.account}             ${web3.fromWei(balance.balance) }`))
        })
        .catch((msg) => console.log("Error : =======================" + msg));

    callback();
}