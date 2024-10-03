import { Component } from "react";
import { CSVImporter } from "csv-import-react";
import { CiImport } from "react-icons/ci";
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import styled from "styled-components";
import { BiError } from "react-icons/bi";

import AppContext from "../../../Context/AppContext";
import Source from "../../Source";

import { BackButton, Container, OutlineBtn } from "../../Source/styledComponent";

const ImportCsvContainer = styled.div`
    width: 20%;
    height: 20%;
    margin-top: 20px;
    cursor: pointer;
    border-radius: 10px;
    background-color: #e8eaed;
    display:flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #888a8c;
`
class AddEmployeeCsv extends Component{

    state = {
        isOpen: false,
    }

    handleOpen = () => {
        this.setState({ isOpen: true });
      };
    
    handleClose = () => {
        this.setState({ isOpen: false });
    };
    
    handleComplete = async (employeeData) => {
      const pendingToast = toast.loading("Adding Employee(s)...");
      this.setState({ isOpen: false });

    try {
      const jwtToken = Cookies.get("jwt_token");

      const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(employeeData),
      }
      const response = await fetch("http://localhost:4000/add-employee-csv", options);
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

      this.handleBackButtonClick()

    } catch (error) {
      toast.update(pendingToast, {
          render: "Network error. Please try again later.",
          type: "error",
          isLoading: false,
          autoClose: 4000,  
      });
  }
    };

    handleTemplateDownload = () => {
        // Example data
        const data = [
          [
              'employee_id', 'first_name', 'last_name', 'gender', 'dob', 'email', 'phone_number',
              'employee_type', 'education_level', 'job_title', 'designation', 'hire_date',
              'salary', 'department', 'manager', 'effective_date', 'joining_date', 
              'password', 'role', 'remarks'
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
        link.setAttribute('download', 'employee_template.csv');
    
        // Append the link to the body (required for Firefox)
        document.body.appendChild(link);
    
        // Trigger the download
        link.click();
    
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    handleBackButtonClick = () => {
      this.props.history.goBack();
    };
    
    render(){
      const {role} = this.context

      if (role !== 'HR ADMIN' && role !== 'SUPER ADMIN'){
          return(
              <Source>
              <Container style={{flexDirection: 'column'}}>
                  <BiError size={60} />
                  <h2>Page Not Found</h2>
              </Container>
              </Source>
          )
      }

        const { isOpen } = this.state;

        return(
          <Source>
            <BackButton 
              onClick={this.handleBackButtonClick}
              > 
              <MdOutlineArrowBackIosNew size={20}/>
            </BackButton>
          <Container style={{flexDirection: 'column', height: '90%'}}>
            <OutlineBtn onClick={this.handleTemplateDownload}>Download CSV Template</OutlineBtn>
            <ImportCsvContainer onClick={this.handleOpen}>
                <p>Import CSV</p>
                <CiImport size={20} style={{marginLeft:'10px'}}/>
            </ImportCsvContainer>
            </Container>
            <CSVImporter
              modalIsOpen={isOpen}
              modalOnCloseTriggered={this.handleClose}
              modalCloseOnOutsideClick={this.handleClose}
              darkMode={true}
              onComplete={this.handleComplete}
              template={{
                columns: [
                  {
                    name: "employee_id",
                    key: "employee_id",
                    required: true,
                    suggested_mappings: ["employee_id"],
                  },
                  {
                    name: "first_name",
                    key: "first_name",
                    required: true,
                    suggested_mappings: ["first_name"],
                  },
                  {
                    name: "last_name",
                    key: "last_name",
                    required: true,
                    suggested_mappings: ["last_name"],
                  },
                  {
                    name: "gender",
                    key: "gender",
                    required: true,
                    suggested_mappings: ["gender"],
                  },
                  {
                    name: "dob",
                    key: "dob",
                    required: true,
                    suggested_mappings: ["dob"],
                  },
                  {
                    name: "email",
                    key: "email",
                    required: true,
                    suggested_mappings: ["email"],
                  },
                  {
                    name: "phone_number",
                    key: "phone_number",
                    required: true,
                    suggested_mappings: ["phone_number"],
                  },
                  {
                    name: "employee_type",
                    key: "employee_type",
                    required: true,
                    suggested_mappings: ["employee_type"],
                  },
                  {
                    name: "education_level",
                    key: "education_level",
                    required: true,
                    suggested_mappings: ["education_level"],
                  },
                  {
                    name: "job_title",
                    key: "job_title",
                    required: true,
                    suggested_mappings: ["job_title"],
                  },
                  {
                    name: "designation",
                    key: "designation",
                    required: true,
                    suggested_mappings: ["designation"],
                  },
                  {
                    name: "hire_date",
                    key: "hire_date",
                    required: true,
                    suggested_mappings: ["hire_date"],
                  },
                  {
                    name: "salary",
                    key: "salary",
                    required: true,
                    suggested_mappings: ["salary"],
                  },
                  {
                    name: "department",
                    key: "department",
                    required: true,
                    suggested_mappings: ["department"],
                  },
                  {
                    name: "manager",
                    key: "manager",
                    required: true,
                    suggested_mappings: ["manager"],
                  },
                  {
                    name: "effective_date",
                    key: "effective_date",
                    required: true,
                    suggested_mappings: ["effective_date"],
                  },
                  {
                    name: "joining_date",
                    key: "joining_date",
                    required: true,
                    suggested_mappings: ["joining_date"],
                  },
                  {
                    name: "password",
                    key: "password",
                    required: true,
                    suggested_mappings: ["password"],
                  },
                  {
                    name: "role",
                    key: "role",
                    required: true,
                    suggested_mappings: ["role"],
                  },
                  {
                    name: "remarks",
                    key: "remarks",
                    suggested_mappings: ["remarks"],
                  },

                ],
              }}
            />
          </Source>
        )
    }
}

AddEmployeeCsv.contextType = AppContext

export default AddEmployeeCsv