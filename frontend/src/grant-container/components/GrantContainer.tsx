import React from 'react';
import Header from './Header';
import Footer from './Footer';
import GrantList from './GrantList';
import GrantLabels from "./GrantLabels";

function GrantContainer() {
  return (
    <div className="GrantContainer">
      <Header/>
      <GrantList/>
      <Footer/>
    </div>
  );
}

export default GrantContainer;
