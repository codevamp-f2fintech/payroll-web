"use client"
import OrganizationForm from '@/components/organization/Organizationform'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizations } from '@/redux/features/organization/organizationSlice';
import { debounce } from 'lodash';
import { RootState } from '@/redux/store';

const OrganizationProfile = () => {

  const dispatch = useDispatch();
  const { organizations } = useSelector((state: RootState) => state.organization);
  const [organizationData, setOrganizationData] = useState(null);
  console.log('orgizanation', organizations)


  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchOrganizations());
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  useEffect(() => {
    if (organizations && organizations.length > 0) {
      setOrganizationData(organizations[0]); // Assuming we want to show the first organization
    }
  }, [organizations]);


  return (
    <OrganizationForm
      initialData={organizationData}
      debouncedFetch={debouncedFetch}

    />
  )
}

export default OrganizationProfile
