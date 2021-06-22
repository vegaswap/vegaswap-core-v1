// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ERC20GovToken with Governance.
// TODO: Replace VegaToken
contract VegaToken is ERC20, Ownable {

    uint256 DECIMALS = 18;
    uint256 DECIMALS_FACTOR = 10**DECIMALS;
    uint256 public MAX_TOTAL_SUPPLY = 10**9 * DECIMALS_FACTOR; // 1 Billion

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(
        //string memory name,
        //string memory symbol,
        
    ) ERC20("Vega Token", "VEGA") {
        _mint(msg.sender, MAX_TOTAL_SUPPLY);
    }
}