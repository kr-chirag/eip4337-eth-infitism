// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "accountabstraction/contracts/core/BaseAccount.sol";
import "accountabstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MySmartWallet is BaseAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 constant SIG_VALIDATION_FAILED = 1;

    IEntryPoint private _entryPoint;
    address private _owner;

    constructor(address admin_, address entryPoint_) {
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
            return SIG_VALIDATION_FAILED;
        }
        return 0;
    }

    receive() external payable {}

    function withdraw() public {
        require(msg.sender == _owner);
        _entryPoint.withdrawTo(
            payable(_owner),
            _entryPoint.balanceOf(address(this))
        );
        payable(_owner).transfer(address(this).balance);
    }
}
