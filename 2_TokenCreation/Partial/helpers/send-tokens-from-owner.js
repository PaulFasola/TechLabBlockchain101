'use strict';

const SoatToken = artifacts.require("./SoatToken.sol");
const readline = require('readline');
const program = require("commander");
const helper = require("./common-functions.js");

module.exports = function (callback) {
    let _instance = null;
    let errored = false;

    program
        .option('--amount [value]', 'Amount of tokens')
        .parse(process.argv);

    if (parseInt(program.amount) === NaN) {
        return;
    }

    let tokenAmount = program.amount * 1000000000000000000;

    SoatToken.deployed()
        .then(
            async function (instance) {
                _instance = instance;
                helper.bind(instance, web3);
                console.log("*****************************************************************************************************************")
                console.log(" Sending FROM: " + web3.eth.accounts[0] + "    ->     TO: " + web3.eth.accounts[1])
                console.log(" Amount : " + web3.fromWei(tokenAmount, "ether")); // 18 digits
                console.log("*****************************************************************************************************************\n")
                return instance.transfer(web3.eth.accounts[1], tokenAmount);
            },
            async function (error) {
                errored = true;
                console.log("Error : " + error);
            }
        )
        .then(
            async (result) => {
                if (result.tx !== undefined) {
                    console.log(" == Transaction Succeeded !");
                    console.log(` == Tx is : ${ result.tx } \n\n`);
                } else {
                    console.log("Transaction may have failed ...\n\n");
                }

                console.log("Transaction details : \n**************************************************************************************************\n")
                console.log(result);
            },
            function (error) {
                errored = true;
                console.log("Error : " + error);
            });

    callback();
}