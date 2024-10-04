import { Component } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import styled from "styled-components";
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'

import AppContext from "../../../Context/AppContext";
import Source from "../../Source";
import { BackButton, CancelButton, Container, FlexContainer, Input,
     InputWrapper, RetryBtn, SaveButton, SelectInput, TextArea, 
     Title} from "../../Source/styledComponent";

const PhotographContainer = styled.div`
    width: 16%;
    border-radius: 7px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    border: 2px solid #ddd;
    margin-bottom: 15px;
`

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class EmployeeDetails extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        employeeDetails: {},
        originalEmployeeDetails: {},
        isEdited: false,
        departments: [],
        managers: [],
        previewPhoto: null,
        employeeId: this.props.match.params.employeeId,
    }

    componentDidMount() {
        this.fetcEmployeeDetails()
    }

    fetcEmployeeDetails = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const {employeeId} = this.state

        try{
            const jwtToken = Cookies.get("jwt_token")
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/${employeeId}`, options)

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json()

            this.setState({
                employeeDetails: data,
                originalEmployeeDetails: data,
                previewPhoto: data.photograph ? `data:image/jpeg;base64,${data.photograph}` : null,
                apiStatus: apiStatusConstants.success,
            });
        } catch (error) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
        
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            employeeDetails: {
                ...prevState.employeeDetails,
                [name]: value
            },
            isEdited: true 
        }));
    }

    handleSaveChanges = async () => {
        const { employeeDetails } = this.state;
        const pendingToast = toast.loading(`Saving Changes for ${employeeDetails.employee_id}...`);

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(employeeDetails),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-employee/${employeeDetails.employee_id}`, options);
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

            this.setState({isEdited: false})

            toast.update(pendingToast, {
                render: data.success,
                type: "success",
                isLoading: false,
                autoClose: 4000, 
            });

            this.fetchData();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
                hideProgressBar:false 
            });        
        }
    }

    handleCancelChanges = () => {
        this.setState((prevState) => ({
            employeeDetails: prevState.originalEmployeeDetails,
            isEdited: false, 
        }));
    };

    handleBackButtonClick = () => {
        this.props.history.goBack();
    };

    render(){
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

        if (this.state.apiStatus === apiStatusConstants.loading) {
            return (
                <Source>
                    <Container>
                    <Oval
                        visible={true}
                        height="40"
                        width="40"
                        color="#3498DB"
                        secondaryColor="#3498DB"
                        ariaLabel="oval-loading"
                    />
                    </Container>
                </Source>
                
            )
        }

        if (this.state.apiStatus === apiStatusConstants.failure) {
            return (
                <Source>
                    <Container style={{flexDirection: 'column'}}>
                        <BiError size={60} />
                        <h2>Error Loading Page</h2>
                        <RetryBtn onClick={this.fetchData}>Retry</RetryBtn>
                    </Container>
                </Source>
                
            )
        }

        const {employeeDetails, isEdited, previewPhoto} = this.state

        return(
            <Source>
                <BackButton onClick={this.handleBackButtonClick}> <MdOutlineArrowBackIosNew size={20}/></BackButton>

                <Title style={{marginTop: '0px'}}>Employee Details</Title>

                <PhotographContainer >
                    <div
                        style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "7px",
                            overflow: "hidden",
                            border: "1px solid #ddd",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {previewPhoto ? (
                            <img
                                src={previewPhoto}
                                alt="Profile Preview"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{ color: "#aaa" }}>No Photo</div>
                        )}
                    </div>

                    
                </PhotographContainer>

                <InputWrapper>
                    <Input
                        type="text"
                        name="employee_id"
                        value={employeeDetails.employee_id}
                        readOnly
                    />
                    <label>ID</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        name="role_name"
                        value={employeeDetails.role_name}
                        onChange={this.handleInputChange}
                    >
                        <option value="HR ADMIN">HR Admin</option>
                        <option value="FINANCE ADMIN">Finance Admin</option>
                        <option value="USER">User</option>
                    </SelectInput>
                    <label>Role</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="status"
                        value={employeeDetails.status}
                        onChange={this.handleInputChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </SelectInput>
                    <label>Status</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="first_name"
                        value={employeeDetails.first_name || " "}
                        onChange={this.handleInputChange}                    
                    />
                    <label>First Name</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="last_name"
                        value={employeeDetails.last_name || " "}
                        onChange={this.handleInputChange}
                    />
                    <label>Last Name</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="gender"
                        value={employeeDetails.gender}
                        onChange={this.handleInputChange}
                    />
                    <label>Gender</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="dob"
                        value={employeeDetails.dob}
                        onChange={this.handleInputChange}
                    />
                    <label>Date of Birth</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="email"
                        value={employeeDetails.email || " "}
                        onChange={this.handleInputChange}
                    />
                    <label>Email</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="phone_number"
                        value={employeeDetails.phone_number}
                        onChange={this.handleInputChange}
                    />
                    <label>Phone Number</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="employee_type"
                        value={employeeDetails.employee_type}
                        onChange={this.handleInputChange}
                    >
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
                        name="education_level"
                        value={employeeDetails.education_level}
                        onChange={this.handleInputChange}
                    />
                    <label>Education Level</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="job_title"
                        value={employeeDetails.job_title}
                        onChange={this.handleInputChange}
                    />
                    <label>Job Title</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="designation"
                        value={employeeDetails.designation}
                        onChange={this.handleInputChange}
                    />
                    <label>Designation</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="hire_date"
                        value={employeeDetails.hire_date}
                        onChange={this.handleInputChange}
                    />
                    <label>Hire Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="salary"
                        value={employeeDetails.salary}
                        onChange={this.handleInputChange}
                    />
                    <label>Salary</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="department"
                        value={employeeDetails.department}
                        onChange={this.handleInputChange}
                    />
                    <label>Department</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="manager"
                        value={employeeDetails.manager}
                        onChange={this.handleInputChange}
                    />
                    <label>Manager</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="effective_date"
                        value={employeeDetails.effective_date}
                        onChange={this.handleInputChange}
                    />
                    <label>Effective Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="joining_date"
                        value={employeeDetails.joining_date}
                        onChange={this.handleInputChange}
                    />
                    <label>joining Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="resignation_date"
                        value={employeeDetails.resignation_date}
                        onChange={this.handleInputChange}
                    />
                    <label>Resignation Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="relieving_date"
                        value={employeeDetails.relieving_date}
                        onChange={this.handleInputChange}
                    />
                    <label>Relieving Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="personal_email"
                        value={employeeDetails.personal_email}
                        onChange={this.handleInputChange}
                    />
                    <label>Personal Email</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="mother_tongue"
                        value={employeeDetails.mother_tongue}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Mother Tongue</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="educational_background"
                        value={employeeDetails.educational_background}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Educational Background</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="hobbies"
                        value={employeeDetails.hobbies}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Hobbies</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="anniversary_date"
                        value={employeeDetails.anniversary_date}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Anniversary Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="blood_type"
                        value={employeeDetails.blood_type}
                        onChange={this.handleInputChange}
                    />
                    <label>Blood Type</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="current_residential_address"
                    value={employeeDetails.current_residential_address}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Current Address</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="permanent_residential_address"
                    value={employeeDetails.permanent_residential_address}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Permanent Address</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="special_certifications"
                    value={employeeDetails.special_certifications}
                    onChange={this.handleInputChange}                    
                    rows="3"
                />
                    <label>Special Certifications</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="location"
                        value={employeeDetails.location}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Location</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="pan_number"
                        value={employeeDetails.pan_number}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Pan Number</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="marital_status"
                        value={employeeDetails.marital_status}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Marital Status</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="spouse_name"
                        value={employeeDetails.spouse_name}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Spouse Name</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="children"
                        value={employeeDetails.children}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Children</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="emergency_contact"
                        value={employeeDetails.emergency_contact}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Emergency Contact</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="relation_with_contact"
                        value={employeeDetails.relation_with_contact}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Relation With Contact</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="cv"
                        value={employeeDetails.cv || " "}
                        onClick={this.handleLinkClick}    
                        style={{ cursor: 'pointer' }}
                        onChange={this.handleInputChange}
                    />
                    <label>CV</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="aadhar_card"
                        value={employeeDetails.aadhar_card || " "}
                        onClick={this.handleLinkClick}    
                        style={{ cursor: 'pointer' }}
                        onChange={this.handleInputChange}
                    />
                    <label>Aadhar Card</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="pan_card"
                        value={employeeDetails.pan_card || " "}
                        onClick={this.handleLinkClick}    
                        style={{ cursor: 'pointer' }}
                        onChange={this.handleInputChange}
                    />
                    <label>Pan Card</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="address_proof"
                        value={employeeDetails.address_proof || " "}
                        onClick={this.handleLinkClick}    
                        style={{ cursor: 'pointer' }}
                        onChange={this.handleInputChange}
                    />
                    <label>Address Proof</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="passport_copy"
                        value={employeeDetails.passport_copy || " "}
                        onClick={this.handleLinkClick}    
                        style={{ cursor: 'pointer' }}
                        onChange={this.handleInputChange}
                    />
                    <label>Passport Copy</label>
                </InputWrapper>

                <div style={{display: 'flex', alignItems: 'flex-start'}}>

                <InputWrapper>
                    <Input
                        type="text"
                        name="voter_id"
                        value={employeeDetails.voter_id || " "}
                        onClick={this.handleLinkClick}    
                        style={{ cursor: 'pointer' }}
                        onChange={this.handleInputChange}
                    />
                    <label>Voter Id</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="relevant_certificates"
                    value={employeeDetails.relevant_certificates}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Relevant Certificates</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="special_certificates"
                    value={employeeDetails.special_certificates || " "}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Special Certificates</label>
                </InputWrapper>
                </div>

                <InputWrapper>
                    <TextArea
                    name="remarks"
                    value={employeeDetails.remarks || " "}
                    onChange={this.handleInputChange}                    
                    rows="3"
                />
                    <label>Remarks</label>
                </InputWrapper>   

                <FlexContainer style={{justifyContent: 'start'}}>
                    <SaveButton
                        onClick={this.handleSaveChanges}
                        disabled={!isEdited} // Disable button if no changes are made
                    >
                        Save Changes
                    </SaveButton>
                    <CancelButton 
                    onClick={this.handleCancelChanges}
                    disabled={!isEdited}
                    >
                        Cancel Changes
                    </CancelButton>
                </FlexContainer>            
            </Source>
        )
    }
}

EmployeeDetails.contextType = AppContext

export default EmployeeDetails