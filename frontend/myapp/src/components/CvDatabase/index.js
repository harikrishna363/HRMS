import { Component } from "react";
import DataTable from "react-data-table-component";
import { CSVImporter } from "csv-import-react";
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import styled from "styled-components";

import AppContext from "../../Context/AppContext";
import Source from "../Source";
import { ActiveStatusSelectInput, BlueBtn, Container, 
    NoRecordsText, RetryBtn, TableContainer, TableTitle } from "../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

const FiltersContainer = styled.div`
    width: 80%;
    display: flex;
    justify-content: space-around;
`;

class CvDatabase extends Component {
    state = {
        apiStatus: apiStatusConstants.loading,
        cvList: [],
        filteredCvList: [],
        filter: "all",
        isOpen: false,
    };

    componentDidMount() {
        this.fetchCvList();
    }

    fetchCvList = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})

        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cv`, options);

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json();

            this.setState({
                cvList: data,
                apiStatus: apiStatusConstants.success
            }, this.filterCv);

        } catch (err) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
    };

    handleOpen = () => {
        this.setState({ isOpen: true });
    };

    handleClose = () => {
        this.setState({ isOpen: false });
    };

    handleComplete = async (candidateData) => {
        this.setState({isOpen: false})

        const pendingToast = toast.loading("Uploading Candidate(s)...");

        try {
            const jwtToken = Cookies.get("jwt_token");

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(candidateData),
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/upload-cv`, options);
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
        
            this.fetchCvList()

        } catch (error) {
            toast.update(pendingToast, {
              render: "Network error. Please try again later.",
              type: "error",
              isLoading: false,
              autoClose: 4000,  
          });        
        }
    };

    filterCv = () => {
        const {filter} = this.state
        let filteredCvList = this.state.cvList;
    
        switch (filter) {
            case "Active":
            case "Inactive":
                // Filter by `active_status`
                filteredCvList = this.state.cvList.filter(cv => cv.active_status === filter);
                break;
            
            case "Accepted":
            case "Rejected":
                // Filter by `status`
                filteredCvList = this.state.cvList.filter(cv => cv.status === filter);
                break;
    
            case "Shortlisted":
                // Filter by `shortlisted_for_future`
                filteredCvList = this.state.cvList.filter(cv => cv.shortlisted_for_future === "Yes");
                break;
    
            default:
                // Show all CVs if 'All' is selected
                filteredCvList = this.state.cvList;
                break;
        }
    
        this.setState({
            filteredCvList
        });
    }

    handleFilterChange = (event) => {
        const filter = event.target.value;
        let filteredCvList = this.state.cvList;
    
        switch (filter) {
            case "Active":
            case "Inactive":
                // Filter by `active_status`
                filteredCvList = this.state.cvList.filter(cv => cv.active_status === filter);
                break;
            
            case "Accepted":
            case "Rejected":
                // Filter by `status`
                filteredCvList = this.state.cvList.filter(cv => cv.status === filter);
                break;
    
            case "Shortlisted":
                // Filter by `shortlisted_for_future`
                filteredCvList = this.state.cvList.filter(cv => cv.shortlisted_for_future === "Yes");
                break;
    
            default:
                // Show all CVs if 'All' is selected
                filteredCvList = this.state.cvList;
                break;
        }
    
        this.setState({
            filter: filter,
            filteredCvList: filteredCvList,
        });
    };

    handleStatusChange = async (event, candidate_id) => {
        event.preventDefault();

        const pendingToast = toast.loading(`Updating status...`);

        const newStatus = event.target.value;
    
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/update-candidate-status/${candidate_id}`;
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

            this.fetchCvList();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000, 
            });        
        }
    };

    handleRowClick = (row) => {
        const { history } = this.props; 
        history.push(`/cv-details/${row.candidate_id}`);
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
                        <RetryBtn onClick={this.fetchCvList}>Retry</RetryBtn>
                    </Container> 
              </Source>  
            )
        }

        const { filteredCvList, filter } = this.state;

        const columns = [
            {
                name: 'Name',
                selector: row => row.name,
            },
            {
                name: 'Post Applied',
                selector: row => row.post_applied,
            },
            {
                name: 'Experience',
                selector: row => row.experience,
            },
            {
                name: 'Email',
                selector: row => row.email_id,
            },
            {
                name: 'Phone',
                selector: row => row.phone_no,
            },
            {
                name: 'Received Date',
                selector: row => row.date_received,
            },
            {
                name: 'Action',
                center: true,
                cell: row => (
                    <ActiveStatusSelectInput
                        onChange={(event) => this.handleStatusChange(event, row.candidate_id)}
                        value={row.active_status}
                        status={row.active_status}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </ActiveStatusSelectInput>
                ),
            },
        ];

        const cellStyles = {
            headCells: {
                style: {
                    fontWeight: "bold",
                    fontSize: "14px",
                }
            }
        };

        return (
            <Source>
                <FiltersContainer style={{ marginBottom: '20px' }}>
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            value="all"
                            checked={filter === "all"}
                            onChange={this.handleFilterChange}
                        />
                        All
                    </label>

                    <label style={{ marginLeft: '10px' }}>
                        <input
                            type="radio"
                            name="filter"
                            value="Active"
                            checked={filter === "Active"}
                            onChange={this.handleFilterChange}
                        />
                        Active
                    </label>

                    <label style={{ marginLeft: '10px' }}>
                        <input
                            type="radio"
                            name="filter"
                            value="Inactive"
                            checked={filter === "Inactive"}
                            onChange={this.handleFilterChange}
                        />
                        Inactive
                    </label>

                    <label style={{ marginLeft: '10px' }}>
                        <input
                            type="radio"
                            name="filter"
                            value="Shortlisted"
                            checked={filter === "Shortlisted"}
                            onChange={this.handleFilterChange}
                        />
                        Shortlisted for Future
                    </label>

                    <label style={{ marginLeft: '10px' }}>
                        <input
                            type="radio"
                            name="filter"
                            value="Accepted"
                            checked={filter === "Accepted"}
                            onChange={this.handleFilterChange}
                        />
                        Accepted
                    </label>

                    <label style={{ marginLeft: '10px' }}>
                        <input
                            type="radio"
                            name="filter"
                            value="Rejected"
                            checked={filter === "Rejected"}
                            onChange={this.handleFilterChange}
                        />
                        Rejected
                    </label>
                </FiltersContainer>

                <TableContainer>
                    <DataTable
                        title={<TableTitle>CV Database</TableTitle>}
                        columns={columns}
                        data={filteredCvList}
                        customStyles={cellStyles}
                        pagination
                        highlightOnHover
                        persistTableHead
                        pointerOnHover
                        onRowClicked={this.handleRowClick}
                        noDataComponent={<NoRecordsText>No CV Available</NoRecordsText>}
                        actions={
                            <BlueBtn onClick={this.handleOpen}>Upload CV</BlueBtn>
                        }
                    />
                </TableContainer>

                <CSVImporter
                    modalIsOpen={this.state.isOpen}
                    modalOnCloseTriggered={this.handleClose}
                    modalCloseOnOutsideClick={this.handleClose}
                    darkMode={true}
                    onComplete={this.handleComplete}
                    template={{
                        columns: [
                            {
                              name: "name", 
                              key: "name", 
                              required: true, 
                              suggestedMappings: ["name"]
                            },
                            {
                              name: "post_applied", 
                              key: "post_applied", 
                              required: true, 
                              suggestedMappings: ["post_applied"]
                            },
                            {
                              name: "gender", 
                              key: "gender", 
                              required: true, 
                              suggestedMappings: ["gender"]
                            },
                            {
                              name: "dob", 
                              key: "dob", 
                              required: true, 
                              suggestedMappings: ["dob"]
                            },
                            {
                              name: "highest_qualification", 
                              key: "highest_qualification", 
                              suggestedMappings: ["highest_qualification"]
                            },
                            {
                              name: "university", 
                              key: "university", 
                              suggestedMappings: ["university"]
                            },
                            {
                              name: "contact_address", 
                              key: "contact_address", 
                              suggestedMappings: ["contact_address"]
                            },
                            {
                              name: "current_position", 
                              key: "current_position", 
                              suggestedMappings: ["current_position"]
                            },
                            {
                              name: "phone_no", 
                              key: "phone_no", 
                              required: true, 
                              suggestedMappings: ["phone_no"]
                            },
                            {
                              name: "email_id", 
                              key: "email_id", 
                              required: true, 
                              suggestedMappings: ["email_id"]
                            },
                            {
                              name: "linkedin", 
                              key: "linkedin", 
                              suggestedMappings: ["linkedin"]
                            },
                            {
                              name: "languages_familiar", 
                              key: "languages_familiar", 
                              suggestedMappings: ["languages_familiar"]
                            },
                            {
                              name: "experience", 
                              key: "experience", 
                              suggestedMappings: ["experience"]
                            },
                            {
                              name: "accomplishments", 
                              key: "accomplishments", 
                              suggestedMappings: ["accomplishments"]
                            },
                            {
                              name: "other_details", 
                              key: "other_details", 
                              suggestedMappings: ["other_details"]
                            },
                            {
                              name: "source", 
                              key: "source", 
                              suggestedMappings: ["source"]
                            },
                            {
                              name: "date_received", 
                              key: "date_received", 
                              suggestedMappings: ["date_received"]
                            },
                            {
                              name: "samples_attached", 
                              key: "samples_attached", 
                              suggestedMappings: ["samples_attached"]
                            },
                            {
                              name: "cv_attachment", 
                              key: "cv_attachment", 
                              required: true, 
                              suggestedMappings: ["cv_attachment"]
                            },
                            {
                              name: "remarks", 
                              key: "remarks", 
                              suggestedMappings: ["remarks"]
                            }
                          ]
                          
                    }}
                />
            </Source>
        );
    }
}

CvDatabase.contextType = AppContext

export default CvDatabase;
