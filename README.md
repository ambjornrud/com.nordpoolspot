# Nordpool

Nordpool Elspot Prices for Athom Homey.

## Flow cards

### Device: Nordpool

#### Triggers

- Price changed
- Current price is at the lowest among the next [x] hours
- Current price is at the highest among the next [x] hours
- Current price is [x] percent below average of the next [y] hours
- Current price is [x] percent above average of the next [y] hours

#### Conditions
- Current price below/above

### Release Notes

#### 0.3.1 (beta)
- New price areas: AT, BE, DE-LU, FR, NL, PL
- Translations for app: no

#### 0.3.0
- Forked from balmli/com.nordpoolspot
- Fix parsing of prices with spaces
- Timeout (15 sek)
- Price as EUR/kWh, DKK/kWh, SEK/kWh, NOK/kWh

#### 0.2.0
- More priceAreas and support currency
- Switched to http.min: Asynchronous call with Promise, repo cleanup

#### 0.1.0
- Blank "starting hour" means 00:00 for "Low price [x] of the [y] hours starting at [z] hours today" - trigger

#### 0.0.1
- Initial version