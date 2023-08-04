import Router from 'next/router';

// NextJS Requirement
export const isWindowAvailable = () => typeof window !== 'undefined';

export const defaultRouteName = 'Gdańsk AI';

export const findCurrentRoute = (routes: any): any => {
  if (!isWindowAvailable()) return null;

  for (let route of routes) {
    if (!!route.items) {
      const found = findCurrentRoute(route.items);
      if (!!found) return found;
    }
    if (Router.pathname.match(route.path) && route) return route;
  }
};

export const getActiveRoute = (routes: any): any => {
  const route = findCurrentRoute(routes);
  return route?.name || defaultRouteName;
};

export const getActiveNavbar = (routes: any): boolean => {
  const route = findCurrentRoute(routes);
  return route?.secondary;
};

export const getActiveNavbarText = (routes: any): string | boolean => {
  return getActiveRoute(routes) || false;
};
