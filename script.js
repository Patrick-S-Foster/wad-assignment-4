/**
 * The form used to capture user input is retrieved by the id 'input-form', which is associated with the <form> tag on
 * line 28 of the HTML file.
 * @type {HTMLElement}
 */
const inputForm = document.getElementById('input-form');

/**
 * The number input field used to capture the principal amount is retrieved by the id 'principal', which is associated
 * with the <input> tag on line 33 of the HTML file.
 * @type {HTMLElement}
 */
const principalInput = document.getElementById('principal');

/**
 * The number input field used to capture the annual interest rate is retrieved by the id 'interest', which is
 * associated with the <input> tag on line 38 of the HTML file.
 * @type {HTMLElement}
 */
const interestInput = document.getElementById('interest');

/**
 * The number input field used to capture the term in years is retrieved by the id 'term', which is associated with the
 * <input> tag on line 42 of the HTML file.
 * @type {HTMLElement}
 */
const termInput = document.getElementById('term');

/**
 * The table header cell used to display the title of the mortgage amortization table is retrieved by the id
 * 'amortization-table-title', which is associated with the <th> tag on line 54 of the HTML file.
 * @type {HTMLElement}
 */
const amortizationTableTitle = document.getElementById('amortization-table-title');

/**
 * The table body used to display rows of the mortgage amortization table is retrieved by the id
 * 'amortization-table-body', which is associated with the <tbody> tag on line 70 of the HTML file.
 * @type {HTMLElement}
 */
const amortizationTableBody = document.getElementById('amortization-table-body');

/**
 * An event listener, in the form of a lambda function, is added to the user input form, which is called when the
 * 'submit' event is triggered, in this case either by the user clicking the 'Calculate' button in the form or by
 * pressing the 'Enter' key while the form is in focus.
 */
inputForm.addEventListener('submit', (event) => {
    /**
     * To prevent the page from reloading, the event is prevented from taking its default action, in this case,
     * submitting the form and causing a page reload.
     */
    event.preventDefault();

    /**
     * The rest of the handling of the event needed to be done is performed in the 'parseFormAndUpdate()' function, so
     * that function can be called outside the context of the event listener if need be.
     */
    parseFormAndUpdate();
});

/**
 * The 'parseFormAndUpdate()' function is now called, so that when the page is loaded, the default values defined in the
 * HTML file are used, and the user never sees an empty mortgage amortization table.
 */
parseFormAndUpdate();

/**
 * The input fields of the user input form are parsed, and then the values are used to populate the mortgage
 * amortization table.
 */
function parseFormAndUpdate() {
    /**
     * The principal amount is parsed from the value of the principal input field, and is converted to a number. Note
     * that sanitization is performed by the input field.
     * @type {number}
     */
    let principal = parseFloat(principalInput.value);

    /**
     * The annual interest rate is parsed from the value of the interest input field, is converted to a number, divided
     * by 100 to convert it to a decimal percentage, and then divided by 12 to convert it to a monthly decimal
     * percentage. Note that sanitization is performed by the input field.
     * @type {number}
     */
    let interest = parseFloat(interestInput.value) / 100 / 12;

    /**
     * The term in years is parsed from the value of the term input field, is converted to a number, and multiplied by
     * 12 to convert it to the number of monthly payments. Note that sanitization is performed by the input field.
     * @type {number}
     */
    let term = parseFloat(termInput.value) * 12;

    /**
     * Updating the mortgage amortization table is performed in the 'updateTable()' function, to which the table body,
     * principal, term in months, and monthly decimal interest rate are passed as arguments.
     */
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
 * Note that if the decimal monthly interest rate is 0, this would result in attempting to divide by 0; in that case,
 * the monthly payment is defined as:
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
    /**
     * Due to the possibility of dividing by 0, the decimal monthly interest rate is checked to see if it is greater
     * than 0.
     */
    if (monthlyInterestRate > 0) {
        /**
         * In this case, the decimal monthly interest rate is greater than 0, so the first formula is used to calculate
         * the monthly payment.
         */
        return principal * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -termInMonths)));
    }
    /**
     * In this case, the decimal monthly interest rate less than or equal to 0, so the second formula is used to
     * calculate the monthly payment.
     */
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
 * Note that if the decimal monthly interest rate is 0, this would result in attempting to divide by 0; in that case,
 * the remaining balance to be paid is defined as:
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
    /**
     * Due to the possibility of dividing by 0, the decimal monthly interest rate is checked to see if it is greater
     * than 0.
     */
    if (monthlyInterestRate > 0) {
        /**
         * In this case, the decimal monthly interest rate is greater than 0, so the first formula is used to calculate
         * the remaining balance to be paid. Note that this line is broken onto multiple lines to keep the code
         * readable. In addition, note that due to floating point rounding errors, the function 'Math.abs()' is used to
         * ensure that the remaining balance to be paid is always a positive number.
         */
        return Math.abs(Math.pow(1 + monthlyInterestRate, monthsPaid) * principal -
            (Math.pow(1 + monthlyInterestRate, monthsPaid) - 1) / monthlyInterestRate * monthlyPayment);
    }
    /**
     * In this case, the decimal monthly interest rate is less than or equal to 0, so the second formula is used to
     * calculate the remaining balance to be paid. Note that due to floating point rounding errors, the function
     * 'Math.abs()' is used to ensure that the remaining balance to be paid is always a positive number.
     */
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
    /**
     * The amount of interest paid in the given month is calculated using the formula above. Note that the remaining
     * balance to be paid is calculated using the 'calculateRemainingBalance()' function, passing the previous month to
     * the month in question.
     */
    return monthlyInterestRate * calculateRemainingBalance(principal, monthlyInterestRate, monthlyPayment, month - 1);
}

