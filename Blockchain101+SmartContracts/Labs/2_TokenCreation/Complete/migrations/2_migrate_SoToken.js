var SoatToken = artifacts.require("./SoatToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SoatToken);
};
