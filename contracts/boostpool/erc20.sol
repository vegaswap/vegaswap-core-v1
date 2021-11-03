// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

interface ERC20 {
    function totalSupply() external returns (uint supply);
    function balanceOf(address _owner) external returns (uint balance);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint remaining);
    function decimals() external view returns(uint digits);
    event Approval(address indexed _owner, address indexed _spender, uint _value);
}