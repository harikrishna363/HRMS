import { Component } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import Cookies from 'js-cookie'
import {toast } from 'react-toastify';
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";

import AppContext from "../../../Context/AppContext";
import Source from "../../Source";
import { BackButton, CancelButton, Container, FlexContainer, 
    RetryBtn, SaveButton, Title } from "../../Source/styledComponent";
import { Input, TextArea, InputWrapper } from "./styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class TemplateDetails extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        template: {},
        originalTemplate: {},
        isEdited: false,
        templateName: this.props.match.params.templateName
    };

    componentDidMount() {
        this.fetchTemplate();
    }

    fetchTemplate = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const {templateName} = this.state
        
        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/email-template/${templateName}`, options);

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json();

            this.setState({
                template: data,
                originalTemplate: data,
                apiStatus: apiStatusConstants.success
            });
        } catch (err) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            template: {
                ...prevState.template,
                [name]: value
            },
            isEdited: true 
        }));
    };

    handleSaveChanges = async () => {
        const { template } = this.state;

        const pendingToast = toast.loading(`Saving Changes for ${template.name} ...`);

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(template),
            };

            const response = await fetch( `${process.env.REACT_APP_API_BASE_URL}/update-email-template/${template.name}`, options );
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

            this.fetchTemplate();

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
        this.setState((prevState) => ({
            template: prevState.originalTemplate,
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
                        <RetryBtn onClick={this.fetchTemplate}>Retry</RetryBtn>
                    </Container> 
              </Source>  
            )
        }

        const {template, isEdited} = this.state;

        return(
            <Source>
                <BackButton onClick={this.handleBackButtonClick}> <MdOutlineArrowBackIosNew size={20}/></BackButton>

                <Title style={{marginTop: '0px'}}>Template Details</Title>
                <InputWrapper>
                    <Input
                        type="text"
                        name="name"
                        value={template.name}
                        readOnly
                    />
                    <label>Name</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="subject"
                    value={template.subject}
                    onChange={this.handleChange}
                    rows="1"
                />
                    <label>Subject</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="text"
                    value={template.text}
                    onChange={this.handleChange}
                    rows="8"
                />
                    <label>TEXT</label>
                </InputWrapper>

                <InputWrapper>
                    <TextArea
                    name="html"
                    value={template.html}
                    onChange={this.handleChange}
                    rows="8"
                />
                    <label>Html</label>
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

TemplateDetails.contextType = AppContext

export default TemplateDetails