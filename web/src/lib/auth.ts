import { UserProfile } from "@auth0/nextjs-auth0/client";

export const isUserAuthenticated = (user: UserProfile) => !!user;