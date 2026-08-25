# Error Handling Documentation

## Overview
This app now includes comprehensive error handling with dedicated error pages for different scenarios.

## Available Error Pages

### 1. 403 - Forbidden
**Path**: `/error/403`
**Component**: `<Error403 />`
**When to use**: User doesn't have permission to access a resource

### 2. 404 - Not Found
**Path**: `/error/404` or any non-existent route
**Component**: `<Error404 />`
**When to use**: Resource or page doesn't exist

### 3. 500 - Server Error
**Path**: `/error/500`
**Component**: `<Error500 />`
**When to use**: Server-side errors (500, 502, 503, 504)

### 4. Network Error
**Path**: `/error/network`
**Component**: `<ErrorNetwork />`
**When to use**: No internet connection or network timeout

## Using Error Components

### In Pages

```tsx
import { Error404, Error403, Error500, ErrorNetwork } from '@/components/error-pages'

// Use directly
<Error404 message="Custom message" showBackButton={false} />
<Error403 message="Custom message" />
<Error500 message="Custom message" showRefreshButton={true} />
<ErrorNetwork onRetry={() => refetchData()} />
```

### Automatic Error Handling with useErrorHandler

```tsx
import { useErrorHandler } from '@/Hooks/useErrorHandler'
import { getUserProfile } from '@/lib/api'

const MyComponent = () => {
  const { handleError } = useErrorHandler()
  
  const fetchData = async () => {
    try {
      const response = await getUserProfile()
      // Handle success
    } catch (error) {
      handleError(error) // Automatically redirects to appropriate error page
    }
  }
}
```

### Safe API Requests (Recommended)

```tsx
import { safeApiRequest } from '@/lib/api/error-handler'
import { getUserProfile } from '@/lib/api'

const MyComponent = () => {
  const fetchData = async () => {
    const [data, error] = await safeApiRequest(() => getUserProfile())
    
    if (error) {
      if (error.isNetworkError) {
        // Handle network error
        router.push('/error/network')
      } else if (error.status === 403) {
        router.push('/error/403')
      }
      return
    }
    
    // Use data safely
    console.log(data)
  }
}
```

## Error Page Features

### Error403
- Lock icon with red theme
- "دسترسی غیرمجاز" message
- Back button (optional)
- Link to home
- Support contact link

### Error404
- Search icon with blue theme
- "صفحه یافت نشد" message
- Back button (optional)
- Link to home
- Help text

### Error500
- Warning icon with orange theme
- "خطای سرور" message
- Refresh button (optional)
- Link to home
- Support contact link

### ErrorNetwork
- Cloud offline icon with purple theme
- Online/offline status indicator
- Real-time connection monitoring
- Retry functionality
- Network troubleshooting tips
- Auto-detects online/offline state

## API Client Error Handling

The API client (`lib/api/client.ts`) automatically:
- Injects auth token
- Handles 401 errors (redirects to login)
- Preserves other errors for manual handling

## Best Practices

1. **Use `useErrorHandler` for simple error handling**
   ```tsx
   const { handleError } = useErrorHandler()
   try { ... } catch (error) { handleError(error) }
   ```

2. **Use `safeApiRequest` for explicit error handling**
   ```tsx
   const [data, error] = await safeApiRequest(() => apiCall())
   if (error) { /* handle */ }
   ```

3. **Custom error messages**
   ```tsx
   <Error500 message="مشکلی در ذخیره اطلاعات رخ داد" />
   ```

4. **Custom retry logic**
   ```tsx
   <ErrorNetwork onRetry={() => { refetch(); router.push('/') }} />
   ```

## Component Props

### Error403Props
```tsx
{
  message?: string          // Custom error message
  showBackButton?: boolean  // Show/hide back button (default: true)
}
```

### Error404Props
```tsx
{
  message?: string          // Custom error message
  showBackButton?: boolean  // Show/hide back button (default: true)
}
```

### Error500Props
```tsx
{
  message?: string           // Custom error message
  showRefreshButton?: boolean // Show/hide refresh button (default: true)
}
```

### ErrorNetworkProps
```tsx
{
  message?: string          // Custom error message
  onRetry?: () => void      // Custom retry handler
}
```

## Examples

### Example 1: Handling Order Fetch Error
```tsx
const OrderPage = () => {
  const { handleError } = useErrorHandler()
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(orderId)
        setOrder(response.data)
      } catch (error) {
        handleError(error) // Auto-redirects based on error type
      }
    }
    fetchOrder()
  }, [orderId])
}
```

### Example 2: Custom Error Page
```tsx
const CustomErrorPage = () => {
  return (
    <Error404 
      message="این آدرس حذف یا تغییر کرده است"
      showBackButton={false}
    />
  )
}
```

### Example 3: Network Retry Logic
```tsx
const DataFetchingComponent = () => {
  const [data, setData] = useState(null)
  
  const fetchData = async () => {
    const [result, error] = await safeApiRequest(() => getData())
    
    if (error?.isNetworkError) {
      // Show inline network error with retry
      return (
        <ErrorNetwork 
          onRetry={fetchData}
          message="اتصال شما قطع شد"
        />
      )
    }
    
    setData(result)
  }
}
```

## Network Monitoring

The `ErrorNetwork` component automatically:
- Detects online/offline state changes
- Updates UI in real-time
- Shows connection status indicator
- Provides network troubleshooting tips

## Styling

All error pages use:
- Soft UI design (neumorphic style)
- RTL layout
- Persian fonts (Vazirmatn)
- Responsive design
- Smooth animations
- Color-coded themes per error type

## Next.js Integration

Custom error pages:
- `pages/404.tsx` - Handles 404 errors
- `pages/500.tsx` - Handles 500 errors
- `pages/_error.tsx` - Catches all other errors
- `pages/error/[type].tsx` - Dedicated error pages
