# Error Pages - Quick Start Guide

## 🚀 Quick Start

Your error handling system is ready to use! Here's how to get started in 5 minutes.

## 1️⃣ See It In Action

Visit these pages to see the error pages:

```
http://localhost:3000/dev/error-test     ← Browse all error pages
http://localhost:3000/dev/error-example  ← Interactive demos
```

## 2️⃣ Use In Your Code (3 Ways)

### Way 1: Auto Error Handling (Recommended) ⭐

```tsx
import { useErrorHandler } from '@/Hooks/useErrorHandler'

const MyComponent = () => {
  const { handleError } = useErrorHandler()
  
  const fetchData = async () => {
    try {
      const response = await getOrders()
      // success!
    } catch (error) {
      handleError(error) // That's it! Auto-redirects to correct page
    }
  }
}
```

### Way 2: Safe API Request

```tsx
import { safeApiRequest } from '@/lib/api/error-handler'

const MyComponent = () => {
  const fetchData = async () => {
    const [data, error] = await safeApiRequest(() => getOrders())
    
    if (error) {
      // Handle error manually
      console.log(error.message)
      return
    }
    
    // Use data
  }
}
```

### Way 3: Display Error Inline

```tsx
import { Error404, ErrorNetwork } from '@/components/error-pages'

const MyComponent = () => {
  if (notFound) {
    return <Error404 message="Not found!" />
  }
  
  if (offline) {
    return <ErrorNetwork onRetry={() => refetch()} />
  }
  
  return <div>Normal content</div>
}
```

## 3️⃣ Available Error Pages

| Error Type | Path | When to Use |
|------------|------|-------------|
| 403 | `/error/403` | Permission denied |
| 404 | `/error/404` | Not found |
| 500 | `/error/500` | Server error |
| Network | `/error/network` | No internet/timeout |

## 4️⃣ Component Props

All components accept optional props:

```tsx
// Error403, Error404
<Error404 
  message="Custom message"    // Optional
  showBackButton={false}      // Optional, default: true
/>

// Error500
<Error500 
  message="Custom message"    // Optional
  showRefreshButton={true}    // Optional, default: true
/>

// ErrorNetwork
<ErrorNetwork 
  message="Custom message"    // Optional
  onRetry={() => doSomething()} // Optional custom retry
/>
```

## 5️⃣ Real World Examples

### Example: Fetch User Profile

```tsx
import { useErrorHandler } from '@/Hooks/useErrorHandler'
import { getUserProfile } from '@/lib/api'

const ProfilePage = () => {
  const { handleError } = useErrorHandler()
  const [profile, setProfile] = useState(null)
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile()
        setProfile(response.data)
      } catch (error) {
        handleError(error) // Shows appropriate error page
      }
    }
    fetchProfile()
  }, [])
  
  return <div>{profile?.name}</div>
}
```

### Example: Order Details

```tsx
import { Error404 } from '@/components/error-pages'
import { getOrderById } from '@/lib/api'

const OrderPage = ({ orderId }) => {
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(orderId)
        setOrder(response.data)
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true)
        }
      }
    }
    fetchOrder()
  }, [orderId])
  
  if (notFound) {
    return <Error404 message="سفارش یافت نشد" />
  }
  
  return <div>{order?.details}</div>
}
```

### Example: Form Submission

```tsx
import { useErrorHandler } from '@/Hooks/useErrorHandler'
import { useToast } from '@/components/toast-provider'
import { createOrder } from '@/lib/api'

const OrderForm = () => {
  const { handleError } = useErrorHandler()
  const toast = useToast()
  
  const handleSubmit = async (data) => {
    try {
      const response = await createOrder(data)
      toast.success('سفارش با موفقیت ثبت شد')
      router.push('/orders')
    } catch (error) {
      // Show error page for severe errors
      if (error.response?.status >= 500) {
        handleError(error)
      } else {
        // Show toast for validation errors
        toast.error('لطفاً اطلاعات را بررسی کنید')
      }
    }
  }
}
```

## 6️⃣ Protection with Error Boundary

Wrap components that might crash:

```tsx
import ErrorBoundary from '@/components/error-boundary'

const MyPage = () => (
  <ErrorBoundary>
    <ComplexDataVisualization />
  </ErrorBoundary>
)
```

## 📚 More Info

- **Full docs**: `ERROR_HANDLING.md`
- **Implementation details**: `ERROR_PAGES_IMPLEMENTATION.md`
- **Complete summary**: `IMPLEMENTATION_SUMMARY.md`

## 🎨 Design

All error pages feature:
- ✅ Soft UI design matching your app
- ✅ RTL Persian layout
- ✅ Smooth animations
- ✅ Clear action buttons
- ✅ Color-coded themes

## 🔧 Customization

### Custom Messages

```tsx
<Error404 message="این محصول دیگر موجود نیست" />
```

### Custom Retry Logic

```tsx
<ErrorNetwork onRetry={() => {
  refetchData()
  logRetryAttempt()
  router.push('/')
}} />
```

### Hide Buttons

```tsx
<Error403 showBackButton={false} />
<Error500 showRefreshButton={false} />
```

## ✅ Checklist

- [x] 4 error page components created
- [x] Next.js error pages (404, 500, _error)
- [x] useErrorHandler hook
- [x] safeApiRequest utility
- [x] Error boundary component
- [x] Test pages at /dev/error-test and /dev/error-example
- [x] Complete documentation
- [x] TypeScript support
- [x] RTL Persian design
- [x] All compiling without errors

## 🎉 You're Ready!

Start using error handling in your components now. It's that simple!

Need help? Check the full documentation or look at the examples in `/dev/error-example`.
