import { Component } from "react";

import Sidebar from "../Sidebar";

import { BgContainer, SideBarContainer, PageContainer, Card } from "./styledComponent";

class Source extends Component{

    render(){

        return(
            <BgContainer>
                <SideBarContainer>
                    <Sidebar />
                </SideBarContainer>
                <PageContainer>
                    <Card>
                        {this.props.children}
                    </Card>
                </PageContainer>
            </BgContainer>

        )
    }
}

export default Source