import styled from "styled-components";

export const InputWrapper = styled.div`
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
export const Input = styled.input`
    width: 150px;
    margin: 5px;
    border-radius: 4px;
    padding: 8px;
    color: #181818;
    border: 2px solid #cccccc;
`
export const DownloadReportBtn = styled.button`
  margin-top: 25px;
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  align-self: center;

  &:hover {
    background-color: #218838;
  }
`;