/**
 * Updates the mortgage amortization table with the passed arguments.
 * @param tableBody the table body to update.
 * @param principal the principal amount.
 * @param termInMonths the term in months.
 * @param monthlyInterestRate the decimal monthly interest rate.
 */
function updateTable(tableBody, principal, termInMonths, monthlyInterestRate) {
    /**
     * This is not necessarily the first time that the method is called, so the table body is emptied before the new
     * table data is added. This is done by performing a 'while' loop, which will continue to loop until the table body
     * has no more children.
     */
    while (tableBody.hasChildNodes()) {
        /** When this point is reached, the table body has at least one child, so the first child is removed. */
        tableBody.removeChild(tableBody.firstChild);
    }

    /**
     * The monthly payment is calculated using the 'calculateMonthlyPayment()' function, passing the principal, term in
     * months, and monthly decimal interest rate as arguments.
     * @type {number}
     */
    const monthlyPayment = calculateMonthlyPayment(principal, termInMonths, monthlyInterestRate);
    /**
     * A 'NumberFormat' object is created to format the currency entries on the mortgage amortization table,
     * specifically, to guarantee that there will always be two decimal places.
     * @type {Intl.NumberFormat}
     */
    const formatter = Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    /**
     * This variable is used to keep track of the cumulative total of principal paid.
     * @type {number}
     */
    let totalPrincipalPaid = 0;
    /**
     * This variable is used to keep track of the cumulative total of interest paid.
     * @type {number}
     */
    let totalInterestPaid = 0;
    /**
     * All months of the mortgage must be iterated over, and this is done by performing a 'for' loop, which will go from
     * month 1, to the number of months in the mortgage, inclusive. At each month, certain calculations are performed,
     * and the table is updated with the results.
     */
    for (let month = 1; month <= termInMonths; month++) {
        /**
         * The starting balance of the month is calculated using the 'calculateRemainingBalance()' function, passing the
         * principal, the decimal monthly interest rate, the monthly payment, and the previous month to the month in
         * question as arguments.
         * @type {number}
         */
        const startingBalance = calculateRemainingBalance(principal, monthlyInterestRate, monthlyPayment, month - 1);
        /**
         * The interest paid in the month is calculated using the 'calculateInterestPaid()' function, passing the
         * principal, the decimal monthly interest rate, the monthly payment, and the month as arguments.
         * @type {number}
         */
        const interestPaid = calculateInterestPaid(principal, monthlyInterestRate, monthlyPayment, month);
        /**
         * The cumulative total of interest paid is updated by adding the interest paid in the month to itself.
         * @type {number}
         */
        totalInterestPaid += interestPaid;
        /**
         * The principal paid in the month is, by definition, the monthly payment minus the interest paid in the
         * month.
         * @type {number}
         */
        const principalPaid = monthlyPayment - interestPaid;
        /**
         * The cumulative total of principal paid is updated by adding the principal paid in the month to itself.
         * @type {number}
         */
        totalPrincipalPaid += principalPaid;
        /**
         * The ending balance of the month is calculated using the 'calculateRemainingBalance()' function, passing the
         * principal, the decimal monthly interest rate, the monthly payment, and the month as arguments.
         * @type {number}
         */
        const endingBalance = calculateRemainingBalance(principal, monthlyInterestRate, monthlyPayment, month);

        /**
         * A row, representing a single month of the mortgage, is created, by calling the 'createRow()' function,
         * passing the month, the starting balance, the principal paid, the total principal paid, the interest paid, the
         * total interest paid, the ending balance, and the formatter as arguments. Note that this line is broken onto
         * multiple lines to keep the code readable.
         * @type {HTMLTableRowElement}
         */
        const row = createRow(month, startingBalance, principalPaid, totalPrincipalPaid, interestPaid,
            totalInterestPaid, endingBalance, formatter);
        /** The row is appended to the mortgage amortization table body. */
        tableBody.appendChild(row);

        /**
         * Every 12 months, a year separator row is inserted into the mortgage amortization table. It is determined if a
         * year separator row is needed by checking if the month is a multiple of 12.
         */
        if (month % 12 === 0) {
            /**
             * In this case, a year separator row is created, by calling the 'createYearRow()' function, passing one of
             * two strings to be displayed in the year separator row, depending on whether the month is the final month,
             * determined by checking if the value of the next month exceeds the term in months. Note that this line is
             * broken onto multiple lines to keep the code readable.
             * @type {HTMLTableRowElement}
             */
            const yearRow = month + 1 > termInMonths ?
                createYearRow(`End of Year ${month / 12}`) :
                createYearRow(`End of Year ${month / 12} | Start of Year ${month / 12 + 1}`);
            /** The year separator row is appended to the mortgage amortization table body. */
            tableBody.appendChild(yearRow);
        }
    }

    /**
     * The principal amount is formatted to be used for the title of the mortgage amortization table.
     * @type {string}
     */
    const formattedPrincipal = formatter.format(principal);
    /**
     * The decimal monthly interest rate is first converted to a decimal annual interest rate by multiplying the decimal
     * monthly interest rate by 12, then converted to a percentage annual interest rate by multiplying the decimal
     * annual interest rate by 100, and finally formatted to be used for the title of the mortgage amortization table.
     * @type {string}
     */
    const formattedInterestRate = formatter.format(monthlyInterestRate * 12 * 100);
    /**
     * The term in months is first converted to a term in years by dividing the term in months by 12, then formatted, to
     * not have any decimal places, to be used for the title of the mortgage amortization table.
     */
    const formattedTerm = Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(termInMonths / 12);
    /**
     * The monthly payment is formatted to be used for the title of the mortgage amortization table.
     * @type {string}
     */
    const formattedMonthlyPayment = formatter.format(monthlyPayment);

    /**
     * The inner HTML of the table header cell is set using a string template literal, which is used to insert the
     * formatted principal, formatted interest rate, formatted term, and formatted monthly payment into the title. Note
     * that this line is broken onto multiple lines to keep the code readable.
     */
    amortizationTableTitle.innerHTML =
        `Mortgage Amortization Table for: €${formattedPrincipal} | ${formattedInterestRate}% Interest Rate | \
            ${formattedTerm} Years<br>Monthly Payment: €${formattedMonthlyPayment}`;
}

