// var Users = artifacts.require("./Users.sol");
const AuctionSale = artifacts.require('./AuctionSale.sol')

module.exports = function(deployer) {
  // deployer.deploy(Users);
  deployer.deploy(AuctionSale, web3.toWei(3, 'ether'), web3.toWei(50, 'ether'))
};
