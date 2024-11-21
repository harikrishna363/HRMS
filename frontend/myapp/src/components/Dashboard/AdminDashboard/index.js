import { Component } from "react";
import Cookies from 'js-cookie'
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";
import styled from "styled-components";

import { Container, RetryBtn } from "../../Source/styledComponent";

const Card = styled.div`
  height: 22%;
  width: 20%;
  background-color: #f9fafc; 
  border: 1px solid #e0e0e0; 
  border-radius: 12px; 
  padding: 20px;
  margin: 16px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-8px); 
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background: linear-gradient(145deg, #f0f5ff, #ffffff); 
  }

  h3 {
    text-align:center;
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: 0.5px;
  }

  p {
    text-align:center;
    margin: 10px 0;
    font-size: 18px;
    color: #7f8c8d; 
  }
`;

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

class AdminDashboard extends Component{
    state = {
        apiStatus: apiStatusConstants.loading,
        activeEmployeeCount: '',
        activeCvCount: '',
    }

    componentDidMount(){
        this.fetchData()
    }

    fetchData = async () => {
        this.setState({ apiStatus: apiStatusConstants.loading });

        const activeEmployeesUrl = `${process.env.REACT_APP_API_BASE_URL}/active-employees-count`
        const activeCvUrl = `${process.env.REACT_APP_API_BASE_URL}/active-cv-count`
        const jwtToken = Cookies.get("jwt_token");

        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        };

        try {
            const [employeeResponse, cvResponse] = await Promise.all([
                fetch(activeEmployeesUrl, options),
                fetch(activeCvUrl, options),
            ]);

            if (!employeeResponse.ok || !cvResponse.ok) {
                this.setState({ apiStatus: apiStatusConstants.failure });
                return;
            }

            const employeeData = await employeeResponse.json();
            const cvData = await cvResponse.json();

            this.setState({
                activeEmployeeCount: employeeData.count,
                activeCvCount: cvData.count,
                apiStatus: apiStatusConstants.success,
            });
        } catch (error) {
            this.setState({ apiStatus: apiStatusConstants.failure });
        }
    };

    render(){

        if (this.state.apiStatus === apiStatusConstants.loading) {
            return (
                <Container>
                <Oval
                    visible={true}
                    height="40"
                    width="40"
                    color="#3498DB"
                    secondaryColor="#3498DB"
                    ariaLabel="oval-loading"
                />
                </Container>
                
            )
        }

        if (this.state.apiStatus === apiStatusConstants.failure) {
            return (
                <Container style={{flexDirection: 'column'}}>
                    <BiError size={60} />
                    <h2>Error Loading Page</h2>
                    <RetryBtn onClick={this.fetchData}>Retry</RetryBtn>
                </Container>
            )
        }

        return(
            <Container>
                <Card>
                    <h3>Active Employees</h3>
                    <p>{this.state.activeEmployeeCount}</p>
                </Card>
                <Card>
                    <h3>Active CV</h3>
                    <p>{this.state.activeCvCount}</p>
                </Card>
                <Card>
                    <h3>Today's Work</h3>
                    <p>** hrs</p>
                </Card>
                <Card>
                    <h3>Annual Training</h3>
                    <p>** hrs</p>
                </Card>
            </Container>

        )
    }
}

export default AdminDashboard