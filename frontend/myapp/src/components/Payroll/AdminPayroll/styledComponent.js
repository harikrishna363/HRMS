import styled from "styled-components";

export const TemplateDownloadBtn = styled.button`
    border-radius: 5px;
    cursor: pointer;
    padding: 10px;
    margin-right: 40px;
`
export const UploadPayrollBtn = styled.button`
    border-radius: 5px;
    cursor: pointer;
    padding: 10px;
`
export const FlexContainer = styled.div`
    display: flex;
    align-items: center;
`
export const SelectMonthContainer = styled.div`
    width: 200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 40px;
`
export const SearchBoxContainer = styled.div`
    margin: 20px;
`
export const RangeButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;
    border-radius: 5px;

`
export const SearchBox = styled.input`
 padding: 8px;
 font-size: 16px;
  width: 300px;
  border-radius: 7px;
`
export const DeleteButton = styled.button`
  margin: 10px;
  margin-right: 30px;
  padding: 10px 20px;
  background-color: ${(props) => (props.disabled ? '#f5c6c6' : '#d9534f')}; /* light red for disabled, darker red for active */
  color: #fff;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (!props.disabled ? '#c9302c' : '#f5c6c6')}; /* darker red on hover */
  }
`;
