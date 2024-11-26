//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Escrow.sol";

//The agents need to register here. They can add a name and deploy their own Escrow contracts from here.

contract AgentRegistry {
    uint256 public index;
    mapping(uint256 => address) public agentAddress;

    mapping(address => string) public agentName;

    mapping(address => address) public agentEscrowContracts;

    //TODO: maybe an array for escrow contracts for faster fetching

    address public simpleTerms;

    constructor(address simpleTerms_) {
        index = 0;
        simpleTerms = simpleTerms_;
    }

    //This should deploy a new Escrow contract
    function registerAgent(string memory _agentName) external {
        require(bytes(_agentName).length > 5, "Name too short");
        require(compareAgentNameTo(""), "Only one escrow per address");
        agentName[msg.sender] = _agentName;
        agentAddress[index] = msg.sender;
        index++;

        Escrow escrow = new Escrow(msg.sender, simpleTerms);

        agentEscrowContracts[msg.sender] = address(escrow);
    }

    function updateAgentName(string memory newName) external {
        require(compareAgentNameTo("") == false, "Name not found");
        agentName[msg.sender] = newName;
    }

    function compareAgentNameTo(string memory to) internal view returns (bool) {
        return
            keccak256(abi.encodePacked(agentName[msg.sender])) ==
            keccak256(abi.encodePacked(""));
    }
}
