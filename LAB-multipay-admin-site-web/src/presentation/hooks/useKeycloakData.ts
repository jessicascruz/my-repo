export const useKeycloakData = () => {
  return {
    userId: 'guest-id',
    username: 'Guest',
    userAvatar: '',
    status: 'authenticated',
    userEmail: 'guest@example.com',
    session: {
        authTokens: {
            accessToken: '',
        }
    },
    roles: ['multipay:admin'], // Giving admin roles by default to bypass checks
    updateSession: async () => {},
  }
}
