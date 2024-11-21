import { Component } from "react";
import DataTable from "react-data-table-component";
import { format } from 'date-fns';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Oval } from "react-loader-spinner"; 
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';

import AppContext from "../../../Context/AppContext";
import { NoRecordsText, RangeButton, RangeContainer, TableTitle, ViewPayslip } from "../../Source/styledComponent";

class UserPayroll extends Component{

    state = {
        selectedMonth: new Date(),
        payrollData: [],
        isPayrollLoading: true
    }

    componentDidMount(){
        this.fetchMyPayroll()
    }

    fetchMyPayroll = async () => {
        this.setState({isPayrollLoading: true})

        const {selectedMonth} = this.state
        const formattedMonth = format(selectedMonth, 'MMM yyyy'); // Format as YYYY-MM
        const {employeeId} = this.props

        try{
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response =await fetch(`${process.env.REACT_APP_API_BASE_URL}/user-payroll/${employeeId}?month=${formattedMonth}`, options)
            const data = await response.json()

            if (!response.ok) {
                toast.error(`Failed to Fetch Payroll Details`, {
                  autoClose: 4000, 
            });
            }

            this.setState({ payrollData: data, isPayrollLoading: false})
        }catch (err) {
            toast.error(`Network error. Please try again later.`, {
              autoClose: 4000, 
          });
        }
    }

    handleMonthChange = (months) => {
        const { selectedMonth } = this.state;
        const newSelectedMonth = new Date(selectedMonth);
        newSelectedMonth.setMonth(selectedMonth.getMonth() + months);
    
        this.setState({
          selectedMonth: newSelectedMonth,
        }, this.fetchMyPayroll);
    };

    handleAction = async (row) => {
        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payslip/${row.payroll_id}`, options);
            
            if (!response.ok) {
                toast.error(`Failed to Fetch Leave Requests`, {
                  autoClose: 4000, 
              });
              return
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            window.open(url);
        } catch (err) {
          toast.error(`Network error. Please try again later.`, {
            autoClose: 4000, 
        });
      }
    };

    render(){
        const { selectedMonth, payrollData } = this.state;

        const columns = [
            { name: "Payment Mode", selector: row => row.payment_mode },
            { name: "Bank Name", selector: row => row.bank_name },
            { name: "Account Number", selector: row => row.account_number },
            { name: "Payment Date", selector: row => row.payment_date, sortable: true },
            { name: "Pay Period", selector: row => row.pay_period },
            { name: "Net Salary", selector: row => row.net_salary, sortable: true },
            {
              name: "Action",
              cell: row => <ViewPayslip onClick={() => this.handleAction(row)}>View Payslip</ViewPayslip>
            }
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
            <>
            <p style={{textAlign: 'center'}}>To view your payslip, choose the month</p>
            <DataTable 
                title={<TableTitle>My Payroll</TableTitle>}
                columns={columns}
                data={payrollData}
                customStyles={cellStyles}
                persistTableHead
                noDataComponent={<NoRecordsText>No Payroll Available</NoRecordsText>}
                progressPending={this.state.isPayrollLoading} 
                progressComponent={ <div style={{marginTop: '20px'}}><Oval height={40} width={40} color="#3498DB" /></div>}
                actions = {
                        <RangeContainer>
                            <RangeButton onClick={() => this.handleMonthChange(-1)}> <MdOutlineKeyboardArrowLeft size={20}/></RangeButton>
                            <div style={{ margin: '0 10px', fontSize: '16px', color: '#6c757d' }}>
                                {format(selectedMonth, 'MMM yyyy')}
                            </div>
                            <RangeButton onClick={() => this.handleMonthChange(1)}> <MdOutlineKeyboardArrowRight size={20} /> </RangeButton>
                        </RangeContainer>                    
                }
            />
            </>

        )
    }
}

UserPayroll.contextType = AppContext

export default UserPayroll