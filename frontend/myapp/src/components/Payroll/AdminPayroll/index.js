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

        const response = await fetch("http://localhost:4000/upload-payroll", options);
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

      this.fetchPayrollData()

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

        const response = await fetch(`http://localhost:4000/payroll?month=${formattedMonth}`, options);

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
            const response = await fetch(`http://localhost:4000/payslip/${row.payroll_id}`);
            
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
              'employee_id', 'bank_name', 'account_number', 'payment_mode', 'transaction_id', 'payment_date',
              'pay_period', 'basic', 'hra', 'conveyance', 'medical', 'lta', 'special_allowance', 'other_allowance',
              'variable_pay', 'incentive', 'food_allowance', 'dress_allowance', 'telephone_internet', 
              'newspaper_periodicals', 'it_tds', 'deductions', 'total_deductions', 'pf', 'pt', 'income_tax', 'others', 'loan', 
              'insurance', 'esi', 'level', 'tax_regime', 'gross_salary', 'net_salary', 'remarks'
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
          { name: "ID", selector: row => row.employeeId, sortable: true, width: '80px' },
          { name: "Employee Name", selector: row => row.employeeName, sortable: true },
          { name: "Department", selector: row => row.department, sortable: true },
          { name: "Designation", selector: row => row.designation },
          { name: "Email", selector: row => row.email },
          { name: "Transaction ID", selector: row => row.transactionId },
          { name: "Payment Mode", selector: row => row.paymentMode },
          { name: "Bank Name", selector: row => row.bankName },
          { name: "Account Number", selector: row => row.accountNumber },
          { name: "Payment Date", selector: row => row.paymentDate, sortable: true },
          { name: "Pay Period", selector: row => row.payPeriod },
          { name: "Net Salary", selector: row => row.netSalary, sortable: true },
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
            <AlignStartFlexContainer>
                <OutlineBtn onClick={this.handleTemplateDownload} style={{marginRight: '20px'}}>Download CSV Template</OutlineBtn>
                <BlueBtn onClick={this.handleOpen}>Upload Payroll</BlueBtn>
            </AlignStartFlexContainer>

            <TableContainer>
              <DataTable 
                  title={<TableTitle>Payroll Records</TableTitle>}
                  columns={columns}
                  data={filteredData}
                  customStyles={cellStyles}
                  pagination
                  persistTableHead
                  noDataComponent={<NoRecordsText>No Payroll Records</NoRecordsText>}
                  progressPending={this.state.apiStatus === apiStatusConstants.loading} 
                  progressComponent={ <div style={{marginTop: '20px'}}><Oval height={40} width={40} color="#3498DB" /></div>}
                  actions = {
                      <FlexContainer>
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
                    name: "bank_name",
                    key: "bank_name",
                    required: true,
                    suggested_mappings: ["bank_name"],
                    },
                    {
                    name: "account_number",
                    key: "account_number",
                    required: true,
                    suggested_mappings: ["account_number"],
                    },
                    {
                    name: "payment_mode",
                    key: "payment_mode",
                    required: true,
                    suggested_mappings: ["payment_mode"],
                    },
                    {
                    name: "transaction_id",
                    key: "transaction_id",
                    required: true,
                    suggested_mappings: ["transaction_id"],
                    },
                    {
                    name: "payment_date",
                    key: "payment_date",
                    required: true,
                    suggested_mappings: ["payment_date"],
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
                    suggested_mappings: ["basic"],
                    },
                    {
                    name: "hra",
                    key: "hra",
                    suggested_mappings: ["hra"],
                    },
                    {
                    name: "conveyance",
                    key: "conveyance",
                    suggested_mappings: ["conveyance"],
                    },
                    {
                    name: "medical",
                    key: "medical",
                    suggested_mappings: ["medical"],
                    },
                    {
                    name: "lta",
                    key: "lta",
                    suggested_mappings: ["lta"],
                    },
                    {
                    name: "special_allowance",
                    key: "special_allowance",
                    suggested_mappings: ["special_allowance"],
                    },
                    {
                    name: "other_allowance",
                    key: "other_allowance",
                    suggested_mappings: ["other_allowance"],
                    },
                    {
                    name: "variable_pay",
                    key: "variable_pay",
                    suggested_mappings: ["variable_pay"],
                    },
                    {
                    name: "incentive",
                    key: "incentive",
                    suggested_mappings: ["incentive"],
                    },
                    {
                    name: "food_allowance",
                    key: "food_allowance",
                    suggested_mappings: ["food_allowance"],
                    },
                    {
                    name: "dress_allowance",
                    key: "dress_allowance",
                    suggested_mappings: ["dress_allowance"],
                    },
                    {
                    name: "telephone_internet",
                    key: "telephone_internet",
                    suggested_mappings: ["telephone_internet"],
                    },
                    {
                    name: "newspaper_periodicals",
                    key: "newspaper_periodicals",
                    suggested_mappings: ["newspaper_periodicals"],
                    },
                    {
                    name: "it_tds",
                    key: "it_tds",
                    suggested_mappings: ["it_tds"],
                    },
                    {
                    name: "deductions",
                    key: "deductions",
                    suggested_mappings: ["deductions"],
                    },
                    {
                    name: "total_deductions",
                    key: "total_deductions",
                    suggested_mappings: ["total_deductions"],
                    },
                    {
                    name: "pf",
                    key: "pf",
                    suggested_mappings: ["pf"],
                    },
                    {
                    name: "pt",
                    key: "pt",
                    suggested_mappings: ["pt"],
                    },
                    {
                    name: "income_tax",
                    key: "income_tax",
                    suggested_mappings: ["income_tax"],
                    },
                    {
                    name: "others",
                    key: "others",
                    suggested_mappings: ["others"],
                    },
                    {
                    name: "loan",
                    key: "loan",
                    suggested_mappings: ["loan"],
                    },
                    {
                    name: "insurance",
                    key: "insurance",
                    suggested_mappings: ["insurance"],
                    },
                    {
                    name: "esi",
                    key: "esi",
                    suggested_mappings: ["esi"],
                    },
                    {
                    name: "level",
                    key: "level",
                    suggested_mappings: ["level"],
                    },
                    {
                    name: "tax_regime",
                    key: "tax_regime",
                    suggested_mappings: ["tax_regime"],
                    },
                    {
                    name: "gross_salary",
                    key: "gross_salary",
                    suggested_mappings: ["gross_salary"],
                    },
                    {
                    name: "net_salary",
                    key: "net_salary",
                    required: true,
                    suggested_mappings: ["net_salary"],
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