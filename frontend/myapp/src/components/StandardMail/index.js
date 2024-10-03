import { Component } from "react";
import DataTable from 'react-data-table-component';
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import styled from "styled-components";

import AppContext from "../../Context/AppContext";
import Source from "../Source";
import AddTemplateModal from "./AddTemplateModal";

import { ActiveStatusSelectInput, AddBtn, BlueBtn, Container, 
    FlexContainer, NoRecordsText, RetryBtn, TableContainer, TableTitle } from "../Source/styledComponent";

const SelectInput = styled.select`
padding: 10px;
margin-right: 20px;
border: 1px solid #3498DB;
border-radius: 5px;
cursor: pointer;
`;

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class StandardMail extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        employees: [],
        mailTemplates: [],
        isAddTemplateModalOpen: false,
        selectedTemplate: '',
        selectedRows: [],
        clearSelectedRows: false,
    }

    componentDidMount(){
        this.fetchData()
    }

    fetchData = async () => {
        this.setState({ apiStatus: apiStatusConstants.loading });

        const employeesUrl = "http://localhost:4000/active-employees";
        const mailTemplatesUrl = "http://localhost:4000/mail-templates";
        const jwtToken = Cookies.get("jwt_token");

        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        };

        try {
            const [employeeResponse, mailTemplatesResponse] = await Promise.all([
                fetch(employeesUrl, options),
                fetch(mailTemplatesUrl, options),
            ]);

            if (!employeeResponse.ok || !mailTemplatesResponse.ok) {
                this.setState({ apiStatus: apiStatusConstants.failure });
                return;
            }

            const employeeData = await employeeResponse.json();
            const mailTemplatesData = await mailTemplatesResponse.json();

            this.setState({
                employees: employeeData,
                mailTemplates: mailTemplatesData,
                apiStatus: apiStatusConstants.success,
            });
        } catch (error) {
            this.setState({ apiStatus: apiStatusConstants.failure });
        }
    };

    openAddTemplateModal = () => {
        this.setState({isAddTemplateModalOpen: true})
    }

    closeAddTemplateModal = () => {
        this.setState({isAddTemplateModalOpen: false})      
    }

    handleTemplateAdded = () => {
        this.fetchMailTemplates()
    };

    handleRowClick = (row) => {
        const { history } = this.props; 
        history.push(`/email-template/${row.name}`);
    };

    closeTemplateDetailsModal = () => {
        this.setState({isTemplateDetailsModalOpen: false})      
    }

    handleTemplateEdited = () => {
        this.fetchMailTemplates()
    };

    fetchEmployees = async () => {
        try {
            const jwtToken = Cookies.get("jwt_token")
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            }
            const response = await fetch(`http://localhost:4000/active-employees`, options);
            if (!response.ok) {
                throw new Error('Failed to fetch Employee details');
            }
            const data = await response.json();
            this.setState({
                employees: data
            });
        } catch (err) {
            console.error(err);
        }
    }

    fetchMailTemplates = async () => {
        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`http://localhost:4000/mail-templates`, options);
            if (!response.ok) {
                throw new Error('Failed to fetch Employee details');
            }
            const data = await response.json();
            this.setState({
                mailTemplates: data
            });
        } catch (err) {
            console.error(err);
        }

    }

    handleSelectTemplateChange = (e) => {
        const {value} = e.target
        this.setState({selectedTemplate: value})
    }

    handleSendMail = async () => {
        const { selectedRows, selectedTemplate } = this.state;
        const employeeMails = selectedRows.map(row => row.email);

        if (employeeMails.length === 0){
            toast.error('Please select employees to send mail', {
                autoClose: 4000,
            });
            return
        }

        if (selectedTemplate === ''){
            toast.error('Please Select a Template to send mail', {
                autoClose: 4000,
            });
            return
        }

        const pendingToast = toast.loading("Sending Mail to Selected Employee(s)...");

        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({selectedTemplate, employeeMails}),
            }

            const response = await fetch(`http://localhost:4000/send-mail`, options);
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
        
            this.setState({clearSelectedRows: true, selectedRows: []})

        } catch (error) {
            toast.update(pendingToast, {
              render: "Network error. Please try again later.",
              type: "error",
              isLoading: false,
              autoClose: 4000,  
          });        
        }
    }

    handleRowSelected = (rows) => {
        this.setState({ selectedRows: rows.selectedRows });
    }

    handleStatusChange = async (event, name) => {
        event.preventDefault();

        const pendingToast = toast.loading(`Updating ${name} status...`);

        const newStatus = event.target.value;
    
        const apiUrl = `http://localhost:4000/update-mail-template-status/${name}`;
        const jwtToken = Cookies.get("jwt_token");
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ status: newStatus }),
        };
        try {
            const response = await fetch(apiUrl, options);  
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

            this.fetchMailTemplates();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
    };

    renderEmployees = () => {
        const {employees, selectedTemplate, mailTemplates} = this.state
        const activeTemplates = mailTemplates.filter((template) => (template.status === 'Active'))

        const cellStyles = {
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
              }
            }
        }

        const employeeColumns = [
            { name: "ID", selector: row => row.id, sortable: true},
            { name: "Name", selector: row => row.name},
            { name: "Designation", selector: row => row.designation},
            { name: "Email", selector: row => row.email},
        ]

        return(
            <TableContainer>
            <DataTable
                title={<TableTitle>Employees</TableTitle>}
                columns={employeeColumns}
                data={employees}
                customStyles={cellStyles}
                pagination
                persistTableHead
                selectableRows
                noContextMenu
                noDataComponent={<NoRecordsText>No Employee Available</NoRecordsText>}
                onSelectedRowsChange={this.handleRowSelected}
                clearSelectedRows={this.state.clearSelectedRows}
                actions = {
                    <FlexContainer>
                        <SelectInput value={selectedTemplate} onChange={this.handleSelectTemplateChange}>
                            <option value="" disabled>Select Template</option>
                            {activeTemplates.map(template => (
                                <option key={template.name} value={template.name}>{template.name}</option>
                            ))}

                        </SelectInput>
                        <AddBtn onClick={this.handleSendMail}>Send Mail</AddBtn>
                    </FlexContainer>
                }
            />

            </TableContainer>

        )
        

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
        const {mailTemplates, isAddTemplateModalOpen} = this.state

        const cellStyles = {
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
              }
            }
        }

        const templateColumns = [
            { name: "Name", selector: row => row.name, sortable: true},
            { name: "Subject", selector: row => row.subject},
            {
                name: "Action",
                center: true,
                cell: row => (
                    <ActiveStatusSelectInput
                        onChange={(event) => this.handleStatusChange(event, row.name)}
                        value={row.status}
                        status={row.status}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </ActiveStatusSelectInput>
                ),            
            }
        ]

        return(
            <Source>
                {this.renderEmployees()}
                
                <TableContainer style={{width: '70%'}}>
                <DataTable
                    title={<TableTitle>Mail Templates</TableTitle>}
                    columns={templateColumns}
                    data={mailTemplates}
                    customStyles={cellStyles}
                    pagination
                    highlightOnHover
                    persistTableHead
                    pointerOnHover
                    noDataComponent={<NoRecordsText>No Templates Available</NoRecordsText>}
                    onRowClicked={this.handleRowClick}
                    actions = {
                        <BlueBtn onClick={this.openAddTemplateModal}>Add Template</BlueBtn>
                    }
                />
                <AddTemplateModal 
                isAddTemplateModalOpen={isAddTemplateModalOpen} 
                closeAddTemplateModal={this.closeAddTemplateModal} 
                handleTemplateAdded={this.handleTemplateAdded}
                />

                </TableContainer>             

            </Source>

        )
    }
}

StandardMail.contextType = AppContext

export default StandardMail