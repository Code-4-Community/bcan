import React from 'react';
import Pagination from "./Pagination.js";
import './styles/Footer.css'

const Footer: React.FC = () => {
    return (
        <div className="footer">
            <div className="pagination-wrapper">
                <Pagination/>
            </div>
            <button className="add-grant-button">+</button>
        </div>
    )
}

export default Footer;