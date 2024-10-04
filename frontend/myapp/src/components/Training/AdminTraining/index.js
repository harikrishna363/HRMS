import { Component } from "react";
import DataTable from "react-data-table-component";
import { format } from 'date-fns';
import { withRouter } from 'react-router-dom'; 
import Cookies from "js-cookie"
import { BiError } from "react-icons/bi";
import { Oval } from "react-loader-spinner"; 
import { toast } from 'react-toastify';

import AddNewTrainingModal from "./AddNewTrainingModal";

import {ProgramsContainer, ProgramCard} from "./styledComponent";
import { ActiveStatusSelectInput, BlueBtn, Container, FlexContainer,
    NoRecordsText, OutlineBtn, RetryBtn, SearchBox, TableContainer, TableTitle } from "../../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class AdminTraining extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        isAddTrainingModalOpen: false,
        trainings: [],
        filteredTrainings: [],
        trainingsSearchQuery: '',
    }

    componentDidMount(){
        this.fetchPrograms()
    }

    fetchPrograms = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})

        try{
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };
            
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/trainings`, options)

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

    openAddTrainingModal = () => {
        this.setState({isAddTrainingModalOpen: true})      
    }
    
    closeAddTrainingModal = () => {
        this.setState({isAddTrainingModalOpen: false})      
    }

    handleTrainingAdded = () => {
        this.fetchPrograms()
    };

    handleTrainingsSearchChange = (event) => {
        const trainingsSearchQuery = event.target.value.toLowerCase();
        this.setState({ trainingsSearchQuery }, this.filterTrainings);
    };

    filterTrainings = () => {
        const { trainings, trainingsSearchQuery } = this.state;

        if (trainingsSearchQuery === "") {
          this.setState({ filteredTrainings: trainings });
        } else {
          const filteredTrainings = trainings.filter(row => 
            row.training_subject.toLowerCase().includes(trainingsSearchQuery)
          );
          this.setState({ filteredTrainings });
        }
    };

    handleRowClick = (row) => {
        const { history } = this.props; 
        history.push(`/training/${row.training_id}`);
    };

    handleStatusChange = async (event, training_id, training_subject) => {
        event.preventDefault();
        const newStatus = event.target.value;

        const pendingToast = toast.loading(`Updating ${training_subject} status...`);
            
        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({ status: newStatus }),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-training-status/${training_id}`, options); 
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

            this.fetchPrograms();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
    };

    handleDownloadTrainingReport = async () => {
        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/training-report`, options);
    
            if (!response.ok) {
                toast.error('Failed to Download Trainings Report', {
                    autoClose: 4000
                })
                return
            }
    
            // Convert response to Blob for downloading
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'training_report.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
    
        } catch (error) {
            toast.error('Network Error! Please Try Again.', {
                autoClose: 4000
            })
        }
    };
    
    renderActiveTrainings = () => {
        const {trainings} = this.state
        const activeTrainings = trainings.filter((training) => (training.progress_status === 'In Progress'))

        return(
            <>
                <h2 style={{color: '#36454F'}}>Active Programs</h2>
                <ProgramsContainer>
                    {activeTrainings.length > 0 ? (
                        activeTrainings.map(program => (
                            <ProgramCard key={program.training_id} onClick={() => this.handleRowClick(program)}>
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
                        <ProgramCard key={program.training_id} onClick={() => this.handleRowClick(program)}>
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

        const columns = [
            { name: "Subject", selector: row => row.training_subject, sortable: true },
            { name: "Trainer", selector: row => row.trainer_name },
            { name: "Training Method", selector: row => row.training_method },
            { name: "Start Date", selector: row => row.start_date },
            { name: "End Date", selector: row => row.end_date },
            { name: "Training Hours", selector: row => row.training_hours, center: true },
        ]

        const cellStyles = {
            headCells: {
                style: {
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#000",
                },
            },
        };

        return(
            <TableContainer>
                <DataTable 
                    title={<TableTitle>Completed Programs</TableTitle>}
                    columns={columns}
                    data={completedTrainings}
                    customStyles={cellStyles}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    persistTableHead
                    onRowClicked={this.handleRowClick}
                    noDataComponent={<NoRecordsText>No Completed Programs</NoRecordsText>}
                />
            </TableContainer>
        )
    }

    renderTrainings = () => {
        const {filteredTrainings, trainingsSearchQuery, isAddTrainingModalOpen} = this.state

        const columns = [
            { name: "Subject", selector: row => row.training_subject, sortable: true },
            { name: "Trainer", selector: row => row.trainer_name },
            { name: "Training Method", selector: row => row.training_method },
            { name: "Start Date", selector: row => row.start_date },
            { name: "End Date", selector: row => row.end_date },
            { name: "Training Hours", selector: row => row.training_hours, center: true },
            { name: "Progress", selector: row => row.progress_status, sortable: true },
            {
                name: 'Action',
                center: true,
                cell: row => (
                        <ActiveStatusSelectInput
                            onChange={(event) => this.handleStatusChange(event, row.training_id, row.training_subject)}
                            value={row.active_status}
                            status={row.active_status}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </ActiveStatusSelectInput>
                    ),
            },
        ]

        const cellStyles = {
            headCells: {
                style: {
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#000", 
                },
            },
        };
        

        return(
            <>
            <TableContainer>
                <DataTable 
                    title={<TableTitle>All Programs</TableTitle>}
                    columns={columns}
                    data={filteredTrainings}
                    customStyles={cellStyles}
                    pagination
                    persistTableHead
                    highlightOnHover
                    pointerOnHover
                    onRowClicked={this.handleRowClick}
                    noDataComponent={<NoRecordsText>No Programs</NoRecordsText>}
                    actions = {
                            <FlexContainer>
                                <SearchBox
                                type="text"
                                placeholder="Search by Subject"
                                value={trainingsSearchQuery}
                                onChange={this.handleTrainingsSearchChange}
                                />
                                <BlueBtn style={{marginLeft: '20px', marginRight: '20px'}} onClick={this.openAddTrainingModal}>New Program </BlueBtn>
                                <OutlineBtn onClick={this.handleDownloadTrainingReport}>Get Report</OutlineBtn>    
                            </FlexContainer>                    
                    }
                />
            </TableContainer>
              
            <AddNewTrainingModal isAddTrainingModalOpen={isAddTrainingModalOpen} closeAddTrainingModal={this.closeAddTrainingModal} 
            handleTrainingAdded = {this.handleTrainingAdded}
            />
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
                {this.renderTrainings()}
                <hr />
                {this.renderCompletedTrainings()}                  
            </>
        )
    }
}

export default withRouter(AdminTraining) 