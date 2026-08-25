export type UserRole = 'super_admin' | 'admin' | 'manager' | 'operator'

export interface User {
	id: string
	username: string
	fullName: string
	role: UserRole
	phone: string
	email?: string
	avatar?: string
	isActive: boolean
	createdAt: string
}

// ==================== شرکت‌ها و مخاطبین ====================
export type CompanyType = 'legal' | 'real' // حقوقی یا حقیقی

export interface CompanyContact {
	id: string
	companyId: string
	fullName: string
	position: string
	mobile: string
	phone?: string
	email?: string
	isMainContact: boolean
	isFinancialContact: boolean
	isOperationalContact: boolean
	receiveInvoices: boolean
}

export interface Contract {
	id: string
	contractNumber: string
	companyId: string
	companyName: string
	startDate: string // جلالی یا ISO
	endDate: string
	status: 'active' | 'expired' | 'pending' | 'terminated'
	discountPercentage?: number
	freeServices?: string[] // Service IDs
	specialTerms?: string
	description?: string
	createdAt: string
}

export interface Company {
	id: string
	name: string
	nationalId: string // شناسه ملی / کد ملی
	economicCode?: string
	registrationNumber?: string
	phone: string
	address: string
	type: CompanyType
	isActive: boolean
	description?: string
	contacts: CompanyContact[]
	contracts: Contract[]
	totalBalance: number // بدهی مثبت = بدهکار، منفی = بستانکار
	createdAt: string
}

// ==================== ناوگان (خودرو و واگن) ====================
export type VehicleType = 'sedan' | 'truck' | 'trailer' | 'foreign' | 'iranian' | 'other'

export interface Vehicle {
	id: string
	plateNumber: string // شماره پلاک
	driverName: string
	driverPhone: string
	driverNationalId?: string
	companyId: string
	companyName: string
	type: VehicleType
	capacityTon: number
	country: string
	description?: string
	isInsideSite: boolean
	createdAt: string
}

export type WagonType = 'covered' | 'flat' | 'open_top' | 'bordered' | 'tanker' | 'refrigerated'
export type WagonStatus = 'arrived' | 'maneuvered' | 'loading' | 'unloading' | 'overnight' | 'departed'

export interface Wagon {
	id: string
	wagonNumber: string
	type: WagonType
	companyId: string
	companyName: string
	capacityTon: number
	cargoName?: string
	status: WagonStatus
	entryDate: string
	entryTime: string
	exitDate?: string
	exitTime?: string
	isOvernight: boolean
	maneuverCount: number
	trackNumber?: string
	description?: string
}

// ==================== ورود و خروج سایت (Site Visit) ====================
export type TargetType = 'vehicle' | 'wagon'
export type OperationType = 'loading' | 'unloading' | 'transshipment' | 'storage' | 'transit' | 'weighing' | 'other'

export interface SiteVisit {
	id: string
	trackingCode: string
	targetType: TargetType
	vehicleId?: string
	vehiclePlate?: string
	wagonId?: string
	wagonNumber?: string
	driverName?: string
	driverPhone?: string
	companyId: string
	companyName: string
	cargoType?: 'general' | 'vehicles' // نوع محموله (عادی یا خودرو سواری)
	vehicleManifest?: VehicleCargoItem[] // لیست مانیفست ماشین‌های داخل این تریلی/واگن
	entryDateTime: string // ISO string
	exitDateTime?: string // ISO string
	stayDurationMinutes?: number
	operationType: OperationType
	parkingLocation?: string
	entranceFeeCalculated: number
	overnightFeeCalculated: number
	status: 'inside' | 'exited' | 'pending_settlement'
	notes?: string
}

// ==================== کالا و انبار ====================
export type ProductStorageType = 'normal' | 'dangerous' | 'valuable' | 'refrigerated'

