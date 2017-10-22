const AuctionSale = artifacts.require("./AuctionSale.sol")
const { promisify, getBalance, expectThrow } = require('./utils.js')


let AUCTION;

contract('AuctionSale', function(accounts) {
  const OWNER_SIG = { from: accounts[0] }
  const HACK_SIG = { from: accounts[1] }

  describe('Penetration tests', function() {
    beforeEach(async() => {
        AUCTION = await AuctionSale.new(web3.toWei(1, 'ether'), web3.toWei(100, 'ether'), web3.toWei(0.1, 'ether'), { from: accounts[0] })
    })
    describe('only owner should can', function() {
      it('only owner could pause', async function() {
        expectThrow(AUCTION.pause(HACK_SIG))
        assert(AUCTION.pause(OWNER_SIG))
      })
      it('only owner could close', async function() {
        expectThrow(AUCTION.close(HACK_SIG))
        assert(AUCTION.close(OWNER_SIG))
      })
      it('allow only highest bid', async function() {
        await AUCTION.bid(accounts[2], { from: accounts[2], value: web3.toWei(1, 'ether') })
        assert(await AUCTION.leader() == accounts[2])

        expectThrow(AUCTION.bid(accounts[1], { from: accounts[1], value: web3.toWei(0.5, 'ether') }))
        assert(await AUCTION.leader() == accounts[2])
      })

      it('collect money only after refund', async function() {
        for(let index = 1; index < 4; index++) {
          await AUCTION.bid(accounts[index], { from: accounts[index], value: web3.toWei(index, 'ether') })
        }

        await AUCTION.pause(OWNER_SIG)

        expectThrow(await AUCTION.collect(OWNER_SIG))

        assert(await AUCTION.close(OWNER_SIG))
      })
    })
  })

})