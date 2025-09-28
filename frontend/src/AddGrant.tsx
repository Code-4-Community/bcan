import './grant-info/components/styles/GrantButton.css';

// TODO: Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <button className="grant-button add-grant-button" onClick={onClick}>
      + ADD
    </button>
  );
};

export default AddGrantButton;
