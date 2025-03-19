import './styles/GrantPage.css'
import Header from './Header';
import GrantList from './GrantList';
import { Button } from "@chakra-ui/react";
import {CreateNotificationPopup} from "./CreateNotificationPopup";
import { useState } from "react";


/**
 * Grant Page
 * @returns Header & GrantList mixed with <div>, <div/> html tags
 */
function GrantPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // handler to open modal
    const openModal = () => setIsModalOpen(true);
    // handler to close modal
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="grant-page">
            <div className="top-half">
                <Header/>
                <CreateNotificationPopup/>
            </div>
            <div className="bot-half">
                <div className="grant-list">
                    <GrantList/>
                </div>
            </div>
        </div>

    );
}

export default GrantPage;