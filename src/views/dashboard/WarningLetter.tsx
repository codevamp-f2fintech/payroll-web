'use client'
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Grid,
    Box,
    LinearProgress,
    Button,
    styled
} from '@mui/material';
import {
    School,
    LibraryBooks,
    EmojiEvents,
    CastForEducation,
    Verified
} from '@mui/icons-material';

const LearningCard = styled(Card)`
    background: linear-gradient(to right bottom, #ffffff, #f8f9fa);
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }
`;

const LearningHeader = styled(CardHeader)`
    background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%);
    
    .MuiCardHeader-title {
        color: white;
        font-weight: 600;
        font-size: 1.4rem;
    }
`;

const LearningBox = styled(Box)`
    background-color: #f3e5f5;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const LearningIcon = styled(Box)`
    background-color: ${props => props.bgcolor || '#f3e5f5'};
    color: ${props => props.iconcolor || '#8e24aa'};
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ProgressBar = styled(LinearProgress)`
    height: 10px;
    border-radius: 5px;
    background-color: #f0f0f0;
    
    .MuiLinearProgress-bar {
        background: linear-gradient(to right, #8e24aa, #6a1b9a);
    }
`;

const CertificateButton = styled(Button)`
    && {
        background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%);
        color: white;
        padding: 0.5rem 1.5rem;
        border-radius: 25px;
        text-transform: none;
        margin-top: 0.5rem;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(142, 36, 170, 0.3);
        }
    }
`;

const WarningLetter = () => {
    // Sample learning and development data
    const learningData = {
        currentLearningPaths: [
            {
                title: 'Advanced Project Management',
                progress: 65,
                platform: 'LinkedIn Learning'
            },
            {
                title: 'Data Analytics Fundamentals',
                progress: 45,
                platform: 'Coursera'
            }
        ],
        completedCertifications: [
            {
                name: 'Agile Scrum Master',
                issuer: 'Scrum Alliance',
                date: 'September 2023'
            },
            {
                name: 'Cloud Computing Basics',
                issuer: 'AWS Certification',
                date: 'June 2023'
            }
        ],
        trainingBudget: {
            used: 1200,
            total: 2000
        },
        upcomingWorkshops: [
            {
                title: 'Leadership Communication Skills',
                date: 'December 15, 2024',
                time: '2:00 PM - 5:00 PM'
            }
        ]
    };

    return (
        <LearningCard elevation={3}>
            <LearningHeader

                title="Learning & Development"
                subheader="Your continuous growth journey"
            />
            <CardContent>
                <Grid container spacing={3}>
                    {/* Current Learning Paths */}
                    <Grid item xs={12}>
                        <LearningBox>
                            <LearningIcon bgcolor="#f3e5f5" iconcolor="#8e24aa">
                                <School />
                            </LearningIcon>
                            <Box width="100%">
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Current Learning Paths
                                </Typography>
                                {learningData.currentLearningPaths.map((path, index) => (
                                    <Box key={index} mb={1}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2">
                                                {path.title} ({path.platform})
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {path.progress}%
                                            </Typography>
                                        </Box>
                                        <ProgressBar
                                            variant="determinate"
                                            value={path.progress}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </LearningBox>
                    </Grid>

                    {/* Completed Certifications */}
                    <Grid item xs={12}>
                        <LearningBox>
                            <LearningIcon bgcolor="#e8eaf6" iconcolor="#3f51b5">
                                <EmojiEvents />
                            </LearningIcon>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Completed Certifications
                                </Typography>
                                {learningData.completedCertifications.map((cert, index) => (
                                    <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                                        <Verified color="success" />
                                        <Typography variant="body2">
                                            {cert.name}
                                            <Typography variant="caption" color="textSecondary" ml={1}>
                                                ({cert.issuer}, {cert.date})
                                            </Typography>
                                        </Typography>
                                    </Box>
                                ))}
                                <CertificateButton
                                    variant="contained"
                                    startIcon={<LibraryBooks />}
                                >
                                    View All Certificates
                                </CertificateButton>
                            </Box>
                        </LearningBox>
                    </Grid>

                    {/* Training Budget */}
                    <Grid item xs={12} md={6}>
                        <LearningBox>
                            <LearningIcon bgcolor="#e3f2fd" iconcolor="#2196f3">
                                <CastForEducation />
                            </LearningIcon>
                            <Box width="100%">
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Training Budget
                                </Typography>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">
                                        Used: ${learningData.trainingBudget.used}
                                    </Typography>
                                    <Typography variant="body2">
                                        Total: ${learningData.trainingBudget.total}
                                    </Typography>
                                </Box>
                                <ProgressBar
                                    variant="determinate"
                                    value={(learningData.trainingBudget.used / learningData.trainingBudget.total) * 100}
                                />
                            </Box>
                        </LearningBox>
                    </Grid>

                    {/* Upcoming Workshops */}
                    <Grid item xs={12} md={6}>
                        <LearningBox>
                            <LearningIcon bgcolor="#e8f5e9" iconcolor="#4caf50">
                                <School />
                            </LearningIcon>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Upcoming Workshops
                                </Typography>
                                {learningData.upcomingWorkshops.map((workshop, index) => (
                                    <Box key={index}>
                                        <Typography variant="body2">
                                            {workshop.title}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {workshop.date} | {workshop.time}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </LearningBox>
                    </Grid>
                </Grid>
            </CardContent>
        </LearningCard>
    );
};

export default WarningLetter;
