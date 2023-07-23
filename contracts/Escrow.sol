// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public buyer;
    address public inspector;
    address public lender;
    
    constructor (address _nftAddress, address payable _seller, address _inspector, address _lender) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }
}