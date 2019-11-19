const BaseDocument = require('frappejs/model/document');
const frappe = require('frappejs');

module.exports = class SalesInvoice extends BaseDocument {
  async change({ changed }) {
    if (changed === 'items' || changed === 'exchangeRate') {
      const companyCurrency = frappe.AccountingSettings.currency;
      if (this.currency && this.currency !== companyCurrency) {
        for (let item of this.items) {
          if (item.rate && this.exchangeRate) {
            const itemRate = await this.getFrom('Item', item.item, 'rate');

            item.rate = itemRate / this.exchangeRate;
            if (item.quantity) {
              item.amount = item.rate * item.quantity;
            }
          }
        }
      }
    }

    if (changed === 'customer' || changed === 'supplier') {
      this.currency = await this.getFrom('Party', this[changed], 'currency');
      this.exchangeRate = await this.getExchangeRate();
    }
  }

  isForeignTransaction() {
    return this.currency
      ? this.currency !== frappe.AccountingSettings.currency
        ? 1
        : 0
      : 0;
  }

  async getExchangeRate() {
    const companyCurrency = frappe.AccountingSettings.currency;
    return this.currency === companyCurrency ? 1.0 : undefined;
  }

  async getBaseNetTotal() {
    if (this.isForeignTransaction()) {
      return this.getSum('items', 'amount') * (this.exchangeRate || 0);
    } else {
      return this.getSum('items', 'amount');
    }
  }

  async getRowTax(row) {
    if (row.tax) {
      let tax = await this.getTax(row.tax);
      let taxAmount = [];
      for (let d of tax.details || []) {
        taxAmount.push({
          account: d.account,
          rate: d.rate,
          amount: (row.amount * d.rate) / 100
        });
      }
      return JSON.stringify(taxAmount);
    } else {
      return '';
    }
  }

  async getTax(tax) {
    if (!this._taxes) this._taxes = {};
    if (!this._taxes[tax]) this._taxes[tax] = await frappe.getDoc('Tax', tax);
    return this._taxes[tax];
  }

  async makeTaxSummary() {
    if (!this.taxes) this.taxes = [];

    // reset tax amount
    this.taxes.map(d => {
      d.amount = 0;
      d.rate = 0;
    });

    // calculate taxes
    for (let row of this.items) {
      if (row.taxAmount) {
        let taxAmount = JSON.parse(row.taxAmount);
        for (let rowTaxDetail of taxAmount) {
          let found = false;

          // check if added in summary
          for (let taxDetail of this.taxes) {
            if (taxDetail.account === rowTaxDetail.account) {
              taxDetail.rate = rowTaxDetail.rate;
              taxDetail.amount = taxDetail.amount + rowTaxDetail.amount;
              found = true;
            }
          }

          // add new row
          if (!found) {
            this.taxes.push({
              account: rowTaxDetail.account,
              rate: rowTaxDetail.rate,
              amount: rowTaxDetail.amount
            });
          }
        }
      }
    }

    // clear no taxes
    this.taxes = this.taxes.filter(d => d.amount);
  }

  async getGrandTotal() {
    await this.makeTaxSummary();
    let grandTotal = this.netTotal;
    if (this.taxes) {
      for (let row of this.taxes) {
        grandTotal += row.amount;
      }
    }

    return grandTotal;
  }

  async getBaseGrandTotal() {
    await this.makeTaxSummary();
    let baseGrandTotal = this.baseNetTotal;
    if (this.taxes) {
      for (let row of this.taxes) {
        baseGrandTotal += row.amount * this.exchangeRate;
      }
    }

    return baseGrandTotal;
  }
};
