export const api = (endpoint: string = '') => `${process.env.API_URL}${endpoint ? `/${endpoint}` : ''}`;
