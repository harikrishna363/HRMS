import { Component } from "react";
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'

import { FormContainer,TextArea, Input, SubmitButton } from "./styledComponent";
import { Title } from "../../Source/styledComponent";

class AddTemplateModal extends Component {
    state = {
        name: '',
        subject: '',
        text: '',
        html: '',
      };
  
    handleChange = (e) => {
      this.setState({ [e.target.name]: e.target.value });
    };
  
    handleSubmit = async (e) => {
      e.preventDefault();

      const {name, subject, text, html} = this.state;

      const pendingToast = toast.loading(`Adding ${name} Template ...`);
  
      try {
        const jwtToken = Cookies.get("jwt_token");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({name, subject, text, html}),
        };

        const response = await fetch('http://localhost:4000/add-mail-template', options);
        const data = await response.json()

        if (!response.ok) {
          toast.update(pendingToast, {
              render: data.failure,
              type: "error",
              isLoading: false,
              autoClose: 4000,  
          });

            this.props.closeAddTemplateModal();
            this.props.handleTemplateAdded();

          return
      }

      toast.update(pendingToast, {
          render: data.success,
          type: "success",
          isLoading: false,
          autoClose: 4000, 
      });

        this.props.closeAddTemplateModal();
        this.props.handleTemplateAdded();
  
      } catch (error) {
        toast.update(pendingToast, {
            render: "Network error. Please try again later.",
            type: "error",
            isLoading: false,
            autoClose: 4000, 
        });        
    }
    };
  
    render() {
      const { isAddTemplateModalOpen, closeAddTemplateModal } = this.props;
      const {name, subject, text, html} = this.state;

      const customStyles = {
        content: {
            width: '60%',
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
          isOpen={isAddTemplateModalOpen}
          onRequestClose={closeAddTemplateModal}
          style={customStyles}
          >
          <FormContainer>
            <Title style={{marginTop:'0px', textAlign: 'center'}}>Add Mail Template</Title>
            <form onSubmit={this.handleSubmit} style={{display: 'flex', flexDirection: 'column'}}>
              <Input
                type="text"
                name="name"
                value={name}
                onChange={this.handleChange}
                placeholder="Name"
                required
              />
              <TextArea
                name="subject"
                value={subject}
                onChange={this.handleChange}
                placeholder="Subject"
                rows="1"
              />
              <TextArea
                name="text"
                value={text}
                onChange={this.handleChange}
                placeholder="Text"
                rows="8"
              />
              <TextArea
                name="html"
                value={html}
                onChange={this.handleChange}
                placeholder="Html"
                rows="8"
              />
              <SubmitButton type="submit">Add Template</SubmitButton>
            </form>
          </FormContainer>
        </Modal>
      );
    }
  }
  
  export default AddTemplateModal;