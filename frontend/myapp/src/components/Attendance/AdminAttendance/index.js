import { Component } from "react";
import DataTable from "react-data-table-component";
import { format } from 'date-fns';
import { CSVImporter } from "csv-import-react";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { toast } from 'react-toastify';
import { Oval } from "react-loader-spinner"; 
import styled from "styled-components";
import Cookies from 'js-cookie'

import AttendanceReportModal from "./AttendanceReportModal";

import { OutlineBtn, FlexContainer, SearchBox, BlueBtn, TableContainer, 
  AlignStartFlexContainer, RangeButton, RangeContainer, 
  NoRecordsText,
  TableTitle} from "../../Source/styledComponent";

const EditStatusBtn = styled.button`
  border: 2px solid ;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px;
  margin: 2px;
  background-color: transparent;
  transition: transform 0.2s ease;
  
  &:hover {
      transform: scale(0.95);
  }
`

const Btn = styled.button`
  border-radius: 8px;
  cursor: pointer;
  padding: 10px 18px;
  background-color: transparent;
  color: #3498DB;
  border: 2px solid #3498DB;
  font-size: 16px;
  font-weight: 600;
  transition: transform 0.2s ease;
  
  &:hover {
      transform: scale(0.95);
  }
  
  &:disabled {
    cursor: not-allowed;
    background-color: #e0e0e0;
    border: 2px solid #ccc;
    color: #a1a1a1;
  }
`;

class AdminAttendance extends Component {
  
