'use strict';

define(['darkwallet', 'util/fiat', 'bitcoinjs-lib'],
    function(DarkWallet, FiatCurrencies, Bitcoin) {

var BigInteger = Bitcoin.BigInteger;

function CurrencyFormatting() {
    
}

/**
 * Convert user amount (from input) to satoshis
 * TODO: we probably want a function that takes a string
 * and parses it carefully.
 */
CurrencyFormatting.asSatoshis = function(amount, unit) {
    var satoshis;
    if (!unit) unit = DarkWallet.getIdentity().settings.currency;
    if (unit === 'mBTC') {
        satoshis = Math.pow(10, 5);
    } else {
        satoshis = Math.pow(10, 8);
    }
    return parseInt(BigInteger.valueOf(amount * satoshis).toString());
}


/**
 * Convert satoshis to user bitcoin unit
 */
CurrencyFormatting.asBtc = function(satoshis, unit) {
    if (!unit) unit = DarkWallet.getIdentity().settings.currency;
    if (unit === 'mBTC') {
        return satoshis / Math.pow(10, 5);
    } else {
        return satoshis / Math.pow(10, 8);
    } 
}

/**
 * Convert satoshis to user fiat unit
 */
CurrencyFormatting.asFiat = function(satoshis, fiatCurrency) {
    if (!fiatCurrency) fiatCurrency = DarkWallet.getIdentity().settings.fiatCurrency;

    var tickerService = DarkWallet.service.ticker;
    var decimalDigits = FiatCurrencies[fiatCurrency].decimal_digits;

    var rate = tickerService.rates[fiatCurrency];
    if (rate) {
      var converted = (satoshis * rate / Math.pow(10, 8)).toFixed(decimalDigits);
      return converted;
    }
}

/**
 * Format satoshis into user unit
 */
CurrencyFormatting.formatBtc = function(satoshis, unit) {
    if (!unit) unit = DarkWallet.getIdentity().settings.currency;

    return this.asBtc(satoshis, unit) + " " + unit;
}

/**
 * Format satoshis to user fiat
 */
CurrencyFormatting.formatFiat = function(satoshis, fiatCurrency) {
    if (!fiatCurrency) fiatCurrency = DarkWallet.getIdentity().settings.fiatCurrency;

    var converted = this.asFiat(satoshis, fiatCurrency);
    if (!(converted === undefined)) {
        var currency = FiatCurrencies[fiatCurrency];
        return converted+" "+currency.symbol_native;
    }
}

/**
 * Format satoshis to full crypto and fiat string
 */
CurrencyFormatting.format = function(satoshis, unit, fiatCurrency) {
    var identity = DarkWallet.getIdentity();

    if (!fiatCurrency) fiatCurrency = identity.settings.fiatCurrency;
    if (!unit) unit = identity.settings.currency;

    var btcs = this.formatBtc(satoshis, unit);
    var fiats = this.formatFiat(satoshis, fiatCurrency);

    var formatted = btcs;
    if (fiats) {
        formatted += " ("+fiats+")";
    }
    return formatted;
}

return CurrencyFormatting;

});
