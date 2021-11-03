// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

// This version is mainly for cleanup and will be merged to BoostPool.sol

import "./erc20.sol";

contract BoostPool {
    address public owner;

    address public stakeToken;
    address public yieldToken;
    uint256 public startTime;
    uint256 public endTime;
    //uint256 public duration; // how long to stake, fixed in time at start of the pool
    uint256 public stakeDecimals;
    uint256 public yieldDecimals;
    uint256 public maxPerStake;
    uint256 public maxYield;
    uint256 public maxStake;
    uint256 public totalAmountStaked;
    uint256 public totalAmountClaimed;
    uint256 public currentStep;

    uint256[] public rewardSteps;
    uint256[] public stakeSteps;
    uint256 public rewardQuote;
    uint256 public minPerStake;

    event Deposit(uint256 amount);
    event StakeAdded(
        address stakeAddress,
        uint256 stakeAmount,
        uint256 yieldAmount,
        uint256 stakeTime
    );
    event Unstaked(
        address stakeAddress,
        uint256 stakeAmount,
        uint256 yieldAmount
    );
    event OwnerDeposit(uint256 amount);
    event OwnerWithdraw(uint256 amount);

    struct Stake {
        address stakeAddress;
        uint256 stakeAmount;
        uint256 yieldAmount;
        bool isAdded;
        bool staked;
        uint256 stakeTime;
    }

    address[] public stakerAddresses;
    mapping(address => Stake) public stakes;

    constructor(
        address _stakeToken,
        address _yieldToken,
        uint256 _duration,
        uint256 _maxYield,
        uint256 _maxStake,
        uint256 _stakeDecimals, // should get from the token ERC20(tokenAddress) TODO: Remove
        uint256 _yieldDecimals, // should get from the token ERC20(tokenAddress) TODO: Remove
        uint256 _maxPerStake,
        //uint256 _minPerStake, // TODO: Should enable this?, and accept external variable
        uint256[] memory _rewardSteps, // Not used
        uint256[] memory _stakeSteps, // Not used
        uint256 _rewardQuote
    ) {
        owner = msg.sender; // set owner
        //assert _stakeToken != ZERO_ADDRESS, "BoostPool: is zero address"
        stakeToken = _stakeToken;
        yieldToken = _yieldToken;
        maxYield = _maxYield;
        maxStake = _maxStake;
        stakeDecimals = _stakeDecimals;
        yieldDecimals = _yieldDecimals;
        maxPerStake = _maxPerStake;
        rewardSteps = _rewardSteps;
        stakeSteps = _stakeSteps;

        startTime = block.timestamp;
        endTime = startTime + _duration;

        totalAmountStaked = 0;
        totalAmountClaimed = 0;
        currentStep = 0;
        rewardQuote = _rewardQuote;
        minPerStake = 1 * 10**stakeDecimals; // HARDCODE
    }

    // TODO: In future, we check msg.value for staking native token like BNB
    // function stakeNative() {
    //
    // }

    function stake(uint256 _stakeAmount) public {
        require(block.timestamp < endTime, "BoostPool: ended");
        require(block.timestamp >= startTime, "BoostPool: not started");
        require(
            _stakeAmount <= maxPerStake,
            "BoostPool: more than maximum stake"
        );
        require(_stakeAmount >= minPerStake, "BoostPool: not enough");
        require(
            totalAmountStaked + _stakeAmount <= maxStake,
            "BoostPool: maximum staked"
        );
        require(!stakes[msg.sender].isAdded, "BoostPool: can only stake once");

        uint256 _yieldAmount = (_stakeAmount * rewardSteps[currentStep]) /
            rewardQuote;

        require(
            totalAmountClaimed + _yieldAmount <= maxYield,
            "BoostPool: rewards exhausted"
        );

        require(
            ERC20(stakeToken).transferFrom(
                msg.sender,
                address(this),
                _stakeAmount
            ),
            "BoostPool: transfer failed"
        );
        stakerAddresses.push(msg.sender);

        // stakes[msg.sender] = Stake(
        // {
        //     //stakeAddress: msg.sender,
        //     stakeAddress: address(this),
        //     stakeAmount: _stakeAmount,
        //     stakeTime: block.timestamp,
        //     yieldAmount: 0,
        //     isAdded: true,
        //     staked: true
        // });

        Stake memory s = Stake({
            stakeAddress: msg.sender,
            stakeAmount: _stakeAmount,
            yieldAmount: _yieldAmount,
            isAdded: true,
            staked: true,
            stakeTime: block.timestamp
        });
        //s.stakeAddress = msg.sender;
        stakes[msg.sender] = s;

        // stakes[msg.sender] = Stake(
        // {
        //     //stakeAddress: msg.sender,
        //     stakeAddress: address(this),
        //     stakeAmount: _stakeAmount,
        //     stakeTime: block.timestamp,
        //     yieldAmount: 0,
        //     isAdded: true,
        //     staked: true
        // });

        // TODO: Implement staking logic
        require(_stakeAmount > 0, "??");
        require(totalAmountStaked >= 0, "??");
        //totalAmountStaked += _stakeAmount;
        totalAmountStaked = 1000 * 10**18;
        //totalAmountClaimed += _yieldAmount;

        // if (totalAmountStaked > stakeSteps[currentStep]){
        //     currentStep++;
        // }

        //emit StakeAdded(msg.sender, _stakeAmount, _yieldAmount, block.timestamp);
    }

    function stake1(uint256 _stakeAmount) public {
        require(block.timestamp < endTime, "BoostPool: ended");
        require(block.timestamp >= startTime, "BoostPool: not started");
        require(
            _stakeAmount <= maxPerStake,
            "BoostPool: more than maximum stake"
        );
        require(_stakeAmount >= minPerStake, "BoostPool: not enough");
        require(
            totalAmountStaked + _stakeAmount <= maxStake,
            "BoostPool: maximum staked"
        );
        require(!stakes[msg.sender].isAdded, "BoostPool: can only stake once");

        uint256 _yieldAmount = (_stakeAmount * rewardSteps[currentStep]) /
            rewardQuote;

        //check available yield tokens
        //uint256 bal = ERC20(yieldToken).balanceOf(address(this));
        //uint256 unclaimed = bal - totalAmountClaimed;
        //require(unclaimed >= _yieldAmount, "BoostPool: need the tokens to stake");

        require(
            totalAmountClaimed + _yieldAmount <= maxYield,
            "BoostPool: rewards exhausted"
        );

        require(
            ERC20(stakeToken).transferFrom(
                msg.sender,
                address(this),
                _stakeAmount
            ),
            "BoostPool: transfer failed"
        );
        stakerAddresses.push(msg.sender);

        stakes[msg.sender] = Stake({
            stakeAddress: msg.sender,
            stakeAmount: _stakeAmount,
            stakeTime: block.timestamp,
            yieldAmount: _yieldAmount,
            isAdded: true,
            staked: true
        });

        totalAmountStaked += _stakeAmount;
        totalAmountClaimed += _yieldAmount; // user should not claim at staking time

        if (totalAmountStaked > stakeSteps[currentStep]) {
            currentStep++;
        }

        emit StakeAdded(
            msg.sender,
            _stakeAmount,
            _yieldAmount,
            block.timestamp
        );
    }

    // TODO: Missing function
    // function withdrawRewards() {}
    //

    function unstake() public {
        require(stakes[msg.sender].isAdded, "BoostPool: not a stakeholder");
        //uint256 b = ERC20(stakeToken).balanceOf(msg.sender);
        require(stakes[msg.sender].staked, "BoostPool: not staked");


        // unstake only at duration time collapsed
        //uint256 lockduration = block.timestamp - stakes[msg.sender].stakeTime;
        //uint256 lockdays = lockduration/1 days;
        //require(lockdays >= duration, "BoostPool: not locked for duration");

        require(
            block.timestamp >= endTime,
            "BoostPool: not locked for duration"
        );

        //transfer stake
        require(
            ERC20(stakeToken).transfer(
                msg.sender,
                stakes[msg.sender].stakeAmount
            ),
            "BoostPool: sending stake failed"
        );
        //transfer yield
        require(
            ERC20(yieldToken).transfer(
                msg.sender,
                stakes[msg.sender].yieldAmount
            ),
            "BoostPool: sending yield failed"
        );

        // Nice to have: extra variable, isStakeEnded true;
        stakes[msg.sender].staked = false;

        //totalAmountStaked -= stakes[msg.sender].stakeAmount;
        emit Unstaked(
            msg.sender,
            stakes[msg.sender].stakeAmount,
            stakes[msg.sender].yieldAmount
        );
    }

    function depositOwner(uint256 amount) public {
        require(msg.sender == owner, "not the owner");

        require(
            ERC20(yieldToken).allowance(msg.sender, address(this)) >= amount,
            "BoostPool: not enough allowance"
        );
        require(
            ERC20(yieldToken).balanceOf(msg.sender) >= amount,
            "BoostPool: not enough balance"
        );

        require(
            ERC20(yieldToken).transferFrom(msg.sender, address(this), amount),
            "BoostPool: sending yield failed"
        );

        emit OwnerDeposit(amount);
    }

    function withdrawOwner(uint256 amount) public {
        require(msg.sender == owner, "BoostPool: not the owner");
        //uint256 bucketbalance = ERC20(yieldToken).balanceOf(address(this));
        //uint256 unclaimedbalance = bucketbalance - totalAmountClaimed;
        //require(amount <= unclaimedbalance, "BoostPool: can't withdraw staked amounts");

        require(
            ERC20(yieldToken).transfer(msg.sender, amount),
            "BoostPool: withdrawOwner"
        );

        emit OwnerWithdraw(amount);
    }

    //emergency withdraw of the stake.
    function withdrawOwnerStake(uint256 amount) public {}
}