import { Component } from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import Modal from 'react-modal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Oval } from "react-loader-spinner"; 

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import ForgotPassword from "./components/Login/ForgotPassword";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import Employee from "./components/Employee";
import EmployeeDetails from "./components/Employee/EmployeeDetails";
import AddEmployeeCsv from "./components/Employee/AddEmployeeCsv";
import AddEmployeeForm from './components/Employee/AddEmployeeForm'
import Attendance from "./components/Attendance";
import Payroll from "./components/Payroll";
import Training from "./components/Training";
import TrainingDetails from "./components/Training/TrainingDetails";
import CvDatabase from "./components/CvDatabase";
import CvDetails from "./components/CvDatabase/CvDetails";
import NotFound from "./components/NotFound";
import AppContext from "./Context/AppContext";
import StandardMail from "./components/StandardMail";
import TemplateDetails from "./components/StandardMail/TemplateDetails";

import './App.css';
import { BgContainer } from "./components/Source/styledComponent";

Modal.setAppElement('#root');

class App extends Component {
  state = {activeMenuId: '', userName: '', role: null, employeeId: null, isLoading: true}

  componentDidMount(){
    const savedActiveMenuId = localStorage.getItem('activeMenuId');

    if (savedActiveMenuId) {
      this.setState({ activeMenuId: savedActiveMenuId });
    }

    this.getEmployeeDetails()
  }

  getEmployeeDetails = () => {
    const jwtToken = Cookies.get("jwt_token");
    if (jwtToken) {
      try {
        const decodedToken = jwtDecode(jwtToken);
        this.setState({ role: decodedToken.role, employeeId: decodedToken.employee_id, userName: decodedToken.name, isLoading: false });  
      } catch (error) {
        console.error("Error decoding token:", error);
        Cookies.remove("jwt_token");
        this.setState({ isLoading: false });
      }
    } else {
      this.setState({ isLoading: false });
    }
  };
  

  updateActiveMenuId = (id) => {
    this.setState({ activeMenuId: id });
    localStorage.setItem('activeMenuId', id); 
  }
  
  render() {
    const {activeMenuId, userName, role, employeeId} = this.state

    if (this.state.isLoading) {
      return(
          <BgContainer>
              <Oval
                  visible={true}
                  height="40"
                  width="40"
                  color="#3498DB"
                  secondaryColor="#3498DB"
                  ariaLabel="oval-loading"
              />
          </BgContainer>
      )
  }

    return (
      <AppContext.Provider value={{
        activeMenuId,
        updateActiveMenuId: this.updateActiveMenuId,
        userName,
        role,
        employeeId
      }}>
        <BrowserRouter>
          <Switch>
            <Route path="/login" component={Login} />
            <Route exact path="/forgot-password" component={ForgotPassword} />
            <ProtectedRoute exact path="/profile" component={Profile} />
            <ProtectedRoute exact path="/" component={Dashboard} />
            <ProtectedRoute exact path="/employee" component={Employee} />
            <ProtectedRoute exact path="/employee/:employeeId" component={EmployeeDetails} />
            <ProtectedRoute exact path="/add-employee-form" component={AddEmployeeForm} />
            <ProtectedRoute exact path="/add-employee-csv" component={AddEmployeeCsv} />
            <ProtectedRoute exact path="/attendance" component={Attendance} />
            <ProtectedRoute exact path="/payroll" component={Payroll} />
            <ProtectedRoute exact path="/training" component={Training} />
            <ProtectedRoute exact path="/training/:trainingId" component={TrainingDetails} />
            <ProtectedRoute exact path="/cv-database" component={CvDatabase} />
            <ProtectedRoute exact path="/cv-details/:candidate_id" component={CvDetails} />
            <ProtectedRoute exact path="/standard-mail" component={StandardMail} />
            <ProtectedRoute exact path="/email-template/:templateName" component={TemplateDetails} />

            <Route component={NotFound} />
          </Switch>

          <ToastContainer 
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

        </BrowserRouter>
      </AppContext.Provider>
      
    );
  }
}

export default App;
