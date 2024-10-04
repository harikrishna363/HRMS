import React from 'react';
import Modal from 'react-modal';
import Cookies from 'js-cookie'

import { FlexContainer } from '../../../Source/styledComponent';
import { DownloadReportBtn, Input, InputWrapper } from './styledComponent';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

class AttendanceReportModal extends React.Component {
    state = {
        startDate: '', 
        endDate: '',
    };

    handleDateChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value }); 
    };

    handleDownloadReport = async (event) => {
        event.preventDefault()
        
        const { startDate, endDate } = this.state;

        if (startDate > endDate) {
            toast.error('Please Select Valid Dates', {
                autoClose: 4000
            })

            return
        }

        try {
            const jwtToken = Cookies.get("jwt_token");
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            };
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance-report?startDate=${startDate}&endDate=${endDate}`, options);
            const data = await response.json()

            if (!response.ok) {
                toast.error(data.failure, {
                    autoClose: 4000
                })
    
                return
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${startDate}_to_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        } catch (error) {
            toast.error(`Network error. Please try again later.`, {
                autoClose: 4000, 
            });
        }
    };

    render() {
        const { isAttendanceReportModalOpen, closeAttendanceReportModal } = this.props;
        const { startDate, endDate } = this.state;

        const customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                paddingTop: '40px',
            },
        };

        return (
            <Modal
                isOpen={isAttendanceReportModalOpen}
                onRequestClose={closeAttendanceReportModal}
                style={customStyles}
                contentLabel="Attendance Report Modal"
            >
                <form onSubmit={this.handleDownloadReport} style={{display: 'flex', flexDirection: 'column'}}>
                <FlexContainer>
                    <InputWrapper>
                        <Input
                            type="date"
                            name="startDate" 
                            value={startDate}
                            onChange={this.handleDateChange}
                            required
                        />
                        <label>From</label>
                    </InputWrapper>
                    <InputWrapper>
                        <Input
                            type="date"
                            name="endDate" 
                            value={endDate}
                            onChange={this.handleDateChange}
                            required
                        />
                        <label>To</label>
                    </InputWrapper>
                </FlexContainer>
                <DownloadReportBtn type='submit'>
                    Download Report
                </DownloadReportBtn>
                </form>
                
            </Modal>
        );
    }
}

export default AttendanceReportModal;
