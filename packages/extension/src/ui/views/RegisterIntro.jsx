import React from 'react';
import PropTypes from 'prop-types';
import {
    Block,
    Text,
} from '@aztec/guacamole-ui';
import i18n from '~ui/helpers/i18n';
import router from '~ui/helpers/router';
import PopupContent from '~ui/components/PopupContent';

const Intro = () => {
    const descriptionNodes = [];
    for (let i = 0; i < 10; i += 1) {
        const textKey = `register.intro.description.para${i}`;
        if (!i18n.has(textKey)) break;

        descriptionNodes.push((
            <Block
                key={`para${i}`}
                padding="l 0"
            >
                <Text
                    text={i18n.t(textKey)}
                    size="xs"
                    color="default"
                    weight={i === 1 ? 'semibold' : 'light'}
                />
            </Block>
        ));
    }

    return (
        <PopupContent
            theme="white"
            footerLink={{
                text: i18n.t('account.restore.fromSeedPhrase'),
                href: router.u('account.restore'),
            }}
        >
            {descriptionNodes}
        </PopupContent>
    );
};

Intro.propTypes = {};

Intro.defaultProps = {};

export default Intro;