// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract TokenSwap {
    address public owner;
    
    // Token addresses on ARC Network
    address public immutable USDC;
    address public immutable EURC;
    
    // Exchange rate: 1 USDC = exchangeRate EURC (with 6 decimals precision)
    uint256 public exchangeRate = 1000000; // 1:1 by default
    
    // Fee in basis points (100 = 1%)
    uint256 public swapFee = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event Swapped(address indexed user, address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);
    event ExchangeRateUpdated(uint256 newRate);
    event FeeUpdated(uint256 newFee);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _usdc, address _eurc) {
        owner = msg.sender;
        USDC = _usdc;
        EURC = _eurc;
    }
    
    function swapUSDCtoEURC(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate output amount with fee
        uint256 feeAmount = (amount * swapFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = amount - feeAmount;
        uint256 outputAmount = (amountAfterFee * exchangeRate) / 1e6;
        
        // Transfer USDC from user to contract
        require(
            IERC20(USDC).transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        // Transfer EURC from contract to user
        require(
            IERC20(EURC).transfer(msg.sender, outputAmount),
            "EURC transfer failed"
        );
        
        emit Swapped(msg.sender, USDC, EURC, amount, outputAmount);
    }
    
    function swapEURCtoUSDC(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate output amount with fee
        uint256 feeAmount = (amount * swapFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = amount - feeAmount;
        uint256 outputAmount = (amountAfterFee * 1e6) / exchangeRate;
        
        // Transfer EURC from user to contract
        require(
            IERC20(EURC).transferFrom(msg.sender, address(this), amount),
            "EURC transfer failed"
        );
        
        // Transfer USDC from contract to user
        require(
            IERC20(USDC).transfer(msg.sender, outputAmount),
            "USDC transfer failed"
        );
        
        emit Swapped(msg.sender, EURC, USDC, amount, outputAmount);
    }
    
    function setExchangeRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Rate must be greater than 0");
        exchangeRate = _newRate;
        emit ExchangeRateUpdated(_newRate);
    }
    
    function setSwapFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        swapFee = _newFee;
        emit FeeUpdated(_newFee);
    }
    
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner, amount), "Transfer failed");
    }
}

