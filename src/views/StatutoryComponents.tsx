"use client"
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { debounce } from "lodash"
import StatutoryComponentsForm from "@/components/statutory-components/StatutoryComponentsForm"
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { fetchStatutoryComponents } from "@/redux/features/statutory-component/statutoryComponentSlice"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
const StatutoryComponents = () => {
  const dispatch: AppDispatch = useDispatch()
  const { components, error } = useSelector((state: RootState) => state.statutoryComponent);
  const [selectedcomponents, setSelectedcomponents] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [value, setValue] = useState(0);
  console.log('component', components);

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role

  const epfData = components?.data?.[0]?.EPF || {};
  const esiData = components?.data?.[0]?.ESI || {};
  const bonusData = components?.data?.[0]?.Bonus || {};
  const id = components?.data?.[0]?._id; // Adjusted to access the first item in the array


  console.log("id", id)

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchStatutoryComponents())
    }, 300),
    []
  )

  useEffect(() => {
    debouncedFetch()
    return debouncedFetch.cancel
  }, [debouncedFetch])

  const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSelectedKeyword(e.target.value)
  }

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1)
    setLimit(newPageSize)
  }

  const handlePaginationModelChange = (params: { page: number; pageSize: number }) => {
    handlePageChange(params.page, params.pageSize)
    debouncedFetch()
  }

  const handleAddClick = () => {
    setSelectedcomponents(null)
    setShowForm(true)
  }

  const handleEditClick = (id: string) => {
    setSelectedcomponents(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false)
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tableStyles = { maxWidth: '600px', margin: '0 auto', borderRadius: '8px' };


  return (
    <>
      <ToastContainer position="top-center" />
      <Dialog open={showForm} onClose={handleCloseForm} fullWidth maxWidth='md'>
        <DialogContent>
          <StatutoryComponentsForm
            handleClose={handleCloseForm}
            declaration={selectedcomponents}
            debouncedFetch={debouncedFetch}
            components={components}

          />
        </DialogContent>
      </Dialog>

      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            Statutory Components
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / Statutory Components
          </Typography>
        </Box>
        <Box display='flex' alignItems='center'>
          <Button
            style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
            variant='contained'
            color='warning'
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Statutory Components
          </Button>
        </Box>

      </Box>

      <Box marginTop={'6vh'} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="fullWidth"
          >
            <Tab label="EPF" {...a11yProps(0)} />
            <Tab label="ESI" {...a11yProps(1)} />
            <Tab label="Professional Tax" {...a11yProps(2)} />
            <Tab label="Statutory Bonus " {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Box mt={2}>
            <Typography marginLeft={'5vw'} variant="h5">Employees' Provident Fund </Typography>
            <Box display='flex' justifyContent='space-between' alignItems='center' mt={10}>
              <Box display='flex' flexDirection={"column"} alignItems='left' mb={2}>
                <Typography marginBottom={3}>EPF Number</Typography>
                <Typography marginBottom={3}>Deduction Cycle</Typography>
                <Typography marginBottom={3}>Employee Contribution Rate</Typography>
                <Typography marginBottom={3}>Employer Contribution Rate</Typography>
                <Typography marginBottom={3}>CTC Inclusions</Typography>
                <Typography>Consider applicable salary</Typography>
                <Typography>components based on LOP</Typography>
              </Box>
              <Box display='flex' flexDirection={"column"} alignItems='right' mb={2}>
                <Typography marginBottom={3}>{epfData.EPFNumber}</Typography>
                <Typography marginBottom={3}>{epfData.DeductionCycle}</Typography>
                <Typography marginBottom={3}>{epfData.EmployeeRate}</Typography>
                <Typography marginBottom={3}>{epfData.EmployerRate}</Typography>
                <Typography marginBottom={3}>yes</Typography>
                <Typography>yes</Typography>
              </Box>
              <Box mr={'3vw'} >
                <Typography marginBottom={3} textAlign={'center'}>Sample EPF Calculation</Typography>
                <Typography>Let's assume the PF wage is ₹ 20,000.</Typography>
                <Typography> The breakup of contribution will be:</Typography>
                <Typography variant="h6" mt={'5vh'}>Employee's Contribution</Typography>
                <Box mt={'2vh'} display='flex' justifyContent={'space-between'}>
                  <Typography>
                    EPF (12% of 20000)</Typography>
                  <Typography>2400</Typography>
                </Box>
                <Typography variant="h6" mt={'5vh'}>Employer's Contribution</Typography>
                <Box mt={'2vh'} display='flex' justifyContent={'space-between'}>
                  <Typography>
                    EPF (8.33%of 20000)</Typography>
                  <Typography>1250</Typography>
                </Box>
                <Box mt={'5vh'} display='flex' justifyContent={'space-between'}>
                  <Typography variant="h6">Total</Typography>
                  <Typography>3650</Typography>
                </Box>

              </Box>
            </Box>
            <Button
              sx={{ mt: '5vh' }}
              variant="contained"
              color="primary"
              onClick={() => handleEditClick(id)}
            >
              Edit
            </Button>

          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Box mt={2}>
            <Typography marginLeft={'5vw'} variant="h5">Employees' State Insurance </Typography>
            <Box display='flex' justifyContent='space-between' alignItems='center' mt={10}>
              <Box marginLeft={'5vw'} display='flex' flexDirection={"column"} alignItems='left' mb={2}>
                <Typography marginBottom={3}>ESI Number</Typography>
                <Typography marginBottom={3}>Deduction Cycle</Typography>
                <Typography marginBottom={3}>Employee Contribution Rate</Typography>
                <Typography>Employer Contribution Rate</Typography>
              </Box>
              <Box marginRight={'30vw'} display='flex' flexDirection={"column"} alignItems='right' mb={2}>
                <Typography marginBottom={3}>{esiData.ESINumber}</Typography>
                <Typography marginBottom={3}>{esiData.DeductionCycle}</Typography>
                <Typography marginBottom={3}>{esiData.EmployeeRate}</Typography>
                <Typography>{esiData.EmployerRate}</Typography>
              </Box>
            </Box>
            <Button
              sx={{ marginLeft: '5vw', mt: '5vh' }}
              variant="contained"
              color="primary"
              onClick={() => handleEditClick(id)}
            >
              Edit
            </Button>
          </Box>

        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography>Professional Tax</Typography>
          <Typography>This tax is levied on an employee’s income by the State Government. Tax slabs differ in each state.</Typography>
          <Box>
            <Typography></Typography>
          </Box>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Box mt={2}>
            <Typography marginLeft={'5vw'} variant="h5">Statutory Bonus</Typography>
            <Box display='flex' justifyContent='space-between' alignItems='center' mt={10}>
              <Box marginLeft={'5vw'} display='flex' flexDirection={"column"} alignItems='left' mb={2}>
                <Typography marginBottom={3}>Payment Frequency</Typography>
                <Typography marginBottom={3}>Bonus Percentage</Typography>
                <Typography>Payment Month</Typography>
              </Box>
              <Box marginRight={'30vw'} display='flex' flexDirection={"column"} alignItems='right' mb={2}>
                <Typography marginBottom={3}>{bonusData.paymentFrequency}</Typography>
                <Typography marginBottom={3}>{bonusData.bonusPercentage}</Typography>
                <Typography>{bonusData.paymentMonth}</Typography>
              </Box>
            </Box>
            <Button
              sx={{ marginLeft: '5vw', mt: '5vh' }}
              variant="contained"
              color="primary"
              onClick={() => handleEditClick(id)}
            >
              Edit
            </Button>

          </Box>

        </TabPanel>
      </Box>

    </>
  )
}

export default StatutoryComponents
