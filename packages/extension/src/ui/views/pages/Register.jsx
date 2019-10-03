import React from 'react';
import PropTypes from 'prop-types';
import { KeyStore } from '~utils/keyvault';
import closeWindow from '~ui/utils/closeWindow';
import CombinedViews from '~ui/views/handlers/CombinedViews';
import Intro from '../RegisterIntro';
import BackupKeys from '../BackupKeys';
import ConfirmBackupKeys from '../ConfirmBackupKeys';
import CreatePassword from '../CreatePassword';
import RegisterAddress from '../RegisterAddress';

const Steps = [
    Intro,
    BackupKeys,
    ConfirmBackupKeys,
    CreatePassword,
    RegisterAddress,
];

const handleGoBack = (step, prevData) => {
    let data = prevData;
    switch (step) {
        case 1: {
            data = { ...data };
            delete data.seedPhrase;
            break;
        }
        case 3: {
            data = {
                ...data,
                stepOffset: 2,
            };
            break;
        }
        default:
    }

    return data;
};

const handleGoNext = (step, prevData) => {
    let data = prevData;
    switch (step) {
        case 0: {
            data = {
                ...data,
                seedPhrase: KeyStore.generateRandomSeed(Date.now().toString()),
            };
            break;
        }
        default:
    }

    return data;
};

const Register = ({
    address,
    requestId,
}) => (
    <CombinedViews
        Steps={Steps}
        initialData={{
            address,
            requestId,
        }}
        onGoBack={handleGoBack}
        onGoNext={handleGoNext}
        onExit={() => closeWindow(1000)}
    />
);

Register.propTypes = {
    requestId: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
};

export default Register;