// هر دستگاه خودروی کالا به عنوان یک آیتم دارای شماره شاسی یونیک
export interface VehicleCargoItem {
	id: string
	chassisNumber: string // شماره شاسی یونیک (VIN)
	brandAndModel: string // نام و برند
	modelYear: number | string // مدل سال ساخت
	color: string // رنگ
	valueUsd: number // ارزش به دلار
	companyId: string
	companyName: string
	batchCode?: string // شماره محموله یا بچ
	warehouseId?: string
	warehouseName?: string
	locationCode?: string // موقعیت در پارکینگ یا انبار
	entryDate: string
	status: 'in_stock' | 'dispatched' | 'reserved'
	notes?: string
}

// مشخصات اختصاصی خودرو/ماشین به عنوان کالا
export interface VehicleProductSpecs {
	chassisNumber: string // شماره شاسی پیش‌فرض / اصلی
	brandAndModel: string // نام و برند
	modelYear: number | string // مدل سال (میلادی یا شمسی)
	color: string // رنگ
	valueUsd: number // ارزش قیمتی به دلار
	items?: VehicleCargoItem[] // لیست ماشین‌های موجود با شاسی‌های مجزا
}

export interface Product {
	id: string
	code: string
	name: string
	categoryId: string
	categoryName: string
	companyId: string
	companyName: string
	unit: 'ton' | 'kg' | 'pallet' | 'box' | 'carton' | 'number' | 'device'
	unitWeightKg?: number
	storageType: ProductStorageType
	isDangerous: boolean
	isValuable: boolean
	estimatedValueRial?: number
	vehicleSpecs?: VehicleProductSpecs // اگر دسته بندی ماشین باشد
	preferredWarehouseId?: string
	description?: string
	currentStockTotal: number
}

export interface Warehouse {
	id: string
	name: string
	code: string
	type: 'indoor_hall' | 'open_yard' | 'silo' | 'cold_storage'
	totalCapacityTon: number
	usedCapacityTon: number
	locations: WarehouseLocation[]
	managerName: string
	isActive: boolean
}

export interface WarehouseLocation {
	id: string
	warehouseId: string
	code: string // e.g. A-12-03
	title: string
	capacityTon: number
	currentOccupiedTon: number
}

export interface InventoryItem {
	id: string
	batchCode: string
	productId: string
	productName: string
	productCode: string
	companyId: string
	companyName: string
	warehouseId: string
	warehouseName: string
	locationCode: string
	quantity: number
	unit: string
	tonnage: number
	isDangerous: boolean
	isValuable: boolean
	entryDateTime: string
	storageDays: number
	accumulatedStorageCost: number
	accumulatedInsuranceCost: number
}

export type InventoryTransactionType = 'in' | 'out' | 'transfer'

export interface InventoryTransaction {
	id: string
	referenceNumber: string
	type: InventoryTransactionType
	productId: string
	productName: string
	companyId: string
	companyName: string
	quantity: number
	tonnage: number
	unit: string
	fromWarehouseId?: string
	fromWarehouseName?: string
	toWarehouseId?: string
	toWarehouseName?: string
	operatorName: string
	dateTime: string
	vehiclePlate?: string
	notes?: string
}

// ==================== عملیات سایت ====================
export type TransshipmentRoute =
	| 'truck_to_truck'
	| 'sedan_to_truck'
	| 'truck_to_platform'
	| 'truck_to_wagon'
	| 'platform_to_wagon'
	| 'wagon_to_platform'
	| 'wagon_to_truck'

export interface SiteOperation {
	id: string
	operationCode: string
	type:
		| 'loading_forklift'
		| 'unloading_forklift'
		| 'loading_crane'
		| 'unloading_crane'
		| 'transshipment'
		| 'transport'
		| 'wagon_maneuver'
	companyId: string
	companyName: string
	vehicleId?: string
	vehiclePlate?: string
	wagonId?: string
	wagonNumber?: string
	productId?: string
	productName?: string
	tonnage: number
	quantity?: number
	route?: TransshipmentRoute
	equipmentType?: 'forklift' | 'crane'
	equipmentId?: string
	operatorName: string
	startDateTime: string
	endDateTime?: string
	durationHours?: number
	unitPrice: number
	totalCalculatedCost: number
	status: 'in_progress' | 'completed' | 'canceled'
	invoiceItemId?: string
	notes?: string
}

