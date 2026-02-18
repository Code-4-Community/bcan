import '../styles/GrantButton.css';

// TODO: Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <button className="add-grant-button bg-white rounded-full" onClick={onClick}>
      +
    </button>
  );
};

export default AddGrantButton;
