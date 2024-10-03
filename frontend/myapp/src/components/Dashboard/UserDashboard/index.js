import { Component } from "react";
import styled from "styled-components";

import { Container } from "../../Source/styledComponent";

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

    render(){

        return(
            <Container>
                <Card>
                    <h3>Worked Days</h3>
                    <p>00</p>
                </Card>
                <Card>
                    <h3>Worked Hours</h3>
                    <p>00</p>
                </Card>
            </Container>

        )
    }
}

export default UserDashboard