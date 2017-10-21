const AuctionSale = artifacts.require("./AuctionSale.sol")
const { promisify, getBalance, expectThrow } = require('./utils.js')

let AS;

contract('AuctionSale', function(accounts) {
  describe('Checking network for testing', function() {
    it('first account should have an eth', async function() {
      assert(await getBalance(accounts[0]) > 0, "Account have lack of ETH")
    })

    it('should be available at network', async function() {
      assert(await AuctionSale.deployed(), "Contract isn't available at network")
    })
  })

  describe('Primary features', function() {
    beforeEach(async() => {
        AS = await AuctionSale.new(web3.toWei(3, 'ether'), web3.toWei(50, 'ether'), { from: accounts[0] })
    })
    
    it('should have min and max caps', async function() {
      const auction = AS
      const minCap = await auction.minCap()
      const maxCap = await auction.maxCap()
      assert(minCap > 0, "Min cap should be more than 0")
      assert(maxCap > minCap, "Max cap should be more than min cap")
      assert(minCap == web3.toWei(3, 'ether'), "Min cap should be 3 ETH")
      assert(maxCap == web3.toWei(50, 'ether'), "Max cap should be 50 ETH")
    })

    it('should allow to join to sale', async function() {
      const auction = AS
      assert(await auction.bid(accounts[0], { from: accounts[0], value: 10000 }))
    })

    it('should deny to join to sale after it ends', async function() {
      const auction = AS
      const owner   = await auction.owner()

      auction.pause({ from: owner })

      await expectThrow(
        auction.bid(accounts[0], { from: accounts[0], value: 10000 }), 
        "Biding is available after pause")
    })

    it('should allow to refund bid if it required', async function() {
      const auction = AS
      await auction.bid(accounts[0], { from: accounts[0], value: 10000 })
      assert(await auction.refund({ from: accounts[0] }))
    })
    
    it('send proper bid value when requested', async function() {
      const auction = AS
      await auction.bid(accounts[0], { from: accounts[0], value: 10000 })
      const bid = await auction.getBid(accounts[0])
      console.log(bid)
      assert(bid.equals(10000))
    })

    it('should allow to raise bid', async function() {
      
    })

    it('should return bids when auction ends', async function() {
      assert(false)
    })

    it('should send leader bid to owner when aution ends', async function() {
      assert(false)
    })

    it('show all active bids when requested', async function() {
      assert(false)
    })

    it('show leader bid when requested', async function() {
      assert(false)
    })

    // TODO: Should it be breakable when required?
    it('should have success state when minimum amount is received', async function() {
      assert(false);
    })

    it('should stop auction if max cap is received', async function() {
      
    })
  })
})
