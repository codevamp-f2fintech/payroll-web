'use client'

import React, { useState, useRef } from "react";
import { Box, Typography, Paper, Button, Grid } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import html2pdf from "html2pdf.js"; // Import html2pdf.js to convert HTML to PDF

const companyName = "F2 FINTECH";
const companyAddress = "ARV PARK M1, NOIDA 63 NEAR ELECTRONICS CITY METRO NOIDA, 110025";

// Dummy employee data for generating the payslip
const dummyEmployees = [
  {
    id: 1,
    name: "Amir Alam",
    employeeId: "F2-369-168",
    payPeriod: "November 2024",
    payDate: "01/11/2024",
    paidDays: 30,
    lopDays: 0,
    earnings: [
      { name: "Basic", amount: 20000 },
      { name: "House Rent Allowance", amount: 0 },
    ],
    deductions: [
      { name: "Income Tax", amount: 0 },
      { name: "Provident Fund", amount: 0 },
      { name: "Extra Leave", amount: 750 },
    ],
    netPay: 19250,
  },
  {
    id: 2,
    name: "Talha Ansari",
    employeeId: "F2-369-201",
    payPeriod: "November 2024",
    payDate: "01/11/2024",
    paidDays: 30,
    lopDays: 0,
    earnings: [
      { name: "Basic", amount: 20000 },
      { name: "House Rent Allowance", amount: 0 },
    ],
    deductions: [
      { name: "Income Tax", amount: 0 },
      { name: "Provident Fund", amount: 0 },
      { name: "Extra Leave", amount: 750 },
    ],
    netPay: 29000,
  },
];

