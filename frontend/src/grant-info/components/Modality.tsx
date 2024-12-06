import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import buildingImage from '../../public/assets/EXPConstruct.png';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  color: 'blue',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const styleImage = {
    height: 300,
    width: 400,
  };

const styleAddButton = {

}

export default function Modality() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <button onClick={handleOpen} style={styleAddButton} className="add-grant-button">+</button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {'<<' + ' Out of order - Devs touching grass ' + '>>'}
          </Typography>
          <img style={styleImage} src={buildingImage}/>
        </Box>
      </Modal>
    </div>
  );
}