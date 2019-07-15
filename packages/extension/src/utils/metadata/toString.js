import config from '~config/metadata';

export default function toString(metadataObj) {
    const lenVars = [];
    const metadata = {};
    config.forEach(({
        name,
        length,
    }) => {
        let data = '';
        if (metadataObj[name] !== undefined) {
            data = Array.isArray(metadataObj[name])
                ? metadataObj[name].join('')
                : `${metadataObj[name]}`;
        }
        if (typeof length === 'string') {
            lenVars.push(length);
            metadata[length] = data.length;
        }
        metadata[name] = data;
    });

    const str = config
        .map(({
            name,
            length,
        }) => {
            const data = lenVars.indexOf(name) >= 0
                ? metadata[name].toString(16)
                : metadata[name];
            const len = typeof length === 'number'
                ? length
                : metadata[length];
            return `${data}`.padStart(len, '0');
        })
        .join('');

    return `0x${str}`;
}