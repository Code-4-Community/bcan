import '../styles/GrantButton.css';

// TODO: Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <button className="grant-button add-grant-button bg-medium-orange" onClick={onClick}>
      + ADD
    </button>
  );
};

export default AddGrantButton;
