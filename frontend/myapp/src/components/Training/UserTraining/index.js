import { Component } from "react";
import { format } from 'date-fns';
import Cookies from "js-cookie"
import { BiError } from "react-icons/bi";
import { Oval } from "react-loader-spinner"; 

import {ProgramsContainer, ProgramCard } from "./styledComponent";
import { Container, NoRecordsText, RetryBtn } from "../../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class UserTraining extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        trainings: []
    }

    componentDidMount(){
        this.fetchPrograms()
    }

    fetchPrograms = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const {employeeId} = this.props

        try{
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };
            
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user-trainings/${employeeId}`, options)

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json()
            this.setState({apiStatus: apiStatusConstants.success, trainings: data}, this.filterTrainings)

        } catch (err) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
    }

    renderActiveTrainings = () => {
        const {trainings} = this.state
        const activeTrainings = trainings.filter((training) => (training.progress_status === 'In Progress'))

        return(
            <>
                <h2 style={{color: '#36454F'}}>Active Programs</h2>
                <ProgramsContainer>
                    {activeTrainings.length > 0 ? (
                        activeTrainings.map(program => (
                            <ProgramCard key={program.training_id}>
                                <h3>{program.training_subject}</h3>
                                <p style={{marginBottom: '0px'}}>{format(new Date(program.start_date), 'MMM dd')} - {format(new Date(program.end_date), 'MMM dd yyyy')}</p>
                                <p style={{marginTop: '0px'}}>({program.training_hours} hrs)</p>
                                <p>Trainer - {program.trainer_name}</p>
                                <p>{program.training_method}</p>
                            </ProgramCard>
                        ))
                    ) : (
                        <NoRecordsText>No Active Programs</NoRecordsText>
                    )}
                </ProgramsContainer>

            </>
            
            
        )
    }

    renderScheduledTrainings = () => {
        const {trainings} = this.state
        const scheduledTrainings = trainings.filter((training) => (training.progress_status === 'Scheduled'))

        return(
            <>
                <h2 style={{color: '#36454F'}}>Upcoming Programs</h2>
                <ProgramsContainer>
                {scheduledTrainings.length > 0 ? (
                    scheduledTrainings.map(program => (
                        <ProgramCard key={program.training_id}>
                            <h3>{program.training_subject}</h3>
                            <p style={{marginBottom: '0px'}}>{format(new Date(program.start_date), 'MMM dd')} - {format(new Date(program.end_date), 'MMM dd yyyy')} </p>
                            <p style={{marginTop: '0px'}}>({program.training_hours} hrs)</p>
                            <p>Trainer - {program.trainer_name}</p>
                            <p style={{textAlign: 'right'}}>{program.training_method}</p>
                        </ProgramCard>    
                    ))
                ) : (
                    <NoRecordsText>No Upcoming Programs</NoRecordsText>
                )}
                </ProgramsContainer>
            </>
            
            
        )
    }

    renderCompletedTrainings = () => {
        const {trainings} = this.state
        const completedTrainings = trainings.filter((training) => (training.progress_status === 'Completed'))

        return(
            <>
                <h2 style={{color: '#36454F'}}>Completed Programs</h2>
                <ProgramsContainer>
                {completedTrainings.length > 0 ? (
                    completedTrainings.map(program => (
                        <ProgramCard key={program.training_id}>
                            <h3>{program.training_subject}</h3>
                            <p style={{marginBottom: '0px'}}>{format(new Date(program.start_date), 'MMM dd')} - {format(new Date(program.end_date), 'MMM dd yyyy')} </p>
                            <p style={{marginTop: '0px'}}>({program.training_hours} hrs)</p>
                            <p>Trainer - {program.trainer_name}</p>
                            <p style={{textAlign: 'right'}}>{program.training_method}</p>
                        </ProgramCard>    
                    ))
                ) : (
                    <NoRecordsText>No Completed Programs</NoRecordsText>
                )}
                </ProgramsContainer>
            </>
        )
    }

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
                  <RetryBtn onClick={this.fetchPrograms}>Retry</RetryBtn>
              </Container>   
            )
        }

        return(
            <>
                {this.renderActiveTrainings()}
                <hr />
                {this.renderScheduledTrainings()}
                <hr />
                {this.renderCompletedTrainings()} 
            </>
        )
    }
}

export default UserTraining