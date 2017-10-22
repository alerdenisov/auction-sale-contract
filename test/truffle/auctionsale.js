const AuctionSale = artifacts.require("./AuctionSale.sol")
const { promisify, getBalance, expectThrow } = require('./utils.js')

let AUCTION;

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
        AUCTION = await AuctionSale.new(web3.toWei(1, 'ether'), web3.toWei(50, 'ether'), web3.toWei(0.1, 'ether'), { from: accounts[0] })
    })
    
    it('should have min and max caps', async function() {
      const auction = AUCTION
      const minCap = await auction.minCap()
      const maxCap = await auction.maxCap()
      assert(minCap > 0, "Min cap should be more than 0")
      assert(maxCap > minCap, "Max cap should be more than min cap")
      assert(minCap == web3.toWei(1, 'ether'), "Min cap should be 3 ETH")
      assert(maxCap == web3.toWei(50, 'ether'), "Max cap should be 50 ETH")
    })

    it('should allow to join to sale', async function() {
      const auction = AUCTION
      assert(await auction.bid(accounts[0], { from: accounts[0], value: web3.toWei(1, 'ether') }))
    })

    it('should deny to join to sale after it ends', async function() {
      const auction = AUCTION
      const owner   = await auction.owner()

      auction.pause({ from: owner })

      await expectThrow(
        auction.bid(accounts[0], { from: accounts[0], value: web3.toWei(1, 'ether') }), 
        "Biding is available after pause")
    })

    // it('should allow to refund bid if it required', async function() {
    //   const auction = AUCTION
    //   await auction.bid(accounts[0], { from: accounts[0], value: web3.toWei(1, 'ether') })
    //   assert(await auction.refund({ from: accounts[0] }))
    // })
    
    it('send proper bid value when requested', async function() {
      const auction = AUCTION
      await auction.bid(accounts[0], { from: accounts[0], value: web3.toWei(1, 'ether') })
      const bid = await auction.getBid(accounts[0])
      assert(bid.equals(web3.toWei(1, 'ether')))
    })

    it('should allow to raise bid', async function() {
      const auction = AUCTION
      const bids = [1, 1.5, 5 ]
      bids.forEach(async bid => {
        await auction.bid(accounts[0], { from: accounts[0], value: web3.toWei(bid, 'ether') })
      })

      const bid = await auction.getBid(accounts[0])
      assert(bid.equals(web3.toWei(bids.reduce((acc, el) => acc + el, 0), 'ether')))
    })

    it('should to deny to bid with amount not divided on step', async function() {
      expectThrow(AUCTION.bid(accounts[0], { from: accounts[0], value: web3.toWei(11.515, 'ether')}))
    })

    it('should deny to bid less than minimal bid', async function() {
      const auction = AUCTION
      await expectThrow(
        auction.bid(accounts[0], { from: accounts[0], value: web3.toWei(0.1, 'ether') }),
        "Allow bid less than 0.5 ETH")
    })

    it('show leader bid when requested', async function() {
      for(let index = 0; index < 3; index++) {
        await AUCTION.bid(accounts[index], { from: accounts[index], value: web3.toWei(index + 1, 'ether') })
      }

      assert(await AUCTION.leader() == accounts[2])
      assert(await AUCTION.leaderBid() == web3.toWei(3, 'ether'))
    })

    it('should stop auction if max cap is received', async function() {
      const max = await AUCTION.maxCap()
      assert(!(await AUCTION.paused()))

      await AUCTION.bid(accounts[0], { from: accounts[0], value: max })

      assert(await AUCTION.paused())
    })

    it('owner could close auction', async function() {
      const initialBalances = accounts.map(async acc => await getBalance(acc))

      for(let index = 1; index < 4; index++) {
        await AUCTION.bid(accounts[index], { from: accounts[index], value: web3.toWei(index, 'ether') })
      }

      assert(await AUCTION.close({ from: accounts[0] }))

      // test refund
      for(let index = 1; index < 3; index++) {
        assert(initialBalances[index] == await getBalance(accounts[index]))
      }
      
      assert(initialBalances[3].sub(web3.toWei(3, 'ether')) == await getBalance(accounts[3]))

      assert(await getBalance(accounts[0]) == initialBalance.add(web3.toWei(3, 'ether')))
    })
  })
})
