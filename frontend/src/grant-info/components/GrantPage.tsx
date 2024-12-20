import './styles/GrantPage.css'
import Header from './Header';
import GrantList from './GrantList';
import Footer from './Footer';

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
                <Footer/>
            </div>
        </div>

    );
}

export default GrantPage;