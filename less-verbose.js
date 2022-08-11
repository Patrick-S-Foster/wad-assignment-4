/** All the needed HTML elements are retrieved via their IDs. */
const inputForm = document.getElementById('input-form');
const principalInput = document.getElementById('principal');
const interestInput = document.getElementById('interest');
const termInput = document.getElementById('term');
const amortizationTableTitle = document.getElementById('amortization-table-title');
const amortizationTableBody = document.getElementById('amortization-table-body');

/**
 * An event listener, in the form of a lambda function, is added to the user input form, which is called when the
 * 'submit' event is triggered, in this case either by the user clicking the 'Calculate' button in the form or by
 * pressing the 'Enter' key while the form is in focus. It is prevented from submitting and reloading the page, then the
 * input form is handled.
 */
inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    parseFormAndUpdate();
});

parseFormAndUpdate();

/**
 * The input fields of the user input form are parsed, and then the values are used to populate the mortgage
 * amortization table.
 */
function parseFormAndUpdate() {
    let principal = parseFloat(principalInput.value);
    let interest = parseFloat(interestInput.value) / 100 / 12;
    let term = parseFloat(termInput.value) * 12;

    updateTable(amortizationTableBody, principal, term, interest);
}

/**
 * Given the various passed arguments, the monthly payment is calculated.
 *
 * The formula for the calculation of the monthly payment is as follows:
 *
 * <pre>
 * p - the principal amount
 * i - the decimal monthly interest rate
 * t - the term in months
 * c - the monthly payment
 *
 * c = p * (i / (1 - (1 + i)^(-t)))
 * </pre>
 *
 * Note that if the decimal monthly interest rate is 0, this would result in attempting to divide by 0, so in that
 * case, the monthly payment is defined as:
 *
 * <pre>
 * c = p / t
 * </pre>
 * @param principal the principal amount.
 * @param termInMonths the term in months.
 * @param monthlyInterestRate the decimal monthly interest rate.
 * @returns {number} the monthly payment.
 */
function calculateMonthlyPayment(principal, termInMonths, monthlyInterestRate) {
    if (monthlyInterestRate > 0) {
        return principal * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -termInMonths)));
    }
    return principal / termInMonths;
}

/**
 * Given the various passed arguments, the remaining balance to be paid is calculated.
 *
 * The formula for the calculation of the remaining balance to be paid is as follows:
 *
 * <pre>
 * p - the principal amount
 * i - the decimal monthly interest rate
 * c - the monthly payment
 * m - the number of months already paid
 * b - the remaining balance to be paid
 *
 * b = (1 + i)^m * p - ((1 + i)^m - 1) / i * c)
 * </pre>
 *
 * Note that if the decimal monthly interest rate is 0, this would result in attempting to divide by 0, so in that
 * case, the remaining balance to be paid is defined as:
 *
 * <pre>
 * b = p - c * m
 * </pre>
 * @param principal the principal amount.
 * @param monthlyInterestRate the decimal monthly interest rate.
 * @param monthlyPayment the monthly payment.
 * @param monthsPaid the number of months already paid.
 * @returns {number} the remaining balance to be paid.
 */
function calculateRemainingBalance(principal, monthlyInterestRate, monthlyPayment, monthsPaid) {
    if (monthlyInterestRate > 0) {
        return Math.abs(Math.pow(1 + monthlyInterestRate, monthsPaid) * principal -
            (Math.pow(1 + monthlyInterestRate, monthsPaid) - 1) / monthlyInterestRate * monthlyPayment);
    }
    return Math.abs(principal - monthlyPayment * monthsPaid);
}

/**
 * Given the various passed arguments, the amount of interest paid in the given month is calculated.
 *
 * The formula for the calculation of the amount of interest paid in the given month is as follows:
 *
 * <pre>
 * i - the decimal monthly interest rate
 * b - the remaining balance to be paid as of the previous month to the one in question
 * n - the amount of interest paid in the given month
 *
 * n = i * b
 * </pre>
 * @param principal the principal amount.
 * @param monthlyInterestRate the decimal monthly interest rate.
 * @param monthlyPayment the monthly payment.
 * @param month the month in question.
 * @returns {number} the amount of interest paid in the given month.
 */
function calculateInterestPaid(principal, monthlyInterestRate, monthlyPayment, month) {
    return monthlyInterestRate *
        calculateRemainingBalance(principal, monthlyInterestRate, monthlyPayment, month - 1);
}

