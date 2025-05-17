function calculateTax(epf_amount, received_hra, total_salary, basic_salary, regime, deductions_object) {


  function calculateOldRegimeTax(taxableIncomeOldRegime) {
    console.log('taxableIncomeOldRegime>>', taxableIncomeOldRegime)
    let tax = 0;

    if (taxableIncomeOldRegime <= 250000) {
      tax = 0;
    } else if (taxableIncomeOldRegime <= 500000) {
      tax = (taxableIncomeOldRegime - 250000) * 0.05;
    } else if (taxableIncomeOldRegime <= 1000000) {
      tax = 12500 + (taxableIncomeOldRegime - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableIncomeOldRegime - 1000000) * 0.3;
    }

    // Apply Section 87A rebate if taxable income is ≤ ₹5,00,000
    if (taxableIncomeOldRegime <= 500000) {
      return 0;
    }

    // Add Health and Education Cess (4%)
    const cess = tax * 0.04;
    return Math.round(tax + cess);
  }

  function calculateNewRegimeTax(taxableIncomeNewRegime) {

    console.log('taxableIncomeNewRegime>>>>>', taxableIncomeNewRegime)
    let tax = 0;

    if (taxableIncomeNewRegime <= 300000) {
      tax = 0;
    } else if (taxableIncomeNewRegime <= 700000) {
      tax = (taxableIncomeNewRegime - 300000) * 0.05;
    } else if (taxableIncomeNewRegime <= 1000000) {
      tax = 20000 + (taxableIncomeNewRegime - 700000) * 0.1;
    } else if (taxableIncomeNewRegime <= 1200000) {
      tax = 50000 + (taxableIncomeNewRegime - 1000000) * 0.15;
    } else if (taxableIncomeNewRegime <= 1500000) {
      tax = 80000 + (taxableIncomeNewRegime - 1200000) * 0.2;
    } else if (taxableIncomeNewRegime <= 2000000) {
      tax = 200000 + (taxableIncomeNewRegime - 1500000) * 0.25;
    } else {
      tax = 300000 + (taxableIncomeNewRegime - 2400000) * 0.3;
    }

    // Apply Section 87A rebate if taxable income is ≤ ₹7,00,000
    if (taxableIncomeNewRegime <= 700000) {
      return 0;
    }

    console.log('tax', tax)
    // Add Health and Education Cess (4%)
    const cess = tax * 0.04;
    console.log('tax + cess', tax + cess)
    return Math.round(tax + cess);
  }

  // Calculate HRA exemption based on city and rent paid
  function calculateHRA(received_hra, basic_salary, rent_paid, city_type) {
    const metroPercentage = 0.5; // 50% for metro
    const nonMetroPercentage = 0.4; // 40% for non-metro
    const salaryPercentage = 0.1; // 10% of basic salary to subtract

    const rentPaidMinus10Percent = rent_paid - salaryPercentage * basic_salary;


    const hraExemption = Math.min(
      received_hra,
      rentPaidMinus10Percent > 0 ? rentPaidMinus10Percent : 0, // Ensure this value is not negative
      city_type === 'metro' ? metroPercentage * basic_salary : nonMetroPercentage * basic_salary
    );
    console.log('hra', hraExemption)

    return Math.max(0, hraExemption);
  }

  // Calculate deductions for Old Regime
  const standardDeduction = regime === 'new' ? 75000 : 50000;

  const epfDeduction = epf_amount || 0;
  const Section80CDeduction = deductions_object['80C'] || 0;

  const deduction80CAndEPF = Math.min(Section80CDeduction + epfDeduction)
  // 80C deduction
  const deduction80C = deduction80CAndEPF > 150000 ? 150000 : deduction80CAndEPF;

  // 80D deduction
  const deduction80D = deductions_object['80D'] > (deductions_object['isSeniorCitizen'] ? 75000 : 50000) ?
    (deductions_object['isSeniorCitizen'] ? 75000 : 50000) : deductions_object['80D'];

  // 80EEA deduction
  const deduction80EEA = deductions_object['80EEA'] > 200000 ? 200000 : deductions_object['80EEA'];

  // 80G deduction (No limit)
  const deduction80G = deductions_object['80G'] || 0;

  // 80TTA deduction
  const deduction80TTA = deductions_object['LTA'] > 10000 ? 10000 : deductions_object['LTA'];

  // Calculate total exemptions and deductions for Old Regime
  const totalDeductionsOldRegime = standardDeduction + deduction80C + deduction80D + deduction80EEA + deduction80TTA + deduction80G;


  // Calculate taxable income for Old Regime
  const taxableIncomeOldRegime = total_salary - totalDeductionsOldRegime;
  // Calculate tax for Old Regime
  let tax = 0;
  if (regime === 'old') {
    // HRA deduction (for Old Regime)
    const hraExemption = calculateHRA(received_hra, basic_salary, deductions_object['rentPaid'], deductions_object['cityType']);
    tax = calculateOldRegimeTax(taxableIncomeOldRegime - hraExemption);
  }

  // Calculate tax for New Regime
  if (regime === 'new') {
    // No HRA deduction and no other deductions, only standard deduction
    const taxableIncomeNewRegime = total_salary - standardDeduction;
    tax = calculateNewRegimeTax(taxableIncomeNewRegime);

  }
  console.log('standardDeduction', standardDeduction)
  console.log('section80C', deduction80C)
  console.log('deduction80D', deduction80D)
  console.log('deduction80EEA', deduction80EEA)
  console.log('deduction80TTA', deduction80TTA)
  console.log('deduction80G', deduction80G)
  console.log('taxableIncomeOldRegime', taxableIncomeOldRegime)
  console.log('taxregime', regime)
  console.log('totalDeductionsOldRegime', totalDeductionsOldRegime)
  console.log('total_salary', total_salary)


  return Math.round(tax);

}
export default calculateTax;
