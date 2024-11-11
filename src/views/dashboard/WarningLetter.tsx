'use client'
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    List,
    ListItem,
    ListItemText,
    Box,
    Button,
    styled,
} from '@mui/material';
import {
    CalendarToday,
    Warning,
    TrackChanges,
    Description,
    CheckCircle
} from '@mui/icons-material';

const StyledCard = styled(Card)`
    max-width: 800px;
    margin: 2rem auto;
    background: linear-gradient(to right bottom, #ffffff, #f8f9fa);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
`;

const StyledCardHeader = styled(CardHeader)`
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
        
    .MuiCardHeader-title {
        color: white;
        font-size: 1.8rem;
        font-weight: 600;
        text-align: center;
    }

    .MuiCardHeader-subheader {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.1rem;
        text-align: center;
        margin-top: 0.5rem;
    }
`;

const StyledListItem = styled(ListItem)`
    padding: 1.5rem;
    border-left: 4px solid ${props => props.bordercolor || '#2e7d32'};
    margin: 1rem;
    background: white;
    border-radius: 0 10px 10px 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateX(5px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }
`;

const IconWrapper = styled(Box)`
    background-color: ${props => props.bgcolor || '#e8f5e9'};
    color: ${props => props.iconcolor || '#2e7d32'};
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.1);
    }
`;

const Label = styled(Typography)`
    font-weight: 600;
    color: #2e7d32;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Value = styled(Typography)`
    font-size: 1.1rem;
    color: #37474f;
    line-height: 1.6;
`;

const ViewButton = styled(Button)`
    && {
        background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
        color: white;
        padding: 0.5rem 1.5rem;
        border-radius: 25px;
        text-transform: none;
        font-size: 1rem;
        margin-top: 0.5rem;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(46, 125, 50, 0.3);
        }
    }
`;

const NoWarningContainer = styled(Box)`
    text-align: center;
    padding: 3rem;
    background: #f8faf8;
    border-radius: 20px;
`;

const StatusBadge = styled(Box)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background: ${props => props.active ? '#ffebee' : '#e8f5e9'};
    color: ${props => props.active ? '#c62828' : '#2e7d32'};
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const WarningLetter = () => {
    const warningDetails = {
        hasWarning: true, // Change to false if there's no warning
        issueDate: '2023-10-15',
        reason: 'Attendance Issues',
        improvementPlan: 'Must improve punctuality within 30 days. Expected to maintain at least 90% attendance rate and arrive no later than 9:15 AM for morning shifts.',
        warningLetterLink: '/path/to/warning-letter.pdf',
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!warningDetails.hasWarning) {
        return (
            <StyledCard elevation={3}>
                <StyledCardHeader title="Performance Status" />
                <CardContent>
                    <NoWarningContainer>
                        <IconWrapper bgcolor="#e8f5e9" iconcolor="#2e7d32" style={{ margin: '0 auto 1rem auto' }}>
                            <CheckCircle fontSize="large" />
                        </IconWrapper>
                        <Typography variant="h6" color="#2e7d32" gutterBottom>
                            Good Standing
                        </Typography>
                        <Typography color="textSecondary">
                            No warnings or performance improvement plans are currently active.
                        </Typography>
                    </NoWarningContainer>
                </CardContent>
            </StyledCard>
        );
    }

    return (
        <StyledCard elevation={3}>
            <StatusBadge active={true}>
                <Warning fontSize="small" />
                Active Warning
            </StatusBadge>
            <StyledCardHeader
                title="Performance Improvement Notice"
                subheader="Please review the details below carefully"
            />
            <CardContent>
                <List disablePadding>
                    <StyledListItem bordercolor="#ffd54f">
                        <IconWrapper bgcolor="#fff8e1" iconcolor="#f57f17">
                            <CalendarToday />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Issue Date</Label>}
                            secondary={<Value>{formatDate(warningDetails.issueDate)}</Value>}
                        />
                    </StyledListItem>
                    <StyledListItem bordercolor="#ef5350">
                        <IconWrapper bgcolor="#ffebee" iconcolor="#c62828">
                            <Warning />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Reason for Notice</Label>}
                            secondary={<Value>{warningDetails.reason}</Value>}
                        />
                    </StyledListItem>
                    <StyledListItem bordercolor="#2e7d32">
                        <IconWrapper bgcolor="#e8f5e9" iconcolor="#2e7d32">
                            <TrackChanges />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Improvement Plan</Label>}
                            secondary={<Value>{warningDetails.improvementPlan}</Value>}
                        />
                    </StyledListItem>
                    <StyledListItem bordercolor="#1976d2">
                        <IconWrapper bgcolor="#e3f2fd" iconcolor="#1976d2">
                            <Description />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Documentation</Label>}
                            secondary={
                                <ViewButton
                                    variant="contained"
                                    href={warningDetails.warningLetterLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<Description />}
                                >
                                    View Complete Notice
                                </ViewButton>
                            }
                        />
                    </StyledListItem>
                </List>
            </CardContent>
        </StyledCard>
    );
};

export default WarningLetter;
