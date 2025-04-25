// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "accountabstraction/contracts/core/BaseAccount.sol";
import "accountabstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract MySmartWallet is Initializable, BaseAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 constant SIG_VALIDATION_FAILED = 1;

    IEntryPoint private _entryPoint;
    address private _owner;

    function initialize(
        address admin_,
        address entryPoint_
    ) public initializer {
        _owner = admin_;
        _entryPoint = IEntryPoint(entryPoint_);
    }

    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 ethSigned = userOpHash.toEthSignedMessageHash();
        address recovered = ethSigned.recover(userOp.signature);
        if (recovered != _owner) {
            console.log("_validateSignature returned SIG_VALIDATION_FAILED");
            return SIG_VALIDATION_FAILED;
        }
        console.log("_validateSignature returned 0");
        return 0;
    }

    function withdraw() public {
        require(msg.sender == _owner);
        _entryPoint.withdrawTo(
            payable(_owner),
            _entryPoint.balanceOf(address(this))
        );
        payable(_owner).transfer(address(this).balance);
    }

    receive() external payable {
        // console.log("receive");
    }

    function _payPrefund(
        uint256 missingAccountFunds
    ) internal virtual override {
        console.log("missingAccountFunds: %d", missingAccountFunds);
        if (missingAccountFunds != 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds
            }("");
            (success);
            console.log("missingAccountFunds: %d", success);
            // Ignore failure (its EntryPoint's job to verify, not account.)
        }
    }
}
