import styled from "styled-components";

export const Input = styled.input`
  width: 20%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: ${({ readOnly }) => (readOnly ? '#f0f0f0' : 'transparent')};
  color: ${({ readOnly }) => (readOnly ? '#888' : '#000')};
`;

export const TextArea = styled.textarea`
  width: 70%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;
export const InputWrapper = styled.div`
  width: 100%;
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