import './grant-info/components/styles/AddGrantButton.css';

// Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <button className="add-grant-button" onClick={onClick}>
      + ADD
    </button>
  );
};

export default AddGrantButton;
