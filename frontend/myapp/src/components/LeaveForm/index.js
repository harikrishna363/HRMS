import { Component } from "react";
import Cookies from 'js-cookie'
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import styled from "styled-components";

import { CancelButton, FlexContainer, Input, InputWrapper, RetryBtn, SaveButton, TextArea } from "../Source/styledComponent";

const Container = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Card = styled.div`
  width: 60%;
  background-color: #f9fafc; 
  border: 1px solid #e0e0e0; 
  border-radius: 12px; 
  padding: 20px;
  margin: 16px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
  transition: transform 0.3s ease, box-shadow 0.3s ease;
`;

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class LeaveForm extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        leaveDetails: {}
    }

    componentDidMount(){
        this.fetchLeaveDetails()
    }

    fetchLeaveDetails =  async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const leaveId = this.props.match.params.leaveId

        try{
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/leave-form/${leaveId}`, options)
            const data = await response.json()
      
            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            this.setState({leaveDetails: data, apiStatus: apiStatusConstants.success})
            
          }catch (err) {
            this.setState({ apiStatus: apiStatusConstants.failure });
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            leaveDetails: {
                ...prevState.leaveDetails,
                [name]: value
            },
        }));
    }

    handleApprove = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const { leaveDetails } = this.state;

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({leaveDetails}),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/leave/approve`, options );
            
            this.fetchLeaveDetails();

        } catch (error) {
            console.log(error)        
        }
    };

    handleReject = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const { leaveDetails } = this.state;

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({leaveDetails}),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/leave/reject`, options );
            
            this.fetchLeaveDetails();

        } catch (error) {
            console.log(error)        
        }
    };

    render(){
        if (this.state.apiStatus === apiStatusConstants.loading) {
            return (
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
                
            )
        }

        if (this.state.apiStatus === apiStatusConstants.failure) {
            return (
                <Container style={{flexDirection: 'column'}}>
                    <BiError size={60} />
                    <h2>Error Loading Page</h2>
                    <RetryBtn onClick={this.fetchLeaveDetails}>Retry</RetryBtn>
                </Container>
            )
        }

        const {leaveDetails} = this.state

        return(
            <Container>
                <h3>{leaveDetails.employee_id} Applied for {leaveDetails.leave_type} Leave</h3>
                <Card>
                    <InputWrapper>
                        <Input
                            type="text"
                            name="employee_id"
                            value={leaveDetails.employee_id}
                            readOnly
                        />
                        <label>Employee ID</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="text"
                            name="name"
                            value={leaveDetails.name}
                            readOnly
                        />
                        <label>Employee Name</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="text"
                            name="designation"
                            value={leaveDetails.designation}
                            readOnly
                        />
                        <label>Designation</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="date"
                            name="start_date"
                            value={leaveDetails.start_date}
                            readOnly
                        />
                        <label>Start Date</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="date"
                            name="end_date"
                            value={leaveDetails.end_date}
                            readOnly
                        />
                        <label>End Date</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="date"
                            name="applied_date"
                            value={leaveDetails.applied_date}
                            readOnly
                        />
                        <label>Applied Date</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="text"
                            name="leave_type"
                            value={leaveDetails.leave_type}
                            readOnly
                        />
                        <label>Leave Type</label>
                    </InputWrapper>

                    <InputWrapper>
                        <Input
                            type="text"
                            name="leave_status"
                            value={leaveDetails.leave_status}
                            readOnly
                        />
                        <label>Status</label>
                    </InputWrapper>

                    <br />

                    <InputWrapper>
                        <TextArea style={{width: '200%'}}
                        name="leave_reason"
                        value={leaveDetails.leave_reason}
                        readOnly
                        rows="3"
                        />
                        <label>Reason</label>
                    </InputWrapper>

                    <br />

                    <InputWrapper>
                        <TextArea style={{width: '200%'}}
                        name="remarks"
                        value={leaveDetails.remarks}
                        onChange={this.handleInputChange}
                        disabled={leaveDetails.leave_status !== 'Pending'}
                        rows="3"
                        />
                        <label>Remarks</label>
                    </InputWrapper>

                    <FlexContainer style={{justifyContent: 'center'}}>
                        <SaveButton
                            onClick={this.handleApprove}
                            disabled={leaveDetails.leave_status !== 'Pending'}
                            >
                            Approve
                        </SaveButton>
                        <CancelButton 
                        onClick={this.handleReject}
                        disabled={leaveDetails.leave_status !== 'Pending'}
                        >
                            Reject
                        </CancelButton>
                    </FlexContainer>

                </Card>
            </Container>

        )
    }
}

export default LeaveForm