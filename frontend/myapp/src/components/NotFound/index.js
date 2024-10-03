import { Component } from "react";
import Source from "../Source"
import { BiError } from "react-icons/bi";

import AppContext from "../../Context/AppContext";
import { Container } from "../Source/styledComponent"

class NotFound extends Component{

    render(){
        const {role} = this.context
        console.log(role)

        if (!role) {
            return (
            <div style={{width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <BiError size={60} />
                <h2>Page Not Found</h2>
            </div>
            )
            
        }

        return(
        <Source>
        <Container style={{flexDirection: 'column'}}>
            <BiError size={60} />
            <h2>Page Not Found</h2>
        </Container>
        </Source>
        )
    }
}

NotFound.contextType = AppContext

export default NotFound