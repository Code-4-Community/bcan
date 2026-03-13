import Button from '../../../components/Button.tsx';

// TODO: Fix 'any' typing here
const AddGrantButton = ({ onClick } : any) => {

  return (
    <Button text= "+ Add" className="bg-primary-900 text-white rounded-full border-2 border-solid" onClick={onClick} />
  );
};

export default AddGrantButton;
