import React from 'react';
import './styles/Footer.css'
import Modality from './Modality';

const Footer: React.FC = () => {
    return (
        <div className="footer">
            { /* <button className="add-grant-button">+</button> */ }
            <Modality/>
        </div>
    )
}

export default Footer;