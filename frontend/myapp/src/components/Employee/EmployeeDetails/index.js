import { Component } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import styled from "styled-components";

import PromotionHistoryModal from "./PromotionHistoryModal";
import EmployeePromotionModal from "./EmployeePromotionModal";
import AppContext from "../../../Context/AppContext";
import Source from "../../Source";

import { AlignStartFlexContainer, BackButton, BlueBtn, CancelButton, Container, FlexContainer, Input,
     InputWrapper, OutlineBtn, RetryBtn, SaveButton, SelectInput, TextArea, 
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
margin-right: 50px;
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

class EmployeeDetails extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        employeeDetails: {},
        originalEmployeeDetails: {},
        isEdited: false,
        fileInputKey: Date.now(),
        departments: [],
        managers: [],
        previewPhoto: null,
        employeeId: this.props.match.params.employeeId,
        isEmployeePromotionModalOpen: false,
        isPromotionHistoryModalOpen: false,
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

    handleFileChange = (e) => {
        const { name, files } = e.target;

        this.setState((prevState) => ({
            employeeDetails: {
                ...prevState.employeeDetails,
                [name]: files[0]
            },
            isEdited: true,
        }));
    };
    
    handleSaveChanges = async () => {
        const { employeeDetails } = this.state;
        const pendingToast = toast.loading(`Saving Changes for ${employeeDetails.employee_id}...`);

        try {
            const jwtToken = Cookies.get("jwt_token");

            const formData = new FormData();
            formData.append("employee_id", employeeDetails.employee_id);
            formData.append("role_name", employeeDetails.role_name);
            formData.append("status", employeeDetails.status);
            formData.append("employee_id", employeeDetails.employee_id);
            formData.append("first_name", employeeDetails.first_name);
            formData.append("last_name", employeeDetails.last_name);
            formData.append("gender", employeeDetails.gender);
            formData.append("dob", employeeDetails.dob);
            formData.append("email", employeeDetails.email);
            formData.append("phone_number", employeeDetails.phone_number);
            formData.append("employee_type", employeeDetails.employee_type);
            formData.append("education_level", employeeDetails.education_level);
            formData.append("job_title", employeeDetails.job_title);
            formData.append("designation", employeeDetails.designation);
            formData.append("hire_date", employeeDetails.hire_date);
            formData.append("salary", employeeDetails.salary);
            formData.append("department", employeeDetails.department);
            formData.append("manager_id", employeeDetails.manager_id);
            formData.append("effective_date", employeeDetails.effective_date);
            formData.append("joining_date", employeeDetails.joining_date);
            formData.append("resignation_date", employeeDetails.resignation_date);
            formData.append("relieving_date", employeeDetails.relieving_date);
            formData.append("personal_email", employeeDetails.personal_email);
            formData.append("mother_tongue", employeeDetails.mother_tongue);
            formData.append("educational_background", employeeDetails.educational_background);
            formData.append("hobbies", employeeDetails.hobbies);
            formData.append("anniversary_date", employeeDetails.anniversary_date);
            formData.append("blood_type", employeeDetails.blood_type);
            formData.append("current_residential_address", employeeDetails.current_residential_address);
            formData.append("permanent_residential_address", employeeDetails.permanent_residential_address);
            formData.append("special_certifications", employeeDetails.special_certifications);
            formData.append("location", employeeDetails.location);
            formData.append("marital_status", employeeDetails.marital_status);
            formData.append("spouse_name", employeeDetails.spouse_name);
            formData.append("children", employeeDetails.children);
            formData.append("emergency_contact", employeeDetails.emergency_contact);
            formData.append("relation_with_contact", employeeDetails.relation_with_contact);
            formData.append("aadhar_number", employeeDetails.aadhar_number);
            formData.append("pan_number", employeeDetails.pan_number);
            formData.append("voter_id", employeeDetails.voter_id);
            formData.append("remarks", employeeDetails.remarks);

            formData.append("aadhar_card", employeeDetails.aadhar_card);
            formData.append("pan_card", employeeDetails.pan_card);
            formData.append("cv", employeeDetails.cv);
            formData.append("address_proof", employeeDetails.address_proof);
            formData.append("passport_copy", employeeDetails.passport_copy);
            formData.append("special_certificates", employeeDetails.special_certificates);
            formData.append("relevant_certificates", employeeDetails.relevant_certificates);

            const options = {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: formData,
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

            this.fetcEmployeeDetails();

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
            fileInputKey: Date.now(),
        }));
    };

    viewPdfFile = (fieldName) => {
        const fileBuffer = this.state.employeeDetails[fieldName];
        
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
      
    handleBackButtonClick = () => {
        this.props.history.goBack();
    };

    openEmployeePromotionModal = () => {
        this.setState({isEmployeePromotionModalOpen: true})      
    }

    closeEmployeePromotionModal = () => {
        this.setState({isEmployeePromotionModalOpen: false})      
    }

    handleEmployeePromoted = () => {
        this.fetcEmployeeDetails()
    };

    openPromotionHistoryModal = () => {
        this.setState({isPromotionHistoryModalOpen: true})      
    }

    closePromotionHistoryModal = () => {
        this.setState({isPromotionHistoryModalOpen: false})      
    }

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
                    </PhotographContainer>
                    <BlueBtn style={{marginRight: '20px'}} onClick={this.openEmployeePromotionModal}>Promote</BlueBtn>
                    <OutlineBtn style={{marginRight: 'auto'}} onClick={this.openPromotionHistoryModal}>Promotion History</OutlineBtn>
                </FlexContainer>

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
                        name="manager_id"
                        value={employeeDetails.manager_id}
                        onChange={this.handleInputChange}
                    />
                    <label>Manager ID</label>
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

                <AlignStartFlexContainer>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="file"
                        name="cv"
                        accept=".pdf"
                        key={this.state.fileInputKey}
                        onChange={this.handleFileChange}
                    />
                    <label>CV (PDF)</label>
                </InputWrapper>
                {this.state.employeeDetails.cv ? (
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
                        value={employeeDetails.aadhar_number || " "}
                        onChange={this.handleInputChange}
                    />
                    <label>Aadhar Number</label>
                </InputWrapper>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="file"
                        name="aadhar_card"
                        accept=".pdf"
                        key={this.state.fileInputKey}
                        onChange={this.handleFileChange}
                    />
                    <label>Aadhar Card (PDF)</label>
                </InputWrapper>
                {this.state.employeeDetails.aadhar_card ? (
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
                        value={employeeDetails.pan_number}
                        onChange={this.handleInputChange}                    
                    />
                    <label>Pan Number</label>
                </InputWrapper>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="file"
                        name="pan_card"
                        accept=".pdf"
                        key={this.state.fileInputKey}
                        onChange={this.handleFileChange}
                    />
                    <label>Pan Card (PDF)</label>
                </InputWrapper>
                {this.state.employeeDetails.pan_card ? (
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
                        value={employeeDetails.voter_id || " "}
                        onChange={this.handleInputChange}
                    />
                    <label>Voter Id</label>
                </InputWrapper>
                </AlignStartFlexContainer>

                <AlignStartFlexContainer>

                <div style={{width: '33%'}}>
                <InputWrapper style={{width: '80%'}}>
                    <Input
                        style={{width: '100%'}}
                        type="file"
                        name="address_proof"
                        accept=".pdf"
                        key={this.state.fileInputKey}
                        onChange={this.handleFileChange}
                    />
                    <label>Address Proof (PDF)</label>
                </InputWrapper>
                {this.state.employeeDetails.address_proof ? (
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
                        type="file"
                        name="passport_copy"
                        accept=".pdf"
                        key={this.state.fileInputKey}
                        onChange={this.handleFileChange}
                    />
                    <label>Passport Copy (PDF)</label>
                </InputWrapper>
                {this.state.employeeDetails.passport_copy ? (
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
                {this.state.employeeDetails.relevant_certificates ? (
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
                {this.state.employeeDetails.special_certificates ? (
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
                    value={employeeDetails.remarks || " "}
                    onChange={this.handleInputChange}                    
                    rows="3"
                />
                    <label>Remarks</label>
                </InputWrapper>   

                </AlignStartFlexContainer>

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

                <EmployeePromotionModal 
                    isEmployeePromotionModalOpen={this.state.isEmployeePromotionModalOpen} 
                    closeEmployeePromotionModal={this.closeEmployeePromotionModal}
                    handleEmployeePromoted={this.handleEmployeePromoted}
                    employee={employeeDetails}
                />

                <PromotionHistoryModal 
                    isPromotionHistoryModalOpen={this.state.isPromotionHistoryModalOpen} 
                    closePromotionHistoryModal={this.closePromotionHistoryModal}
                    employeeId={this.state.employeeId}
                />        
            </Source>
        )
    }
}

EmployeeDetails.contextType = AppContext

export default EmployeeDetails