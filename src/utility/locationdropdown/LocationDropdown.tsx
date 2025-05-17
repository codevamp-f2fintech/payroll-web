import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TextField, MenuItem, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

import { fetchCompanies } from '@/redux/features/company/companyslice'
import { RootState, AppDispatch } from '@/redux/store'

const LocationDropdown = ({ selectedLocation, setSelectedLocation }) => {
  const dispatch = useDispatch<AppDispatch>()

  // Access branches, loading, and error from Redux state
  const { companies, loading, error, total } = useSelector((state: RootState) => state.companies);

  useEffect(() => {
    // Dispatch fetchCompanies if not already fetched
    if (!companies) {
      dispatch(fetchCompanies())
    }
  }, [dispatch, companies])

  const branches = companies?.branch || []

  if (loading) {
    return (
      <TextField select label='By Branch' value='' fullWidth disabled>
        <MenuItem>Loading...</MenuItem>
      </TextField>
    )
  }

  if (error) {
    return (
      <TextField select label='By Branch' value='' fullWidth disabled>
        <MenuItem>{error}</MenuItem>
      </TextField>
    )
  }

  return (
    <TextField
      select
      label='Choose Branch'
      value={selectedLocation}
      onChange={e => setSelectedLocation(e.target.value)}
      fullWidth
      InputProps={{
        endAdornment: selectedLocation && (
          <InputAdornment position='end' sx={{ marginRight: '10%' }}>
            <IconButton onClick={() => setSelectedLocation('')} aria-label='clear selection' edge='end'>
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
    >
      {branches.length > 0 ? (
        branches.map((branch, index) => (
          <MenuItem key={index} value={branch}>
            {branch.charAt(0).toUpperCase() + branch.slice(1)}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No branches available</MenuItem>
      )}
    </TextField>
  )
}

export default LocationDropdown
