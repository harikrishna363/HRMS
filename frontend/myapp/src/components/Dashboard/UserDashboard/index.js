import { Component } from "react";
import styled from "styled-components";
import Cookies from 'js-cookie'
import { Oval } from "react-loader-spinner"; 
import { BiError } from "react-icons/bi";

import { Container, RetryBtn } from "../../Source/styledComponent";

const apiStatusConstants = {
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
}

const Card = styled.div`
  width: 20%;
  background-color: #f9fafc; 
  border: 1px solid #e0e0e0; 
  border-radius: 12px; 
  padding: 20px;
  padding-bottom: 2px;
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

class UserDashboard extends Component{
  state = {
    apiStatus: apiStatusConstants.loading,
    workStats: {},
  }

  componentDidMount(){
    this.fetchWorkStats()
  }

  fetchWorkStats = async () => {
    this.setState({apiStatus: apiStatusConstants.loading})

    try{
      const jwtToken = Cookies.get("jwt_token");

      const options = {
          method: "GET",
          headers: {
              Authorization: `Bearer ${jwtToken}`,
          },
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/work-stats/${this.props.employeeId}`, options);

      if (!response.ok) {
        this.setState({ apiStatus: apiStatusConstants.failure });
        return;
      }

      const data = await response.json();

      this.setState({
          workStats: data,
          apiStatus: apiStatusConstants.success,
      });

    }catch (error) {
      this.setState({ apiStatus: apiStatusConstants.failure });
    }

  }

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

      const {workStats} = this.state

      return(
            <Container>
                <Card>
                    <h3>Worked Days</h3>
                    <p>{workStats.workedDays}</p>
                    <p style={{textAlign:'right', margin: '0px', fontSize: '14px'}}>current month</p>
                </Card>
                <Card>
                    <h3>Worked Hours</h3>
                    <p>**</p>
                    <p style={{textAlign:'right', margin: '0px', fontSize: '14px'}}>current month</p>
                </Card>
            </Container>

        )
    }
}

export default UserDashboard