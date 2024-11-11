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
import { CalendarToday, Work, Business, Description } from '@mui/icons-material';

// Styled Components
const StyledCard = styled(Card)`
    max-width: 800px;
    margin: 2rem auto;
    background: linear-gradient(to right bottom, #ffffff, #f8f9fa);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const StyledCardHeader = styled(CardHeader)`
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
    
    .MuiCardHeader-title {
        color: white;
        font-size: 2rem;
        font-weight: 600;
        text-align: center;
    }

    .MuiCardHeader-subheader {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.1rem;
        text-align: center;
    }
`;

const StyledListItem = styled(ListItem)`
    padding: 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
        background-color: rgba(46, 125, 50, 0.05);
        transform: translateX(5px);
    }

    &:last-child {
        border-bottom: none;
    }
`;

const IconWrapper = styled(Box)`
    background-color: ${props => props.bgcolor};
    color: ${props => props.iconcolor};
    width: 45px;
    height: 45px;
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
`;

const Value = styled(Typography)`
    font-size: 1.1rem;
    color: #37474f;
`;

const ViewButton = styled(Button)`
    && {
        background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
        color: white;
        padding: 0.5rem 1.5rem;
        border-radius: 25px;
        text-transform: none;
        font-size: 1rem;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(46, 125, 50, 0.3);
        }
    }
`;

const WelcomeMessage = styled(Typography)`
    text-align: center;
    color: white;
    margin-bottom: 1rem;
    font-style: italic;
`;

const OfferLetter = () => {
    const offerDetails = {
        employeeName: 'John Doe',
        position: 'Software Engineer',
        joiningDate: '2023-11-01',
        department: 'IT',
        offerLetterLink: '/path/to/offer-letter.pdf',
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <StyledCard elevation={5}>
            <StyledCardHeader
                title="Welcome Aboard!"
                subheader={
                    <>
                        <WelcomeMessage>
                            We're excited to have you join our team
                        </WelcomeMessage>
                        <Typography variant="h5" color="white" fontWeight="500">
                            {offerDetails.employeeName}
                        </Typography>
                    </>
                }
            />
            <CardContent>
                <List disablePadding>
                    <StyledListItem>
                        <IconWrapper bgcolor="#e8f5e9" iconcolor="#2e7d32">
                            <Work />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Position</Label>}
                            secondary={<Value>{offerDetails.position}</Value>}
                        />
                    </StyledListItem>
                    <StyledListItem>
                        <IconWrapper bgcolor="#f1f8e9" iconcolor="#558b2f">
                            <Business />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Department</Label>}
                            secondary={<Value>{offerDetails.department}</Value>}
                        />
                    </StyledListItem>
                    <StyledListItem>
                        <IconWrapper bgcolor="#e0f2f1" iconcolor="#00695c">
                            <CalendarToday />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Joining Date</Label>}
                            secondary={<Value>{formatDate(offerDetails.joiningDate)}</Value>}
                        />
                    </StyledListItem>
                    <StyledListItem>
                        <IconWrapper bgcolor="#f9fbe7" iconcolor="#827717">
                            <Description />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Offer Letter</Label>}
                            secondary={
                                <ViewButton
                                    variant="contained"
                                    href={offerDetails.offerLetterLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<Description />}
                                >
                                    View Offer Letter
                                </ViewButton>
                            }
                        />
                    </StyledListItem>
                </List>
            </CardContent>
        </StyledCard>
    );
};

export default OfferLetter;
