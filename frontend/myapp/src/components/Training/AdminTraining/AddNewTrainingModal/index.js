import { Component } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'

import AppContext from '../../../../Context/AppContext';
import { BlueBtn, FlexContainer } from '../../../Source/styledComponent';
import { InputWrapper, Input, SelectInput, TextArea } from './styledComponent';

class AddNewTrainingModal extends Component {
    state = {
        subject: '',
        startDate: '',
        endDate: '',
        trainer: '',
        hours: '',
        method: '',
        remarks: '',
    }

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    onSubmitAddNewTraining = async (event) => {
        event.preventDefault();  

        const { subject, startDate, endDate, trainer, hours, method, remarks } = this.state;
        const pendingToast = toast.loading(`Adding ${subject} Training ...`);

        const newTrainingData = {
            subject,
            trainer,
            startDate,
            endDate,
            hours,
            method,
            remarks
        };

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(newTrainingData),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/add-training`, options);
            const data = await response.json()

            if (!response.ok) {
                toast.update(pendingToast, {
                    render: data.failure,
                    type: "error",
                    isLoading: false,
                    autoClose: 4000,  
                });
                
                return
            }

            this.props.closeAddTrainingModal()
            this.props.handleTrainingAdded();
            
            toast.update(pendingToast, {
                render: data.success,
                type: "success",
                isLoading: false,
                autoClose: 4000, 
            });

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
        const { isAddTrainingModalOpen, closeAddTrainingModal } = this.props;
        const { subject, startDate, endDate, trainer, hours, method, remarks } = this.state;

        const customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(145deg, #a6cbee, #eaf4fc)',
            },
        };

        return (
            <Modal
                isOpen={isAddTrainingModalOpen}
                onRequestClose={closeAddTrainingModal}
                style={customStyles}
                contentLabel="Add New Program Modal"
            >
                <form onSubmit={this.onSubmitAddNewTraining}>
                    <InputWrapper>
                        <Input
                            type="text"
                            name="subject"
                            value={subject}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Subject</label>
                    </InputWrapper>

                    <FlexContainer>
                    <InputWrapper>
                        <Input
                            type="date"
                            name="startDate"
                            value={startDate}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Start Date</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={this.handleChange}
                            required
                        />
                        <label>End Date</label>
                    </InputWrapper>
                    </FlexContainer>

                    <InputWrapper>
                        <Input
                            type="number"
                            name="hours"
                            value={hours}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Duration in hours</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="text"
                            name="trainer"
                            value={trainer}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Trainer</label>
                    </InputWrapper>

                    <InputWrapper>
                        <SelectInput
                            name="method"
                            value={method}                       
                            onChange={this.handleChange}
                            required
                        >
                            <option value="" disabled>Select Training Method</option>
                            <option value="Online">Online</option>
                            <option value="In-person">In-person</option>
                            <option value="Hybrid">Hybrid</option>
                        </SelectInput>
                        <label>Training Method</label>
                    </InputWrapper>

                    <br />

                    <InputWrapper>
                        <TextArea
                        name="remarks"
                        value={remarks}
                        onChange={this.handleChange}
                        rows="3"
                    />
                        <label>Remarks</label>
                    </InputWrapper>
                    <br />
                    <div style={{textAlign: 'center'}}>
                    <BlueBtn type="submit">Add Program</BlueBtn>
                    </div>
                </form>
            </Modal>
        );
    }
}

AddNewTrainingModal.contextType = AppContext

export default AddNewTrainingModal;
