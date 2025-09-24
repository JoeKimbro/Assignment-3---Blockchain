// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CampusCreditV2
 * @dev ERC-20 token with capping, pausing, role-based access, and batch airdrop
 */
contract CampusCreditV2 is ERC20, ERC20Burnable, ERC20Capped, ERC20Pausable, AccessControl {
    // Role definitions (required)
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Custom errors (required)
    error ArrayLengthMismatch();
    error CapExceeded();

    /**
     * @dev Constructor with exact parameter semantics required
     * @param name_ Token name
     * @param symbol_ Token symbol  
     * @param cap_ Maximum supply in wei (18 decimal units)
     * @param initialReceiver Address to receive initial mint
     * @param initialMint Amount to mint initially in wei (18 decimal units)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_,
        address initialReceiver,
        uint256 initialMint
    ) ERC20(name_, symbol_) ERC20Capped(cap_) {
        // Grant all roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        // Initial mint if specified
        if (initialMint > 0) {
            _mint(initialReceiver, initialMint);
        }
    }

    /**
     * @dev Pause transfers (PAUSER_ROLE only)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause transfers (PAUSER_ROLE only)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Mint tokens (MINTER_ROLE only)
     * @param to Recipient address
     * @param amount Amount in wei
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Batch airdrop with gas optimization (MINTER_ROLE only)
     * @param to Array of recipient addresses
     * @param amounts Array of amounts in wei
     */
    function airdrop(address[] calldata to, uint256[] calldata amounts) 
        external onlyRole(MINTER_ROLE) 
    {
        // Revert if array lengths differ
        if (to.length != amounts.length) revert ArrayLengthMismatch();
        
        uint256 len = to.length;
        uint256 totalAmount;
        
        // Calculate total amount first
        for (uint256 i = 0; i < len; ) {
            totalAmount += amounts[i];
            unchecked { ++i; }
        }
        
        // Check cap before any minting
        if (totalSupply() + totalAmount > cap()) revert CapExceeded();
        
        // Execute all mints
        for (uint256 j = 0; j < len; ) {
            _mint(to[j], amounts[j]);
            unchecked { ++j; }
        }
    }

    /**
     * @dev Required override for multiple inheritance
     */
    function _update(address from, address to, uint256 value) 
        internal override(ERC20, ERC20Pausable, ERC20Capped) 
    {
        super._update(from, to, value);
    }
}