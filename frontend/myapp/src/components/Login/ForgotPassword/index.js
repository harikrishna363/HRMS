import { Component } from "react";
import { MdOutlineArrowBack } from "react-icons/md";
import { Oval } from "react-loader-spinner"; 
import { toast } from 'react-toastify';

import { Input, InputContainer, InputLabel, LoginBgContainer, LoginCardContainer, Logo, GetOtpBtn } from "./styledComponent";
import { CheckBox, FormElement, ShowPasswordContainer, ShowPasswordLabel } from "../styledComponent";

class ForgotPassword extends Component {
  state = {
    email: "",
    otp: "",
    isOtpSent: false,
    isLoading: false,
    newPassword: "",
    showPassword: false,
    message: "",
    errorMessage: ""
  };

  toggleShowPassword = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  }

  updateInputChange = event => {
    const {name, value} = event.target
    this.setState({ [name]: value });
  };

  validateEmail = () => {
    const { email } = this.state;
    const emailDomain = "@timbremedia.in";
    return email.endsWith(emailDomain);
  }

  sendOtp = async (event) => {
    event.preventDefault();
    const { email } = this.state;

    if (!this.validateEmail()) {
        toast.error('Invalid Email')
        return;
    }
    this.setState({isLoading: true})

    const apiUrl = "http://localhost:4000/send-otp";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    };
    
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    if (response.ok) {
      toast.success(data.success)
      this.setState({ isOtpSent: true, isLoading: false });
    } else {
      toast.error(data.failure)
      this.setState({ isLoading: false });
    }
  };

  handleChangePassword = async (event) => {
    event.preventDefault();
    const {email, otp, newPassword} = this.state

    const response = await fetch("http://localhost:4000/reset-password", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify({email, otp, newPassword}),
    });

    const data = await response.json();
    if (response.ok) {
        toast.success('Password Changed')
        window.location.replace("./login");
    } else {
      toast.error(data.failure)
    }
  };

  handleBackArrowClick = () => {
    this.props.history.goBack();
  }


  render() {
    const { email, otp, newPassword, message, errorMessage, showPassword } = this.state;
    const passwordType = showPassword ? "text" : "password";

    if (this.state.isLoading){
        return(
        <LoginBgContainer>
            <Logo alt="Logo" src="https://res.cloudinary.com/deuczujwd/image/upload/v1727720137/WhatsApp_Image_2024-09-28_at_11.21.38_AM_eryerc.jpg" />
            <LoginCardContainer>
                <MdOutlineArrowBack size={20}
                    onClick={this.handleBackArrowClick}  
                    style={{alignSelf: 'flex-start', cursor: 'pointer'}}
                />
                <Oval
                    visible={true}
                    height="40"
                    width="40"
                    color="#3498DB"
                    secondaryColor="#3498DB"
                    ariaLabel="oval-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
            </LoginCardContainer>
        </LoginBgContainer>
        )
        
    }
    
    return (
        <LoginBgContainer>
                      <Logo alt="Logo" src="https://res.cloudinary.com/deuczujwd/image/upload/v1727720137/WhatsApp_Image_2024-09-28_at_11.21.38_AM_eryerc.jpg" />

            <LoginCardContainer>
            <MdOutlineArrowBack size={20}
                onClick={this.handleBackArrowClick}  
                style={{alignSelf: 'flex-start', cursor: 'pointer'}}
            />
            
            {
                !this.state.isOtpSent &&
                <FormElement onSubmit={this.sendOtp}>
                
                    <InputContainer>
                        <InputLabel htmlFor="email">
                            Email
                        </InputLabel>
                        <Input 
                            id="email" 
                            type="text" 
                            name="email"
                            placeholder="Enter your Email" 
                            value={email} 
                            onChange={this.updateInputChange} 
                            required
                        />
                    </InputContainer>
                
                    <GetOtpBtn type="submit">Get OTP</GetOtpBtn>
                </FormElement>
            }
            
            {
            this.state.isOtpSent && 
            <FormElement onSubmit={this.handleChangePassword}>
            {message && <p style={{fontSize: '14px', fontWeight: '500'}}>{message}</p>}
            <InputContainer>
                <InputLabel htmlFor="otp">
                    OTP
                </InputLabel>
                <Input 
                    id="otp" 
                    type="text" 
                    name="otp"
                    placeholder="Enter OTP" 
                    value={otp} 
                    onChange={this.updateInputChange} 
                    required
                />
            </InputContainer>

            <InputContainer>
                <InputLabel htmlFor="newPassword">
                    New Password
                </InputLabel>
                <Input 
                    id="newPassword" 
                    type={passwordType}
                    name="newPassword"
                    placeholder="Type new password" 
                    value={newPassword} 
                    onChange={this.updateInputChange} 
                    required
                />
                </InputContainer>
                <ShowPasswordContainer>
                <CheckBox 
                    id="showPassword" 
                    type="checkbox" 
                    onChange={this.toggleShowPassword} 
                />
                <ShowPasswordLabel htmlFor="showPassword">Show Password</ShowPasswordLabel>
                </ShowPasswordContainer>

                <GetOtpBtn type="submit">Change Password</GetOtpBtn>
            
              </FormElement>
            }
              
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            
            
            </LoginCardContainer>
        </LoginBgContainer>
    );
  }
}

export default ForgotPassword;
