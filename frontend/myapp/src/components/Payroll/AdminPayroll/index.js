import { Component } from "react";
import DataTable from "react-data-table-component";
import { format } from 'date-fns';
import { CSVImporter } from "csv-import-react";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Oval } from "react-loader-spinner"; 
import { toast } from 'react-toastify';
import { BiError } from "react-icons/bi";
import Cookies from 'js-cookie'

import { AlignStartFlexContainer, BlueBtn, Container, FlexContainer, NoRecordsText, OutlineBtn, 
  RangeButton, RangeContainer, RetryBtn, SearchBox, TableContainer, 
  TableTitle,
  ViewPayslip} from "../../Source/styledComponent";
import { DeleteButton } from "./styledComponent";

const apiStatusConstants = {
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class AdminPayroll extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        isOpen: false,
        filteredData: [],
        searchQuery: "",
        payrollData: [],
        selectedMonth: new Date(),
        selectedRows: [],
        clearSelectedRows: false,
    };

    componentDidMount() {
        this.fetchPayrollData();
    }

    handleOpen = () => {
        this.setState({ isOpen: true });
    };

    handleClose = () => {
        this.setState({ isOpen: false });
    };

    handleComplete = async (payrollData) => {
      this.setState({ isOpen: false });
  
      for (const row of payrollData.rows) {
          const { values } = row;

          // Ensure required fields are filled
          if (!values.employee_id || !values.level || !values.account_number || !values.bank_name || !values.pf_number || 
              !values.insurance || !values.esi || !values.tax_regime || !values.pay_period || !values.basic || 
              !values.hra || !values.conveyance || !values.medical || !values.food_allowance || !values.dress_allowance || 
              !values.telephone_internet || !values.lta || !values.newspaper_periodicals || !values.special_allowance || 
              !values.other_allowance || !values.variable_pay || !values.incentive || !values.gross_salary || 
              !values.pf || !values.pt || !values.income_tax || !values.others || !values.loan || !values.total_deductions || 
              !values.net_salary || !values.payment_mode || !values.payment_date) {
              return toast.error('Required Fields cannot be empty');
          }

          if (values.remarks.length > 100) {
            return toast.error('Remarks must be atmost 100 characters');
          }
  
          const decimalFields = ['basic', 'hra', 'conveyance', 'medical', 'lta', 'special_allowance', 
                                 'other_allowance', 'variable_pay', 'incentive', 'food_allowance', 
                                 'dress_allowance', 'telephone_internet', 'newspaper_periodicals', 
                                 'total_deductions', 'pf', 'pt', 'income_tax', 'others', 'loan', 
                                 'insurance', 'esi', 'gross_salary', 'net_salary'];
  
          decimalFields.forEach(field => {
              if (values[field] === '0') {
                  values[field] = "-";
              }
          });
      }
  
      const pendingToast = toast.loading("Importing Payroll...");
  
      try {
          const jwtToken = Cookies.get("jwt_token");
          const options = {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${jwtToken}`,
              },
              body: JSON.stringify(payrollData),
          };
  
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/upload-payroll`, options);
          const data = await response.json();
  
          if (!response.ok) {
              toast.update(pendingToast, {
                  render: data.failure,
                  type: "error",
                  isLoading: false,
                  autoClose: 4000,
              });
  
              return;
          }
  
          toast.update(pendingToast, {
              render: data.success,
              type: "success",
              isLoading: false,
              autoClose: 4000,
          });
  
          this.fetchPayrollData();
  
      } catch (error) {
          toast.update(pendingToast, {
              render: "Network error. Please try again later.",
              type: "error",
              isLoading: false,
              autoClose: 4000,
          });
      }
  };  
  
    fetchPayrollData = async () => {
      this.setState({apiStatus: apiStatusConstants.loading})

      const { selectedMonth } = this.state;
      const formattedMonth = format(selectedMonth, 'MMM yyyy'); 

      try {
        const jwtToken = Cookies.get("jwt_token");
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        };

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payroll?month=${formattedMonth}`, options);

        if (!response.ok) {
          this.setState({apiStatus: apiStatusConstants.failure})
          return 
        }

        const data = await response.json();
        this.setState({ payrollData: data, filterData: data, apiStatus: apiStatusConstants.success }, this.filterData);

      } catch (error) {
        this.setState({apiStatus: apiStatusConstants.failure})
      }
    };
    
    handleMonthChange = (months) => {
        const { selectedMonth } = this.state;
        const newSelectedMonth = new Date(selectedMonth);
        newSelectedMonth.setMonth(selectedMonth.getMonth() + months);
    
        this.setState({
          selectedMonth: newSelectedMonth,
        }, this.fetchPayrollData);
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
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
    
                window.open(url);
            } else {
              toast.error('Failed to fetch payslip', {
                autoClose: 4000
              })
            }
        } catch (error) {
          toast.error('Network error. Please try again later.', {
            autoClose: 4000
          })        
        }
    };
    
    handleSearchChange = (event) => {
        const searchQuery = event.target.value.toLowerCase();
        this.setState({ searchQuery }, this.filterData);
    };

    filterData = () => {
        const { payrollData, searchQuery } = this.state;
        if (searchQuery === "") {
          this.setState({ filteredData: payrollData });
        } else {
          const filteredData = payrollData.filter(row => 
            row.employeeName.toLowerCase().includes(searchQuery)
          );
          this.setState({ filteredData });
        }
    };

    handleTemplateDownload = () => {
        // Example data
        const data = [
          [
              'employee_id', 'level', 'account_number', 
              'bank_name', 'pf_number(UAN)', 'insurance', 'esi', 'tax_regime', 'pay_period', 'basic', 'hra', 'conveyance', 
              'medical',  'food_allowance', 'dress_allowance', 'telephone_internet', 'lta', 'newspaper_periodicals', 
              'special_allowance', 'other_allowance', 'variable_pay', 'incentive', 'gross_salary', 'pf', 'pt', 'income_tax', 
              'others', 'loan', 'total_deductions', 'net_salary', 'payment_mode', 'payment_date', 'remarks'
          ]
      ];
      
    
        // Convert the array data into CSV format
        const csvContent = data.map(row => row.join(',')).join('\n');
    
        // Create a Blob from the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
        // Create a link element to trigger the download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'payroll_template.csv');
    
        // Append the link to the body (required for Firefox)
        document.body.appendChild(link);
    
        // Trigger the download
        link.click();
    
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    handleRowSelected = (rows) => {  
      this.setState({ selectedRows: rows.selectedRows });
    };

    handleDeletePayroll = async () => {
      const pendingToast = toast.loading("Deleting Payslip(s)...");
      const payrollIds = this.state.selectedRows.map(row => row.payroll_id)
  
      try {
          const jwtToken = Cookies.get("jwt_token");
          const options = {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${jwtToken}`,
              },
              body: JSON.stringify({payrollIds}),
          };
  
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delete-payroll`, options);
          const data = await response.json();
  
          if (!response.ok) {
              toast.update(pendingToast, {
                  render: data.failure,
                  type: "error",
                  isLoading: false,
                  autoClose: 4000,
              });
  
              return;
          }
  
          toast.update(pendingToast, {
              render: data.success,
              type: "success",
              isLoading: false,
              autoClose: 4000,
          });
  
          this.fetchPayrollData();
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

    render(){
        const { selectedMonth, filteredData, searchQuery, isOpen } = this.state;

        if (this.state.apiStatus === apiStatusConstants.failure) {
          return (
            <Container style={{flexDirection: 'column'}}>
                <BiError size={60} />
                <h2>Error Loading Page</h2>
                <RetryBtn onClick={this.fetchPayrollData}>Retry</RetryBtn>
            </Container>   
          )
      }

        const columns = [
          { name: <p>ID</p>, selector: row => row.employeeId, sortable: true, width: '80px', 
            cell: (row) => (
              <p>{row.employeeId}</p>
            )
            
           },
          { name: <p>Employee Name</p>, width: '150px', selector: row => row.employeeName, sortable: true,
            cell: (row) => (
              <p>{row.employeeName}</p>
            )
           },
          { name: <p>Department</p>,width: '150px', selector: row => row.department, sortable: true,
            cell: (row) => (
              <p>{row.department}</p>
            )
           },
          { name: <p>Designation</p>,width: '150px', selector: row => row.designation,
            cell: (row) => (
              <p>{row.designation}</p>
            )
           },
          { name: <p>Email</p>, width: '150px', selector: row => row.email,
            cell: (row) => (
              <p>{row.email}</p>
            )
           },
          { name: <p>Payment Mode</p>,width: '150px', selector: row => row.paymentMode,
            cell: (row) => (
              <p>{row.paymentMode}</p>
            )
           },
          { name: <p>Bank Name</p>,width: '150px', selector: row => row.bankName,
            cell: (row) => (
              <p>{row.bankName}</p>
            )
           },
          { name: <p>Account Number</p>,width: '150px', selector: row => row.accountNumber,
            cell: (row) => (
              <p>{row.accountNumber}</p>
            )
           },
          { name: <p>Payment Date</p>,width: '150px', selector: row => row.paymentDate, sortable: true,
            cell: (row) => (
              <p>{row.paymentDate}</p>
            )
           },
          { name: <p>Pay Period</p>,width: '150px', selector: row => row.payPeriod,
            cell: (row) => (
              <p>{row.payPeriod}</p>
            )
           },
          { name: <p>Net Salary</p>,width: '150px', selector: row => row.netSalary, sortable: true,
            cell: (row) => (
              <p>{row.netSalary}</p>
            )
           },
          {
            name: "Action", width: '150px', center: true,
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
            <AlignStartFlexContainer>
                <OutlineBtn onClick={this.handleTemplateDownload} style={{marginRight: '20px'}}>Download CSV Template</OutlineBtn>
                <BlueBtn onClick={this.handleOpen}>Upload Payroll</BlueBtn>
            </AlignStartFlexContainer>

            <p style={{textAlign: 'center'}}>To view payslips, choose the month</p>

            <TableContainer>
              <DataTable 
                  title={<TableTitle>Payroll Records</TableTitle>}
                  columns={columns}
                  data={filteredData}
                  customStyles={cellStyles}
                  pagination
                  persistTableHead
                  selectableRows
                  noContextMenu
                  onSelectedRowsChange={this.handleRowSelected}
                  clearSelectedRows={this.state.clearSelectedRows}
                  noDataComponent={<NoRecordsText>No Payroll Records</NoRecordsText>}
                  progressPending={this.state.apiStatus === apiStatusConstants.loading} 
                  progressComponent={ <div style={{marginTop: '20px'}}><Oval height={40} width={40} color="#3498DB" /></div>}
                  actions = {
                      <FlexContainer>
                          <DeleteButton disabled={this.state.selectedRows.length === 0} onClick={this.handleDeletePayroll}>Delete</DeleteButton>
                          <RangeContainer>
                          <RangeButton onClick={() => this.handleMonthChange(-1)}> <MdOutlineKeyboardArrowLeft size={20}/></RangeButton>
                          <div style={{ margin: '0 10px', fontSize: '16px', color: '#6c757d' }}>
                              {format(selectedMonth, 'MMM yyyy')}
                          </div>
                          <RangeButton onClick={() => this.handleMonthChange(1)}> <MdOutlineKeyboardArrowRight size={20} /> </RangeButton>
                          </RangeContainer>
                          <SearchBox
                            type="text"
                            placeholder="Search by employee name"
                            value={searchQuery}
                            onChange={this.handleSearchChange}
                            style={{ padding: '8px', fontSize: '16px', width: '300px' }}
                          />
                      </FlexContainer>
                      
                  }
              />
            </TableContainer>
            <CSVImporter
                modalIsOpen={isOpen}
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
                    }, 
                    {
                    name: "level",
                    key: "level",
                    required: true,
                    suggested_mappings: ["level"],
                    },   
                    {
                    name: "account_number",
                    key: "account_number",
                    required: true,
                    suggested_mappings: ["account_number"],
                    },                                     
                    {
                    name: "bank_name",
                    key: "bank_name",
                    required: true,
                    suggested_mappings: ["bank_name"],
                    },
                    {
                    name: "pf_number(UAN)",
                    key: "pf_number",
                    required: true,
                    suggested_mappings: ["pf_number(UAN)"],
                    },
                    {
                    name: "insurance",
                    key: "insurance",
                    required: true,
                    suggested_mappings: ["insurance"],
                    },
                    {
                    name: "esi",
                    key: "esi",
                    required: true,
                    suggested_mappings: ["esi"],
                    },                    
                    {
                    name: "tax_regime",
                    key: "tax_regime",
                    required: true,
                    suggested_mappings: ["tax_regime"],
                    },
                    {
                    name: "pay_period",
                    key: "pay_period",
                    required: true,
                    suggested_mappings: ["pay_period"],
                    },   
                    {
                    name: "basic",
                    key: "basic",
                    required: true,
                    suggested_mappings: ["basic"],
                    },
                    {
                    name: "hra",
                    key: "hra",
                    required: true,
                    suggested_mappings: ["hra"],
                    },
                    {
                    name: "conveyance",
                    key: "conveyance",
                    required: true,
                    suggested_mappings: ["conveyance"],
                    },
                    {
                    name: "medical",
                    key: "medical",
                    required: true,
                    suggested_mappings: ["medical"],
                    },          
                    {
                    name: "food_allowance",
                    key: "food_allowance",
                    required: true,
                    suggested_mappings: ["food_allowance"],
                    },
                    {
                    name: "dress_allowance",
                    key: "dress_allowance",
                    required: true,
                    suggested_mappings: ["dress_allowance"],
                    },
                    {
                    name: "telephone_internet",
                    key: "telephone_internet",
                    required: true,
                    suggested_mappings: ["telephone_internet"],
                    },
                    {
                    name: "lta",
                    key: "lta",
                    required: true,
                    suggested_mappings: ["lta"],
                    },
                    {
                    name: "newspaper_periodicals",
                    key: "newspaper_periodicals",
                    required: true,
                    suggested_mappings: ["newspaper_periodicals"],
                    },
                    {
                    name: "special_allowance",
                    key: "special_allowance",
                    required: true,
                    suggested_mappings: ["special_allowance"],
                    },
                    {
                    name: "other_allowance",
                    key: "other_allowance",
                    required: true,
                    suggested_mappings: ["other_allowance"],
                    },
                    {
                    name: "variable_pay",
                    key: "variable_pay",
                    required: true,
                    suggested_mappings: ["variable_pay"],
                    },
                    {
                    name: "incentive",
                    key: "incentive",
                    required: true,
                    suggested_mappings: ["incentive"],
                    },
                    {
                    name: "gross_salary",
                    key: "gross_salary",
                    required: true,
                    suggested_mappings: ["gross_salary"],
                    },                    
                    {
                    name: "pf",
                    key: "pf",
                    required: true,
                    suggested_mappings: ["pf"],
                    },
                    {
                    name: "pt",
                    key: "pt",
                    required: true,
                    suggested_mappings: ["pt"],
                    },
                    {
                    name: "income_tax",
                    key: "income_tax",
                    required: true,
                    suggested_mappings: ["income_tax"],
                    },
                    {
                    name: "others",
                    key: "others",
                    required: true,
                    suggested_mappings: ["others"],
                    },
                    {
                    name: "loan",
                    key: "loan",
                    required: true,
                    suggested_mappings: ["loan"],
                    },
                    {
                    name: "total_deductions",
                    key: "total_deductions",
                    required: true,
                    suggested_mappings: ["total_deductions"],
                    },                    
                    {
                    name: "net_salary",
                    key: "net_salary",
                    required: true,
                    suggested_mappings: ["net_salary"],
                    },
                    {
                    name: "payment_mode",
                    key: "payment_mode",
                    required: true,
                    suggested_mappings: ["payment_mode"],
                    },        
                    {
                    name: "payment_date",
                    key: "payment_date",
                    required: true,
                    suggested_mappings: ["payment_date"],
                    },
                    {
                    name: "remarks",
                    key: "remarks",
                    suggested_mappings: ["remarks"],
                    },
                ],
                
                }}
            />
            </>

        )
    }
}

export default AdminPayroll