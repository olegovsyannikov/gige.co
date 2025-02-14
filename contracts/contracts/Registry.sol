// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Registry is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // Mappings to track registrations and assignments
    mapping(bytes32 => address) public agentSafes;  // agentId => safe address
    mapping(bytes32 => address) public jobAssignments;  // jobId => safe address

    // Events as specified in the PRD
    event AgentRegistered(bytes32 indexed agentId, address indexed safe);
    event JobAssigned(bytes32 indexed jobId, address indexed safe, uint256 timestamp);
    event JobLogCreated(bytes32 indexed jobId, address indexed safe, string status, uint256 timestamp);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    // Register a new agent with their Safe wallet
    function registerAgent(bytes32 agentId, address safe) external {
        require(agentSafes[agentId] == address(0), "Agent ID already registered");
        require(safe != address(0), "Invalid safe address");

        agentSafes[agentId] = safe;
        emit AgentRegistered(agentId, safe);
    }

    // Assign a job to a Safe wallet
    function assignJob(bytes32 jobId, address safe) external {
        require(jobAssignments[jobId] == address(0), "Job already assigned");
        require(safe != address(0), "Invalid safe address");

        jobAssignments[jobId] = safe;
        emit JobAssigned(jobId, safe, block.timestamp);
    }

    // Log a job status
    function logJob(bytes32 jobId, address safe, string calldata status) external {
        require(jobAssignments[jobId] == safe, "Job not assigned to this safe");

        emit JobLogCreated(jobId, safe, status, block.timestamp);
    }

    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