  calculateStartDate = (endDate) => {
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7);
    return startDate;
  };
  
  state = {
    isOpen: false,
    attendanceData: [],
    filteredData: [],
    columns: [],
    startDate: this.calculateStartDate(new Date()),
    endDate: new Date(),
    searchQuery: "",
    leaveRequestsData: [],
    isAttendanceReportModalOpen: false,
    isLeaveRequestsLoading: true,
    isAttendanceLoading: true,
    isTodayAttendanceLoading: true,
    clockInDisabled: false,
    clockOutDisabled: true,
    loginTime: null,
    logoutTime: null,
  };

  componentDidMount() {
    this.fetchLeaveRequests()
    this.fetchAttendanceData()
    this.fetchTodaysAttendance()
  }

  fetchTodaysAttendance = async () => {
    this.setState({isTodayAttendanceLoading: true})
    
    try {
      const jwtToken = Cookies.get("jwt_token");
      const options = {
          method: "GET",
          headers: {
              Authorization: `Bearer ${jwtToken}`,
          },
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/${this.props.employeeId}`, options);
      const data = await response.json();

      if (data && data.status) {
        this.setState({ clockInDisabled: true, loginTime: data.login_time, logoutTime: data.logout_time });
      }
      if (data && data.login_time && !data.logout_time) {
        this.setState({clockOutDisabled: false})
      } else {
        this.setState({clockOutDisabled: true})
      }

      this.setState({isTodayAttendanceLoading: false})

    } catch (error) {
      toast.error(`Network error. Please try again...`, {
        autoClose: 4000, 
    });      
  }
  };

  handleClockIn = async () => {
    const pendingToast = toast.loading("Recording Login Time...");
      
    try {
      const jwtToken = Cookies.get("jwt_token");
      const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({employeeId: this.props.employeeId }),
      };
      

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/login`, options);
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
        hideProgressBar: true 
    });

    this.fetchTodaysAttendance()
    this.fetchAttendanceData()

    } catch (error) {
      toast.update(pendingToast, {
          render: "Network error. Please try again...",
          type: "error",
          isLoading: false,
          autoClose: 4000,  
      });
  }
  };

  handleClockOut = async () => {
    const pendingToast = toast.loading("Recording Logout Time...");
      
    try {
      const jwtToken = Cookies.get("jwt_token");
      const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({employeeId: this.props.employeeId }),
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/logout`, options);
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
        hideProgressBar: true 
    });

    this.fetchTodaysAttendance()
    this.fetchAttendanceData()

    } catch (error) {
      toast.update(pendingToast, {
          render: "Network error. Please try again...",
          type: "error",
          isLoading: false,
          autoClose: 4000,  
      });
  }
  };

  handleOpen = () => {
    this.setState({ isOpen: true });
  };

  handleClose = () => {
    this.setState({ isOpen: false });
  };

  handleComplete = async (attendanceData) => {
    this.setState({ isOpen: false });

    for (const row of attendanceData.rows) {
      const {values} = row

      if (!values.employee_id || !values.date || !values.status ) {
        return toast.error('Required Fields cannot be empty')
      }
    }

    const pendingToast = toast.loading("Importing Attendance...");

    try {
      const jwtToken = Cookies.get("jwt_token");
      const options = {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(attendanceData),
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/upload-attendance`, options);
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

      this.fetchAttendanceData()

    } catch (error) {
      toast.update(pendingToast, {
        render: "Network error. Please try again later.",
        type: "error",
        isLoading: false,
        autoClose: 4000,  
    });     
  }
  };

  updateDateRange = (days) => {
    const { startDate, endDate } = this.state;
  
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
  
    // Subtract or add the entire range of days
    newStartDate.setDate(newStartDate.getDate() + days);
    newEndDate.setDate(newEndDate.getDate() + days);
  
    // Set the new state and fetch data for the new date range
    this.setState({
      startDate: newStartDate,
      endDate: newEndDate,
    }, this.fetchAttendanceData);
  };

  fetchLeaveRequests = async () => {
    this.setState({isLeaveRequestsLoading: true})

    try{
      const jwtToken = Cookies.get("jwt_token");
      const options = {
          method: "GET",
          headers: {
              Authorization: `Bearer ${jwtToken}`,
          },
      };
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee-leave-requests`, options)
      const data = await response.json()

      if (!response.ok) {
        toast.error(`Failed to Fetch Leave Requests`, {
          autoClose: 4000, 
      });
      return
      }
      
      this.setState({leaveRequestsData: data, isLeaveRequestsLoading: false})
      
    }catch (err) {
      toast.error(`Network error. Please try again later.`, {
        autoClose: 4000, 
    });
  }
  }

  handleLeaveStatus = async (event, leaveRequest, status) => {
    event.preventDefault();

    const pendingToast = toast.loading("Updating Leave Status...");

    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/update-leave-status/${leaveRequest.leave_id}`;
      const jwtToken = Cookies.get("jwt_token");
      const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ status,leaveRequest }),
    };

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
  
        this.fetchLeaveRequests()
        this.fetchAttendanceData()

    } catch (error) {
      toast.update(pendingToast, {
        render: "Network error. Please try again later.",
        type: "error",
        isLoading: false,
        autoClose: 4000,  
    });    }
}

  fetchAttendanceData = async () => {
    this.setState({isAttendanceLoading: true})

    const { startDate, endDate } = this.state;

    const formattedStartDate = format(startDate, 'yyyy-MM-dd')
    const formattedEndDate = format(endDate, 'yyyy-MM-dd')

    try {
      const jwtToken = Cookies.get("jwt_token");
      const options = {
          method: "GET",
          headers: {
              Authorization: `Bearer ${jwtToken}`,
          },
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, options);
      const data = await response.json();
   
      this.setState({ 
        attendanceData: data, 
        filteredData: data,
        isAttendanceLoading: false
      }, this.filterData);

    } catch (error) {
      toast.error(`Network error. Please try again later.`, {
              autoClose: 4000, 
          });
    }
  };

  handleSearchChange = (event) => {
    const searchQuery = event.target.value.toLowerCase();
    this.setState({ searchQuery }, this.filterData);
  };

  filterData = () => {
    const { attendanceData, searchQuery } = this.state;
    if (searchQuery === "") {
      this.setState({ filteredData: attendanceData });
    } else {
      const filteredData = attendanceData.filter(row => 
        row.employeeName.toLowerCase().includes(searchQuery)
      );
      this.setState({ filteredData });
    }
  };

  handleTemplateDownload = () => {
    // Example data
    const data = [
      [
          'employee_id', 'date', 'login_time', 'logout_time', 'status', 'remarks'
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
    link.setAttribute('download', 'attendance_template.csv');

    // Append the link to the body (required for Firefox)
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  openAttendanceReportModal = () => {
    this.setState({isAttendanceReportModalOpen: true})      
}

  closeAttendanceReportModal = () => {
      this.setState({isAttendanceReportModalOpen: false})      
  }

  render() {
    const { filteredData, startDate, endDate, searchQuery, isOpen, leaveRequestsData } = this.state;

    const cellStyles = {
      headCells: {
        style: {
          fontWeight: "bold",
          fontSize: "14px",
        }
      }
    }

    const leaveRequestsColumns = [
      { 
        name: "ID",
        width: '80px',
        selector: row => row.employee_id
      },
      { 
        name: "Name",
        selector: row => row.name
      },
      { 
        name: "Designation",
        selector: row => row.designation
      },
      { 
        name: "Applied Date",
        selector: row =>format(new Date(row.applied_date), 'MMM dd')
      },
      { 
        name: "Leave Type",
         selector: row => row.leave_type 
      },
      { 
        name: "start Date",
         selector: row => format(new Date(row.start_date), 'MMM dd')
      },
      { 
        name: "End Date",
         selector: row => format(new Date(row.end_date), 'MMM dd') 
      },
      { 
        name: "Reason",
        selector: row => row.leave_reason,
        cell: row => (
          <div style={{cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.leave_reason}>
            {row.leave_reason}
          </div>
        )
      },
      { 
        name: "Remarks",
        selector: row => row.remarks,
        cell: row => (
          <div style={{cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.remarks}>
            {row.remarks}
          </div>
        )
      },
      { 
        name: "Status",
         selector: row => row.leave_status,
         cell: row => (
          <span
            style={{
              color: row.leave_status === 'Approved' ? 'green' : row.leave_status === 'Rejected' ? 'red' : 'black',
            }}
          >
            {row.leave_status}
          </span>
        ), 
      },
      {
        name: 'Action',
        width: '200px',
        style: {
            textAlign: 'center', 
        },
        center: true,
        cell: row => (
            <div>
                <EditStatusBtn disabled={row.leave_status !== 'Pending'} onClick={(event) => this.handleLeaveStatus(event, row, 'Approved')} style={{borderColor: '#7ff088',}}>Approve</EditStatusBtn>
                <EditStatusBtn disabled={row.leave_status !== 'Pending'} onClick={(event) => this.handleLeaveStatus(event, row, 'Rejected')} style={{borderColor: '#eb877c'}}>Reject</EditStatusBtn>
            </div>
        ),
        ignoreRowClick: true,
        allowoverflow: true,
    },
    ]

    const columns = [
      { name: "ID", selector: row => row.employeeId, sortable: true, width: "80px" },
      { name: "Employee Name", selector: row => row.employeeName, sortable: true },
      { name: "Department", selector: row => row.department, sortable: true },
    ];
    
    const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); // Example: "25 Aug"
    
      // Insert each date column at the start of the columns array
      columns.splice(3, 0, {
        name: dateStr,
        center: true,
        selector: (row) => {
          const day = row.attendance.find(d => new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) === dateStr);
          return day ? day.status : "-";
        },
        cell: (row) => {
          const day = row.attendance.find(d => new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) === dateStr);
          const status = day ? day.status : "-";
          const loginTime = day ? day.loginTime : "";
          const logoutTime = day ? day.logoutTime : "";
    
          let color;
          if (status === "P") color = "#299c1c";
          else if (status === "A") color = "red";
          else if (status === "L") color = "orange";
          else color = "black"; // Default color for any other status
    
          // Tooltip showing "login_time - logout_time"
          const tooltip = loginTime ? `${loginTime} - ${logoutTime}` : "No Timings";
    
          return (
            <div
              style={{ color, fontWeight: "700", fontSize: "14px", cursor: 'pointer' }}
              title={tooltip}  // Tooltip on hover
            >
              {status}
            </div>
          );
        },
      });
    }
    

    return (
      <>
        <TableContainer style={{minHeight: 'auto'}}>
          <DataTable 
            title ={<TableTitle>Leave Requests</TableTitle>} 
            data={leaveRequestsData}
            columns={leaveRequestsColumns}
            customStyles={cellStyles}
            pagination
            persistTableHead
            noDataComponent={<NoRecordsText>No Leave Requests</NoRecordsText>}
            progressPending={this.state.isLeaveRequestsLoading} 
            progressComponent={ <div style={{marginTop: '20px'}}><Oval height={40} width={40} color="#3498DB" /></div>}
            />
        </TableContainer>

        <hr style={{marginBottom: '10px'}}/>

        {!this.state.isTodayAttendanceLoading && 
        <AlignStartFlexContainer style={{marginBottom: '30px'}}>
          <div style={{marginRight: '20px', textAlign: 'center'}}>
          <Btn onClick={this.handleClockIn} disabled={this.state.clockInDisabled} >Clock In</Btn>
          {this.state.loginTime && <p style={{margin: '0px'}}>{this.state.loginTime}</p>}
          </div>
          <div style={{textAlign: 'center'}}>
          <Btn onClick={this.handleClockOut} disabled={this.state.clockOutDisabled}>Clock Out</Btn>
          {this.state.logoutTime && <p style={{margin: '0px'}}>{this.state.logoutTime}</p>}
          </div>
        </AlignStartFlexContainer>
        }
        <hr style={{marginBottom: '20px'}}/>

        <AlignStartFlexContainer>
          <OutlineBtn onClick={this.handleTemplateDownload} style={{marginRight: "20px"}}>Download CSV Template</OutlineBtn>
          <BlueBtn onClick={this.handleOpen}>Upload Attendance</BlueBtn>
        </AlignStartFlexContainer>

        <TableContainer>
          <DataTable
            title={<TableTitle>Attendance Records</TableTitle>}
            columns={columns}
            data={filteredData}
            customStyles={cellStyles}
            pagination
            persistTableHead
            noDataComponent={<NoRecordsText>No Attendance Records</NoRecordsText>}
            progressPending={this.state.isAttendanceLoading} 
            progressComponent={ <div style={{marginTop: '20px'}}><Oval height={40} width={40} color="#3498DB" /></div>}
            actions = {
            <FlexContainer>
              <RangeContainer>
                <RangeButton onClick={() => this.updateDateRange(-8)}> <MdOutlineKeyboardArrowLeft size={20}/> </RangeButton>
                  <div style={{ margin: '0 10px', fontSize: '16px', color: '#6c757d' }}>
                    {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM yyyy')}
                  </div>
                <RangeButton onClick={() => this.updateDateRange(8)}> <MdOutlineKeyboardArrowRight size={20}/> </RangeButton>
              </RangeContainer>
              <SearchBox
                type="text"
                placeholder="Search by employee name"
                value={searchQuery}
                onChange={this.handleSearchChange}
              />
              <OutlineBtn style={{marginLeft: '20px'}} onClick={this.openAttendanceReportModal}>Get Report</OutlineBtn>
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
                        name: "date",
                        key: "date",
                        required: true,
                        suggested_mappings: ["date"],
                      },
                      {
                        name: "login_time",
                        key: "login_time",
                        suggested_mappings: ["login_time"],
                      },
                      {
                        name: "logout_time",
                        key: "logout_time",
                        suggested_mappings: ["logout_time"],
                      },
                      {
                        name: "status",
                        key: "status",
                        required: true,
                        suggested_mappings: ["status"],
                      },
                      {
                        name: "remarks",
                        key: "remarks",
                        suggested_mappings: ["remarks"],
                      },
                      
              ],
                    
            }}
        />
        <AttendanceReportModal 
        isAttendanceReportModalOpen={this.state.isAttendanceReportModalOpen}
        closeAttendanceReportModal={this.closeAttendanceReportModal}
        />

      </>
      
    );
  }
}

export default AdminAttendance;
