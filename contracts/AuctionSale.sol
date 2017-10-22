pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

// Core sale contacts
contract AuctionSale is Pausable {  
  using SafeMath for uint256;

  mapping(address => uint256) bids;
  address[] buyers;

  uint256 public leaderBid;
  address public leader;

  uint256 public minCap;
  uint256 public maxCap;
  uint256 public step;

  event NewLeader(address indexed buyer, uint256 bid);

  function AuctionSale(uint256 _minCap, uint256 _maxCap, uint256 _step) public  {
    minCap = _minCap;
    maxCap = _maxCap;
    step = _step;
  }

  function () payable public {
    bid(msg.sender);
  }

  function bid(address _buyer) payable whenNotPaused public {
    require(msg.value % step == 0);
    
    if(bids[_buyer] == 0) {
      buyers.push(_buyer);
    }

    bids[_buyer] = bids[_buyer].add(msg.value);

    assert(bids[_buyer] >= minCap);
    assert(bids[_buyer] <= maxCap);
    assert(leaderBid < bids[_buyer]);

    leaderBid = bids[_buyer];
    leader = _buyer;
    NewLeader(leader, leaderBid);

    if(leaderBid == maxCap) {
      paused = true;
      Pause();
    }
  }

  function refundMe() whenPaused public {
    refund(msg.sender);
  }

  function refund(address _buyer) whenPaused public {
    require(_buyer != leader);
    _buyer.transfer(bids[_buyer]);
    bids[_buyer] = 0;
  }

  function getBid(address _buyer) public constant returns(uint256 _bid) {
    _bid = bids[_buyer];
  }

  function myBid() public constant returns(uint256 _bid) {
    _bid = getBid(msg.sender);
  }

  function collect() public onlyOwner whenPaused {
    require(this.balance == leaderBid);
    owner.transfer(this.balance);
  }

  function close() public onlyOwner {
    pause();

    for(uint index = 0; index < buyers.length; index++ ) {
      if(buyers[index] != leader) {
        refund(buyers[index]);
      }
    }

    collect();
  }
}