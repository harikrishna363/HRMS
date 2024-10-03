import styled from "styled-components"

export const LoginBgContainer = styled.div`
    background-color : #F2FAFC;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
`
export const LoginCardContainer = styled.div`
    box-shadow: 0px 4px 16px 0px #bfbfbf;
    background-color: #f9f9f9;
    width: 28%;
    padding: 30px;
    border-radius: 7px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
export const Logo = styled.img`
    width: 40%;    
`
export const FormElement = styled.form`
    display: flex;
    flex-direction: column;
    align-self: stretch;

`
export const InputContainer = styled.div`
    width: 100%;
    display:flex;
    flex-direction: column;
    margin-bottom: 10px;
`
export const InputLabel = styled.label`
    color: #616e7c;
    font-size: 14px;
    font-weight: 500;
    margin: 3px;
`
export const Input = styled.input`
    background-color: transparent;
    padding: 10px;
    color: #181818;
    border: 2px solid #cccccc;


`
export const ShowPasswordContainer = styled.div`
    display: flex;
    align-self: flex-start;
    align-items: center;
    

`
export const CheckBox = styled.input`
    border: none;
  padding: 5px;
  margin-top: 5px;
  border: 2px solid #616e7c;
`
export const ShowPasswordLabel = styled.label`
    font-weight: 500;
  color: ${props => (props.darkTheme ? ' #d7dfe9' : '#231f20')};
  font-size: 13px;
`
export const LoginButton = styled.button`
    cursor: pointer;
  margin-top: 20px;
  align-self: stretch;
  background-color: #3b82f6;
  border: none;
  border-radius: 7px;
  padding: 10px;
  color: #ffffff;
`
export const ErrorMessage = styled.p`
  font-size: 14px;
  color: #ff0000;
`