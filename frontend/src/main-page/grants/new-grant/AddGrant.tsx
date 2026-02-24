import Button from '../../../components/Button.tsx';

// TODO: Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <Button text= "+ Add" className="bg-white rounded-full border-2 border-grey-500 border-solid" onClick={onClick} />
  );
};

export default AddGrantButton;
