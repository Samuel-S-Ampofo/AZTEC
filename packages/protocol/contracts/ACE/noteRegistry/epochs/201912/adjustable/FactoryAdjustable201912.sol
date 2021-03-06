pragma solidity >=0.5.0 <0.6.0;

import "../../../interfaces/NoteRegistryFactory.sol";
import "./BehaviourAdjustable201912.sol";

/**
  * @title FactoryAdjustable201912
  * @author AZTEC
  * @dev Deploys a BehaviourAdjustable201912
  * Copyright Spilsbury Holdings Ltd 2019. All rights reserved.
 **/
contract FactoryAdjustable201912 is NoteRegistryFactory {
    constructor(address _aceAddress) public NoteRegistryFactory(_aceAddress) {}

    function deployNewBehaviourInstance()
        public
        onlyOwner
        returns (address)
    {
        BehaviourAdjustable201912 behaviourContract = new BehaviourAdjustable201912();
        emit NoteRegistryDeployed(address(behaviourContract));
        return address(behaviourContract);
    }
}
