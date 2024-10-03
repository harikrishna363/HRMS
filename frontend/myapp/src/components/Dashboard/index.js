import { Component } from "react";

import AppContext from "../../Context/AppContext";
import Source from "../Source";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

class Dashboard extends Component {

    render() {
        const { role, employeeId } = this.context;

        return (
            <Source>
                { role === "HR ADMIN" || role === "SUPER ADMIN" ? (
                    <AdminDashboard />
                ) : (
                    <UserDashboard employeeId = {employeeId}/>
                )
                }
            </Source>
        );
    }
}

Dashboard.contextType = AppContext;

export default Dashboard;
