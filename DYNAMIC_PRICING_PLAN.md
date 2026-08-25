# 📋 پلن قیمت‌گذاری پویا بر اساس وزن (Dynamic Weight-Based Pricing)

## 🎯 هدف
تغییر سیستم قیمت‌گذاری پسماندها از **قیمت ثابت (Fixed Price)** به **قیمت پویا بر اساس وزن (Weight-Based Dynamic Pricing)** به‌طوری که:

- هر پسماند دارای **قیمت حداقل (minPrice)** و **قیمت حداکثر (maxPrice)** باشد
- بازه وزنی از **۱ کیلوگرم** تا **۱۰۰ کیلوگرم** باشد
- هرچه وزن بیشتر → قیمت هر کیلو بالاتر (تشویق به جمع‌آوری بیشتر)
- قیمت نهایی هر سفارش ثبت و نگهداری شود

---

## 📐 فرمول محاسبه قیمت

### فرمول درون‌یابی خطی (Linear Interpolation)

```
pricePerKg(weight) = minPrice + (maxPrice - minPrice) × ((weight - 1) / (100 - 1))
```

```
totalPrice = weight × pricePerKg(weight)
```

### مثال عملی:
فرض کنید برای **پلاستیک PET**:
- `minPrice = 5,000` تومان (قیمت هر کیلو در وزن ۱ کیلو)
- `maxPrice = 8,000` تومان (قیمت هر کیلو در وزن ۱۰۰ کیلو)

| وزن (کیلو) | قیمت هر کیلو (تومان) | قیمت کل (تومان) |
|------------|---------------------|----------------|
| 1          | 5,000               | 5,000          |
| 10         | 5,273               | 52,727         |
| 25         | 5,727               | 143,182        |
| 50         | 6,485               | 324,242        |
| 75         | 7,242               | 543,182        |
| 100        | 8,000               | 800,000        |

> ✅ نتیجه: هرچه کاربر وزن بیشتری تحویل دهد، **قیمت هر کیلو** هم بالاتر می‌رود.

---

## 🗄️ تغییرات Backend (وب سرویس / API)

### ۱. تغییر مدل Waste (پسماند)

**قبل:**
```json
{
  "_id": "...",
  "title": "پلاستیک PET",
  "price": 5000,
  "info": "...",
  "active": true
}
```

**بعد:**
```json
{
  "_id": "...",
  "title": "پلاستیک PET",
  "price": 5000,          // ← حفظ برای backward compatibility (می‌تواند برابر minPrice باشد)
  "minPrice": 5000,       // ✅ جدید: قیمت حداقل (هر کیلو در وزن ۱ کیلو)
  "maxPrice": 8000,       // ✅ جدید: قیمت حداکثر (هر کیلو در وزن ۱۰۰ کیلو)
  "minWeight": 1,         // ✅ جدید: حداقل وزن قابل قبول (پیش‌فرض: ۱)
  "maxWeight": 100,       // ✅ جدید: حداکثر وزن قابل قبول (پیش‌فرض: ۱۰۰)
  "info": "...",
  "active": true
}
```

### ۲. تغییر API پاسخ `GET /Waste`

پاسخ API باید فیلدهای `minPrice`، `maxPrice`، `minWeight`، `maxWeight` را برگرداند:

```json
{
  "data": [
    {
      "_id": "abc123",
      "title": "پلاستیک PET",
      "price": 5000,
      "minPrice": 5000,
      "maxPrice": 8000,
      "minWeight": 1,
      "maxWeight": 100,
      "info": "...",
      "img": { ... },
      "category": { ... },
      "active": true
    }
  ]
}
```

### ۳. تغییر API دریافت سفارش `POST /order/Accept/:id`

**قبل:**
```json
{
  "wastes": [
    { "item": "wasteId1", "count": 5 }
  ],
  "desc": "دریافت شد"
}
```

**بعد:**
```json
{
  "wastes": [
    {
      "item": "wasteId1",
      "count": 5,
      "pricePerKg": 5121,     // ✅ جدید: قیمت محاسبه‌شده هر کیلو در لحظه ثبت
      "totalPrice": 25606     // ✅ جدید: قیمت کل این آیتم
    }
  ],
  "desc": "دریافت شد"
}
```

