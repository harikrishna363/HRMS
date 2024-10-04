import { Component } from "react";
import Cookies from "js-cookie";
import DataTable from 'react-data-table-component';
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import { toast } from 'react-toastify';

import AppContext from "../../Context/AppContext";
import Source from "../Source"
import AddEmployeeModal from "./AddEmployeeModal";

import { ActiveStatusSelectInput, BlueBtn, Container, 
    FlexContainer, NoRecordsText, OutlineBtn, RetryBtn, TableTitle } from "../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class Employee extends Component {

    state = {
        apiStatus: apiStatusConstants.loading,
        showModal: false,
        employeeList: []
    }

    componentDidMount(){
        this.fetchEmployees()
    }

    fetchEmployees = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})

        try{
            const jwtToken = Cookies.get("jwt_token")
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee`, options)

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json()
            this.setState({employeeList: data, apiStatus: apiStatusConstants.success})

        } catch (error) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
        
    }

    handleStatusChange = async (event, employee_id) => {
        event.preventDefault();

        const pendingToast = toast.loading(`Updating ${employee_id} status`);

        const newStatus = event.target.value;
    
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

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-employee-status/${employee_id}`, options);    
            
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

            this.fetchEmployees();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
    };

    handleOpenModal = () => {
        this.setState({ showModal: true });
      };
    
    handleCloseModal = () => {
        this.setState({ showModal: false });
    };

    handleRowClick = (row) => {
        const { history } = this.props; 
        history.push(`/employee/${row.employee_id}`);
    };

    handleDownloadEmployeeReport = async () => {
        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee-report`, options);
    
            if (!response.ok) {
                throw new Error('Failed to download report');
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employee_report.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
    
        } catch (error) {
            console.error("Error downloading employee report:", error);
            alert("Failed to download the report.");
        }
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
                        <RetryBtn onClick={this.fetchEmployees}>Retry</RetryBtn>
                    </Container>
                </Source>
                
            )
        }

        const cellStyles = {
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
              }
            }
        }

        const columns = [
            {
                name: 'ID',
                width: '80px',
                selector: row => row.employee_id,
                 
            },
            {
                name: 'Name',
                selector: row => row.name,
            },
            {
                name: 'Email',
                selector: row => row.email,       
            },
            {
                name: 'Phone',
                selector: row => row.phone_number,       
            },
            {
                name: 'Department',
                selector: row => row.department,
            },
            {
                name: 'Designation',
                selector: row => row.designation,          
            },
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

        return(
            <Source>
                <DataTable
                    title={<TableTitle>Employees</TableTitle>}
                    columns={columns}
                    data={this.state.employeeList}
                    customStyles={cellStyles}
                    pagination
                    highlightOnHover
                    persistTableHead
                    pointerOnHover
                    onRowClicked={this.handleRowClick}
                    noDataComponent={<NoRecordsText>No Employee Records</NoRecordsText>}
                    actions = {
                        <FlexContainer>
                            <BlueBtn onClick={this.handleOpenModal}>Add Employee</BlueBtn>
                            <OutlineBtn style={{marginLeft: '20px'}} onClick={this.handleDownloadEmployeeReport}>Get Report</OutlineBtn>
                        </FlexContainer>
                    }
                />  
                <AddEmployeeModal
                    showModal={this.state.showModal}
                    handleClose={this.handleCloseModal}
                />
            </Source>
        )
    }
}

Employee.contextType = AppContext

export default Employee