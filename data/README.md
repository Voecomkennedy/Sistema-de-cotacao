# Airport timezones

`../js/airport-timezones.js` contains 7,917 IATA → IANA mappings extracted from
https://github.com/mwgg/Airports, master commit
`2473bd8f135c10c3c0edc8af58f9aad742541575`, retrieved 2026-09-24.
Source: https://raw.githubusercontent.com/mwgg/Airports/2473bd8f135c10c3c0edc8af58f9aad742541575/airports.json
License: MIT, see AIRPORTS-LICENSE.txt.

Only three-character IATA codes with a timezone and no conflicting timezone
mapping are included. No numeric UTC offsets are hardcoded. JavaScript Intl
uses the browser's timezone database for the requested travel date, including
DST. Browsers need updates when governments change timezone rules.

The mapping is bundled locally; no customer data is sent to an airport API.
Unknown airport codes, city-only text, unsupported zones and ambiguous or
nonexistent local timestamps do not yield an automatic duration. The operator
must choose a recognized IATA airport or explicitly enter a reviewed duration.
Metro codes such as BHZ are not assumed to be individual airports.
