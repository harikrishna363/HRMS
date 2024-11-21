import { Component } from "react";
import Modal from 'react-modal';
import Cookies from 'js-cookie'
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import DataTable from 'react-data-table-component';

import { Container, NoRecordsText, RetryBtn, TableTitle } from "../../../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class PromotionHistoryModal extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        promotionHistory: []
    }

    componentDidMount() {
        this.fetchPromotionHistory()
    }

    fetchPromotionHistory = async () => {
        this.setState({apiStatus: apiStatusConstants.loading})
        const {employeeId} = this.props

        try{
            const jwtToken = Cookies.get("jwt_token")
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/promotion-history/${employeeId}`, options)

            if (!response.ok) {
                this.setState({apiStatus: apiStatusConstants.failure})
                return
            }

            const data = await response.json()

            this.setState({
                promotionHistory: data,
                apiStatus: apiStatusConstants.success,
            });
        } catch (error) {
            this.setState({apiStatus: apiStatusConstants.failure})
        }
        
    }

    renderComponent = () => {
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
                    <Container style={{flexDirection: 'column', textAlign: 'center'}}>
                        <BiError size={60} />
                        <h2>Error Loading Promotion History</h2>
                        <RetryBtn onClick={this.fetchData}>Retry</RetryBtn>
                    </Container>
                
            )
        }

        const columns = [
            {
                name: 'Promotion Date',
                selector: row => row.promotion_date,
                cell: (row) => (
                    <p>{row.promotion_date}</p>
                )
            },
            {
                name: 'Designation',
                selector: row => row.designation,
                cell: (row) => (
                    <p>{row.designation}</p>
                )
            },
            {
                name: 'Department',
                selector: row => row.department,   
                cell: (row) => (
                    <p>{row.department}</p>
                )    
            },
            {
                name: 'Salary',
                selector: row => row.salary, 
                cell: (row) => (
                    <p>{row.salary}</p>
                )      
            },
            {
                name: 'Remarks',
                selector: row => row.remarks,  
                cell: (row) => (
                    <p>{row.remarks}</p>
                )     
            },
        ]

        const cellStyles = {
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
              }
            }
        }

        return(
            <DataTable
                    title={<TableTitle style={{margin: '0px'}}>Promotion History</TableTitle>}
                    columns={columns}
                    data={this.state.promotionHistory}
                    customStyles={cellStyles}
                    pagination
                    persistTableHead
                    noDataComponent={<NoRecordsText>No Promotion History</NoRecordsText>}
                />  

        )


    }

    render(){
        const {isPromotionHistoryModalOpen, closePromotionHistoryModal} = this.props

        const customStyles = {
            content: {
                width: '50%',
                maxHeight: '70%',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                overflowY: 'auto'
            },
        };

        return(
            <Modal
                isOpen={isPromotionHistoryModalOpen}
                onRequestClose={closePromotionHistoryModal}
                style={customStyles}
                contentLabel="Promotion History Modal"
            >
                {this.renderComponent()}
            </Modal>

        )
    }
}

export default PromotionHistoryModal