import { Component } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'
import {format} from 'date-fns'
import AppContext from '../../../../Context/AppContext';
import { Input, SelectInput, TextArea, InputWrapper } from './styledComponent';
import { BlueBtn, FlexContainer } from '../../../Source/styledComponent';

class ApplyLeaveModal extends Component {
    state = {
        leaveType: '',
        startDate: '',
        endDate: '',
        leaveReason: '',
        singleDayLeave: false,
    }

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value }, () => {
            // If single day leave is checked, keep endDate same as startDate
            if (this.state.singleDayLeave && name === 'startDate') {
                this.setState({ endDate: value });
            }
        });
    };

    handleSingleDayLeaveToggle = () => {
        this.setState(prevState => {
            const singleDayLeave = !prevState.singleDayLeave;
            const endDate = singleDayLeave ? prevState.startDate : prevState.endDate;
            return { singleDayLeave, endDate };
        });
    };

    onSubmitApplyLeave = async (event) => {
        event.preventDefault();  
        const { leaveType, startDate, endDate, leaveReason } = this.state;
        const currentDate = format(new Date(), 'yyyy-MM-dd');

        if (startDate < currentDate) {
            toast.error('Enter Valid Start Date')
            return
        } else if (endDate < startDate) {
            toast.error('Enter Valid Dates')
            return
        }

        const pendingToast = toast.loading(`Requesting Leave...`);

        const {employeeId} = this.context

        const leaveData = {
            employeeId,
            leaveType,
            startDate,
            endDate,
            leaveReason
        };

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(leaveData),
            };

            const response = await fetch('http://localhost:4000/apply-leave', options);
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

            this.props.closeApplyLeaveModal()
            this.props.handleLeaveRequested();

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
        const { applyLeaveModalIsOpen, closeApplyLeaveModal } = this.props;
        const { leaveType, startDate, endDate, leaveReason, singleDayLeave } = this.state;

        const customStyles = {
            content: {
                width: '30%',
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
                isOpen={applyLeaveModalIsOpen}
                onRequestClose={closeApplyLeaveModal}
                style={customStyles}
                contentLabel="Apply Leave Modal"
            >
                <form onSubmit={this.onSubmitApplyLeave}>
                <InputWrapper>
                        <SelectInput
                            name="leaveType"
                            value={leaveType}                       
                            onChange={this.handleChange}
                            required
                        >
                            <option value="" disabled>Select Leave Type</option>
                            <option value="Casual">Casual</option>
                            <option value="Sick">Sick</option>
                            <option value="Other">Other</option>
                        </SelectInput>
                        <label>Leave Type</label>
                    </InputWrapper>
                    <br />

                    <label style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '20px'}}>
                        <input
                            type='checkbox'
                            checked={singleDayLeave}
                            onChange={this.handleSingleDayLeaveToggle}
                        /> Single Day Leave
                    </label>
                    

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
                            disabled={singleDayLeave}
                            required
                        />
                        <label>End Date</label>
                    </InputWrapper>
                    </FlexContainer>

                    <InputWrapper>
                        <TextArea
                        name="leaveReason"
                        value={leaveReason}
                        onChange={this.handleChange}
                        rows="5"
                        placeholder='Enter reason here'
                        required
                    />
                        <label>Reason</label>
                    </InputWrapper>

                    <br />
                    <div style={{textAlign: 'center'}}>
                        <BlueBtn type="submit">Apply for Leave</BlueBtn>
                    </div>
                </form>
            </Modal>
        );
    }
}

ApplyLeaveModal.contextType = AppContext

export default ApplyLeaveModal;
