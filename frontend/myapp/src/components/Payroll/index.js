import { Component } from "react";

import Source from "../Source";
import AppContext from "../../Context/AppContext";
import AdminPayroll from "./AdminPayroll";
import UserPayroll from "./UserPayroll";

class Payroll extends Component{

    render(){
    const {role, employeeId} = this.context

    return (
        <Source>
            { role === "FINANCE ADMIN" || role === "SUPER ADMIN" ? (
                <AdminPayroll />
            ) : (
                <UserPayroll employeeId = {employeeId}/>
            )
            }
        </Source>
    );
    }
}

Payroll.contextType = AppContext

export default Payroll