> ⚠️ **مهم:** سرور باید قیمت‌ها را **مجدداً محاسبه و اعتبارسنجی** کند تا از دستکاری جلوگیری شود.

### ۴. تغییر مدل Order (سفارش)

فیلد `wastes` در مدل سفارش باید اطلاعات قیمت‌گذاری لحظه ثبت را ذخیره کند:

```json
{
  "_id": "...",
  "orderId": 1234,
  "status": "collected",
  "totalPrice": 75606,
  "wastes": [
    {
      "item": {
        "_id": "wasteId1",
        "title": "پلاستیک PET"
      },
      "count": 5,
      "pricePerKg": 5121,          // ✅ قیمت هر کیلو در لحظه ثبت
      "totalItemPrice": 25606,     // ✅ قیمت کل این آیتم
      "snapshotMinPrice": 5000,    // ✅ snapshot: حداقل قیمت در لحظه ثبت
      "snapshotMaxPrice": 8000     // ✅ snapshot: حداکثر قیمت در لحظه ثبت
    },
    {
      "item": {
        "_id": "wasteId2",
        "title": "آهن"
      },
      "count": 10,
      "pricePerKg": 7576,
      "totalItemPrice": 75758,
      "snapshotMinPrice": 6000,
      "snapshotMaxPrice": 10000
    }
  ],
  "createdAt": "..."
}
```

### ۵. API جدید (اختیاری): محاسبه قیمت `POST /Waste/calculate-price`

برای محاسبه قیمت قبل از ثبت (پیش‌نمایش):

**درخواست:**
```json
{
  "wasteId": "abc123",
  "weight": 25
}
```

**پاسخ:**
```json
{
  "wasteId": "abc123",
  "title": "پلاستیک PET",
  "weight": 25,
  "pricePerKg": 5727,
  "totalPrice": 143182,
  "minPrice": 5000,
  "maxPrice": 8000
}
```

---

## 🖥️ تغییرات Frontend (اپلیکیشن Next.js)

### ۱. تغییر تایپ‌ها (`lib/api/waste.ts`)

```typescript
export interface PricingItem {
  _id: string;
  title: string;
  price: number;           // backward compatible
  minPrice: number;        // ✅ جدید
  maxPrice: number;        // ✅ جدید
  minWeight: number;       // ✅ جدید (پیش‌فرض: 1)
  maxWeight: number;       // ✅ جدید (پیش‌فرض: 100)
  img?: ImageObject | null;
  info: string;
  active: boolean;
  otherImg?: ImageObject[];
  category?: { ... };
}
```

### ۲. تابع محاسبه قیمت (`lib/utils.ts`)

```typescript
/**
 * محاسبه قیمت هر کیلو بر اساس وزن (درون‌یابی خطی)
 */
export function calculatePricePerKg(
  weight: number,
  minPrice: number,
  maxPrice: number,
  minWeight: number = 1,
  maxWeight: number = 100
): number {
  const clampedWeight = Math.max(minWeight, Math.min(maxWeight, weight));
  const ratio = (clampedWeight - minWeight) / (maxWeight - minWeight);
  return Math.round(minPrice + (maxPrice - minPrice) * ratio);
}

/**
 * محاسبه قیمت کل
 */
export function calculateTotalPrice(
  weight: number,
  minPrice: number,
  maxPrice: number,
  minWeight: number = 1,
  maxWeight: number = 100
): number {
  const pricePerKg = calculatePricePerKg(weight, minPrice, maxPrice, minWeight, maxWeight);
  return Math.round(weight * pricePerKg);
}
```

### ۳. تغییر کامپوننت `PriceItem` (`components/price-item.tsx`)

- **لیست قیمت‌ها:** به جای نمایش یک قیمت ثابت، بازه قیمت نمایش داده شود:
  - `۵,۰۰۰ ~ ۸,۰۰۰ تومان/کیلو`
- **مودال جزئیات:** اسلایدر وزن با محاسبه پویا:
  - اسلایدر از ۱ تا ۱۰۰ کیلو
  - نمایش قیمت هر کیلو (متغیر بر اساس وزن)
  - نمایش قیمت کل
  - نمودار بصری تغییر قیمت

