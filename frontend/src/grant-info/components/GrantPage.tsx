import './styles/GrantPage.css'
import Header from './Header.js';
import GrantList from './GrantList.js';
import Footer from './Footer.js';
import BellButton from '../../Bell.js';
import '../../Bell.css'
import GrantSearch from './GrantSearch.js';


function GrantPage() {

    return (
        <div className="grant-page">
            <div className="top-half">
                <Header />
                <GrantSearch/>

            </div>
            <div className="bell-container">
                <BellButton />
            </div>
            <div className="bot-half">
                <div className="grant-list">
                    <GrantList />
                </div>
                <Footer />
            </div>
        </div>

    );
}

export default GrantPage;