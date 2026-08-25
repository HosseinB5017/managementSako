# Error Handling System

## New Features Added

### 1. Dedicated Error Page Components

Four specialized error page components have been created:

- **Error403** (`/error/403`) - Forbidden/Access Denied
- **Error404** (`/error/404`) - Not Found
- **Error500** (`/error/500`) - Server Error
- **ErrorNetwork** (`/error/network`) - Network/Offline Issues

### 2. Error Handler Hook

A new `useErrorHandler` hook that automatically routes errors to appropriate pages:

```tsx
import { useErrorHandler } from '@/Hooks/useErrorHandler'

const { handleError } = useErrorHandler()

try {
  await apiCall()
} catch (error) {
  handleError(error) // Auto-redirects based on error type
}
```

### 3. Safe API Request Utility

A wrapper for safe API calls with explicit error handling:

```tsx
import { safeApiRequest } from '@/lib/api/error-handler'

const [data, error] = await safeApiRequest(() => getUserProfile())

if (error) {
  if (error.isNetworkError) {
    // Handle network error
  }
}
```

### 4. Enhanced API Client

The API client now properly distinguishes between:
- Network errors (no response)
- Client errors (4xx)
- Server errors (5xx)
- Authentication errors (401 - auto-redirects to login)

## Features

### Visual Design
- ✅ Soft UI (neumorphic) design matching app theme
- ✅ RTL support with Persian fonts
- ✅ Color-coded themes per error type
- ✅ Smooth animations (pop-in, fade-in)
- ✅ Responsive layout for all screen sizes

### Functionality
- ✅ Online/offline detection for network errors
- ✅ Customizable error messages
- ✅ Retry functionality
- ✅ Navigation buttons (Home, Back, Refresh)
- ✅ Support contact links
- ✅ Real-time connection monitoring

### User Experience
- ✅ Clear, Persian error messages
- ✅ Helpful troubleshooting tips
- ✅ Visual status indicators
- ✅ Quick action buttons
- ✅ Consistent design language

## File Structure

```
components/error-pages/
├── error-403.tsx      # Forbidden error
├── error-404.tsx      # Not found error
├── error-500.tsx      # Server error
├── error-network.tsx  # Network/offline error
└── index.ts          # Exports

pages/
├── 404.tsx           # Next.js 404 handler
├── 500.tsx           # Next.js 500 handler
├── _error.tsx        # Next.js error handler
└── error/
    ├── 403.tsx       # Dedicated 403 page
    ├── 404.tsx       # Dedicated 404 page
    ├── 500.tsx       # Dedicated 500 page
    └── network.tsx   # Network error page

Hooks/
└── useErrorHandler.ts # Error handling hook

lib/api/
└── error-handler.ts  # Safe API utilities
```

## Testing

Two test pages are available:

1. **Error Test Page** (`/dev/error-test`)
   - Browse all error pages
   - View quick examples
   - See implementation code

2. **Error Example Page** (`/dev/error-example`)
   - Interactive demonstrations
   - Live error simulations
   - Code examples

## Usage Examples

### Example 1: Simple Error Handling
```tsx
import { useErrorHandler } from '@/Hooks/useErrorHandler'
import { getOrders } from '@/lib/api'

const MyComponent = () => {
  const { handleError } = useErrorHandler()
  
  const fetchData = async () => {
    try {
      const response = await getOrders()
      // Handle success
    } catch (error) {
      handleError(error) // Auto-redirects
    }
  }
}
```

### Example 2: Inline Error Display
```tsx
import { Error404 } from '@/components/error-pages'

const MyPage = () => {
  if (notFound) {
    return <Error404 message="سفارش یافت نشد" />
  }
  
  return <div>Content</div>
}
```

### Example 3: Network Error with Retry
```tsx
import { ErrorNetwork } from '@/components/error-pages'

const MyComponent = () => {
  if (networkError) {
    return (
      <ErrorNetwork 
        onRetry={() => refetchData()}
        message="اتصال قطع شد"
      />
    )
  }
}
```

### Example 4: Safe API Call
```tsx
import { safeApiRequest } from '@/lib/api/error-handler'

const [data, error] = await safeApiRequest(() => 
  getUserProfile()
)

if (error) {
  console.log('Error:', error.message)
  console.log('Status:', error.status)
  console.log('Is network error?', error.isNetworkError)
}
```

## API Client Behavior

The enhanced API client (`lib/api/client.ts`):

1. **401 Unauthorized**: Auto-clears auth and redirects to login
2. **403 Forbidden**: Let component handle (permission error)
3. **404 Not Found**: Let component handle (resource error)
4. **5xx Server Errors**: Let component handle (server error)
5. **Network Errors**: Let component handle (connectivity error)

This allows flexible error handling at the component level while maintaining automatic authentication handling.

## Documentation

Full documentation is available in `ERROR_HANDLING.md` including:
- Component props
- API reference
- Best practices
- Advanced examples
- Integration guide

## Benefits

1. **Consistent UX**: All errors have the same visual language
2. **Better DX**: Easy-to-use hooks and utilities
3. **Informative**: Clear messages in Persian
4. **Resilient**: Network detection and retry logic
5. **Maintainable**: Centralized error handling logic
6. **Type-safe**: Full TypeScript support

## Next Steps

Consider adding:
- [ ] Error logging service integration
- [ ] Analytics tracking for errors
- [ ] Custom error pages per feature
- [ ] Offline mode with cached data
- [ ] Error boundary components for React errors
