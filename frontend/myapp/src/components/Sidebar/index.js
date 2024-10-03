import { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import { GoPerson } from "react-icons/go";
import { TbLogout2 } from "react-icons/tb";
import { IoKeyOutline } from "react-icons/io5";
import { toast } from 'react-toastify';

import AppContext from "../../Context/AppContext";
import MenuItem from "../MenuItem"

import {SidebarBgContainer, LogoContainer, LogoImage, MenuUnorderdListContainer, ProfileContainer, ProfilePicture,
    ProfileName, ModalOption,
    ChangePasswordBtn
} from "./styledComponent"
import { Input } from "../Source/styledComponent";

const menuItemsList = [
    {
        id: "DASHBOARD",
        displayText: "Dashboard",
        path: "/dashboard"
    },
    {
        id: "EMPLOYEE",
        displayText: "Employee",
        path: "/employee"
    },
    {
        id: "ATTENDANCE",
        displayText: "Attendance",
        path: "/attendance"
    },
    {
        id: "PAYROLL",
        displayText: "Payroll",
        path: "/payroll"
    },
    {
        id: "TRAINING",
        displayText: "Training",
        path: "/training"
    },
    {
        id: "CV DATABASE",
        displayText: "CV Database",
        path: "/cv-database"
    },
    {
        id: "STANDARD MAIL",
        displayText: "Standard Mail",
        path: "/standard-mail"
    },
    
]
class Sidebar extends Component {

    state = {
        modalIsOpen: false,
        isPasswordChangeModalOpen: false,
        currentPassword: '',
        newPassword: '',
    }

    onLogoutBtn = () => {
        Cookies.remove('jwt_token')
        const {history} = this.props
        history.replace('/login')
    }

    openModal = () => {
        this.setState({modalIsOpen: true})
    }
    
    closeModal = () => {
        this.setState({modalIsOpen: false})
    }
    
    openPasswordChangeModal = () => {
        this.setState({modalIsOpen: false, isPasswordChangeModalOpen: true})
    }

    closePasswordChangeModal = () => {
        this.setState({isPasswordChangeModalOpen: false, currentPassword: '', newPassword: ''})
    }

    handlePasswordInputChange = (event) => {
        const {name, value} = event.target
        this.setState({[name]: value}) 
    }

    handlePasswordChange = async (event) => {
        event.preventDefault();
        const pendingToast = toast.loading("Updating password...");

        const { employeeId } = this.context;
        const { currentPassword, newPassword } = this.state;

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({ currentPassword, employeeId, newPassword }),
            };
            const response = await fetch("http://localhost:4000/change-password", options);

            const data = await response.json();

            if (!response.ok) {
                toast.update(pendingToast, {
                    render: data.error,
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
                autoClose: 2000,  
            });
            
            this.closePasswordChangeModal();

        } catch (error) {
            toast.update(pendingToast, {
                render: "Network error. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000,  
            });
        }
    }

    render(){
        const {userName, role} = this.context

        const filteredMenuItems = role === "USER" || role === "FINANCE ADMIN"
            ? menuItemsList.filter(item => item.id !== "EMPLOYEE" && item.id !== "CV DATABASE" && item.id !== "STANDARD MAIL")
            : menuItemsList;
        
        const customStyles = {
            content: {
              top: '90%',
              left: '18%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              paddingTop: '15px',
              paddingBottom: '15px',
              paddingLeft: '1px',
              paddingRight: '1px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
            },
            overlay: {
                backgroundColor: 'transparent',
              },
          };

          const passwordChangeModalStyles = {
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',      
            },
          };

        return(         
            <SidebarBgContainer>
                <LogoContainer>
                    <LogoImage alt="Logo" src="https://res.cloudinary.com/deuczujwd/image/upload/v1727729849/WhatsApp_Image_2024-09-28_at_11.21.38_AM-removebg-preview_6_ysygu6.png" /> 
                </LogoContainer>
                
                <MenuUnorderdListContainer>
                    {filteredMenuItems.map(eachItem => (
                        <MenuItem key={eachItem.id}
                        menu={eachItem}
                        />
                    ))}
                </MenuUnorderdListContainer>

                <ProfileContainer onClick={this.openModal}>
                    <ProfilePicture src="/images/kindpng_248253.png" />
                    <ProfileName>{userName}</ProfileName>
                    <MdOutlineKeyboardArrowRight size={20}/>
                </ProfileContainer>

                <Modal
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    <Link to="/profile" style = {{textDecoration: "none", color: "inherit"}}>
                        <ModalOption>
                            <GoPerson  size={20}/>
                            <p style={{paddingLeft: "12px"}}>Profile</p>
                        </ModalOption> 
                    </Link>
                    <ModalOption onClick={this.openPasswordChangeModal} >
                        <IoKeyOutline size={20} />
                        <p style={{paddingLeft: "12px"}}>Change Password</p>
                    </ModalOption>
                    <ModalOption onClick={this.onLogoutBtn} >
                        <TbLogout2 size={20} />
                        <p  style={{paddingLeft: "12px"}}>Logout</p>
                    </ModalOption>
                </Modal>

                <Modal
                    isOpen={this.state.isPasswordChangeModalOpen}
                    onRequestClose={this.closePasswordChangeModal}
                    style={passwordChangeModalStyles}
                    contentLabel="Example Modal"
                >
                    <form onSubmit={this.handlePasswordChange} style={{display: 'flex', flexDirection: 'column'}}>
                        <Input 
                        type="password"
                        name="currentPassword"
                        value={this.state.currentPassword}
                        onChange={this.handlePasswordInputChange}
                        placeholder="Enter Current Password"
                        required
                        />

                        <Input 
                        type="password"
                        name="newPassword"
                        value={this.state.newPassword}
                        onChange={this.handlePasswordInputChange}
                        placeholder="Enter New Password"
                        required
                        />
                        <ChangePasswordBtn type="submit">Change Password</ChangePasswordBtn>
                    </form>

                </Modal>

            </SidebarBgContainer>
            
        )
    }
}

Sidebar.contextType = AppContext

export default withRouter(Sidebar)