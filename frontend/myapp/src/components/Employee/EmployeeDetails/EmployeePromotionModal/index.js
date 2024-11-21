import { Component } from "react";
import Modal from 'react-modal';
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';

import { BlueBtn } from "../../../Source/styledComponent";
import { InputWrapper, TextArea, Input } from "./styledComponent";

class EmployeePromotionModal extends Component{
    state = {
        employee_id: this.props.employee.employee_id,
        designation: this.props.employee.designation,
        department: this.props.employee.department,
        salary: this.props.employee.salary,
        promotion_date: '',
        remarks: '',
    }

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    onSubmitEmployeePromotion = async (event) => {
        event.preventDefault();  

        const {employee_id, designation, department, salary, promotion_date, remarks } = this.state;
        const pendingToast = toast.loading(`Promoting ${employee_id}...`);

        const promotionData = {
            designation,
            department,
            salary,
            promotion_date,
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
                body: JSON.stringify(promotionData),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/promote-employee/${employee_id}`, options);
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

            this.props.closeEmployeePromotionModal()
            this.props.handleEmployeePromoted();
            
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

    render(){
        const {isEmployeePromotionModalOpen, closeEmployeePromotionModal} = this.props
        const {designation, department, salary, promotion_date, remarks} = this.state

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

        return(
            <Modal
                isOpen={isEmployeePromotionModalOpen}
                onRequestClose={closeEmployeePromotionModal}
                style={customStyles}
                contentLabel="Employee Promotion Modal"
            >
                <form onSubmit={this.onSubmitEmployeePromotion}>
                    <InputWrapper>
                        <Input
                            type="text"
                            name="designation"
                            value={designation}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Designation</label>
                    </InputWrapper>

                    <br />

                    <InputWrapper>
                        <Input
                            type="text"
                            name="department"
                            value={department}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Department</label>
                    </InputWrapper>

                    <br />

                    <InputWrapper>
                        <Input
                            type="text"
                            name="salary"
                            value={salary}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Salary</label>
                    </InputWrapper>

                    <br />

                    <InputWrapper>
                        <Input
                            type="date"
                            name="promotion_date"
                            value={promotion_date}
                            onChange={this.handleChange}
                            required
                        />
                        <label>Promotion Date</label>
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
                    <BlueBtn type="submit">Promote Now</BlueBtn>
                    </div>
                </form>
            </Modal>

        )
    }
}

export default EmployeePromotionModal