import { Component } from "react";
import DataTable from "react-data-table-component";
import { CSVImporter } from "csv-import-react";
import Cookies from 'js-cookie'
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { toast } from 'react-toastify';
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";

import AppContext from "../../../Context/AppContext";
import Source from "../../Source"; 

import { FlexContainer, Input, SelectInput, TextArea, SearchBox, 
    BackButton, Title, InputWrapper, BlueBtn, CancelButton, SaveButton, 
    TableContainer, TableTitle, NoRecordsText, ActiveStatusSelectInput, RetryBtn, Container } from "../../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class TrainingDetails extends Component {
    state = {
        apiStatus: apiStatusConstants.loading,
        trainingDetails: null,
        originalTrainingDetails: {},
        registeredEmployees: [],
        isEdited: false,
        employeeSearchQuery: '',
        filteredEmployeeData: [],
        isModalOpen: false,
        trainingId: this.props.match.params.trainingId,
    }

    componentDidMount() {
        this.fetchTrainingDetails();
    }

    fetchTrainingDetails = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const {trainingId} = this.state

        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/training/${trainingId}`, options);

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json();

            this.setState({
                trainingDetails: data.trainingDetails,
                originalTrainingDetails: data.trainingDetails,
                registeredEmployees: data.registeredEmployees,
                filteredEmployeeData: data.registeredEmployees,
                apiStatus: apiStatusConstants.success
            }, this.filterEmployeeData);

        } catch (err) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            trainingDetails: {
                ...prevState.trainingDetails,
                [name]: value
            },
            isEdited: true 
        }));
    }

    handleSaveChanges = async () => {
        const { trainingDetails, trainingId } = this.state;

        const pendingToast = toast.loading(`Saving Changes for ${trainingDetails.training_subject} ...`);

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(trainingDetails),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-training/${trainingId}`, options);
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

            this.fetchTrainingDetails();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
    }

    handleCancelChanges = () => {
        this.setState((prevState) => ({
            trainingDetails: prevState.originalTrainingDetails,
            isEdited: false, 
        }));
    };

    handleemployeeSearchChange = (event) => {
        const employeeSearchQuery = event.target.value.toLowerCase();
        this.setState({ employeeSearchQuery }, this.filterEmployeeData);
    };

    filterEmployeeData = () => {
        const { registeredEmployees, employeeSearchQuery } = this.state;

        if (employeeSearchQuery === "") {
          this.setState({ filteredEmployeeData: registeredEmployees });
        } else {
          const filteredEmployeeData = registeredEmployees.filter(row => 
            row.name.toLowerCase().includes(employeeSearchQuery)
          );
          this.setState({ filteredEmployeeData });
        }
    };

    handleOpen = () => {
        this.setState({ isModalOpen: true });
    };

    handleClose = () => {
        this.setState({ isModalOpen: false });
    };

    handleComplete = async (employeeData) => {
        this.setState({isModalOpen: false})

        const pendingToast = toast.loading("Registering Employee(s)...");

        const {trainingId} = this.state

        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(employeeData),
            }

          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/training/${trainingId}/register-employees`, options);
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
    
        this.fetchTrainingDetails(trainingId)
    
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

    handleStatusChange = async (event, employee_id) => {
        event.preventDefault();
        const {trainingId} = this.state
        const newStatus = event.target.value;

        const pendingToast = toast.loading(`Updating status...`);
            
        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({ status: newStatus, employee_id }),
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-employee-training-status/${trainingId}`, options); 
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

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
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
                        <RetryBtn onClick={this.fetchTrainingDetails}>Retry</RetryBtn>
                    </Container> 
              </Source>  
            )
        }
        const { trainingDetails, filteredEmployeeData, isEdited, employeeSearchQuery, isModalOpen } = this.state;

        const columns = [
            { name: "ID", selector: row => row.employee_id, sortable: true},
            { name: "Name", selector: row => row.name, sortable: true },
            { name: "Mail", selector: row => row.email },
            { name: "Designation", selector: row => row.designation },
            {
                name: 'Action',
                center: true,
                cell: row => (
                        <ActiveStatusSelectInput
                            onChange={(event) => this.handleStatusChange(event, row.employee_id)}
                            value={row.status}
                            status={row.status}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </ActiveStatusSelectInput>
                    ),
            },
        ]

        const customStyles = {
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
              }
            }
        }

        return (
            <Source>
                <BackButton onClick={this.handleBackButtonClick}> <MdOutlineArrowBackIosNew size={20}/></BackButton>
                
                <Title style={{marginTop: '0px'}}>Training Details</Title>

                <InputWrapper>
                    <Input
                        type="text"
                        name="training_subject"
                        value={trainingDetails.training_subject}
                        onChange={this.handleInputChange}
                    />
                    <label>Subject</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="text"
                        name="trainer_name"
                        value={trainingDetails.trainer_name}
                        onChange={this.handleInputChange}
                    />
                    <label>Trainer</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="start_date"
                        value={trainingDetails.start_date}
                        onChange={this.handleInputChange}
                    />
                    <label>Start Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="date"
                        name="end_date"
                        value={trainingDetails.end_date}
                        onChange={this.handleInputChange}
                    />
                    <label>End Date</label>
                </InputWrapper>

                <InputWrapper>
                    <Input
                        type="number"
                        name="training_hours"
                        value={trainingDetails.training_hours}
                        onChange={this.handleInputChange}
                    />
                    <label>Training Hours</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        name="training_method"
                        value={trainingDetails.training_method}                       
                        onChange={this.handleInputChange}
                    >
                        <option value="Online">Online</option>
                        <option value="In-person">In-person</option>
                        <option value="Hybrid">Hybrid</option>
                    </SelectInput>
                    <label>Method</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        name='progress_status' 
                        value={trainingDetails.progress_status} 
                        onChange={this.handleInputChange}
                    >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </SelectInput>
                    <label>Progress Status</label>
                </InputWrapper>

                <InputWrapper>
                    <SelectInput
                        name='active_status' 
                        value={trainingDetails.active_status} 
                        onChange={this.handleInputChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </SelectInput>
                    <label>Active Status</label>
                </InputWrapper>

                <br />

                <InputWrapper>
                    <TextArea
                    name="remarks"
                    value={trainingDetails.remarks}
                    onChange={this.handleInputChange}
                    rows="3"
                />
                    <label>Remarks</label>
                </InputWrapper>

                <FlexContainer style={{justifyContent: 'center'}}>
                    <SaveButton
                        onClick={this.handleSaveChanges}
                        disabled={!isEdited} 
                    >
                        Save
                    </SaveButton>
                    <CancelButton 
                    onClick={this.handleCancelChanges}
                    disabled={!isEdited}
                    >
                        Cancel
                    </CancelButton>
                </FlexContainer>  

                <hr />

                <TableContainer>
                    <DataTable 
                        title={<TableTitle>Registered Employees</TableTitle>}
                        columns={columns}
                        data={filteredEmployeeData}
                        customStyles={customStyles}
                        pagination
                        highlightOnHover
                        persistTableHead
                        noDataComponent={<NoRecordsText>Employees Not Registered Yet</NoRecordsText>}
                        actions = {
                                <FlexContainer>
                                    <SearchBox
                                        type="text"
                                        placeholder="Search by Employee Name"
                                        value={employeeSearchQuery}
                                        onChange={this.handleemployeeSearchChange}
                                    />
                                    <BlueBtn style={{marginLeft: '20px'}} onClick={this.handleOpen}>Add Employee</BlueBtn>          
                                </FlexContainer>
                                
                                                    
                        }
                    />
                </TableContainer>
                <CSVImporter
                        modalIsOpen={isModalOpen}
                        modalOnCloseTriggered={this.handleClose}
                        modalCloseOnOutsideClick={this.handleClose}
                        darkMode={true}
                        onComplete={this.handleComplete}
                        template={{
                            columns : [
                            {
                            name: "employee_id",
                            key: "employee_id",
                            required: true,
                            suggested_mappings: ["employee_id"],
                            }
                        ],
                        
                        }}
                />
            </Source>
        );
    }
}

TrainingDetails.contextType = AppContext

export default TrainingDetails;
