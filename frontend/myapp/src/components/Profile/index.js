import { Component } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { AiOutlineUpload, AiOutlineClose } from "react-icons/ai";
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'

import Source from "../Source";
import AppContext from "../../Context/AppContext";
import styled from "styled-components";

import { FlexContainer, BackButton, InputWrapper, Input, SelectInput, 
    TextArea, SaveButton, CancelButton, 
    Container,
    RetryBtn,
    Title} from "../Source/styledComponent";

const PhotographContainer = styled.div`
    width: 30%;
    border-radius: 7px;
    padding: 8px;
    display: flex;
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

class Profile extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        myDetails: {},
        myOriginalDetails: {},
        isEdited: false,
        photograph: null,
        previewPhoto: null,
        employeeId: this.context.employeeId
    }

    componentDidMount(){
        this.fetchMyDetails()
    } 
    
    fetchMyDetails = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const {employeeId} = this.state

        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/${employeeId}`, options);

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }
    
            const data = await response.json();
        
            this.setState({
                isMyDetailsFetched: true,
                myDetails: data,
                myOriginalDetails: data,
                previewPhoto: data.photograph ? `data:image/jpeg;base64,${data.photograph}` : null,
                apiStatus: apiStatusConstants.success
            });
    
        } catch (err) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
    }

    handlePhotographUpload = async (event) => {
        const { employeeId } = this.state;
        const file = event.target.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('photograph', file);
            const pendingToast = toast.loading(`Uploading Your Photograph`);

            try {
                const jwtToken = Cookies.get("jwt_token");
                const options = {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                    body: formData,
                };

                const response = await fetch( `${process.env.REACT_APP_API_BASE_URL}/update-photograph/${employeeId}`, options);
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
    
                this.fetchMyDetails();
    
            } catch (error) {
                toast.update(pendingToast, {
                    render: "Network error. Please try again later.",
                    type: "error",
                    isLoading: false,
                    autoClose: 4000, 
                });        
            }
        }
    };    

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            myDetails: {
                ...prevState.myDetails,
                [name]: value
            },
            isEdited: true 
        }));
    }

    handleRemovePhoto = async () => {
        const pendingToast = toast.loading(`Deleting your Photograph...`);

        const { employeeId } = this.state;

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
            };
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delete-photograph/${employeeId}`,options );
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

            this.fetchMyDetails();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
    };

    handleSaveChanges = async () => {
        const { myDetails } = this.state;
        const pendingToast = toast.loading(`Saving Changes in your Profile`);

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({...myDetails, photograph: ''}),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-profile/${myDetails.employee_id}`, options );
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

            this.fetchMyDetails();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
                hideProgressBar:false 
            });        
        }
    };

    handleCancelChanges = () => {
        this.setState(prevState => ({
            myDetails: { ...prevState.myOriginalDetails },
            isEdited: false
        }));
    };

    handleBackButtonClick = () => {
        this.props.history.goBack();
    };

    render(){
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
                        <RetryBtn onClick={this.fetchMyDetails}>Retry</RetryBtn>
                    </Container>
                </Source>
                
            )
        }

        const {myDetails, isEdited, previewPhoto} = this.state

        return(
            <Source>
                <BackButton onClick={this.handleBackButtonClick}> <MdOutlineArrowBackIosNew size={20}/></BackButton>

                <Title>My Profile</Title>

                {/* Profile Photo Section */}
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

                    <div>
                        <label>
                            <FlexContainer style={{cursor: 'pointer'}}><AiOutlineUpload /> Upload Photo</FlexContainer>
                            
                            <input
                                type="file"
                                accept="image/*"
                                onChange={this.handlePhotographUpload}
                                style={{ display: "none", cursor: 'pointer' }}
                            />
                        </label>
                        <br />
                        <button 
                            onClick={this.handleRemovePhoto} 
                            style={{ color: "red", border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                            <FlexContainer><AiOutlineClose /> Remove Photo</FlexContainer> 
                        </button>
                    </div>
                </PhotographContainer>

                <InputWrapper>
                    <Input
                        type="text"
                        name="employee_id"
                        value={myDetails.employee_id || ""}
                        readOnly
                    />
                    <label>ID</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="role_name"
                        value={myDetails.role_name || ""}
                        readOnly
                    />
                    <label>Role</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="status"
                        value={myDetails.status || ""}
                        readOnly
                    />
                    <label>Status</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="first_name"
                        value={myDetails.first_name || ""}
                        readOnly                    
                    />
                    <label>First Name</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="last_name"
                        value={myDetails.last_name || ""}
                        readOnly                    
                    />
                    <label>Last Name</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="gender"
                        value={myDetails.gender || ""}
                        readOnly
                    >
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
                        value={myDetails.dob || ""}
                        readOnly
                    />
                    <label>Date of Birth</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="email"
                        value={myDetails.email || ""}
                        readOnly
                    />
                    <label>Email</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="phone_number"
                        value={myDetails.phone_number || ""}
                        readOnly
                    />
                    <label>Phone Number</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="employee_type"
                        value={myDetails.employee_type || ""}
                        readOnly
                    />
                    <label>Employee Type</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="education_level"
                        value={myDetails.education_level || ""}
                        readOnly
                    />
                    <label>Education Level</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="job_title"
                        value={myDetails.job_title || ""}
                        readOnly
                    />
                    <label>Job Title</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="designation"
                        value={myDetails.designation || ""}
                        readOnly
                    />
                    <label>Designation</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="hire_date"
                        value={myDetails.hire_date || ""}
                        readOnly
                    />
                    <label>Hire Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="salary"
                        value={myDetails.salary || ""}
                        readOnly
                    />
                    <label>Salary</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="department"
                        value={myDetails.department || ""}
                        readOnly
                    />
                    <label>Department</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="manager"
                        value={myDetails.manager || ""}
                        readOnly
                    />
                    <label>Manager</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="effective_date"
                        value={myDetails.effective_date || ""}
                        readOnly
                    />
                    <label>Effective Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="joining_date"
                        value={myDetails.joining_date || ""}
                        readOnly
                    />
                    <label>joining Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="resignation_date"
                        value={myDetails.resignation_date || ""}
                        readOnly
                    />
                    <label>Resignation Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="relieving_date"
                        value={myDetails.relieving_date || ""}
                        readOnly
                    />
                    <label>Relieving Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="personal_email"
                        value={myDetails.personal_email || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Personal Email</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="mother_tongue"
                        value={myDetails.mother_tongue || ""}
                        onChange={this.handleInputChange}
                        />
                    <label>Mother Tongue</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="educational_background"
                        value={myDetails.educational_background || ""}
                        onChange={this.handleInputChange}
                        />
                    <label>Educational Background</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="hobbies"
                        value={myDetails.hobbies || ""}
                        onChange={this.handleInputChange}
                        />
                    <label>Hobbies</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="anniversary_date"
                        value={myDetails.anniversary_date || ""}
                        onChange={this.handleInputChange}
                        />
                    <label>Anniversary Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="blood_type"
                        value={myDetails.blood_type || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Blood Type</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="current_residential_address"
                    value={myDetails.current_residential_address || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Current Address</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="permanent_residential_address"
                    value={myDetails.permanent_residential_address || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Permanent Address</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="special_certifications"
                    value={myDetails.special_certifications || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Special Certifications</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="location"
                        value={myDetails.location || ""}
                        onChange={this.handleInputChange}
                        />
                    <label>Location</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="pan_number"
                        value={myDetails.pan_number || ""}
                        readOnly
                        />
                    <label>Pan Number</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="marital_status"
                        value={myDetails.marital_status || ""}
                        readOnly
                        />
                    <label>Marital Status</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="spouse_name"
                        value={myDetails.spouse_name || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Spouse Name</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="children"
                        value={myDetails.children || ""}
                        readOnly
                    />
                    <label>Children</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="emergency_contact"
                        value={myDetails.emergency_contact || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Emergency Contact</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="relation_with_contact"
                        value={myDetails.relation_with_contact || ""}
                        readOnly
                    />
                    <label>Relation With Contact</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="cv"
                        value={myDetails.cv || ""}
                        readOnly
                    />
                    <label>CV</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="aadhar_card"
                        value={myDetails.aadhar_card || ""}
                        readOnly
                    />
                    <label>Aadhar Card</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="pan_card"
                        value={myDetails.pan_card || ""}
                        readOnly
                    />
                    <label>Pan Card</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="address_proof"
                        value={myDetails.address_proof || ""}
                        readOnly
                    />
                    <label>Address Proof</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="passport_copy"
                        value={myDetails.passport_copy || ""}
                        readOnly
                    />
                    <label>Passport Copy</label>
                </InputWrapper>

                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                <InputWrapper>
                    <Input
                        type="text"
                        name="voter_id"
                        value={myDetails.voter_id || ""}
                        readOnly
                    />
                    <label>Voter Id</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="relevant_certificates"
                    value={myDetails.relevant_certificates || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Relevant Certificates</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="special_certificates"
                    value={myDetails.special_certificates || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Special Certificates</label>
                </InputWrapper>
                </div>

                <InputWrapper>
                    <TextArea
                    name="remarks"
                    value={myDetails.remarks || ""}
                    readOnly                   
                    rows="3"
                />
                    <label>Remarks</label>
                </InputWrapper>   

                <FlexContainer style={{justifyContent: 'start'}}>
                    <SaveButton
                        onClick={this.handleSaveChanges}
                        disabled={!isEdited} 
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

Profile.contextType = AppContext

export default Profile