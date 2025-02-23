import "./styles/GrantPage.css";
import Header from "./Header";
import GrantList from "./GrantList.js";
import Footer from "./Footer.js";
import BellButton from "../../Bell.js";
import "../../Bell.css";

function GrantPage() {
  return (
    <div className="grant-page p-5 bg-tan">
      <div className="top-half">
        <Header />
      </div>
      <div className="bell-container">
        <BellButton />
      </div>
      <div className="bot-half">
        <div className="">
          <GrantList />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default GrantPage;
