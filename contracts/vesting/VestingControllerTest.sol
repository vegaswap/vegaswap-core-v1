// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./VestingController.sol";

contract VestingControllerTest is VestingController {
  function _releaseTest(VestingSchedule memory vestingSchedule) external payable onlyOwner returns (uint256) {
    return _release(vestingSchedule);
  }

  function getEndTimeTest(
    uint256 _cliffTime,
    uint256 _amountPerTerminalPeriod,
    uint256 _totalAmount
  ) external view returns (uint256) {
    return getEndTime(_cliffTime, _amountPerTerminalPeriod, _totalAmount);
  }

  function getVestedAmountTest(
    uint256 _cliffTime,
    uint256 _endTime,
    uint256 _period,
    uint256 _amountPerTerminalPeriod,
    uint256 _totalAmount
  ) external view returns (uint256) {
    return getVestedAmount(_cliffTime, _endTime, _period, _amountPerTerminalPeriod, _totalAmount);
  }
}
