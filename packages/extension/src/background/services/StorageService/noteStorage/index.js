import dataKey from '~utils/dataKey';
import {
    fromAction,
    isDestroyed,
} from '~utils/noteStatus';
import noteModel from '~database/models/note';
import noteAccessModel from '~database/models/noteAccess';
import assetModel from '~database/models/asset';
import pushAssetValue from './pushAssetValue';
import removeAssetValue from './removeAssetValue';

const createOrUpdate = async (note) => {
    const {
        id,
        assetKey,
        ownerKey,
        action,
    } = note;

    const isOwner = note.account.id === note.owner.id;

    const model = isOwner
        ? noteModel
        : noteAccessModel;

    // TODO - decrypt value from note hash
    const value = 100;
    const status = fromAction(action);

    const newData = {
        ...note,
        value,
        status,
        asset: assetKey,
        owner: ownerKey,
    };

    const {
        data: prevData,
        storage: prevStorage,
        modified,
    } = await model.set(
        newData,
        {
            ignoreDuplicate: true,
        },
    );

    const {
        [id]: noteKey,
    } = prevData;
    const {
        [noteKey]: prevNoteData,
    } = prevData;
    const justCreated = modified.indexOf(id) >= 0;

    const promises = [];

    if (!justCreated) {
        const {
            [noteKey]: prevNoteStorage,
        } = prevStorage;
        const newNoteStorage = model.toStorageData(newData);
        const hasChanged = prevNoteStorage.length !== newNoteStorage.length
            || prevNoteStorage.some((v, i) => v !== newNoteStorage[i]);
        if (hasChanged) {
            promises.push(model.update(newData));
        }
    }


    const {
        status: prevStatus,
    } = prevNoteData;
    const isNoteDestroyed = isDestroyed(status);
    if (isOwner
        && (justCreated || status !== prevStatus)
    ) {
        promises.push(assetModel.update({
            key: assetKey,
            balance: (prevBalance) => {
                const ratio = isNoteDestroyed ? -1 : 1;
                return (prevBalance || 0) + (value * ratio);
            },
        }));

        const assetValueKey = dataKey('assetValue', {
            assetKey,
            value,
        });


        // TODO - don't push note that's been removed
        if (isNoteDestroyed) {
            promises.push(removeAssetValue(assetValueKey, noteKey));
        } else {
            promises.push(pushAssetValue(assetValueKey, noteKey));
        }
    }

    await Promise.all(promises);

    return {
        key: noteKey,
    };
};

export default {
    createOrUpdate,
};
