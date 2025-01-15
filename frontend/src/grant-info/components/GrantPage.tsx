import './styles/GrantPage.css'
import Header from './Header';
import GrantList from './GrantList';

/**
 * Grant Page
 * @returns Header & GrantList mixed with <div>, <div/> html tags
 */
function GrantPage() {

    return (
        <div className="grant-page">
            <div className="top-half">
                <Header/>
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