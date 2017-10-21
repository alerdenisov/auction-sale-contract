pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

// Core sale contacts
contract AuctionSale is Pausable {
  using SafeMath for uint256;
  
  mapping(address => uint256) bids;
  
  uint256 public leaderBid;
  address public leader;

  uint256 public minCap;
  uint256 public maxCap;

  function AuctionSale(uint256 _minCap, uint256 _maxCap) public  {
    minCap = _minCap;
    maxCap = _maxCap;
  }

  function () payable public {
    bid(msg.sender);
  }

  function bid(address _buyer) payable whenNotPaused public {
    require(msg.value > 0);
    
    bids[_buyer] = bids[_buyer].add(msg.value);

    assert(bids[_buyer] <= maxCap);
    assert(leaderBid < bids[_buyer]);

    leaderBid = bids[_buyer];
    leader = _buyer;
  }

  function refund() whenNotPaused public {
    require(bids[msg.sender] > 0);

    msg.sender.transfer(bids[msg.sender]);
    bids[msg.sender] = 0;
  }

  function getBid(address _buyer) public constant returns(uint256 _bid) {
    _bid = bids[_buyer];
  }
}