import styled from "styled-components";

export const ProgramsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0px;
`
export const ProgramCard = styled.div`
  width: 250px;
  background-color: #f9fafc; 
  border: 1px solid #e0e0e0; 
  border-radius: 12px; 
  padding: 20px;
  margin: 16px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px); 
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background: linear-gradient(145deg, #f0f5ff, #ffffff); 
  }

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: 0.5px;
  }

  p {
    margin: 10px 0;
    font-size: 16px;
    color: #7f8c8d; 
  }

  p:last-child {
    text-align: right;
    font-weight: bold;
    color: #2980b9;
  }
`;
