import { Component } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { AiOutlineUpload, AiOutlineClose } from "react-icons/ai";
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import styled from "styled-components";

import Source from "../Source";
import AppContext from "../../Context/AppContext";
import PromotionHistoryModal from "./PromotionHistoryModal";

import { FlexContainer, BackButton, InputWrapper, Input, 
    TextArea, SaveButton, CancelButton, 
    Container,
    RetryBtn,
    Title,
    AlignStartFlexContainer,
    OutlineBtn} from "../Source/styledComponent";

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
const ViewPdfButton = styled.button`
    border: none;
    background-color: transparent;
    cursor: pointer;
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
        fileInputKey: Date.now(),
        isPromotionHistoryModalOpen: false,
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

    handleFileChange = (e) => {
        const { name, files } = e.target;

        this.setState((prevState) => ({
            myDetails: {
                ...prevState.myDetails,
                [name]: files[0]
            },
            isEdited: true,
        }));
    };

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

            const formData = new FormData();
            formData.append("employee_id", myDetails.employee_id);
            formData.append("role_name", myDetails.role_name);
            formData.append("status", myDetails.status);
            formData.append("employee_id", myDetails.employee_id);
            formData.append("first_name", myDetails.first_name);
            formData.append("last_name", myDetails.last_name);
            formData.append("gender", myDetails.gender);
            formData.append("dob", myDetails.dob);
            formData.append("email", myDetails.email);
            formData.append("phone_number", myDetails.phone_number);
            formData.append("employee_type", myDetails.employee_type);
            formData.append("education_level", myDetails.education_level);
            formData.append("job_title", myDetails.job_title);
            formData.append("designation", myDetails.designation);
            formData.append("hire_date", myDetails.hire_date);
            formData.append("salary", myDetails.salary);
            formData.append("department", myDetails.department);
            formData.append("manager_id", myDetails.manager_id);
            formData.append("effective_date", myDetails.effective_date);
            formData.append("joining_date", myDetails.joining_date);
            formData.append("resignation_date", myDetails.resignation_date);
            formData.append("relieving_date", myDetails.relieving_date);
            formData.append("personal_email", myDetails.personal_email);
            formData.append("mother_tongue", myDetails.mother_tongue);
            formData.append("educational_background", myDetails.educational_background);
            formData.append("hobbies", myDetails.hobbies);
            formData.append("anniversary_date", myDetails.anniversary_date);
            formData.append("blood_type", myDetails.blood_type);
            formData.append("current_residential_address", myDetails.current_residential_address);
            formData.append("permanent_residential_address", myDetails.permanent_residential_address);
            formData.append("special_certifications", myDetails.special_certifications);
            formData.append("location", myDetails.location);
            formData.append("marital_status", myDetails.marital_status);
            formData.append("spouse_name", myDetails.spouse_name);
            formData.append("children", myDetails.children);
            formData.append("emergency_contact", myDetails.emergency_contact);
            formData.append("relation_with_contact", myDetails.relation_with_contact);
            formData.append("aadhar_number", myDetails.aadhar_number);
            formData.append("pan_number", myDetails.pan_number);
            formData.append("voter_id", myDetails.voter_id);
            formData.append("remarks", myDetails.remarks);

            formData.append("special_certificates", myDetails.special_certificates);
            formData.append("relevant_certificates", myDetails.relevant_certificates);

            const options = {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: formData,
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
            isEdited: false,
            fileInputKey: Date.now(),
        }));
    };

    handleBackButtonClick = () => {
        this.props.history.goBack();
    };

    viewPdfFile = (fieldName) => {
        const fileBuffer = this.state.myDetails[fieldName];
        
        if (fileBuffer && fileBuffer.type === 'Buffer' && Array.isArray(fileBuffer.data)) {
          // Convert fileBuffer.data to a Uint8Array and then create a Blob
          const byteArray = new Uint8Array(fileBuffer.data);
          const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
      
          // Generate a Blob URL
          const pdfUrl = URL.createObjectURL(pdfBlob);
      
          // Open PDF in a new tab
          window.open(pdfUrl, '_blank');
      
          // Clean up the Blob URL after opening the file
          URL.revokeObjectURL(pdfUrl);
        } else {
          console.warn(`No valid PDF data available for ${fieldName}`);
        }
    }

    openPromotionHistoryModal = () => {
        this.setState({isPromotionHistoryModalOpen: true})      
    }

    closePromotionHistoryModal = () => {
        this.setState({isPromotionHistoryModalOpen: false})      
    }

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

                <FlexContainer>
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
                    <OutlineBtn style={{marginRight: 'auto', marginLeft: '20px'}} onClick={this.openPromotionHistoryModal}>Promotion History</OutlineBtn>
                </FlexContainer>

                

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
                    <Input
                        type="text"
                        name="gender"
                        value={myDetails.gender || ""}
                        readOnly
                    />
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
                        name="manager_id"
                        value={myDetails.manager_id || ""}
                        readOnly
                    />
                    <label>Manager ID</label>
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
                        name="marital_status"
                        value={myDetails.marital_status || ""}
                        onChange={this.handleInputChange}
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
                        onChange={this.handleInputChange}
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

                <AlignStartFlexContainer>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="text"
                        name="cv"
                        value={myDetails.cv ? 'Available' : 'Not Available'}
                        readOnly
                    />
                    <label>CV (PDF)</label>
                </InputWrapper>
                {this.state.myDetails.cv ? (
                    <ViewPdfButton 
                    style={{ marginRight: 'auto' }} 
                    onClick={() => this.viewPdfFile('cv')}
                    > 
                    <FaRegEye size={20} />
                    </ViewPdfButton>
                ) : (
                    <ViewPdfButton style={{ marginRight: 'auto', cursor: 'default' }}>
                    <FaRegEyeSlash size={20} />
                    </ViewPdfButton>
                )}
                </div>

                <InputWrapper>
                    <Input
                        type="text"
                        name="aadhar_number"
                        value={myDetails.aadhar_number || ""}
                        readOnly
                    />
                    <label>Aadhar Number</label>
                </InputWrapper>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="text"
                        name="aadhar_card"
                        value={myDetails.aadhar_card ? 'Available' : 'Not Available'}
                        readOnly
                    />
                    <label>Aadhar Card (PDF)</label>
                </InputWrapper>
                {this.state.myDetails.aadhar_card ? (
                    <ViewPdfButton 
                    style={{ marginRight: 'auto' }} 
                    onClick={() => this.viewPdfFile('aadhar_card')}
                    > 
                    <FaRegEye size={20} />
                    </ViewPdfButton>
                ) : (
                    <ViewPdfButton style={{ marginRight: 'auto', cursor: 'default' }}>
                    <FaRegEyeSlash size={20} />
                    </ViewPdfButton>
                )}
                </div>

                </AlignStartFlexContainer>

                <AlignStartFlexContainer>

                <InputWrapper>
                    <Input
                        type="text"
                        name="pan_number"
                        value={myDetails.pan_number || ""}
                        readOnly
                        />
                    <label>Pan Number</label>
                </InputWrapper>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="text"
                        name="pan_card"
                        value={myDetails.pan_card ? 'Available' : 'Not Available'}
                        readOnly
                    />
                    <label>Pan Card (PDF)</label>
                </InputWrapper>
                {this.state.myDetails.pan_card ? (
                    <ViewPdfButton 
                    style={{ marginRight: 'auto' }} 
                    onClick={() => this.viewPdfFile('pan_card')}
                    > 
                    <FaRegEye size={20} />
                    </ViewPdfButton>
                ) : (
                    <ViewPdfButton style={{ marginRight: 'auto', cursor: 'default' }}>
                    <FaRegEyeSlash size={20} />
                    </ViewPdfButton>
                )}
                </div>

                <InputWrapper>
                    <Input
                        type="text"
                        name="voter_id"
                        value={myDetails.voter_id || ""}
                        readOnly
                    />
                    <label>Voter Id</label>
                </InputWrapper>

                </AlignStartFlexContainer>

                <AlignStartFlexContainer>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="text"
                        name="address_proof"
                        value={myDetails.address_proof ? 'Available' : 'Not Available'}
                        readOnly
                    />
                    <label>Address Proof (PDF)</label>
                </InputWrapper>
                {this.state.myDetails.address_proof ? (
                    <ViewPdfButton 
                    style={{ marginRight: 'auto' }} 
                    onClick={() => this.viewPdfFile('address_proof')}
                    > 
                    <FaRegEye size={20} />
                    </ViewPdfButton>
                ) : (
                    <ViewPdfButton style={{ marginRight: 'auto', cursor: 'default' }}>
                    <FaRegEyeSlash size={20} />
                    </ViewPdfButton>
                )}
                </div>     

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="text"
                        name="passport_copy"
                        value={myDetails.passport_copy ? 'Available' : 'Not Available'}
                        readOnly
                    />
                    <label>Passport Copy (PDF)</label>
                </InputWrapper>
                {this.state.myDetails.passport_copy ? (
                    <ViewPdfButton 
                    style={{ marginRight: 'auto' }} 
                    onClick={() => this.viewPdfFile('passport_copy')}
                    > 
                    <FaRegEye size={20} />
                    </ViewPdfButton>
                ) : (
                    <ViewPdfButton style={{ marginRight: 'auto', cursor: 'default' }}>
                    <FaRegEyeSlash size={20} />
                    </ViewPdfButton>
                )}
                </div>    

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="file"
                        name="relevant_certificates"
                        accept=".pdf"
                        key={this.state.fileInputKey}
                        onChange={this.handleFileChange}
                    />
                    <label>Relevant Certificates (PDF)</label>
                </InputWrapper>
                {this.state.myDetails.relevant_certificates ? (
                    <ViewPdfButton 
                    style={{ marginRight: 'auto' }} 
                    onClick={() => this.viewPdfFile('relevant_certificates')}
                    > 
                    <FaRegEye size={20} />
                    </ViewPdfButton>
                ) : (
                    <ViewPdfButton style={{ marginRight: 'auto', cursor: 'default' }}>
                    <FaRegEyeSlash size={20} />
                    </ViewPdfButton>
                )}                
                </div>

                </AlignStartFlexContainer>    

                <AlignStartFlexContainer>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="file"
                        name="special_certificates"
                        accept=".pdf"
                        key={this.state.fileInputKey}
                        onChange={this.handleFileChange}
                    />
                    <label>Special Certificates (PDF)</label>
                </InputWrapper>
                {this.state.myDetails.special_certificates ? (
                    <ViewPdfButton 
                    style={{ marginRight: 'auto' }} 
                    onClick={() => this.viewPdfFile('special_certificates')}
                    > 
                    <FaRegEye size={20} />
                    </ViewPdfButton>
                ) : (
                    <ViewPdfButton style={{ marginRight: 'auto', cursor: 'default' }}>
                    <FaRegEyeSlash size={20} />
                    </ViewPdfButton>
                )}                
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

                </AlignStartFlexContainer>  

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
                <PromotionHistoryModal 
                    isPromotionHistoryModalOpen={this.state.isPromotionHistoryModalOpen} 
                    closePromotionHistoryModal={this.closePromotionHistoryModal}
                    employeeId={this.state.employeeId}
                />           
            </Source> 
            
        )
    }
}

Profile.contextType = AppContext

export default Profile