export const totalAndAverageSalaryResponse = async (): Promise<any> => {
  const token = localStorage?.getItem("token") || '{}';
  const { company_id } = typeof window !== "undefined" ? JSON.parse(localStorage?.getItem("user")) : {};

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/payroll/total-payroll`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token} ${company_id}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;  // { totalSalary: number, averageSalary: number }
  } catch (error) {
    console.error('Error fetching total and average salary:', error);
    throw error;
  }
};
