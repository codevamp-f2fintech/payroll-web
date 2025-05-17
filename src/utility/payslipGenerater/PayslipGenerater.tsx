'use client'

// src/contexts/PayslipContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
const html2pdf = typeof window !== 'undefined' ? require('html2pdf.js') : null


// Create context
const PayslipContext = createContext()

// Utility functions
const numberToWords = num => {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const toWords = num => {
    if (num === 0) return 'Zero'
    if (num < 20) return a[num]
    if (num < 100) return `${b[Math.floor(num / 10)]} ${a[num % 10]}`
    if (num < 1000) return `${a[Math.floor(num / 100)]} Hundred ${toWords(num % 100)}`
    return `${toWords(Math.floor(num / 1000))} Thousand ${toWords(num % 1000)}`
  }
  return toWords(num).trim()
}

// Provider component
export const PayslipProvider = ({ children }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.company_id) {
          setError('not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/organization-profile/company/${user.company_id}`);
        const result = await response.json();

        if (result.data) {
          setCompanyData(result.data);
        } else {
          setError(result.message || 'Failed to fetch loan details');
        }
      } catch (error) {
        setError('Error fetching the details');
        console.error('Error fetching user data:', error);
      }
    };

    fetchCompanyData();
  }, []);


  // Function to fetch employee attendance data
  const fetchEmployeeAttendance = async (employee) => {
    setLoading(true)
    try {
      const emsTrue = process.env.NEXT_PUBLIC_APP_EMS === "true"
      const baseUrl = emsTrue
        ? process.env.NEXT_PUBLIC_APP_EMS_URL
        : process.env.NEXT_PUBLIC_APP_URL

      const attendanceResponse = await fetch(
        `${baseUrl}/attendance/fetch-by-email?email=${employee.employee.email}&month=${month}&year=${year}`
      )

      if (!attendanceResponse.ok) {
        throw new Error('Failed to fetch attendance data')
      }

      const { lopDays, paidDays } = await attendanceResponse.json()

      setSelectedEmployee({
        ...employee,
        lopDays,
        paidDays
      })

      return {
        ...employee,
        lopDays,
        paidDays
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Generate payslip for employee
  const generatePayslip = async (employee) => {
    try {
      const employeeWithAttendance = await fetchEmployeeAttendance(employee)
      return employeeWithAttendance
    } catch (error) {
      console.error('Error generating payslip:', error)
      throw error
    }
  }

  // Download payslip as PDF
  const downloadPayslip = (contentRef, employee) => {
    if (!contentRef.current || !employee) {
      console.error('No content reference or employee data provided')
      return
    }

    const options = {
      margin: 1,
      filename: `${employee?.employee?.first_name}_${employee?.employee?.last_name}_Payslip.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: true,
        useCORS: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().from(contentRef.current).set(options).save()
  }

  // Payslip component that can be reused
  const PayslipLayout = React.forwardRef((props, ref) => {
    const { employee } = props

    if (!employee) return null

    const earnings = employee?.earnings
    const deductions = employee?.deductions
    const netPayable = employee?.netSalary
    const grossEarning = employee?.grossEarnings
    const totalDeductions = employee?.totalDeductions

    const amountInWords = `Indian Rupee ${numberToWords(Math.floor(netPayable))} Only`
    return (
      <div ref={ref}>
        <div style={{ padding: '24px', margin: '16px', boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)' }}>
          {/* Invoice Header */}
          <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Company Logo and Address */}
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <img
                  src={"/images/logos/fintech.png"}
                  alt='Company logo'
                  style={{ width: '100px', marginRight: '1rem' }}
                />
                <div>
                  <h6 style={{ fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>
                    {companyData?.name}
                  </h6>
                  <p style={{ fontWeight: 'medium', lineHeight: '1.5', margin: '8px 0 0 0' }}>
                    {companyData?.address?.[0]}
                  </p>
                </div>
              </div>

              {/* Payslip for the Month */}
              <div style={{
                textAlign: 'right',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                flex: 1
              }}>
                <h5 style={{ margin: 0 }}>Payslip For the Month</h5>
                <h6 style={{ fontWeight: 'bold', color: 'black', margin: '8px 0 0 0' }}>
                  {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
                    new Date(year, month - 1)
                  )}
                </h6>
              </div>
            </div>
          </div>

          {/* Employee Summary */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <div style={{ flex: 1 }}>
              <h6 style={{ marginBottom: '16px' }}>Employee Summary</h6>

              {/* Employee Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Employee Name:</span>
                <span style={{ color: 'black' }}>
                  {employee?.employee?.first_name} {employee?.employee?.last_name}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Employee ID:</span>
                <span style={{ color: 'black' }}>{employee?.employee?.code}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Pay Date:</span>
                <span style={{ color: 'black' }}>
                  {(() => {
                    const date = new Date(year, month, 0)
                    return `${date.getDate()}/${month}/${year}`
                  })()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pay Period:</span>
                <span style={{ color: 'black' }}>
                  {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
                    new Date(year, month - 1)
                  )}
                </span>
              </div>
            </div>

            <div style={{ flex: 1, margin: '0 auto' }}>
              <div style={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                overflow: 'hidden'
              }}>
                {/* Employee Net Pay Section */}
                <div style={{
                  backgroundColor: '#d3f8e2',
                  padding: '16px 12px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {/* Green Vertical Line */}
                  <div style={{
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'green',
                    marginRight: '8px'
                  }}></div>
                  <div>
                    <h5 style={{
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '1.4rem',
                      margin: 0
                    }}>
                      ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h5>
                    <p style={{
                      color: '#6a6a6a',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      margin: '4px 0 0 0'
                    }}>
                      Employee Net Pay
                    </p>
                  </div>
                </div>

                {/* Dotted Line Separator */}
                <hr style={{ border: '1px dotted #ccc', margin: 0 }} />

                {/* Paid Days and LOP Days Section */}
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <p style={{ fontWeight: 'lighter', color: '#6a6a6a', margin: 0 }}>Paid Days:</p>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold', color: '#000', margin: 0 }}>{employee?.paidDays}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', marginTop: '8px' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <p style={{ fontWeight: 'lighter', color: '#6a6a6a', margin: 0 }}>LOP Days:</p>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold', color: '#000', margin: 0 }}>{employee?.lopDays}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings and Deductions Tables */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '24px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px'
          }}>
            {/* Earnings Section */}
            <div style={{ flex: 1, paddingBottom: '20px' }}>
              <h6 style={{
                borderBottom: '2px dotted #000',
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'center',
                paddingBottom: '8px',
                marginBottom: '16px'
              }}>
                Earnings
              </h6>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Type</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>{earning.type}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: 'black', fontWeight: 'bold' }}>
                        ₹{Number(earning.monthlyAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Deductions Section */}
            <div style={{ flex: 1, paddingBottom: '20px' }}>
              <h6 style={{
                borderBottom: '2px dotted #000',
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'center',
                paddingBottom: '8px',
                marginBottom: '16px'
              }}>
                Deductions
              </h6>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Type</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((deduction, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>{deduction.type}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: 'black', fontWeight: 'bold' }}>
                        ₹{deduction.monthlyAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gross Earnings and Total Deductions */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '8px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: 'bold' }}>Gross Earnings:</span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>₹{Number(grossEarning).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '8px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: 'bold' }}>Total Deductions:</span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>₹{totalDeductions}</span>
              </div>
            </div>
          </div>

          {/* Total Net Pay */}
          <div style={{ marginTop: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundColor: '#f0f8f4'
            }}>
              <h6 style={{ fontWeight: 'bold', margin: 0 }}>TOTAL NET PAYABLE</h6>
              <h6 style={{
                fontWeight: 'bold',
                color: '#000',
                backgroundColor: '#d3f8e2',
                padding: '5px 10px',
                borderRadius: '5px',
                margin: 0
              }}>
                ₹{Number(netPayable).toFixed(2)}
              </h6>
            </div>
          </div>

          {/* Amount in words */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px' }}>
            <span style={{ color: '#6a6a6a', marginRight: '4px' }}>Amount In Words:</span>
            <span style={{ fontWeight: 'bold', color: '#000' }}>{amountInWords}</span>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: 'center',
            color: '#6a6a6a',
            marginTop: '32px',
            fontSize: '14px'
          }}>
            -- This document is system-generated and does not require a physical signature. It is valid for all official purposes.
          </p>
        </div>
      </div>
    )
  })

  // Set month and year
  const setPayPeriod = (selectedMonth, selectedYear) => {
    setMonth(selectedMonth)
    setYear(selectedYear)
  }

  // Value object to be provided to consumers
  const value = {
    selectedEmployee,
    setSelectedEmployee,
    loading,
    month,
    year,
    setPayPeriod,
    generatePayslip,
    downloadPayslip,
    PayslipLayout,
    fetchEmployeeAttendance
  }

  return <PayslipContext.Provider value={value}>{children}</PayslipContext.Provider>
}

// Custom hook for using payslip context
export const usePayslip = () => {
  if (typeof window === 'undefined') {
    // Return a mock implementation for server-side rendering
    return {
      selectedEmployee: null,
      setSelectedEmployee: () => { },
      loading: false,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      setPayPeriod: () => { },
      generatePayslip: async () => { },
      downloadPayslip: () => { },
      PayslipLayout: () => null,
      fetchEmployeeAttendance: async () => { }
    }
  }
  const context = useContext(PayslipContext)
  if (context === undefined) {
    throw new Error('usePayslip must be used within a PayslipProvider')
  }
  return context
}

// Component to download payslip
export const PayslipDownloader = ({ employee }) => {
  const { generatePayslip, downloadPayslip, PayslipLayout } = usePayslip()
  const contentRef = React.useRef(null)
  const [payslipData, setPayslipData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGeneratePayslip = async () => {
    setLoading(true)
    try {
      const data = await generatePayslip(employee)
      setPayslipData(data)
    } catch (error) {
      console.error('Error generating payslip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (payslipData) {
      downloadPayslip(contentRef, payslipData)
    } else {
      console.error('No payslip data available')
    }
  }

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <button onClick={handleGeneratePayslip} disabled={loading}>
            Generate Payslip
          </button>
          <button onClick={handleDownload} disabled={!payslipData || loading}>
            Download Payslip
          </button>
          <div style={{ display: payslipData ? 'block' : 'none' }}>
            <div ref={contentRef}>
              <PayslipLayout employee={payslipData} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
