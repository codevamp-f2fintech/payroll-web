import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { Box, Typography, Paper, Divider, CircularProgress, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { fetchConfiguration } from "@/redux/features/configuration/configurationSlice";
import { RootState } from "@/redux/store";

const SummaryItem = styled(Box)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

const SummaryLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  width: 180,
}));

const SummaryValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  flex: 1,
}));

const DeclarationPeriod = () => {
  const dispatch = useDispatch();
  const { configration, loading, error } = useSelector(
    (state: RootState) => state.configration
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });


  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchConfiguration());
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

  // Safely check if data is present
  const config = configration?.data?.[0];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading configuration: {error}
      </Alert>
    );
  }

  if (!config) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No configuration data available.
      </Alert>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        p: 3,
        mb: 2,
        mx: 2,
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 2, fontWeight: 600, color: "#0056b3" }}
      >
        Configuration Summary
      </Typography>

      <SummaryItem>
        <SummaryLabel variant="body1">Status:</SummaryLabel>
        <SummaryValue
          variant="body1"
          sx={{ color: config?.declarationEnabled ? "green" : "red" }}
        >
          {config?.declarationEnabled ? "Enabled" : "Disabled"}
        </SummaryValue>
      </SummaryItem>
      <Divider />

      <SummaryItem>
        <SummaryLabel variant="body1">Declaration Period:</SummaryLabel>
        <SummaryValue variant="body1">
          {formatDate(config?.startDate)} to {formatDate(config?.endDate)}
        </SummaryValue>
      </SummaryItem>
      <Divider />

      <SummaryItem>
        <SummaryLabel variant="body1">Period Duration:</SummaryLabel>
        <SummaryValue variant="body1">
          {Math.ceil(
            (new Date(config?.endDate).getTime() -
              new Date(config?.startDate).getTime()) /
            86400000
          )}{" "}
          days
        </SummaryValue>
      </SummaryItem>

      {config?.enableProof && (
        <>
          <Divider />
          <SummaryItem>
            <SummaryLabel variant="body1">Proof Submit Period:</SummaryLabel>
            <SummaryValue variant="body1">
              {formatDate(config?.proofStartDate)} to{" "}
              {formatDate(config?.proofEndDate)}
            </SummaryValue>
          </SummaryItem>
          <Divider />

          <SummaryItem>
            <SummaryLabel variant="body1">Proof Duration:</SummaryLabel>
            <SummaryValue variant="body1">
              {Math.ceil(
                (new Date(config?.proofEndDate).getTime() -
                  new Date(config?.proofStartDate).getTime()) /
                86400000
              )}{" "}
              days
            </SummaryValue>
          </SummaryItem>
        </>
      )}
    </Paper>
  );
};

export default DeclarationPeriod;
