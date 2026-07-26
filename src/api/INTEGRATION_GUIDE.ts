/**
 * API Integration Guide
 * Frontend-Backend Integration for VYON Fit Club
 */

/*
============================================================
ARCHITECTURE OVERVIEW
============================================================

The API layer is structured as follows:

1. api/config.ts
   - Centralized configuration and endpoints
   - Base URL (using Vite proxy)
   - API endpoint paths

2. api/errors.ts
   - Error parsing and handling
   - Human-readable error messages
   - Error logging

3. api/http-client.ts
   - Axios HTTP client with interceptors
   - Request authentication (Bearer token)
   - Response error handling
   - Auto-logout on 401

4. api/types.ts
   - TypeScript type definitions
   - Request/Response interfaces
   - Type safety across the app

5. services/auth.ts
   - Authentication operations
   - Token management
   - User info storage

6. services/dashboard.ts
   - Dashboard data fetching
   - Role-specific endpoints
   - Data transformation

============================================================
ENVIRONMENT CONFIGURATION
============================================================

Development (.env.development):
  VITE_API_BASE_URL=http://localhost:8000

Production (.env.production):
  VITE_API_BASE_URL=https://api.vyon.com

Note: During development, Vite proxy (vite.config.ts) 
      forwards /api requests to localhost:8000

============================================================
USAGE EXAMPLES
============================================================

1. LOGIN WITH API

import { AuthService, LoginRequest } from '@/api/api'
import { ApiErrorHandler } from '@/api/errors'

const handleLogin = async (identifier: string, password: string) => {
  try {
    const credentials: LoginRequest = { identifier, password }
    const response = await AuthService.login(credentials)
    
    // User data automatically stored in localStorage
    // Token, role, name, email, userId stored
    
    navigate(`/${response.user.role}`) // Redirect to dashboard
  } catch (error) {
    const apiError = ApiErrorHandler.parse(error)
    console.error(apiError.message)
  }
}

2. FETCH ADMIN DASHBOARD

import { DashboardService } from '@/api/api'
import { AdminDashboardResponse } from '@/api/types'

const loadAdminDashboard = async () => {
  try {
    const data: AdminDashboardResponse = 
      await DashboardService.getAdminDashboard()
    setDashboard(data)
  } catch (error) {
    const apiError = ApiErrorHandler.parse(error)
    setError(apiError.message)
  }
}

3. CHECK AUTHENTICATION STATUS

import { AuthService } from '@/api/api'

// Check if user is logged in
if (AuthService.isAuthenticated()) {
  // User is authenticated
}

// Check specific role
if (AuthService.hasRole('SUPER_ADMIN')) {
  // User is a super administrator
}

// Get user info
const user = AuthService.getUserInfo()
console.log(user.name, user.role)

4. LOGOUT

import { AuthService } from '@/api/api'

const handleLogout = () => {
  AuthService.logout()
  navigate('/login')
}

5. ADD CUSTOM HEADERS

import { httpClient } from '@/api/http-client'

// Token is added automatically by interceptor
// But you can add custom headers if needed:

await httpClient.get('/api/endpoint', {
  headers: {
    'X-Custom-Header': 'value'
  }
})

============================================================
AUTHENTICATION FLOW
============================================================

1. User enters credentials on Login page
2. Frontend calls POST /api/auth/login
3. Backend validates and returns token + user info
4. Frontend stores token in localStorage
5. httpClient interceptor adds Bearer token to requests
6. Dashboard fetches role-specific data
7. On 401 error, user is logged out and redirected to login

============================================================
ERROR HANDLING
============================================================

The ApiErrorHandler class parses all error responses:

- Network errors → "No response from server"
- 401 errors → "Unauthorized - Invalid credentials"
- 404 errors → "Not Found"
- 500 errors → "Internal Server Error"
- Custom backend errors → Backend error message

Usage:

try {
  await someApiCall()
} catch (error) {
  const apiError = ApiErrorHandler.parse(error)
  // apiError.status: number
  // apiError.message: string (human-readable)
  // apiError.detail: string (additional info)
}

============================================================
PRODUCTION DEPLOYMENT
============================================================

1. Update .env.production with production API URL
2. Build: npm run build
3. Deploy frontend to CDN/hosting
4. Ensure CORS is configured on backend
5. Use HTTPS in production
6. Set secure cookies if needed

============================================================
FUTURE ENHANCEMENTS (Phase 5+)
============================================================

- JWT refresh token implementation
- Password reset flow
- Two-factor authentication
- Role-based access control (RBAC)
- Request rate limiting
- API request caching
- Offline support with Service Workers
- API versioning support
- GraphQL integration option

============================================================
TROUBLESHOOTING
============================================================

Q: CORS errors?
A: Check vite.config.ts proxy configuration
   and backend CORS settings

Q: 401 errors after login?
A: Verify token is being stored in localStorage
   and interceptor is adding Authorization header

Q: Network errors?
A: Ensure backend is running on localhost:8000
   during development

Q: Type errors?
A: Verify all imports use exact paths from api/types.ts

*/

export {};
