import { Component } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";

import AppContext from "../../../Context/AppContext";
import Source from "../../Source";
import { AlignStartFlexContainer, BackButton, CancelButton, Container, 
    FlexContainer, Input, InputWrapper, RetryBtn, SaveButton, SelectInput, 
    TextArea, Title } from "../../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class CvDetails extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        cvDetails: {},
        originalCvDetails: {},
        isEdited: false,
        candidateId: this.props.match.params.candidate_id,
    }

    componentDidMount(){
        this.fetchCvDetails()
    }

    fetchCvDetails = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const {candidateId} = this.state

        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`http://localhost:4000/cv/${candidateId}`, options);

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json();
            
            this.setState({
                cvDetails: data,
                originalCvDetails: data,
                apiStatus:apiStatusConstants.success
            });
        } catch (err) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
    }

    handleBackButtonClick = () => {
        this.props.history.goBack();
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            cvDetails: {
                ...prevState.cvDetails,
                [name]: value
            },
            isEdited: true 
        }));
    }

    handleSaveChanges = async () => {
        const pendingToast = toast.loading(`Saving Changes...`);

        const { cvDetails } = this.state;
        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(cvDetails),
            };

            const response = await fetch(`http://localhost:4000/update-cv/${cvDetails.candidate_id}`, options );
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

            this.fetchCvDetails();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
    };

    handleCancelChanges = () => {
        this.setState(prevState => ({
            cvDetails: { ...prevState.originalCvDetails },
            isEdited: false
        }));
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
                        <RetryBtn onClick={this.fetchCvDetails}>Retry</RetryBtn>
                    </Container> 
              </Source>  
            )
        }

        const {cvDetails, isEdited} = this.state

        return(
            <Source>
                <BackButton onClick={this.handleBackButtonClick}> <MdOutlineArrowBackIosNew size={20}/></BackButton>

                <Title style={{marginTop: '0px'}}>CV Details</Title>

                <InputWrapper>
                    <Input
                        type="text"
                        name="name"
                        value={cvDetails.name || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Name</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="post_applied"
                        value={cvDetails.post_applied || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Post Applied</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="cv_attachment"
                        value={cvDetails.cv_attachment || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>CV</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="active_status"
                        value={cvDetails.active_status || ""}
                        onChange={this.handleInputChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </SelectInput>
                    <label>Active Status</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="status"
                        value={cvDetails.status || ""}
                        onChange={this.handleInputChange}
                    >
                        <option value="">None</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                    </SelectInput>
                    <label>Progress Status</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="standard_hr_mail_sent"
                        value={cvDetails.standard_hr_mail_sent || ""}
                        onChange={this.handleInputChange}
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </SelectInput>
                    <label>Standard HR Mail Sent</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="date_received"
                        value={cvDetails.date_received || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Date Received</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="shortlisted_for_future"
                        value={cvDetails.shortlisted_for_future || ""}
                        onChange={this.handleInputChange}
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </SelectInput>
                    <label>Shortlisted For Future</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="date_shortlisted"
                        value={cvDetails.date_shortlisted || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Date Shortlisted</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="current_position"
                        value={cvDetails.current_position || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Current Position</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="experience"
                        value={cvDetails.experience || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Experience</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        type="text"
                        name="gender"
                        value={cvDetails.gender || ""}
                        onChange={this.handleInputChange}
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
                        value={cvDetails.dob || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>DOB</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="phone_no"
                        value={cvDetails.phone_no || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Phone</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="email_id"
                        value={cvDetails.email_id || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Email</label>
                </InputWrapper>

                <AlignStartFlexContainer>
                <InputWrapper>
                    <Input
                        type="text"
                        name="highest_qualification"
                        value={cvDetails.highest_qualification || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Highest Qualification</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="university"
                        value={cvDetails.university || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>University</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="contact_address"
                    value={cvDetails.contact_address || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Contact Address</label>
                </InputWrapper>
                </AlignStartFlexContainer>

                <AlignStartFlexContainer>     
                <InputWrapper>
                    <Input
                        type="text"
                        name="linkedin"
                        value={cvDetails.linkedin || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Linkedin</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="languages_familiar"
                    value={cvDetails.languages_familiar || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Languages Familiar</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="accomplishments"
                    value={cvDetails.accomplishments || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Accomplishments</label>
                </InputWrapper>
                </AlignStartFlexContainer>   

                <AlignStartFlexContainer>
                <InputWrapper>
                    <TextArea
                    name="other_details"
                    value={cvDetails.other_details || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Other Details</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="source"
                        value={cvDetails.source || ""}
                        onChange={this.handleInputChange}
                    />
                    <label>Source</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="samples_attached"
                    value={cvDetails.samples_attached || ""}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Samples Attached</label>
                </InputWrapper>
                </AlignStartFlexContainer>                

                <InputWrapper>
                    <TextArea
                    name="remarks"
                    value={cvDetails.remarks || ""}
                    onChange={this.handleInputChange}
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

CvDetails.contextType = AppContext

export default CvDetails