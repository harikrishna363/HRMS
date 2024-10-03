import { Component } from "react";
import DataTable from "react-data-table-component";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { format } from 'date-fns';
import { Oval } from "react-loader-spinner"; 
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import styled from "styled-components";

import ApplyLeaveModal from "./ApplyLeaveModal";
import { AlignStartFlexContainer, BlueBtn, NoRecordsText, RangeButton, RangeContainer, 
  TableContainer, TableTitle } from "../../Source/styledComponent";

const OutlineBtn = styled.button`
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

class UserAttendance extends Component{

    calculateStartDate = (endDate) => {
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 10);
        return startDate;
    };

    state = {
        applyLeaveModalIsOpen: false,
        leaveRequestData: [],
        startDate: this.calculateStartDate(new Date()),
        endDate: new Date(),
        attendanceData: [],
        isLeaveRequestsLoading: true,
        isAttendanceLoading: true,
        isTodayAttendanceLoading: true,
        clockInDisabled: false,
        clockOutDisabled: true,
        loginTime: null,
        logoutTime: null,
    }

    componentDidMount(){
        this.getLeaveRequests()
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

        const response = await fetch(`http://localhost:4000/attendance/${this.props.employeeId}`, options);
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
      });      }
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
        

        const response = await fetch('http://localhost:4000/attendance/login', options);
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

        const response = await fetch('http://localhost:4000/attendance/logout', options);
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

    fetchAttendanceData = async () => {
      this.setState({isAttendanceLoading: true})

        const { startDate, endDate } = this.state;

        const formatDateToLocal = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth is 0-indexed
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
      };
  
      const formattedStartDate = formatDateToLocal(new Date(startDate));
      const formattedEndDate = formatDateToLocal(new Date(endDate));
    
        try {
          const jwtToken = Cookies.get("jwt_token");
          const options = {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${jwtToken}`,
              },
          };

          const response = await fetch(`http://localhost:4000/user-attendance/${this.props.employeeId}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, options);
          const data = await response.json();
          
          if (!response.ok) {
            toast.error(`Failed to Featch Attendance Records`, {
              autoClose: 4000, 
          });
          }
    
          this.setState({ 
            attendanceData: data, 
            isAttendanceLoading: false,
        });
        } catch (error) {
          toast.error(`Network error. Please try again later.`, {
                  autoClose: 4000, 
              });
        }
    };

    getLeaveRequests = async () => {
      this.setState({isLeaveRequestsLoading: true})
        const {employeeId} = this.props

        try{
          const jwtToken = Cookies.get("jwt_token");
          const options = {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${jwtToken}`,
              },
          };

          const response = await fetch(`http://localhost:4000/leave-requests?employeeId=${employeeId}`, options)
          const data = await response.json()

          if (!response.ok) {
            toast.error(`Failed to Fetch Leave Requests`, {
              autoClose: 4000, 
          });
          return
          }
          
          this.setState({ leaveRequestData: data, isLeaveRequestsLoading: false })
          
        }catch (err) {
          toast.error(`Network error. Please try again later.`, {
            autoClose: 4000, 
        });
      }
        
    }

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
      
    openApplyLeaveModal = () => {
        this.setState({applyLeaveModalIsOpen: true})
    }
    
    closeApplyLeaveModal = () => {
        this.setState({applyLeaveModalIsOpen: false})  
    } 

    handleLeaveRequested = () => {
      this.getLeaveRequests()
  };

    render(){
        const {leaveRequestData, attendanceData, startDate, endDate} = this.state

        const cellStyles = {
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
              }
            }
        }

        const leaveRequestColumns = [
          { 
            name: "Applied Date",
            selector: row => row.applied_date
          },
          { 
            name: "Leave Type",
             selector: row => row.leave_type 
          },
          { 
            name: "start Date",
             selector: row => row.start_date 
          },
          { 
            name: "End Date",
             selector: row => row.end_date 
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
        ]

        const columns = [];
    
          const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
          for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); // Output example: "25 Aug"
    
            // Insert each date column at the start of the columns array
            columns.splice(0, 0, {
              name: dateStr,
              center: true,
              selector: (row) => {
                const day = row.attendance.find(d => new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) === dateStr);
                return day ? day.status : "-";
              },
              cell: (row) => {
                const day = row.attendance.find(d => new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) === dateStr);
                const status = day ? day.status : "-"
                const loginTime = day ? day.loginTime : "";
                const logoutTime = day ? day.logoutTime : "";
              
                let color;
                if (status === "P") color = "#299c1c";
                else if (status === "A") color = "red";
                else if (status === "L") color = "orange";
                else color = "black"; // Default color for any other status

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
         
        return(
            <>
              <TableContainer style={{minHeight: 'auto'}}>
                <DataTable 
                title ={<TableTitle>Leave Requests</TableTitle>}
                data={leaveRequestData}
                columns={leaveRequestColumns}
                customStyles={cellStyles}
                pagination
                persistTableHead
                noDataComponent={<NoRecordsText>No Leave Requests</NoRecordsText>}
                progressPending={this.state.isLeaveRequestsLoading} 
                progressComponent={ <div style={{marginTop: '20px'}}><Oval height={40} width={40} color="#3498DB" /></div>}
                actions = {
                <BlueBtn onClick={this.openApplyLeaveModal}>Apply leave</BlueBtn>
                }
                />

                <ApplyLeaveModal applyLeaveModalIsOpen = {this.state.applyLeaveModalIsOpen} 
                    closeApplyLeaveModal = {this.closeApplyLeaveModal}
                    handleLeaveRequested = {this.handleLeaveRequested}

                />
              </TableContainer>

            <hr style={{marginBottom: '20px'}}/>

            {!this.state.isTodayAttendanceLoading && 
            <AlignStartFlexContainer>
              <div style={{marginRight: '20px', textAlign: 'center'}}>
              <OutlineBtn onClick={this.handleClockIn} disabled={this.state.clockInDisabled} >Clock In</OutlineBtn>
              {this.state.loginTime && <p style={{margin: '0px'}}>{this.state.loginTime}</p>}
              </div>
              <div style={{textAlign: 'center'}}>
              <OutlineBtn onClick={this.handleClockOut} disabled={this.state.clockOutDisabled}>Clock Out</OutlineBtn>
              {this.state.logoutTime && <p style={{margin: '0px'}}>{this.state.logoutTime}</p>}
              </div>
            </AlignStartFlexContainer>
            }

            <TableContainer>
            <DataTable
                title={<TableTitle>My Attendance</TableTitle>}
                columns={columns}
                data={attendanceData}
                customStyles={cellStyles}
                pagination
                persistTableHead
                noDataComponent={<NoRecordsText>No Attendance Records</NoRecordsText>}
                progressPending={this.state.isAttendanceLoading} 
                progressComponent={ <div style={{marginTop: '20px'}}><Oval height={40} width={40} color="#3498DB" /></div>}
                actions = {
                    <RangeContainer>
                        <RangeButton onClick={() => this.updateDateRange(-11)}> <MdOutlineKeyboardArrowLeft size={20}/> </RangeButton>
                            <div style={{ margin: '0 10px', fontSize: '16px', color: '#6c757d' }}>
                            {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM yyyy')}
                            </div>
                        <RangeButton onClick={() => this.updateDateRange(11)}> <MdOutlineKeyboardArrowRight size={20}/> </RangeButton>
                    </RangeContainer>
                }
            />
            </TableContainer>
            </>
            
        )
    }
}

export default UserAttendance