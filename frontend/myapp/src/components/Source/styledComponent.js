import styled from "styled-components"

export const BgContainer = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`
export const SideBarContainer = styled.div`
    width: 18%;
    height: 100%;
`
export const PageContainer = styled.div`
    width: 100%;
    height:100%;
    padding: 30px;
    display: flex;
    justify-content: center;
    overflow-x: auto;
`
export const Card = styled.div`
    width: 100%;
    height:100%;
    padding: 20px;
    padding-top: 30px;
    overflow-y: auto;
    box-shadow: 0px 4px 16px 0px #bfbfbf;
`
export const FlexContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`
export const AlignStartFlexContainer = styled.div`
    display: flex;
    align-items: flex-start;
`
export const StarMark = styled.span`
    color: red;
`
export const SubmitButton = styled.button`
    border-radius: 5px;
    align-self: center;
    width: 100px;
    padding: 5px;
    background-color: transparent;
    cursor: pointer;
`
export const SearchBoxContainer = styled.div`
    margin: 20px;
`
export const SearchBox = styled.input`
    padding: 10px 18px;
    font-size: 16px;
    width: 300px;
    border: 2px solid #3498DB;
    border-radius: 8px;
`
export const TableContainer = styled.div`
    min-height: 300px;
`
export const Btn = styled.button`
    border-radius: 5px;
    cursor: pointer;
    padding: 10px;
    margin: 10px;
    display: flex;
    align-items: center;
`
export const BackButton = styled.button`
    display:flex;
    justify-content: center;
    align-items: center;
    background-color: transparent; 
    color: #3498DB;
    border: none; 
    border-radius: 5px; 
    cursor: pointer;  
`
export const AddBtn = styled.button`
    border-radius: 8px;
    cursor: pointer;
    padding: 12px 20px;
    background-color: #3498DB;
    color: white;
    border: none;
    font-size: 16px;
    font-weight: 600;
    transition: background-color 0.3s ease, transform 0.2s ease;
    
    &:hover {
        background-color: #2980B9;
        transform: scale(1.05);
    }

    &:active {
        background-color: #2980B9;
    }
`;
export const SaveButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  background-color: ${(props) => (props.disabled ? '#ccc' : '#4CAF50')};
  color: #fff;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (!props.disabled ? '#45a049' : '#ccc')};
  }
`;
export const CancelButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  background-color: ${(props) => (props.disabled ? '#ccc' : '#f5963d')};
  color: #fff;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (!props.disabled ? '#e58532' : '#ccc')};
  }
`;
export const ActiveStatusSelectInput = styled.select`
    cursor: pointer;
    width: 90px;
    border-radius: 10px;
    padding: 6px;
    color: #181818;
    border: 2px solid ${props => 
        props.status === 'Active' ? '#4CAF50' : '#FF6347'}     
`;
export const ReportBtn = styled.button`
    margin-left: 30px;
    border-radius: 8px;
    cursor: pointer;
    padding: 10px 18px;
    background-color: transparent;
    color: #3498DB;
    border: 2px solid #3498DB;
    font-size: 16px;
    font-weight: 600;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: scale(0.95);
    }
`;
export const BlueBtn = styled.button`
    border-radius: 8px;
    cursor: pointer;
    padding: 12px 20px;
    background-color: #3498DB;
    color: white;
    border: none;
    font-size: 16px;
    font-weight: 600;
    transition: background-color 0.3s ease, transform 0.2s ease;
    
    &:hover {
        background-color: #2980B9;
        transform: scale(1.05);
    }

    &:active {
        background-color: #2980B9;
    }
`;
export const RetryBtn = styled.button`
    border-radius: 17px;
    cursor: pointer;
    padding: 7px 15px;
    background-color: #3498DB;
    color: white;
    border: none;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.3s ease;
    
    &:hover {
        background-color: #2980B9;
    }

    &:active {
        background-color: #2980B9;
    }
`;
export const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`
export const Input = styled.input`
  width:90%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: ${({ readOnly }) => (readOnly ? '#f0f0f0' : 'transparent')};
  color: ${({ readOnly }) => (readOnly ? '#888' : '#000')};
`;
export const SelectInput = styled.select`
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width:90%;
  cursor: pointer;
`;
export const TextArea = styled.textarea`
  width: 90%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: ${({ readOnly }) => (readOnly ? '#f0f0f0' : 'transparent')};
  color: ${({ readOnly }) => (readOnly ? '#888' : '#000')};
`;
export const InputWrapper = styled.div`
  width: 33%;
  position: relative;
  display: inline-block;
  margin-top: 10px;

  label {
    font-weight: 700;
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    color: #aaa;
    transition: 0.2s ease all;
    pointer-events: none;
  }

  input:focus + label,
  input:not(:placeholder-shown) + label,
  select:focus + label,
  select:not([value=""]) + label,
  textarea:focus + label,
  textarea:not([value=""]) + label {
    top: -8px;
    left: 5px;
    font-size: 12px;
    color: #000;
  }
`;
export const OutlineBtn = styled.button`
    border-radius: 8px;
    cursor: pointer;
    padding: 10px 18px;
    background-color: transparent;
    color: #3498DB;
    border: 2px solid #3498DB;
    font-size: 16px;
    font-weight: 600;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: scale(0.95);
    }
`;
export const RangeContainer = styled.div`
    width: 260px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 40px;
`
export const RangeButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    color: #3498DB;
`
export const TableTitle = styled.h3`
    color: #36454F;
`
export const Title = styled.h2`
    color: #36454F;
    text-align: center;
    margin-top: 0px;
    margin-bottom: 40px;
`
export const NoRecordsText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #7f8c8d; 
  
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
export const ViewPayslip = styled.button`
    border-radius: 4px;
    cursor: pointer;
    padding: 3px;
    background-color: transparent;
    color: #3498DB;
    border: 2px solid #3498DB;
    font-size: 14px;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: scale(0.95);
    }
`;