/**
 * Given the passed arguments, a row for a month in the mortgage amortization table is created. Note that this line is
 * broken onto multiple lines to keep the code readable.
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
    /**
     * The row is created by creating a new HTML <tr> element.
     * @type {HTMLTableRowElement}
     */
    const row = document.createElement('tr');
    /** A cell is created for the month without the formatter, then appended to the row. */
    row.appendChild(createCell(month));
    /** A cell is created for the starting balance with the formatter, then appended to the row. */
    row.appendChild(createCell(startingBalance, formatter));
    /** A cell is created for the principal paid with the formatter, then appended to the row. */
    row.appendChild(createCell(principalPaid, formatter));
    /** A cell is created for the total principal paid with the formatter, then appended to the row. */
    row.appendChild(createCell(totalPrincipalPaid, formatter));
    /** A cell is created for the interest paid with the formatter, then appended to the row. */
    row.appendChild(createCell(interestPaid, formatter));
    /** A cell is created for the total interest paid with the formatter, then appended to the row. */
    row.appendChild(createCell(totalInterestPaid, formatter));
    /** A cell is created for the ending balance with the formatter, then appended to the row. */
    row.appendChild(createCell(endingBalance, formatter));
    /** The row is returned. */
    return row;
}

/**
 * Given the passed arguments, a cell for a month in the mortgage amortization table is created.
 * @param text the text to be displayed in the cell.
 * @param formatter the formatter, if any, to be used to format the currency numbers.
 * @returns {HTMLTableCellElement} the cell for the month in the mortgage amortization table.
 */
function createCell(text, formatter = undefined) {
    /**
     * The cell is created by creating a new HTML <td> element.
     * @type {HTMLTableCellElement}
     */
    const cell = document.createElement('td');
    /**
     * The inner HTML of the cell is set using either a string template literal, used to insert formatted text, or the
     * text itself, depending on whether a formatter is passed to the function.
     */
    cell.innerHTML = formatter ? `€${formatter.format(text)}` : text;
    /** The cell is returned. */
    return cell;
}

/**
 * A row for a year separator in the mortgage amortization table is created, with the given text.
 * @param text the text to be displayed in the row.
 * @returns {HTMLTableRowElement} the row for the year separator in the mortgage amortization table.
 */
function createYearRow(text) {
    /**
     * The row is created by creating a new HTML <tr> element.
     * @type {HTMLTableRowElement}
     */
    const row = document.createElement('tr');
    /**
     * The cell is created by creating a new HTML <td> element.
     * @type {HTMLTableCellElement}
     */
    const cell = document.createElement('td');
    /** The inner HTML of the cell is set to the given text. */
    cell.innerHTML = text;
    /** The classes 'year-row' and 'header-accent' are added to the cell for styling purposes. */
    cell.classList.add('year-row', 'header-accent');
    /**
     * The attribute 'colspan' is set to the 7, which is the number of columns in the mortgage amortization table,
     * therefore spanning the entire width of the table.
     */
    cell.setAttribute('colspan', '7');
    /** The cell is appended to the row. */
    row.appendChild(cell);
    /** The row is returned. */
    return row;
}