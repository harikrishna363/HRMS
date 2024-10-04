import React, { Component } from 'react';
import Cookies from "js-cookie"
import { BiError } from "react-icons/bi";
import { toast } from 'react-toastify';
import { MdOutlineArrowBackIosNew } from "react-icons/md";

import AppContext from '../../../Context/AppContext';
import Source from '../../Source';

import { BackButton, InputWrapper, Input, SelectInput, TextArea, 
    BlueBtn, AlignStartFlexContainer, Container, Title } from '../../Source/styledComponent';

class AddEmployeeForm extends Component {
  state = {
    employeeId: '',
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    phoneNumber: '',
    mail: '',
    educationLevel: '',
    hireDate: '',
    employeeType: '',
    jobTitle: '',
    designation: '',
    salary: '',
    department: '',
    manager: '',
    password: '',
    role: '',
    effectiveDate: '',
    joiningDate: '',
    remarks: ''
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = async event => {
    event.preventDefault();

    const pendingToast = toast.loading("Adding Employee...");

    const { ...formData } = this.state;

    try{
        const jwtToken = Cookies.get("jwt_token");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(formData),
        };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/add-employee-form`, options);
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

    toast.update(pendingToast, {
        render: data.success,
        type: "success",
        isLoading: false,
        autoClose: 4000,  
    });

    this.handleBackButtonClick()

    } catch (error) {
      toast.update(pendingToast, {
          render: "Network error. Please try again later.",
          type: "error",
          isLoading: false,
          autoClose: 4000,  
      });
  }
  };

  handleBackButtonClick = () => {
    this.props.history.goBack();
  };

  render() {
    const {role} = this.context

    if (role !== 'HR ADMIN' && role !== 'SUPER ADMIN'){
        return(
            <Source>
            <Container style={{flexDirection: 'column'}}>
                <BiError size={60} />
                <h2>Page Not Found</h2>
            </Container>
            </Source>
        )
    }

    return (
      <Source>
        <BackButton onClick={this.handleBackButtonClick}> <MdOutlineArrowBackIosNew size={20}/></BackButton>

        <Title style={{ marginTop: '0px'}}>Add Employee</Title>

        <form onSubmit={this.handleSubmit}>

        <InputWrapper>
            <Input
                type="text" 
                name="employeeId" 
                value={this.state.employeeId} 
                onChange={this.handleChange} 
                required
            />
            <label>Employee ID</label>
        </InputWrapper>

        <InputWrapper>
            <SelectInput
                name="role" 
                value={this.state.role}
                onChange={this.handleChange}
                required
            >
                <option value="" disabled>Select Role</option>
                <option value="HR ADMIN">HR Admin</option>
                <option value="FINANCE ADMIN">Finance Admin</option>
                <option value="USER">User</option>
            </SelectInput>
            <label>Role</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name="firstName" 
                value={this.state.firstName} 
                onChange={this.handleChange} 
                required
            />
            <label>First Name</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name="lastName" 
                value={this.state.lastName} 
                onChange={this.handleChange} 
                required
            />
            <label>Last Name</label>
        </InputWrapper>

        <InputWrapper>
            <SelectInput
                name="gender" 
                value={this.state.gender} 
                onChange={this.handleChange} 
                required
            >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </SelectInput>
            <label>Gender</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="date"
                name="dob"
                value={this.state.dob}
                onChange={this.handleChange}
                required
            />
            <label>Date of Birth</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name='mail' 
                value={this.state.mail}
                onChange={this.handleChange} 
                required
            />
            <label>Email</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name="phoneNumber" 
                value={this.state.phoneNumber} 
                onChange={this.handleChange} 
                required
            />
            <label>Phone Number</label>
        </InputWrapper>

        <InputWrapper>
            <SelectInput
                name="employeeType" 
                value={this.state.employeeType} 
                onChange={this.handleChange} 
                required
            >
                <option value="">Select Type</option>
                <option value="Regular">Regular</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Consultant">Consultant</option>
                <option value="Intern">Intern</option>
                <option value="Other">Other</option>
            </SelectInput>
            <label>Employee Type</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name="educationLevel" 
                value={this.state.educationLevel} 
                onChange={this.handleChange} 
                required
            />
            <label>Educational Level</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name="jobTitle" 
                value={this.state.jobTitle} 
                onChange={this.handleChange} 
                required
            />
            <label>Job Title</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name="designation" 
                value={this.state.designation} 
                onChange={this.handleChange} 
                required
            />
            <label>Designation</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="date" 
                name="hireDate" 
                value={this.state.hireDate} 
                onChange={this.handleChange} 
                required
            />
            <label>Hire Date</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name="salary" 
                value={this.state.salary} 
                onChange={this.handleChange} 
                required
            />
            <label>Salary</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name='department' 
                value={this.state.department}
                onChange={this.handleChange} 
                required
            />
            <label>Department</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="text" 
                name='manager' 
                value={this.state.manager}
                onChange={this.handleChange} 
                required
            />
            <label>Manager</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="date" 
                name="effectiveDate" 
                value={this.state.effectiveDate} 
                onChange={this.handleChange} 
                required
            />
            <label>Effective Date</label>
        </InputWrapper>

        <InputWrapper>
            <Input
                type="date" 
                name="joiningDate" 
                value={this.state.joiningDate} 
                onChange={this.handleChange} 
                required
            />
            <label>Joining Date</label>
        </InputWrapper>

        <AlignStartFlexContainer >
        <InputWrapper>
            <Input
                type="text" 
                name="password" 
                value={this.state.password} 
                onChange={this.handleChange} 
                required
            />
            <label>Password</label>
        </InputWrapper>

        <InputWrapper>
            <TextArea
            name="remarks" 
            value={this.state.remarks}
            onChange={this.handleChange}                    
            rows="3"
            />
            <label>Remarks</label>
        </InputWrapper>
        </AlignStartFlexContainer>

        <div style={{textAlign: 'center'}}>
          <BlueBtn type='submit'>
            Add
          </BlueBtn>
        </div>
        </form>
      
      </Source>
      
    );
  }
}

AddEmployeeForm.contextType = AppContext

export default AddEmployeeForm;
