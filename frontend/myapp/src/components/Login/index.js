import { Component } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

import { 
  LoginBgContainer, 
  LoginCardContainer, 
  Logo, 
  FormElement, 
  InputContainer, 
  InputLabel, 
  Input,
  ShowPasswordContainer, 
  CheckBox, 
  ShowPasswordLabel, 
  LoginButton, 
  ErrorMessage 
} from "./styledComponent";

class Login extends Component {
  state = {
    email: "",
    password: "",
    showPassword: false,
    errorMessage: "",
    showErrorMessage: false
  }

  componentDidMount() {
    const { history } = this.props;
    const jwtToken = Cookies.get('jwt_token');
    if (jwtToken) {
      history.replace("/dashboard");
      localStorage.setItem('activeMenuId', 'DASHBOARD');
    }
  }
  
  validateEmail = () => {
    const { email } = this.state;
    const emailDomain = "@timbremedia.in";
    return email.endsWith(emailDomain);
  }

  onSubmitForm = async event => {
    event.preventDefault();
    this.setState({ showErrorMessage: false });
    const { email, password } = this.state;

    // Validate email domain
    if (!this.validateEmail()) {
      this.setState({ 
        showErrorMessage: true, 
        errorMessage: "Invalid Email" 
      });
      return;
    }

    const userDetails = { email, password };
    const apiUrl = "http://localhost:4000/login";
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails)
    }
    const response = await fetch(apiUrl, options);
    const data = await response.json();
    
    if (response.ok === true) {
      this.submitSuccess(data.jwtToken);
    } else {
      this.submitFailure(data.errorMessage);
    }
  }

  submitSuccess = jwtToken => {
    Cookies.set('jwt_token', jwtToken, { expires: 30 });
    localStorage.setItem('activeMenuId', 'DASHBOARD');
    window.location.replace('/dashboard');
  }

  submitFailure = errorMessage => {
    this.setState({ showErrorMessage: true, errorMessage });
  }

  updateEmail = event => {
    this.setState({ email: event.target.value });
  }

  updatePassword = event => {
    this.setState({ password: event.target.value });
  }

  toggleShowPassword = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  }

  render() {
    const { email, password, showPassword, errorMessage, showErrorMessage } = this.state;
    const passwordType = showPassword ? "text" : "password";
    return (
      <LoginBgContainer>
        <Logo alt="Logo" src="https://res.cloudinary.com/deuczujwd/image/upload/v1727720137/WhatsApp_Image_2024-09-28_at_11.21.38_AM_eryerc.jpg" />
        <LoginCardContainer>
          <FormElement onSubmit={this.onSubmitForm}>
            <InputContainer>
              <InputLabel htmlFor="email">
                Email
              </InputLabel>
              <Input 
                id="email" 
                type="text" 
                placeholder="Enter your Email" 
                value={email} 
                onChange={this.updateEmail} 
                required
              />
            </InputContainer>
            <InputContainer>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input 
                id="password" 
                type={passwordType} 
                placeholder="Enter Password" 
                value={password} 
                onChange={this.updatePassword} 
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
            <LoginButton type="submit">Sign In</LoginButton>
            {showErrorMessage && (
              <ErrorMessage>*{errorMessage}</ErrorMessage>
            )}
            <Link to="/forgot-password">
              <p>Forgot Password?</p>
            </Link>
          </FormElement>
        </LoginCardContainer>
      </LoginBgContainer>
    );
  }
}

export default Login;
