import styled from "styled-components";

export const MenuListContainer = styled.li`
  width: 100%;
  height: 40px;
  padding: 15px;
  padding-left: 20px;
  color: #d4d6d6;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background-color: ${({ $menuactivestatus }) => ($menuactivestatus ? '#3498DB' : 'transparent')};

  transition: background-color 0.3s ease;
    &:hover {
        background-color: #2980B9; 
    }
`;
export const MenuIconContainer = styled.div`
    margin-top: 5px;
    margin-right: 15px;
    padding: 0px;
`
export const MenuText = styled.p`
    font-size: 17px;
    font-weight: 500; 

`