// ==================== خدمات و تعرفه‌گذاری ====================
export type ServiceUnit = 'fixed' | 'per_operation' | 'per_hour' | 'per_day' | 'per_ton' | 'per_wagon' | 'per_vehicle'

export interface SystemService {
	id: string
	code: string
	name: string
	category: 'transshipment' | 'traffic' | 'equipment' | 'rail' | 'storage' | 'insurance' | 'special'
	unit: ServiceUnit
	unitTitleFa: string
	basePriceRial: number
	description?: string
	isActive: boolean
}

export interface TariffRule {
	id: string
	serviceId: string
	serviceName: string
	companyId?: string // if company specific
	contractId?: string // if contract specific
	customRateRial?: number
	multiplier?: number // e.g. 0.8 for 20% discount, 2.0 for 2x
	discountPercent?: number
	isFree: boolean
	validFrom: string
	validTo?: string
	version: number
}

// ==================== موتور محاسبه هزینه ====================
export interface CostCalculationResult {
	serviceId: string
	serviceName: string
	unit: ServiceUnit
	quantity: number
	basePrice: number
	appliedRate: number
	discountApplied: number
	insuranceCost: number
	finalCost: number
	calculationFormula: string
}

// ==================== فاکتور و امور مالی ====================
export interface InvoiceItem {
	id: string
	serviceId: string
	serviceName: string
	operationId?: string
	operationCode?: string
	dateTime: string
	quantity: number
	unitTitle: string
	unitPrice: number
	discountAmount: number
	insuranceAmount: number
	taxAmount: number
	finalTotal: number
	description?: string
}

export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'canceled'

export interface Invoice {
	id: string
	invoiceNumber: string
	companyId: string
	companyName: string
	companyNationalId: string
	contractId?: string
	periodStart: string
	periodEnd: string
	issuedDate: string
	dueDate: string
	items: InvoiceItem[]
	subtotalAmount: number
	totalDiscount: number
	totalInsurance: number
	totalTax: number // 10% VAT
	finalPayableAmount: number
	paidAmount: number
	remainingAmount: number
	status: InvoiceStatus
	notes?: string
}

export type PaymentMethod = 'cash' | 'card_pos' | 'bank_transfer' | 'cheque' | 'credit'

export interface Payment {
	id: string
	receiptNumber: string
	invoiceId?: string
	invoiceNumber?: string
	companyId: string
	companyName: string
	amountRial: number
	paymentMethod: PaymentMethod
	paymentDate: string
	bankName?: string
	trackingCode?: string
	chequeNumber?: string
	chequeDueDate?: string
	isVerified: boolean
	recordedBy: string
	notes?: string
}

export interface CustomerAccountSummary {
	companyId: string
	companyName: string
	nationalId: string
	totalInvoicesAmount: number
	totalPaidAmount: number
	currentDebt: number
	unsettledInvoicesCount: number
	lastPaymentDate?: string
	status: 'normal' | 'debtor' | 'creditor' | 'blocked'
}

// ==================== داشبورد و شاخص‌ها ====================
export interface DashboardStats {
	todayRevenueRial: number
	monthRevenueRial: number
	activeCompaniesCount: number
	vehiclesInsideSite: number
	wagonsInsideSite: number
	totalInventoryTon: number
	warehouseCapacityPercentage: number
	unpaidInvoicesCount: number
	totalOutstandingDebtRial: number
	todayOperationsCount: number
}

// ==================== لاگ سیستم و اعلان ====================
export interface AuditLog {
	id: string
	userId: string
	userName: string
	userRole: UserRole
	action: 'create' | 'update' | 'delete' | 'status_change' | 'login' | 'export'
	entityType: 'company' | 'vehicle' | 'wagon' | 'operation' | 'warehouse' | 'invoice' | 'tariff' | 'user'
	entityId?: string
	details: string
	ipAddress: string
	timestamp: string
}

export interface SystemNotification {
	id: string
	title: string
	message: string
	type: 'warning' | 'info' | 'error' | 'success'
	isRead: boolean
	createdAt: string
	link?: string
}
