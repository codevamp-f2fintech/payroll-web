export const totalAndAverageSalaryResponse = async (month: number, year: number): Promise<any> => {
    const token = localStorage?.getItem("token") || '{}';

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/payroll/total-avg-salary?month=${month}&year=${year}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
