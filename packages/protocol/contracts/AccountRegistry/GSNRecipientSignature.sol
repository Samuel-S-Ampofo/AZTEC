pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol";

import "../libs/Modifiers.sol";

/**
 * @dev A xref:ROOT:gsn-strategies.adoc#gsn-strategies[GSN strategy] that allows relayed 
 * transactions through when they are accompanied by the signature of a trusted signer. 
 * The intent is for this signature to be generated by a server that performs validations 
 * off-chain. Note that nothing is charged to the user in this scheme. Thus, the server should make
 * sure to account for this in their economic and threat model.
 */
contract GSNRecipientSignature is Initializable, GSNRecipient, Modifiers {
    using ECDSA for bytes32;

    uint256 constant private RELAYED_CALL_REJECTED = 11;

    address private _trustedSigner;

    enum GSNRecipientSignatureErrorCodes {
        INVALID_SIGNER
    }

    /**
     * @dev Sets the trusted signer that is going to be producing signatures to approve relayed calls.
     */
    function initialize(address trustedSigner) internal initializer checkZeroAddress(trustedSigner) {
        _trustedSigner = trustedSigner;

        GSNRecipient.initialize();
    }

    /**
     * @dev Return this in acceptRelayedCall to impede execution of a relayed call. No fees will be charged.
     */
    function _rejectRelayedCall(uint256 errorCode, bytes memory context) internal pure returns (uint256, bytes memory) {
        return (RELAYED_CALL_REJECTED + errorCode, context);
    }

    /**
     * @dev Ensures that only transactions with a trusted signature can be relayed through the GSN.
     */
    function acceptRelayedCall(
        address relay,
        address from,
        bytes calldata encodedFunction,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 nonce,
        bytes calldata approvalData,
        uint256
    )
        external
        view
        returns (uint256, bytes memory context)
    {
        bytes memory blob = abi.encodePacked(
            relay,
            from,
            encodedFunction,
            transactionFee,
            gasPrice,
            gasLimit,
            nonce, // Prevents replays on RelayHub
            getHubAddr(), // Prevents replays in multiple RelayHubs
            address(this) // Prevents replays in multiple recipients
        );
        context = abi.encode(approvalData);
        if (keccak256(blob).toEthSignedMessageHash().recover(approvalData) == _trustedSigner) {
            return _approveRelayedCall(context);
        } else {
            return _rejectRelayedCall(uint256(GSNRecipientSignatureErrorCodes.INVALID_SIGNER), context);
        }
    }

    function _preRelayedCall(bytes memory) internal returns (bytes32) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function _postRelayedCall(bytes memory, bool, uint256, bytes32) internal {
        // solhint-disable-previous-line no-empty-blocks
    }
}
