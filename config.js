/* Public site settings. Add only confirmed business details.
   The Maps browser key must be restricted by website referrer and API.
   Email-provider secrets belong in server environment variables, never here. */
window.BAKEHOUSE_CONFIG = Object.freeze({
  business: {
    name: 'Umhlanga Bakehouse',
    email: '',
    phone: '',
    streetAddress: '',
    addressConfirmed: false
  },
  maps: {
    apiKey: '',
    areaQuery: 'Umhlanga Rocks, Durban, KwaZulu-Natal, South Africa',
    zoom: 14
  }
});
