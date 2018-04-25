var Roulette = artifacts.require("Roulette.sol");

module.exports = function(deployer) {
  // Here, we deploy the smart contract with 80 ETH from the first account
  // If we don't do that, the smart contract will revert any bet (since the casino can't pay back)
  deployer.deploy(Roulette, 0, {from: web3.eth.accounts[0], value: web3.toWei(80, "ether")});
};
