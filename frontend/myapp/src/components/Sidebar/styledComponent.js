import styled from "styled-components";

export const SidebarBgContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #2C3E50;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 10px;
`
export const LogoContainer = styled.div`
    width: 100%;
    height: 160px;
    background-color: transparent;
    display:flex;
    align-items:center;
    justify-content: center;
`
export const LogoImage = styled.img`
    width: 80%;
    height: 100%;
    border-top-right-radius: 18px;

`
export const MenuUnorderdListContainer = styled.ul`
    padding-left: 0px;
    width:100%;
    list-style: none;
`
export const ProfileContainer = styled.div`
    padding: 15px;
    margin-top:auto;
    margin-bottom: 20px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #d3def0;
    background-color: transparent;
    cursor: pointer;

    transition: background-color 0.3s ease;
    &:hover {
        background-color: #2980B9; 
    }

`
export const ProfilePicture = styled.img`
    width: 30px;

`
export const ProfileName = styled.p`
    font-size: 17px;
    font-weight: 500; 
    align-self: start;
    margin: 0px;
`
export const ModalOption = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0px;
    height: 30px;
    padding-left: 20px;
    padding-right: 20px;
    border-radius: 5px;
    
    transition: background-color 0.3s ease;
    &:hover {
        background-color: #d4d6d6; 
    }
`
export const ChangePasswordBtn = styled.button`
    margin-top: 15px;
    border-radius: 8px;
    cursor: pointer;
    padding: 12px 20px;
    background-color: #3498DB;
    color: white;
    border: none;
    font-size: 16px;
    font-weight: 600;
    transition: background-color 0.3s ease;
    
    &:hover {
        background-color: #2980B9;
    }

    &:active {
        background-color: #2980B9;
    }
`;