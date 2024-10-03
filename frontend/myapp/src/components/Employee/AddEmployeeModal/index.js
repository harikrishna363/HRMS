import React from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

import { BlueBtn, FlexContainer, Title } from '../../Source/styledComponent';

class AddEmployeeModal extends React.Component {

  render() {
    const { showModal, handleClose } = this.props;
    if (!showModal) return null;

    const customStyles = {
      content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh', 
          overflowY: 'auto',
          background: 'linear-gradient(145deg, #a6cbee, #eaf4fc)',
      },
    };

    return (

      <Modal
        isOpen={showModal}
        onRequestClose={handleClose}
        style={customStyles}
        contentLabel="Example Modal"
      >
          <Title>Add Employee Via</Title>
          <FlexContainer>
            <Link to="/add-employee-form">
              <BlueBtn>Form</BlueBtn>
            </Link>
            <Link to="/add-employee-csv">
              <BlueBtn >CSV</BlueBtn>
            </Link>
          </FlexContainer>

      </Modal>
      
    );
  }
}

export default AddEmployeeModal;