export const PayrollGenerator = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Track selected employee for invoice generation
  const contentRef = useRef(); // Create a reference for the invoice content

  const handleGeneratePrint = (employee) => {
    setSelectedEmployee(employee); // Set selected employee data for print
  };

  // Function to generate and download the PDF using html2pdf
  const handleDownloadPdf = () => {
    if (contentRef.current) {
      const options = {
        margin: 1,
        filename: `${selectedEmployee?.name}_Payslip.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      // Generate the PDF from the content inside contentRef
      html2pdf().from(contentRef.current).set(options).save();
    }
  };

  // Invoice Layout Component
  const InvoiceLayout = React.forwardRef((props, ref) => {
    const { employee } = props;

    return (
      <div ref={ref}>
        <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
          {/* Invoice Header */}
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/avatars/f2logo.jpg"
                alt="Company Logo"
                style={{ width: '100px', marginRight: '16px' }} // Ensure proper spacing from address
              />
              <Box>
                <Typography style={{ fontWeight: 'bold', fontSize: '1.5rem' }} variant="h6">{companyName}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{companyAddress}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="h5">Payslip For the Month</Typography>
              <Typography style={{ fontWeight: 'bold', color: 'black' }} variant="h6">{employee?.payPeriod}</Typography>
            </Grid>
          </Grid>

          {/* Employee Summary */}
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Employee Summary</Typography>

              {/* Employee Name */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Employee Name:</Typography>
                <Typography sx={{ color: 'black' }}>{employee?.name}</Typography>
              </Box>

              {/* Employee ID */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Employee ID:</Typography>
                <Typography sx={{ color: 'black' }}>{employee?.employeeId}</Typography>
              </Box>

              {/* Pay Date */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Pay Date:</Typography>
                <Typography sx={{ color: 'black' }}>{employee?.payDate}</Typography>
              </Box>
            </Grid>

            <Grid sx={{ margin: '0 auto' }} item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  width: "100%",
                  maxWidth: "400px",
                  margin: "0 auto",
                  overflow: "hidden", // Ensure the border-radius applies properly
                }}
              >
                {/* Employee Net Pay Section with Light Green Background and Left-Aligned Content */}
                <Box
                  sx={{
                    backgroundColor: "#d3f8e2", // Light green background
                    padding: "16px 12px", // Adjusted padding for proper height and alignment
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* Green Vertical Line */}
                  <Box
                    sx={{
                      width: "4px",
                      height: "100%",
                      backgroundColor: "green",
                      marginRight: 1,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#000",
                        fontWeight: "bold",
                        fontSize: "1.4rem", // Adjusted font size
                      }}
                    >
                      Rs. {employee?.netPay.toFixed(2)}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#6a6a6a",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Employee Net Pay
                    </Typography>
                  </Box>
                </Box>

                {/* Dotted Line Separator */}
                <hr style={{ border: "1px dotted #ccc", margin: 0 }} />

                {/* Paid Days and LOP Days Section with Aligned Labels */}
                <Box sx={{ padding: "12px" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6} sx={{ textAlign: "left" }}>
                      <Typography sx={{ fontWeight: "lighter", color: "#6a6a6a" }}>
                        Paid Days:
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontWeight: "bold", color: "#000" }}>
                        {employee?.paidDays}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sx={{ textAlign: "left" }}>
                      <Typography sx={{ fontWeight: "lighter", color: "#6a6a6a" }}>
                        LOP Days:
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontWeight: "bold", color: "#000" }}>
                        {employee?.lopDays}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

            </Grid>
          </Grid>

          {/* Earnings and Deductions Tables with Border and Dotted Line under Heading */}
          {/* Earnings and Deductions Tables with Border and Dotted Line under Heading */}
          <Grid container spacing={2} sx={{ marginTop: 3, border: "1px solid #ccc", borderRadius: "8px", padding: 2 }}>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ borderBottom: "2px dotted #000", fontWeight: 'bold', color: 'black', textAlign: 'center' }}>Earnings</Typography>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left" }}>Name</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {employee?.earnings.map((earning, index) => (
                    <tr key={index}>
                      <td style={{ padding: "8px" }}>{earning.name}</td>
                      <td style={{ padding: "8px", textAlign: "right", color: 'black', fontWeight: 'bold' }}>₹{earning.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ borderBottom: "2px dotted #000", fontWeight: 'bold', color: 'black', textAlign: 'center' }}>Deductions</Typography>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "left" }}>Name</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {employee?.deductions.map((deduction, index) => (
                    <tr key={index}>
                      <td style={{ padding: "8px" }}>{deduction.name}</td>
                      <td style={{ padding: "8px", textAlign: "right", color: 'black', fontWeight: 'bold' }}>₹{deduction.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Grid>

            {/* Total Earnings and Deductions Row */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f5f5f5", padding: "8px", fontWeight: "bold" }}>
              <Typography style={{ color: 'black', fontWeight: 'bold' }}>Gross Earnings: ₹{employee?.earnings.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</Typography>
              <Typography style={{ color: 'black', fontWeight: 'bold' }}>Total Deductions: ₹{employee?.deductions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</Typography>
            </Grid>
          </Grid>


          {/* Total Net Pay */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Paper
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#f0f8f4", // Light green background similar to the image
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                TOTAL NET PAYABLE
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#000",
                  backgroundColor: "#d3f8e2", // Light green background for the value
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                ₹{employee?.netPay.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px" }}>
            <Typography sx={{ color: "#6a6a6a", marginRight: "4px" }}>
              Amount In Words:
            </Typography>
            <Typography sx={{ fontWeight: "bold", color: "#000" }}>
              Indian Rupee Nineteen Thousand Two Hundred Fifty Only
            </Typography>
          </Box>



        </Paper>
      </div>
    );
  });

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 150 },
    { field: "employeeId", headerName: "Employee ID", width: 150 },
    { field: "payPeriod", headerName: "Pay Period", width: 150 },
    { field: "paidDays", headerName: "Paid Days", width: 150 },
    {
      field: "generate",
      headerName: "Generate PaySlip",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleGeneratePrint(params.row)} // Set employee data on click
        >
          Generate
        </Button>
      ),
    },
  ];

  return (
    <>
      <Box p={3}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
          <Button variant="contained" color="secondary" onClick={handleDownloadPdf} disabled={!selectedEmployee}>
            Download Payslip (PDF)
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          Employee Payroll Data
        </Typography>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid rows={dummyEmployees} columns={columns} pageSize={5} />
        </div>
      </Box>

      {/* Invoice Section */}
      {selectedEmployee && (
        <div>
          {/* Invoice Layout Displayed Dynamically */}
          <div ref={contentRef}>
            <InvoiceLayout employee={selectedEmployee} />
          </div>
        </div>
      )}
    </>
  );
};

export default PayrollGenerator;
