import { Link } from "react-router-dom";
import AppContext from "../../Context/AppContext";
import { LuLayoutDashboard } from "react-icons/lu";
import { GrGroup } from "react-icons/gr";
import { SlCalender } from "react-icons/sl";
import { IoWalletOutline } from "react-icons/io5";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { TbFileCv } from "react-icons/tb";
import { MdOutlineMailOutline } from "react-icons/md";

import {MenuListContainer, MenuIconContainer, MenuText} from "./styledComponent"

const MenuItem = props => {
    const {menu} = props

    let icon 

    switch (menu.id) {
        case "DASHBOARD":
            icon = <LuLayoutDashboard size="20"/>
            break
        case "EMPLOYEE":
            icon = <GrGroup size="20"/>
            break
        case "ATTENDANCE":
            icon = <SlCalender size="20"/>
            break
        case "PAYROLL":
            icon = <IoWalletOutline size="20"/>
            break
        case "TRAINING":
            icon = <LiaChalkboardTeacherSolid size="20"/>
            break
        case "CV DATABASE":
            icon = <TbFileCv size="20"/>
            break
        case "STANDARD MAIL":
            icon = <MdOutlineMailOutline size="20"/>
            break 
        default:
            icon = null
    }

    return (
        <AppContext.Consumer>
            {value => {
                const {activeMenuId, updateActiveMenuId} = value

                const onMenuId = () => updateActiveMenuId(menu.id)
        
                const menuActiveStatus = menu.id === activeMenuId

                return(
                    <Link to={menu.path} style = {{textDecoration: "none"}}>
                        <MenuListContainer $menuactivestatus={menuActiveStatus} onClick={onMenuId}>
                            <MenuIconContainer >
                                {icon}
                            </MenuIconContainer>
                            <MenuText>{menu.displayText}</MenuText>
                        </MenuListContainer>
                    </Link>
                )
            }}
        </AppContext.Consumer>
        
        

    )

}

export default MenuItem