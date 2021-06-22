// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "./uniswap/router/interfaces/IUniswapV2Router02.sol"; 
import "./uniswap/core/interfaces/IUniswapV2Factory.sol"; 
import "./Credits.sol";
//import "./VestingController.sol";

//import "OpenZeppelin/openzeppelin-contracts@4.1.0/contracts/token/ERC20/ERC20.sol";
//import "OpenZeppelin/openzeppelin-contracts@4.1.0/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Broker is Initializable, Ownable {

    //mainnet
    //IUniswapV2Router02 router = IUniswapV2Router02(0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F);

    //ropsten    
    //IUniswapV2Factory factory = IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);

    //pancake
    address private PANCAKE_FACTORY = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address private PANCAKE_ROUTER = 0x10ED43C718714eb63d5aA57B78B54704E256024E;

    //address private UNI_FACTORY = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    //BSC
    address private BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address private CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;
    address private DAI_PEG = 0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3;
    address private WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;

    IUniswapV2Factory public pancake_factory = IUniswapV2Factory(PANCAKE_FACTORY);
    IUniswapV2Router02 public pancake_router = IUniswapV2Router02(PANCAKE_ROUTER);
    //uni
    //IUniswapV2Router02 public router = IUniswapV2Router02();

    //ETH
    //address private BUSD = 0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F;
    //address private USDT = 0x55d398326f99059fF775485246999027B3197955;

    Credits private credits;

    address[] private select_pair;

    constructor(){
        
    }

    function initialize() public {  

        credits = new Credits();
        credits.initialize("VCS");              
    }

    function getPrice(address A, address B, uint amount) public view returns (uint) {
        address[] memory path = new address[](2);
        //path[0] = WBNB;
        //path[1] = CAKE;
        path[0] = A;
        path[1] = B;
        uint p = pancake_router.getAmountsIn(amount, path)[0];
        return p;
    }

    function setPair() public {
        select_pair[0] = WBNB;
        select_pair[1] = CAKE;
    }
   
    
    //token
    //TODO address tokenA, tokenB
    //price for now just 1:1 for stables
    function swapRoute(uint256 amountIn) public {

        //need approve
        
        //allowance
        //address pair = factory.getPair(BUSD, CAKE);

        //(uint[] memory amounts);
        address to = msg.sender;
        //amountIn = 0;        
        uint amountOutMin = 100000;        

        setPair();
        
        uint deadline = block.timestamp + 15;
        pancake_router.swapExactTokensForTokens(amountIn, amountOutMin, select_pair, to, deadline);
        
        ////price of tokenA to tokenB 
        //query uniswap
        // price = 1500
        // price_usd = tokenB * ethusd
        // dollar_traded = amount * price_usd
        // swap(tokenA, tokenB)


        // credit_amount = dollar_traded
        
        // if trade is successful
        //TODO USD calculation
        uint credit_amount = amountIn;
        credits.issue(msg.sender, credit_amount);

    }

    function balanceOfToken(address token) public view returns (uint256) {
        ERC20 erc = ERC20(token);
        return erc.balanceOf(msg.sender);
    }

    function creditAddress() public view returns (address) {
        return address(credits);
    }

    function balanceOfCredits() public view returns (uint256) {
        return credits.balanceOf(msg.sender);
    }

    function totalCredits() public view returns (uint256) {
        return credits.totalSupply();
    }

}
