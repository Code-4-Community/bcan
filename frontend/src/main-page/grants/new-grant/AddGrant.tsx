import '../styles/GrantButton.css';
import Button from '../../settings/components/Button.tsx';

// TODO: Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <button className="add-grant-button bg-white rounded-full" onClick={onClick}>
      +
    </button>
  );
};

export default AddGrantButton;
