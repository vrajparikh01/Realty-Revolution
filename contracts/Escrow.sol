// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmt;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;

    mapping(uint256 => mapping(address => bool)) public approval;

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this function.");
        _;
    }

    modifier onlyBuyer(uint _nftId) {
        require(msg.sender == buyer[_nftId], "Only buyer can call this function.");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this function.");
        _;
    }
    
    constructor (address _nftAddress, address payable _seller, address _inspector, address _lender) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(uint _nftId, uint _purchasePrice, uint _escrowAmt, address _buyer) public onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        purchasePrice[_nftId] = _purchasePrice;
        escrowAmt[_nftId] = _escrowAmt;
        buyer[_nftId] = _buyer;
    }

    function depositEarnest(uint _nftId) public payable {
        require(msg.value >= escrowAmt[_nftId], "Not enough earnest money.");
    }

    function updateInspectionStatus(uint _nftId, bool _passed) public onlyInspector {
        inspectionPassed[_nftId] = _passed;
    }

    function approveSale(uint _nftId) public {
        approval[_nftId][msg.sender] = true;
    }

    receive() external payable {}

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function finalizeSale(uint _nftId) public{
        require(inspectionPassed[_nftId], "Inspection not passed.");
        require(approval[_nftId][seller], "Seller has not approved.");
        require(approval[_nftId][lender], "Lender has not approved.");
        require(approval[_nftId][buyer[_nftId]], "Buyer has not approved.");
        require(address(this).balance >= purchasePrice[_nftId], "Not enough balance for sale.");

        isListed[_nftId] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success, "Transfer failed.");

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftId], _nftId);
    }

    function cancelSale(uint _nftId) public{
        require(msg.sender == seller || msg.sender == buyer[_nftId], "Only seller or buyer can call this function.");

        // if inspection not passed, refund money to buyer else send money to seller
        if(inspectionPassed[_nftId]) {
            payable(buyer[_nftId]).transfer(address(this).balance);
        }
        else{
            payable(seller).transfer(address(this).balance);
        }
    }
}