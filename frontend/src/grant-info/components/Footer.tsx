import React from 'react';
import './styles/Footer.css'
import { Group, Text } from '@chakra-ui/react';
import { FooterText } from '../../translations/general';

const Footer: React.FC = () => {
    return (
        <div className="footer">
            <Group>
                <Text>
                {FooterText.Motto}
                </Text>
            </Group>
            </div>
    )
}

export default Footer;