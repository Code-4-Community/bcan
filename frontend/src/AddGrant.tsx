import './grant-info/components/styles/AddGrantButton.css';

// TODO: Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <button className="add-grant-button" onClick={onClick}>
      + ADD
    </button>
  );
};

export default AddGrantButton;
