import { Component } from "react";

import Source from "../Source";
import AppContext from "../../Context/AppContext";
import AdminTraining from "./AdminTraining";
import UserTraining from "./UserTraining";

class Training extends Component{

    render(){
        const {role, employeeId} = this.context

        return(
            <Source>
                { role === "HR ADMIN" || role === "SUPER ADMIN" ? (
                    <AdminTraining />
                ) : (
                    <UserTraining employeeId = {employeeId}/>
                )
                }
            </Source>
        )
    }
}

Training.contextType = AppContext

export default Training