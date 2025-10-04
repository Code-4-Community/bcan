import React from 'react';
import '../styles/Footer.css'
import { Group, Text } from '@chakra-ui/react';
import { FooterText } from '../translations/general';

const Footer: React.FC = () => {
    return (
        <div className="footer">
{
    /* TODO: Add BCAN Quick Links
            <div className="bcan-link">
            <Text>
                <a href="https://bostonclimateaction.org/">
                bostonclimateaction website
                </a>
            </Text>
            </div>
    */
}
            <Group className="text-block">
                <Text>
                {FooterText.Motto}
                </Text>
                <Text className="northeastern-uni-caption">
                {FooterText.NEU}
                </Text>
            </Group>
            </div>
    )
}

export default Footer;