/**
 * Updates the mortgage amortization table with the passed arguments, by clearing the table of any previous data,
 * creating and adding rows to the table for every month, adding year rows, and setting the table title with the
 * pertinent information.
 * @param tableBody the table body to update.
 * @param principal the principal amount.
 * @param termInMonths the term in months.
 * @param monthlyInterestRate the decimal monthly interest rate.
 */
function updateTable(tableBody, principal, termInMonths, monthlyInterestRate) {
    while (tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    const monthlyPayment = calculateMonthlyPayment(principal, termInMonths, monthlyInterestRate);
    const formatter = Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    for (let month = 1; month <= termInMonths; month++) {
        const startingBalance =
            calculateRemainingBalance(principal, monthlyInterestRate, monthlyPayment, month - 1);
        const interestPaid = calculateInterestPaid(principal, monthlyInterestRate, monthlyPayment, month);
        totalInterestPaid += interestPaid;
        const principalPaid = monthlyPayment - interestPaid;
        totalPrincipalPaid += principalPaid;
        const endingBalance = calculateRemainingBalance(principal, monthlyInterestRate, monthlyPayment, month);

        const row = createRow(month, startingBalance, principalPaid, totalPrincipalPaid, interestPaid,
            totalInterestPaid, endingBalance, formatter);
        tableBody.appendChild(row);

        if (month % 12 === 0) {
            const yearRow = month + 1 > termInMonths ?
                createYearRow(`End of Year ${month / 12}`) :
                createYearRow(`End of Year ${month / 12} | Start of Year ${month / 12 + 1}`);
            tableBody.appendChild(yearRow);
        }
    }

    const formattedPrincipal = formatter.format(principal);
    const formattedInterestRate = formatter.format(monthlyInterestRate * 12 * 100);
    const formattedTerm = Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(termInMonths / 12);
    const formattedMonthlyPayment = formatter.format(monthlyPayment);

    amortizationTableTitle.innerHTML =
        `Mortgage Amortization Table for: €${formattedPrincipal} | ${formattedInterestRate}% Interest Rate | \
            ${formattedTerm} Years<br>Monthly Payment: €${formattedMonthlyPayment}`;
}

/**
 * Given the passed arguments, a row for a month in the mortgage amortization table is created.
 * @param month the month in question.
 * @param startingBalance the starting balance of the month.
 * @param principalPaid the principal paid in the month.
 * @param totalPrincipalPaid the cumulative total of the principal paid up to and including the month.
 * @param interestPaid the interest paid in the month.
 * @param totalInterestPaid the cumulative total of the interest paid up to and including the month.
 * @param endingBalance the ending balance of the month.
 * @param formatter the formatter to be used to format the currency numbers.
 * @returns {HTMLTableRowElement} the row for the month in the mortgage amortization table.
 */
function createRow(month, startingBalance, principalPaid, totalPrincipalPaid, interestPaid, totalInterestPaid,
                   endingBalance, formatter) {
    const row = document.createElement('tr');
    row.appendChild(createCell(month));
    row.appendChild(createCell(startingBalance, formatter));
    row.appendChild(createCell(principalPaid, formatter));
    row.appendChild(createCell(totalPrincipalPaid, formatter));
    row.appendChild(createCell(interestPaid, formatter));
    row.appendChild(createCell(totalInterestPaid, formatter));
    row.appendChild(createCell(endingBalance, formatter));
    return row;
}

/**
 * Given the passed arguments, a cell for a month in the mortgage amortization table is created.
 * @param text the text to be displayed in the cell.
 * @param formatter the formatter, if any, to be used to format the currency numbers.
 * @returns {HTMLTableCellElement} the cell for the month in the mortgage amortization table.
 */
function createCell(text, formatter = undefined) {
    const cell = document.createElement('td');
    cell.innerHTML = formatter ? `€${formatter.format(text)}` : text;
    return cell;
}

/**
 * A row for a year separator in the mortgage amortization table is created, with the given text.
 * @param text the text to be displayed in the row.
 * @returns {HTMLTableRowElement}
 */
function createYearRow(text) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.innerHTML = text;
    cell.classList.add('year-row', 'header-accent');
    cell.setAttribute('colspan', '7');
    row.appendChild(cell);
    return row;
}