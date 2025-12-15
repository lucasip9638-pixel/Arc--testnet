// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DailyGM {
    struct GMRecord {
        uint256 lastGMTime;
        uint256 totalGMs;
        uint256 currentStreak;
        uint256 longestStreak;
    }
    
    mapping(address => GMRecord) public gmRecords;
    
    uint256 public constant ONE_DAY = 1 days;
    uint256 public totalGMsSent;
    
    address[] public gmSenders;
    mapping(address => bool) public hasEverSentGM;
    
    event GMSent(address indexed user, uint256 timestamp, uint256 streak);
    event StreakBroken(address indexed user, uint256 oldStreak);
    
    function sayGM() external {
        GMRecord storage record = gmRecords[msg.sender];
        
        // Check if this is the first GM ever
        if (!hasEverSentGM[msg.sender]) {
            gmSenders.push(msg.sender);
            hasEverSentGM[msg.sender] = true;
        }
        
        // Check if already sent GM today
        require(
            block.timestamp >= record.lastGMTime + ONE_DAY,
            "Already sent GM today"
        );
        
        // Check if streak continues (within 48 hours)
        if (record.lastGMTime > 0 && block.timestamp <= record.lastGMTime + (2 * ONE_DAY)) {
            record.currentStreak += 1;
        } else if (record.lastGMTime > 0) {
            // Streak broken
            emit StreakBroken(msg.sender, record.currentStreak);
            record.currentStreak = 1;
        } else {
            // First GM ever
            record.currentStreak = 1;
        }
        
        // Update longest streak
        if (record.currentStreak > record.longestStreak) {
            record.longestStreak = record.currentStreak;
        }
        
        record.lastGMTime = block.timestamp;
        record.totalGMs += 1;
        totalGMsSent += 1;
        
        emit GMSent(msg.sender, block.timestamp, record.currentStreak);
    }
    
    function canSayGM(address user) external view returns (bool) {
        GMRecord memory record = gmRecords[user];
        return block.timestamp >= record.lastGMTime + ONE_DAY;
    }
    
    function getTimeUntilNextGM(address user) external view returns (uint256) {
        GMRecord memory record = gmRecords[user];
        
        if (record.lastGMTime == 0) {
            return 0; // Can say GM immediately
        }
        
        uint256 nextGMTime = record.lastGMTime + ONE_DAY;
        
        if (block.timestamp >= nextGMTime) {
            return 0; // Can say GM now
        }
        
        return nextGMTime - block.timestamp;
    }
    
    function getGMRecord(address user) external view returns (
        uint256 lastGMTime,
        uint256 totalGMs,
        uint256 currentStreak,
        uint256 longestStreak
    ) {
        GMRecord memory record = gmRecords[user];
        return (
            record.lastGMTime,
            record.totalGMs,
            record.currentStreak,
            record.longestStreak
        );
    }
    
    function getLeaderboard(uint256 count) external view returns (
        address[] memory users,
        uint256[] memory streaks
    ) {
        uint256 length = gmSenders.length < count ? gmSenders.length : count;
        users = new address[](length);
        streaks = new uint256[](length);
        
        // Simple implementation - in production, use sorted data structure
        for (uint256 i = 0; i < length; i++) {
            users[i] = gmSenders[i];
            streaks[i] = gmRecords[gmSenders[i]].currentStreak;
        }
        
        return (users, streaks);
    }
}
