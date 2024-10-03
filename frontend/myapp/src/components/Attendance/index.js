import { Component } from "react";

import Source from "../Source";
import AppContext from "../../Context/AppContext";
import AdminAttendance from "./AdminAttendance";
import UserAttendance from "./UserAttendance";

class Attendance extends Component{

    render(){
        const {role, employeeId} = this.context
       
        return (
            <Source>
                { role === "HR ADMIN" || role === "SUPER ADMIN" ? (
                    <AdminAttendance employeeId = {employeeId}/>
                ) : (
                    <UserAttendance employeeId = {employeeId}/>
                )
                }
            </Source>
        );
    }
}

Attendance.contextType = AppContext

export default Attendance