### ۴. تغییر مودال دریافت سفارش راننده (`components/driver/order-action-modal.tsx`)

- اضافه کردن فیلد وزن (weight) برای هر پسماند انتخاب‌شده
- محاسبه و نمایش قیمت هر کیلو بر اساس وزن وارد شده
- نمایش قیمت کل هر آیتم و جمع کل سفارش
- ارسال `pricePerKg` و `totalPrice` به همراه هر آیتم

### ۵. تغییر نمایش تاریخچه سفارشات

- نمایش جزئیات قیمت‌گذاری هر سفارش:
  - وزن هر پسماند
  - قیمت هر کیلو (در لحظه ثبت)
  - قیمت کل هر آیتم
  - جمع کل سفارش

---

## 📊 تغییرات تایپ‌ها (`types/order.ts`)

```typescript
export interface OrderWasteItem {
  item: {
    _id: string;
    title: string;
  } | string;
  count: number;              // وزن (کیلوگرم)
  pricePerKg: number;         // ✅ قیمت هر کیلو در لحظه ثبت
  totalItemPrice: number;     // ✅ قیمت کل این آیتم
  snapshotMinPrice: number;   // ✅ حداقل قیمت در لحظه ثبت
  snapshotMaxPrice: number;   // ✅ حداکثر قیمت در لحظه ثبت
}

export interface Order {
  _id: string;
  orderId: number;
  address: Address | null;
  user: User;
  totalPrice: number;
  timeSlot: TimeSlot | null;
  slot?: string;
  selectedSlot?: SlotDetail | null;
  active: boolean;
  status: OrderStatus;
  desc?: string;
  wastes: OrderWasteItem[];   // ✅ تغییر از any[] به OrderWasteItem[]
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔄 ترتیب اجرا (Implementation Order)

### فاز ۱: Backend (وب سرویس)
1. ✅ اضافه کردن فیلدهای `minPrice`, `maxPrice`, `minWeight`, `maxWeight` به مدل Waste
2. ✅ آپدیت API `GET /Waste` برای برگرداندن فیلدهای جدید
3. ✅ اضافه کردن تابع محاسبه قیمت در سرور
4. ✅ تغییر API `POST /order/Accept/:id` برای دریافت و ذخیره قیمت‌ها
5. ✅ اعتبارسنجی قیمت‌ها در سرور (جلوگیری از دستکاری)
6. ✅ ذخیره snapshot قیمت در مدل Order
7. ✅ (اختیاری) ایجاد API محاسبه قیمت

### فاز ۲: Frontend - صفحه قیمت‌ها
8. ✅ آپدیت تایپ `PricingItem` در `lib/api/waste.ts`
9. ✅ اضافه کردن توابع محاسبه قیمت در `lib/utils.ts`
10. ✅ تغییر `PriceItem` برای نمایش بازه قیمت
11. ✅ تغییر اسلایدر وزن برای محاسبه پویا

### فاز ۳: Frontend - پنل راننده
12. ✅ آپدیت تایپ‌ها در `types/order.ts`
13. ✅ تغییر `OrderActionModal` برای محاسبه قیمت پویا
14. ✅ نمایش قیمت محاسبه‌شده در لحظه ثبت

### فاز ۴: Frontend - تاریخچه و نمایش
15. ✅ نمایش جزئیات قیمت در تاریخچه سفارشات
16. ✅ نمایش قیمت ثبت‌شده (snapshot) در جزئیات سفارش

---

## ⚠️ نکات مهم

### Backward Compatibility (سازگاری با نسخه قبل)
- فیلد `price` در مدل Waste حفظ شود (برابر `minPrice`)
- اگر `minPrice`/`maxPrice` وجود نداشت، از `price` به عنوان fallback استفاده شود
- سفارشات قدیمی که `pricePerKg` ندارند، با قیمت ثابت قبلی نمایش داده شوند

### اعتبارسنجی سمت سرور
- سرور باید قیمت‌ها را **خودش محاسبه** کند و فقط از مقادیر ارسالی کلاینت برای مقایسه استفاده کند
- اگر اختلاف بین قیمت محاسبه‌شده سرور و کلاینت بیش از ۱٪ بود، خطا برگرداند
- وزن باید بین `minWeight` و `maxWeight` باشد

### Migration (مهاجرت داده)
- برای پسماندهای موجود: `minPrice = price`, `maxPrice = price * 1.5` (یا مقدار دلخواه)
- `minWeight = 1`, `maxWeight = 100`
- سفارشات قدیمی نیاز به migration ندارند

---

## 🎨 طراحی UI

### لیست قیمت‌ها (صفحه pricing)
```
┌─────────────────────────────────────────┐
│  🔄 پلاستیک PET                        │
│  پلاستیک                               │
│                    ۵,۰۰۰ ~ ۸,۰۰۰      │
│                    تومان/کیلو           │
└─────────────────────────────────────────┘
```

### مودال جزئیات (با اسلایدر)
```
┌─────────────────────────────────────────┐
│  محاسبه قیمت                            │
│                                         │
│  ──────────●──────────────  (اسلایدر)   │
│  ۱ کیلو              ۱۰۰ کیلو          │
│                                         │
│  حدود ۲۵ کیلو                           │
│                                         │
│  قیمت هر کیلو: ۵,۷۲۷ تومان             │
│  ─────────────────────────              │
│  قیمت کل: ۱۴۳,۱۸۲ تومان               │
│                                         │
│  💡 هرچه بیشتر تحویل دهید،             │
│     قیمت هر کیلو بالاتر!               │
└─────────────────────────────────────────┘
```

### مودال دریافت سفارش (راننده)
```
┌─────────────────────────────────────────┐
│  دریافت سفارش                           │
│                                         │
│  پلاستیک PET                            │
│  وزن: [  25  ] کیلو                     │
│  قیمت هر کیلو: ۵,۷۲۷ تومان             │
│  قیمت این آیتم: ۱۴۳,۱۸۲ تومان          │
│                                         │
│  آهن                                    │
│  وزن: [  10  ] کیلو                     │
│  قیمت هر کیلو: ۶,۲۷۳ تومان             │
│  قیمت این آیتم: ۶۲,۷۲۷ تومان           │
│                                         │
│  ─────────────────────────              │
│  جمع کل: ۲۰۵,۹۰۹ تومان                │
│                                         │
│  [ ثبت دریافت ]                         │
└─────────────────────────────────────────┘
```

---

## 📁 فایل‌های تغییر یافته

| فایل | نوع تغییر | توضیح |
|------|----------|-------|
| `lib/api/waste.ts` | ✏️ ویرایش | اضافه کردن فیلدهای جدید به تایپ `PricingItem` |
| `lib/utils.ts` | ✏️ ویرایش | اضافه کردن توابع `calculatePricePerKg` و `calculateTotalPrice` |
| `types/order.ts` | ✏️ ویرایش | اضافه کردن تایپ `OrderWasteItem` و آپدیت `Order` |
| `components/price-item.tsx` | ✏️ ویرایش | نمایش بازه قیمت + محاسبه پویا در اسلایدر |
| `pages/pricing.tsx` | ✏️ ویرایش | پاس دادن `minPrice`/`maxPrice` به `PriceItem` |
| `components/driver/order-action-modal.tsx` | ✏️ ویرایش | محاسبه قیمت پویا هنگام ثبت سفارش |
| `lib/api/driver.ts` | ✏️ ویرایش | آپدیت تایپ‌های ارسال سفارش |
| `pages/collection-history.tsx` | ✏️ ویرایش | نمایش جزئیات قیمت در تاریخچه |

---

## 🧪 تست‌ها

### تست‌های واحد (Unit Tests)
- [ ] تست فرمول محاسبه قیمت با مقادیر مرزی (وزن ۱، ۵۰، ۱۰۰)
- [ ] تست با `minPrice === maxPrice` (قیمت ثابت)
- [ ] تست با وزن خارج از بازه (clamp شود)
- [ ] تست backward compatibility (بدون `minPrice`/`maxPrice`)

### تست‌های یکپارچگی (Integration Tests)
- [ ] ثبت سفارش با قیمت پویا و بررسی ذخیره صحیح
- [ ] بررسی اعتبارسنجی سمت سرور
- [ ] بررسی نمایش صحیح در تاریخچه سفارشات
