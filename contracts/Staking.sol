// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Staking {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    address public owner;
    
    // Annual Percentage Yield (APY) in basis points (1000 = 10%)
    uint256 public apy = 1000; // 10% APY default
    uint256 public constant APY_DENOMINATOR = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => Stake) public stakes;
    
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event APYUpdated(uint256 newAPY);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _stakingToken, address _rewardToken) {
        owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Claim pending rewards before staking more
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }
        
        // Transfer tokens from user to contract
        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        if (stakes[msg.sender].amount == 0) {
            stakes[msg.sender] = Stake({
                amount: amount,
                startTime: block.timestamp,
                lastClaimTime: block.timestamp
            });
        } else {
            stakes[msg.sender].amount += amount;
            stakes[msg.sender].lastClaimTime = block.timestamp;
        }
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient staked amount");
        
        // Claim pending rewards before unstaking
        _claimRewards();
        
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back to user
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    function claimRewards() external {
        require(stakes[msg.sender].amount > 0, "No staked amount");
        _claimRewards();
    }
    
    function _claimRewards() internal {
        uint256 reward = calculateRewards(msg.sender);
        
        if (reward > 0) {
            stakes[msg.sender].lastClaimTime = block.timestamp;
            require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, reward);
        }
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 reward = (userStake.amount * apy * timeStaked) / (APY_DENOMINATOR * SECONDS_PER_YEAR);
        
        return reward;
    }
    
    function getStakeInfo(address user) external view returns (uint256 amount, uint256 startTime, uint256 pendingRewards) {
        Stake memory userStake = stakes[user];
        return (userStake.amount, userStake.startTime, calculateRewards(user));
    }
    
    function setAPY(uint256 _newAPY) external onlyOwner {
        require(_newAPY <= 50000, "APY too high"); // Max 500%
        apy = _newAPY;
        emit APYUpdated(_newAPY);
    }
    
    function depositRewards(uint256 amount) external onlyOwner {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
}
