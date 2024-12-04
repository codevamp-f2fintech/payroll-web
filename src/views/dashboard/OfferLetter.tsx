'use client'
import React, { useEffect, useState } from 'react';
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
    const [userData, setUserData] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true); // Loading state

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const fetchUserData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/employees/get/${user.id}`);
                const result = await response.json();
                console.log('Fetched Data:', result);

                // Set userData with the extracted `data` field
                if (result.success) {
                    setUserData(result.data);
                } else {
                    console.error('Failed to fetch user data:', result.message || 'Unknown error');
                }
                setLoading(false); // Set loading to false
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false); // Handle errors gracefully
            }
        };

        if (user.id) {
            fetchUserData();
        } else {
            setLoading(false); // No user ID in localStorage, stop loading
        }
    }, []);



    if (loading) {
        return <Typography align="center">Loading...</Typography>; // Display while loading
    }

    if (!userData) {
        return <Typography align="center">No user data found.</Typography>; // Handle no data scenario
    }




    return (
        <StyledCard elevation={5}>
            <StyledCardHeader
                title="Welcome Aboard!"
                subheader={
                    <>
                        <WelcomeMessage>
                            Welcome to the team! We're glad to have you on board.
                        </WelcomeMessage>
                        <Typography variant="h5" color="white" fontWeight="500">
                            {userData?.first_name} {userData?.last_name}
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
                            secondary={<Value>{userData?.designation}</Value>}
                        />
                    </StyledListItem>

                    <StyledListItem>
                        <IconWrapper bgcolor="#e3f2fd" iconcolor="#1976d2">
                            <Business />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Department</Label>}
                            secondary={<Value>{userData?.department}</Value>}
                        />
                    </StyledListItem>

                    <StyledListItem>
                        <IconWrapper bgcolor="#e0f2f1" iconcolor="#00695c">
                            <CalendarToday />
                        </IconWrapper>
                        <ListItemText
                            primary={<Label>Joining Date</Label>}
                            secondary={<Value>{formatDate(userData?.joining_date)}</Value>}
                        />
                    </StyledListItem>
                </List>
            </CardContent>
        </StyledCard>
    );
};

export default OfferLetter;
