import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Home,
  DollarSign,
  Trash2,
  Plus,
  Printer,
  TrendingUp,
  MapPin,
  Copy
} from 'lucide-react';

const STORAGE_KEY = 'mf_roi_scenarios_v1';

const App = () => {
  // --- State Management ---
  const [copySuccess, setCopySuccess] = useState('');

  // Property Details
  const [address, setAddress] = useState('4-Unit Residential Property');
  const [mlsNumber, setMlsNumber] = useState('1234567');

  // Property Basics & Loan
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(125000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  // Initial Cash Outlay Additions
  const [closingCosts, setClosingCosts] = useState(15000);
  const [initialCapEx, setInitialCapEx] = useState(5000);

  // Operating Assumptions
  const [vacancyRate, setVacancyRate] = useState(5); // %
  const [maintenanceAnnual, setMaintenanceAnnual] = useState(2500);
  const [otherExpenses, setOtherExpenses] = useState(500);

  // Expense Variables
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.25); // % of Price
  const [insuranceAnnual, setInsuranceAnnual] = useState(1200);

  // Management Logic
  const [managementType, setManagementType] = useState('percent'); // 'percent' or 'flat'
  const [managementPercent, setManagementPercent] = useState(8);
  const [managementFlat, setManagementFlat] = useState(3000);

  // Units
  const [units, setUnits] = useState([
    { id: 1, beds: 2, baths: 1, rent: 1200 },
    { id: 2, beds: 2, baths: 1, rent: 1200 },
    { id: 3, beds: 1, baths: 1, rent: 950 },
    { id: 4, beds: 1, baths: 1, rent: 950 }
  ]);

  // Scenarios
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  // Load scenarios from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setScenarios(parsed);
      }
    } catch (e) {
      console.error('Error loading scenarios', e);
    }
  }, []);

  const persistScenarios = (next) => {
    setScenarios(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Error saving scenarios', e);
    }
  };

  const getCurrentScenarioData = () => ({
    address,
    mlsNumber,
    purchasePrice,
    downPayment,
    interestRate,
    loanTerm,
    closingCosts,
    initialCapEx,
    vacancyRate,
    maintenanceAnnual,
    otherExpenses,
    propertyTaxRate,
    insuranceAnnual,
    managementType,
    managementPercent,
    managementFlat,
    units
  });

  const applyScenarioData = (data) => {
    if (!data) return;

    setAddress(data.address ?? '');
    setMlsNumber(data.mlsNumber ?? '');
    setPurchasePrice(data.purchasePrice ?? 0);
    setDownPayment(data.downPayment ?? 0);
    setInterestRate(data.interestRate ?? 0);
    setLoanTerm(data.loanTerm ?? 30);
    setClosingCosts(data.closingCosts ?? 0);
    setInitialCapEx(data.initialCapEx ?? 0);
    setVacancyRate(data.vacancyRate ?? 0);
    setMaintenanceAnnual(data.maintenanceAnnual ?? 0);
    setOtherExpenses(data.otherExpenses ?? 0);
    setPropertyTaxRate(data.propertyTaxRate ?? 0);
    setInsuranceAnnual(data.insuranceAnnual ?? 0);
    setManagementType(data.managementType ?? 'percent');
    setManagementPercent(data.managementPercent ?? 0);
    setManagementFlat(data.managementFlat ?? 0);
    setUnits(
      Array.isArray(data.units) && data.units.length
        ? data.units.map((u) => ({ ...u }))
        : [
            { id: 1, beds: 2, baths: 1, rent: 1200 },
            { id: 2, beds: 2, baths: 1, rent: 1200 },
            { id: 3, beds: 1, baths: 1, rent: 950 },
            { id: 4, beds: 1, baths: 1, rent: 950 }
          ]
    );
  };

  const handleSaveAsNewScenario = () => {
    const defaultName = address
      ? `${address} – Scenario ${scenarios.length + 1}`
      : `Scenario ${scenarios.length + 1}`;

    const name = window.prompt('Scenario name', defaultName);
    if (!name) return;

    const id = Date.now();
    const newScenario = {
      id,
      name,
      createdAt: new Date().toISOString(),
      data: getCurrentScenarioData()
    };

    const next = [...scenarios, newScenario];
    persistScenarios(next);
    setSelectedScenarioId(id);
  };

  const handleSaveScenario = () => {
    // If no scenario selected yet, treat as “Save as New”
    if (!selectedScenarioId) {
      handleSaveAsNewScenario();
      return;
    }

    const next = scenarios.map((s) =>
      s.id === selectedScenarioId ? { ...s, data: getCurrentScenarioData() } : s
    );
    persistScenarios(next);
  };

  const handleSelectScenario = (e) => {
    const value = e.target.value;
    if (!value) {
      setSelectedScenarioId(null);
      return;
    }
    const id = Number(value);
    const scenario = scenarios.find((s) => s.id === id);
    if (scenario) {
      setSelectedScenarioId(id);
      applyScenarioData(scenario.data);
    }
  };

  const handleDeleteScenario = () => {
    if (!selectedScenarioId) return;
    const scenario = scenarios.find((s) => s.id === selectedScenarioId);
    const ok = window.confirm(
      `Delete scenario "${scenario?.name || ''}"? This cannot be undone.`
    );
    if (!ok) return;

    const next = scenarios.filter((s) => s.id !== selectedScenarioId);
    persistScenarios(next);
    setSelectedScenarioId(null);
  };

  // Formatting helpers
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);

  const formatPercent = (val) => `${(val || 0).toFixed(2)}%`;

  const formatNumber = (val) =>
    (val || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

  // --- Calculations ---

  // Income
  const totalMonthlyRent = units.reduce(
    (acc, unit) => acc + (parseFloat(unit.rent) || 0),
    0
  );
  const potentialGrossIncome = totalMonthlyRent * 12; // AGR / GPI
  const vacancyLoss = potentialGrossIncome * (vacancyRate / 100);
  const effectiveGrossIncome = potentialGrossIncome - vacancyLoss;

  // Expenses
  const propertyTaxAnnual = purchasePrice * (propertyTaxRate / 100);

  // Management based on Gross Rent (AGR)
  const managementAnnual =
    managementType === 'percent'
      ? potentialGrossIncome * (managementPercent / 100)
      : managementFlat;

  // Loan
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = (interestRate / 100) / 12;
  const numberOfPayments = loanTerm * 12;

  const calculateMonthlyMortgage = () => {
    if (loanAmount <= 0) return 0;
    if (interestRate === 0) return loanAmount / numberOfPayments;
    return (
      loanAmount *
      ((monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1))
    );
  };

  const monthlyMortgage = calculateMonthlyMortgage();
  const annualDebtService = monthlyMortgage * 12;

  // Operating expenses
  const totalOperatingExpenses =
    managementAnnual +
    maintenanceAnnual +
    propertyTaxAnnual +
    insuranceAnnual +
    parseFloat(otherExpenses || 0);

  // NOI & CF
  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;
  const annualCashFlow = netOperatingIncome - annualDebtService;

  // Cash investment
  const totalInitialInvestment = downPayment + closingCosts + initialCapEx;

  // KPIs
  const cashOnCashROI =
    totalInitialInvestment > 0
      ? (annualCashFlow / totalInitialInvestment) * 100
      : 0;

  const capRate =
    purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;

  const grossRentMultiplier =
    potentialGrossIncome > 0 ? purchasePrice / potentialGrossIncome : 0;

  const opexRatio =
    potentialGrossIncome > 0
      ? (totalOperatingExpenses / potentialGrossIncome) * 100
      : 0;

  const dscr =
    annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;

  const dscrText =
    dscr === 0
      ? 'N/A'
      : dscr < 1.2
      ? 'Yellow (Below Min)'
      : dscr < 1.35
      ? 'Yellow (Borderline)'
      : 'Green (Strong)';

  // --- Handlers ---

  const addUnit = () => {
    const newId =
      units.length > 0 ? Math.max(...units.map((u) => u.id)) + 1 : 1;
    setUnits([...units, { id: newId, beds: 2, baths: 1, rent: 1000 }]);
  };

  const removeUnit = (id) => {
    setUnits(units.filter((u) => u.id !== id));
  };

  const updateUnit = (id, field, value) => {
    setUnits(units.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const handlePrint = () => {
    window.print(); // User chooses "Save as PDF"
  };

  const generateReportText = () => {
    const unitMixDetails = units
      .map(
        (u, i) =>
          `  - Unit ${i + 1} (${u.beds}B/${u.baths}B): ${formatCurrency(
            u.rent
          )}/mo`
      )
      .join('\n');

    return `
# Investment Performance Report

## Property & Assumptions
- Address/Name: ${address || 'N/A'}
- MLS Number: ${mlsNumber || 'N/A'}
- Units: ${units.length}

### Acquisition Details
- Purchase Price: ${formatCurrency(purchasePrice)}
- Down Payment: ${formatCurrency(downPayment)}
- Closing Costs: ${formatCurrency(closingCosts)}
- Initial CapEx/Repairs: ${formatCurrency(initialCapEx)}
- TOTAL INITIAL CASH OUTLAY: ${formatCurrency(totalInitialInvestment)}

### Financing
- Loan Amount: ${formatCurrency(loanAmount)}
- Interest Rate: ${interestRate}%
- Loan Term: ${loanTerm} years
- Monthly P&I Payment: ${formatCurrency(monthlyMortgage)}

---

## Projected Annual Financials

### Income
- Gross Potential Income (GPI): ${formatCurrency(potentialGrossIncome)}
- Vacancy Loss (${vacancyRate}%): ${formatCurrency(vacancyLoss)}
- Effective Gross Income (EGI): ${formatCurrency(effectiveGrossIncome)}

### Expenses
- Property Taxes (${propertyTaxRate}%): ${formatCurrency(propertyTaxAnnual)}
- Insurance (Annual): ${formatCurrency(insuranceAnnual)}
- Management Fee (${
      managementType === 'percent'
        ? `${managementPercent}% of GPI`
        : 'Flat'
    }): ${formatCurrency(managementAnnual)}
- Maintenance (Annual): ${formatCurrency(maintenanceAnnual)}
- Other/HOA (Annual): ${formatCurrency(otherExpenses)}
- Total Operating Expenses (OpEx): ${formatCurrency(totalOperatingExpenses)}
- OpEx % of Gross Rent: ${formatPercent(opexRatio)}
- NET OPERATING INCOME (NOI): ${formatCurrency(netOperatingIncome)}

### Debt & Cash Flow
- Annual Debt Service: ${formatCurrency(annualDebtService)}
- PROJECTED ANNUAL CASH FLOW: ${formatCurrency(annualCashFlow)}

---

## Key Performance Indicators (KPIs)

- Cash-on-Cash Return (CoC): ${formatPercent(cashOnCashROI)}
- Capitalization Rate (Cap Rate): ${formatPercent(capRate)}
- Gross Rent Multiplier (GRM): ${formatNumber(grossRentMultiplier)}x
- DSCR: ${formatNumber(dscr)} (${dscrText})

---

## Unit Mix Breakdown (Monthly Rent)
${unitMixDetails}
`;
  };

  const handleExportToText = () => {
    const reportText = generateReportText();
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = reportText;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    try {
      document.execCommand('copy');
      setCopySuccess('Report copied! Paste into email/Word/Notes.');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopySuccess('Failed to copy. Please try again.');
    }
    document.body.removeChild(tempTextarea);
    setTimeout(() => setCopySuccess(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 print:p-4 print:bg-white">
      {/* Header / Action Bar */}
      <div className="max-w-6xl mx-auto mb-6 print:hidden">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Logo + analysis label */}
          <div className="flex items-center gap-4">
            <img
              src="/JS Realtor logo initials.png"
              alt="Jonathan Sarrow Logo"
              className="h-20 w-auto"
            />
            <div>
              <div className="text-[0.8rem] font-semibold tracking-[0.18em] uppercase text-slate-500">
                Multifamily Investment Analysis
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Prepared for:{' '}
                <span className="font-semibold">
                  {address || '4-Unit Residential Property'}
                </span>
              </div>
              {mlsNumber && (
                <div className="text-xs text-slate-400 mt-0.5">
                  MLS #{mlsNumber}
                </div>
              )}
            </div>
          </div>

          {/* Right: buttons & status */}
          <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
            {copySuccess && (
              <div className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs flex items-center gap-2">
                <Copy size={14} /> {copySuccess}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <button
                onClick={handleExportToText}
                className="w-full sm:w-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg shadow-md transition-colors text-xs font-medium"
              >
                <Copy size={16} />
                Copy Text Report
              </button>

              <button
                onClick={handlePrint}
                className="w-full sm:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors text-xs font-medium"
              >
                <Printer size={16} />
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>

        {/* Scenario bar */}
        {scenarios.length > 0 ? (
          <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.16em] text-slate-400 font-semibold">
                Saved Scenarios
              </span>
              <select
                value={selectedScenarioId || ''}
                onChange={handleSelectScenario}
                className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select scenario…</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSaveScenario}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Save
              </button>
              <button
                onClick={handleSaveAsNewScenario}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Save as New
              </button>
              <button
                onClick={handleDeleteScenario}
                disabled={!selectedScenarioId}
                className={`px-3 py-1.5 rounded-md border ${
                  selectedScenarioId
                    ? 'border-red-300 text-red-600 hover:bg-red-50'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSaveAsNewScenario}
              className="px-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
            >
              Save current inputs as scenario
            </button>
          </div>
        )}

        {/* Thin divider line under header, CBRE-style */}
        <div className="border-b border-slate-200 mt-4" />
      </div>

      {/* Printable Header (for PDF / printouts) */}
      <div className="hidden print:block max-w-6xl mx-auto mb-6 pb-3 border-b border-slate-300">
        <div className="flex justify-between items-center gap-4">
          {/* Left: logo + analysis label */}
          <div className="flex items-center gap-4">
            <img
              src="/JS Realtor logo initials.png"
              alt="Jonathan Sarrow Logo"
              className="h-28 w-auto"
            />
            <div>
              <div className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-slate-700">
                Multifamily Investment Analysis
              </div>
              <div className="text-[0.65rem] text-slate-500 mt-1">
                Prepared by Jonathan Sarrow, Realtor®
              </div>
            </div>
          </div>

          {/* Right: subject property & date */}
          <div className="text-right">
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              Subject Property
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {address || 'Investment Property Prospectus'}
            </div>
            {mlsNumber && (
              <div className="text-xs text-slate-500 mt-0.5">
                MLS #{mlsNumber}
              </div>
            )}
            <div className="text-[0.65rem] text-slate-500 mt-2">
              Date Generated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Property Details */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-slate-500" />
              Property Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Property Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Springfield"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  MLS Number
                </label>
                <input
                  type="text"
                  value={mlsNumber}
                  onChange={(e) => setMlsNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Purchase & Investment */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-blue-500" />
              Purchase & Investment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) =>
                    setPurchasePrice(parseFloat(e.target.value) || 0)
                  }
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Down Payment ($)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) =>
                      setDownPayment(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) =>
                      setInterestRate(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Loan Term (Years)
                  </label>
                  <input
                    type="number"
                    value={loanTerm}
                    onChange={(e) =>
                      setLoanTerm(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Cash Outlay */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Closing Costs ($)
                  </label>
                  <input
                    type="number"
                    value={closingCosts}
                    onChange={(e) =>
                      setClosingCosts(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Initial CapEx/Repairs
                  </label>
                  <input
                    type="number"
                    value={initialCapEx}
                    onChange={(e) =>
                      setInitialCapEx(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 space-y-2">
                <div className="flex justify-between border-b border-blue-200 pb-2">
                  <span>Loan Amount:</span>
                  <span className="font-bold">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between border-b border-blue-200 pb-2">
                  <span>Total Initial Cash Needed:</span>
                  <span className="font-bold">
                    {formatCurrency(totalInitialInvestment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly P&I:</span>
                  <span className="font-bold">
                    {formatCurrency(monthlyMortgage)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Operating Expenses */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-red-500" />
              Operating Expenses (Annual)
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Vacancy Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vacancyRate}
                    onChange={(e) =>
                      setVacancyRate(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Insurance ($/yr)
                  </label>
                  <input
                    type="number"
                    value={insuranceAnnual}
                    onChange={(e) =>
                      setInsuranceAnnual(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Property Tax */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Property Tax
                </label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={propertyTaxRate}
                      onChange={(e) =>
                        setPropertyTaxRate(parseFloat(e.target.value) || 0)
                      }
                      className="w-full p-2 pr-8 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 text-sm">
                      %
                    </span>
                  </div>
                  <div className="text-slate-800 font-semibold text-sm w-24 text-right">
                    {formatCurrency(propertyTaxAnnual)}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Calculated based on Purchase Price
                </p>
              </div>

              {/* Management */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-600">
                    Management Fees
                  </label>
                  <div className="flex bg-white rounded-md border border-slate-300 p-0.5">
                    <button
                      onClick={() => setManagementType('percent')}
                      className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${
                        managementType === 'percent'
                          ? 'bg-blue-100 text-blue-700 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      % Rent
                    </button>
                    <button
                      onClick={() => setManagementType('flat')}
                      className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${
                        managementType === 'flat'
                          ? 'bg-blue-100 text-blue-700 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      Flat $
                    </button>
                  </div>
                </div>

                {managementType === 'percent' ? (
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.5"
                        value={managementPercent}
                        onChange={(e) =>
                          setManagementPercent(
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-2 pr-8 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
                    <div className="text-slate-800 font-semibold text-sm w-24 text-right">
                      {formatCurrency(managementAnnual)}
                    </div>
                  </div>
                ) : (
                  <div className="relative flex-1 mt-2">
                    <span className="absolute left-2 top-2 text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={managementFlat}
                      onChange={(e) =>
                        setManagementFlat(parseFloat(e.target.value) || 0)
                      }
                      className="w-full p-2 pl-6 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-1">
                  {managementType === 'percent'
                    ? 'Based on Gross Potential Income (GPI)'
                    : 'Annual Flat Fee'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Maintenance ($/yr)
                  </label>
                  <input
                    type="number"
                    value={maintenanceAnnual}
                    onChange={(e) =>
                      setMaintenanceAnnual(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Other/HOA ($/yr)
                  </label>
                  <input
                    type="number"
                    value={otherExpenses}
                    onChange={(e) =>
                      setOtherExpenses(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                OpEx % of Gross Rent:{' '}
                <span className="font-semibold">
                  {formatPercent(opexRatio)}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: OUTPUT & UNIT MIX */}
        <div className="lg:col-span-7 space-y-6">
         {/* KPI Cards – fully aligned, CBRE / M&M style */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

  {/* Annual Cash Flow */}
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center grid grid-rows-[auto_1fr_auto] h-32 p-4">
    <div className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-slate-500 leading-tight">
      Annual<br />Cash Flow
    </div>
    <div className="flex items-center justify-center">
      <span
        className={`text-2xl font-extrabold ${
          annualCashFlow >= 0 ? 'text-green-700' : 'text-red-700'
        }`}
      >
        {formatCurrency(annualCashFlow)}
      </span>
    </div>
    <div className="text-[0.65rem] text-slate-400 uppercase tracking-wide">
      Per Year
    </div>
  </div>

  {/* Cash-on-Cash ROI */}
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center grid grid-rows-[auto_1fr_auto] h-32 p-4">
    <div className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-slate-500 leading-tight">
      Cash-On-Cash<br />ROI
    </div>
    <div className="flex items-center justify-center">
      <span className="text-2xl font-extrabold text-slate-800">
        {formatPercent(cashOnCashROI)}
      </span>
    </div>
    <div className="text-[0.65rem] text-slate-400 uppercase tracking-wide">
      On Initial Cash
    </div>
  </div>

  {/* Cap Rate */}
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center grid grid-rows-[auto_1fr_auto] h-32 p-4">
    <div className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-slate-500 leading-tight">
      Cap<br />Rate
    </div>
    <div className="flex items-center justify-center">
      <span className="text-2xl font-extrabold text-slate-800">
        {formatPercent(capRate)}
      </span>
    </div>
    <div className="text-[0.65rem] text-slate-400 uppercase tracking-wide">
      On Purchase Price
    </div>
  </div>

  {/* DSCR */}
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center grid grid-rows-[auto_1fr_auto] h-32 p-4">
    <div className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-slate-500 leading-tight">
      DSCR
    </div>
    <div className="flex items-center justify-center">
      <span className="text-2xl font-extrabold text-slate-800">
        {formatNumber(dscr)}
      </span>
    </div>
    <div className="text-[0.65rem] text-slate-400 uppercase tracking-wide">
      {dscrText}
    </div>
  </div>
 </div>

          {/* Pro Forma Annual Financials */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calculator size={18} />
                Pro Forma Annual Financials
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 py-2 border-b border-slate-100">
                <span className="text-slate-600">Gross Potential Income</span>
                <span className="text-right font-medium">
                  {formatCurrency(potentialGrossIncome)}
                </span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-slate-100">
                <span className="text-red-500 text-sm pl-4">
                  - Vacancy Loss ({vacancyRate}%)
                </span>
                <span className="text-right text-red-500 text-sm">
                  ({formatCurrency(vacancyLoss)})
                </span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-slate-200 bg-slate-50 font-semibold">
                <span className="text-slate-800">Effective Gross Income</span>
                <span className="text-right text-slate-800">
                  {formatCurrency(effectiveGrossIncome)}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Operating Expenses
                </div>

                <div className="grid grid-cols-2 py-1">
                  <span className="text-slate-600 text-sm pl-4">
                    Property Taxes ({propertyTaxRate}%)
                  </span>
                  <span className="text-right text-slate-600 text-sm">
                    {formatCurrency(propertyTaxAnnual)}
                  </span>
                </div>
                <div className="grid grid-cols-2 py-1">
                  <span className="text-slate-600 text-sm pl-4">Insurance</span>
                  <span className="text-right text-slate-600 text-sm">
                    {formatCurrency(insuranceAnnual)}
                  </span>
                </div>
                <div className="grid grid-cols-2 py-1">
                  <span className="text-slate-600 text-sm pl-4">
                    Management (
                    {managementType === 'percent'
                      ? `${managementPercent}% of GPI`
                      : 'Flat'}
                    )
                  </span>
                  <span className="text-right text-slate-600 text-sm">
                    {formatCurrency(managementAnnual)}
                  </span>
                </div>
                <div className="grid grid-cols-2 py-1">
                  <span className="text-slate-600 text-sm pl-4">
                    Maintenance
                  </span>
                  <span className="text-right text-slate-600 text-sm">
                    {formatCurrency(maintenanceAnnual)}
                  </span>
                </div>
                <div className="grid grid-cols-2 py-1 border-b border-slate-100">
                  <span className="text-slate-600 text-sm pl-4">
                    Other / Utilities / HOA
                  </span>
                  <span className="text-right text-slate-600 text-sm">
                    {formatCurrency(otherExpenses)}
                  </span>
                </div>

                <div className="grid grid-cols-2 py-2 text-red-600 font-medium bg-red-50 rounded mt-2">
                  <span className="pl-2">Total Operating Expenses</span>
                  <span className="text-right pr-2">
                    ({formatCurrency(totalOperatingExpenses)})
                  </span>
                </div>

                <div className="grid grid-cols-2 py-1 mt-2">
                  <span className="text-slate-600 text-sm pl-4">
                    OpEx % of Gross Rent
                  </span>
                  <span className="text-right text-slate-600 text-sm">
                    {formatPercent(opexRatio)}
                  </span>
                </div>

                <div className="grid grid-cols-2 py-3 font-bold text-lg border-t-2 border-slate-200 mt-4">
                  <span className="text-slate-800">Net Operating Income</span>
                  <span className="text-right text-slate-800">
                    {formatCurrency(netOperatingIncome)}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-dashed border-slate-300">
                <div className="grid grid-cols-2 py-2">
                  <span className="text-red-600">Annual Debt Service</span>
                  <span className="text-right text-red-600">
                    ({formatCurrency(annualDebtService)})
                  </span>
                </div>
                <div className="grid grid-cols-2 py-3 mt-2 bg-slate-800 text-white rounded-md px-4">
                  <span className="font-bold">Projected Annual Cash Flow</span>
                  <span className="text-right font-bold">
                    {formatCurrency(annualCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Mix */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Home size={18} />
                Unit Mix Breakdown
              </h3>
              <span className="text-sm text-slate-500 font-medium">
                {units.length} Units Total • Monthly Total:{' '}
                {formatCurrency(totalMonthlyRent)}
              </span>
            </div>

            <div className="p-0 md:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="p-3 rounded-l-lg">Unit #</th>
                      <th className="p-3">Bedrooms</th>
                      <th className="p-3">Bathrooms</th>
                      <th className="p-3">Monthly Rent</th>
                      <th className="p-3 rounded-r-lg print-hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {units.map((unit, index) => (
                      <tr key={unit.id}>
                        <td className="p-3 font-medium text-slate-700">
                          {index + 1}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            className="w-16 p-1 border rounded"
                            value={unit.beds}
                            onChange={(e) =>
                              updateUnit(
                                unit.id,
                                'beds',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            className="w-16 p-1 border rounded"
                            value={unit.baths}
                            onChange={(e) =>
                              updateUnit(
                                unit.id,
                                'baths',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </td>
                        <td className="p-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-slate-400 text-xs">
                              $
                            </span>
                            <input
                              type="number"
                              className="w-24 pl-5 p-1 border rounded"
                              value={unit.rent}
                              onChange={(e) =>
                                updateUnit(
                                  unit.id,
                                  'rent',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="p-3 print-hidden">
                          <button
                            onClick={() => removeUnit(unit.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove Unit"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 px-4 md:px-0 print-hidden">
                <button
                  onClick={addUnit}
                  className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Another Unit
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 text-center text-xs text-slate-400">
        <p>Generated via Multifamily ROI Analyzer. For estimation purposes only.</p>
      </div>
    </div>
  );
};

export default App;
