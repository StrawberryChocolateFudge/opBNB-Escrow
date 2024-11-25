//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//TODO: Terms don't have URL, it should be baked into the application!

// TODO: So there should be the current terms and previously accepted terms
//TODO: the API should not break tho

contract SimpleTerms {
    event NewTerms(bytes32 termshash);
    event NewParticipant(address indexed participant);

    address public issuer;

    bytes32 private termsHash;

    // The key here is the hash from the terms hashed with the agreeing address.
    mapping(bytes32 => Participant) private agreements;

    // The participant any wallet that accepts the terms.
    struct Participant {
        bool signed;
    }

    constructor() {
        issuer = msg.sender;
    }

    /* The setTerms allows an issuer to add new Term to their contract

       Error code 901: "Only the deployer can call this." 
    */
    function setTerms(bytes32 value)
        external
        returns (bool)
    {
        require(msg.sender == issuer, "901");
    
        termsHash = value;

        emit NewTerms(value);
        return true;
    }

    /* The accept function is called when a user accepts an agreement represented by the hash
    
       Error code 902: "Invalid terms."
    */
    function accept(bytes32 value) external {
        require(
            value == termsHash,
            "902"
        );
        bytes32 access = keccak256(abi.encodePacked(msg.sender, value));
        agreements[access] = Participant({signed: true});
        emit NewParticipant(msg.sender);
    }

    // We can check if an address accepted the current terms or not
    function acceptedTerms(address _address) external view returns (bool) {
        bytes32 access = keccak256(abi.encodePacked(_address, termsHash));
        return agreements[access].signed;
    }

    /* The modifier allows a contract inheriting from this, to controll access easily based on agreement signing.
      
       Error code 903: "You must accept the terms first."
    */
    modifier checkAcceptance() {
        bytes32 access = keccak256(abi.encodePacked(msg.sender, termsHash));
        require(agreements[access].signed, "903");
        _;
    }
}
