# EMS API - Enterprise Management System for Rana Plastics

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Module Documentation](#module-documentation)
5. [Business Rules](#business-rules)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Testing Strategy](#testing-strategy)
9. [Configuration](#configuration)
10. [Deployment Guide](#deployment-guide)
11. [CI/CD Pipeline](#-cicd-pipeline)

---

## 📖 Project Overview

### Purpose
The **EMS API** (Enterprise Management System) is a comprehensive backend system designed for **Rana Plastics**, a manufacturing company. It manages the complete production lifecycle including inventory, orders, production, raw materials, machine utilization, power consumption, payments, and receivables.

### Business Domain
Manufacturing & Supply Chain Management for Plastic Products

### Key Features
- ✅ Client management with relationship tracking
- ✅ Product master catalog with pricing and categorization
- ✅ Real-time inventory management with reservation system
- ✅ Order processing with automatic inventory allocation
- ✅ Production tracking with quality control (good/rejected quantities)
- ✅ Raw material consumption monitoring with wastage alerts
- ✅ Machine utilization tracking with downtime detection
- ✅ Power consumption monitoring with spike detection
- ✅ Payment processing with automatic receivable updates
- ✅ Client receivable management with aging analysis
- ✅ Complete transactional integrity with rollback safety

---

## 🛠 Technology Stack

### Backend Framework
- **Spring Boot**: 3.2.5
- **Java Version**: 17
- **Build Tool**: Maven

### Persistence
- **ORM**: Spring Data JPA (Hibernate 6)
- **Database**: MySQL 8+ (Production)
- **Test Database**: H2 (In-Memory)
- **API Standard**: Jakarta Persistence (Jakarta EE 9+)

### Key Dependencies
```xml
<!-- Spring Boot Starters -->
spring-boot-starter-data-jpa
spring-boot-starter-web
spring-boot-starter-validation

<!-- Database -->
mysql-connector-j (Runtime)
h2 (Test)

<!-- Utilities -->
lombok

<!-- PDF generation -->
pdfbox (2.0.30)
```

### Package Structure
```
com.pentagon.emsapi
├── Controllers/          # REST API endpoints
├── Services/            # Business logic layer
│   └── Impl/           # Service implementations
├── Repositories/        # Data access layer
├── Models/             # JPA entities
├── dto/                # Data Transfer Objects
│   ├── client/
│   ├── product/
│   ├── inventory/
│   ├── order/
│   ├── payment/
│   ├── production/
│   ├── receivable/
│   ├── machineutilization/
│   ├── powerconsumption/
│   └── rawmaterial/
├── exception/          # Custom exceptions & handlers
├── config/            # Configuration classes
└── common/            # Shared utilities (BaseEntity, etc.)
```

---

## 🏗 Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         REST Controllers                │  ← HTTP Layer
│  (JSON Request/Response)                │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Service Layer                   │  ← Business Logic
│  (@Transactional, Business Rules)      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Repository Layer                │  ← Data Access
│  (JPA, Custom Queries)                  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Database (MySQL/H2)             │  ← Persistence
└─────────────────────────────────────────┘
```

### Design Principles
1. **Separation of Concerns**: Clear layer boundaries
2. **Constructor Injection**: No field injection (Spring best practice)
3. **Immutable DTOs**: Java Records for request/response
4. **Transactional Boundaries**: All write operations are @Transactional
5. **Soft Delete**: Records marked as deleted, not removed
6. **Auditing**: All entities track createdAt/updatedAt timestamps

---

## 📦 Module Documentation

### 1. Client Management Module

#### Purpose
Manages customer information and relationships with orders, payments, and receivables.

#### Entity: `Client`
```java
@Entity
@Table(name = "clients")
public class Client extends BaseEntity {
    Long clientId;              // Primary Key
    String name;                // Client name (required)
    String phoneNo;             // Contact number
    String emailId;             // Email address
    String address;             // Physical address
    LocalDateTime createdAt;    // Audit: Created timestamp
    LocalDateTime updatedAt;    // Audit: Updated timestamp
    LocalDateTime deletedAt;    // Soft delete marker
    
    // Relationships
    @OneToMany List<Order> orders;
    @OneToMany List<Payment> payments;
    // Receivables are managed by clientId (scalar) on Receivable (no JPA relationship)
}
```

#### REST Endpoints
- `POST /api/v1/clients` - Create client
- `GET /api/v1/clients/{id}` - Get by ID
- `GET /api/v1/clients` - Get all clients
- `PUT /api/v1/clients/{id}` - Update client
- `DELETE /api/v1/clients/{id}` - Soft delete client

#### Business Rules
- ✅ Client name is required
- ✅ Each client has ONE receivable account (auto-created)
- ✅ Phone and email are optional but recommended
- ✅ Soft delete preserves historical data

---

### 2. Product Management Module

#### Purpose
Manages product master data including product definitions, pricing, and categorization.

#### Entity: `Product`
```java
@Entity
@Table(name = "product")
public class Product {
    Long productId;            // Primary Key
    String productName;        // Product name (required)
    ProductType productType;   // FINISHED, SEMI_FINISHED, RAW_MATERIAL
    Integer standardSize;      // Standard size
    BigDecimal rate;           // Default selling rate
}
```

#### Product Types
```java
enum ProductType {
    FINISHED,        // Ready for sale
    SEMI_FINISHED,   // Work in progress
    RAW_MATERIAL     // Input materials
}
```

#### REST Endpoints
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/{id}` - Get by ID
- `GET /api/v1/products/code/{code}` - Get by product code
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/type/{type}` - Filter by product type
- `GET /api/v1/products/category/{category}` - Filter by category
- `GET /api/v1/products/active` - Get only active products
- `GET /api/v1/products/search?name=...` - Search by name
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Soft delete product
- `POST /api/v1/products/{id}/activate` - Activate product
- `POST /api/v1/products/{id}/deactivate` - Deactivate product

#### Business Rules

1. **Product Code Uniqueness**
   ```
   Product code MUST be unique
   ✅ Enforced at database level (unique constraint)
   ✅ Validated during creation
   ✅ Throws DuplicateResourceException if duplicate
   ```

2. **Product Activation**
   ```
   Products can be activated/deactivated
   ✅ Inactive products are hidden from normal operations
   ✅ Soft delete vs deactivate:
      - Deactivate: Temporarily hide (can be reactivated)
      - Soft delete: Permanent removal (preserves history)
   ```

3. **Pricing Rules**
   ```
   unitPrice: Selling price (required)
   costPrice: Cost/production price (optional)
   profit = unitPrice - costPrice
   ```

4. **Reorder Level**
   ```
   reorderLevel: Threshold for low stock alerts
   ✅ Used by inventory module for alerts
   ✅ Optional but recommended
   ```

5. **Product Search**
   ```
   Search by:
   - Product code (exact match)
   - Product name (partial match, case-insensitive)
   - Product type (enum)
   - Category (exact match)
   ```

6. **Validation Rules**
   - ✅ Product code is required and unique
   - ✅ Product name is required (max 255 characters)
   - ✅ Unit price must be positive
   - ✅ Standard weight must be positive (if provided)
   - ✅ Cost price must be positive (if provided)

---

### 3. Inventory Management Module

#### Purpose
Tracks product inventory levels, manages stock movements, and prevents stockouts.

#### Entity: `Inventory`
> Note: Inventory stores a scalar `productId` + `productName` (no JPA relationship to `Product`).

```java
@Entity
@Table(name = "inventory")
public class Inventory extends BaseEntity {
    Long inventoryId;                 // Primary Key
    Long productId;                   // Product identifier (scalar)
    String productName;               // Denormalized name for reporting
    BigDecimal availableQuantity;      // Available stock
    BigDecimal reservedQuantity;       // Reserved stock

    // Business rules
    void addStock(BigDecimal qty);
    void deductStock(BigDecimal qty);      // throws InsufficientInventoryException
    void reserveQuantity(BigDecimal qty);  // throws InsufficientInventoryException
    void releaseReservation(BigDecimal qty);
}
```

#### Repository Notes
- `InventoryRepository.findActiveById(productId)` returns the active inventory row for a *productId* (not the PK `inventoryId`).
- Concurrency-sensitive updates use pessimistic locking via `findByIdForUpdate(productId)`.

---

### 3. Order Management Module

#### Purpose
Manages customer orders, links to inventory, and tracks order fulfillment status.

#### Entities

**Order**
```java
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {
    Long orderId;                    // Primary Key
    Client client;                   // Customer (ManyToOne)
    LocalDate date;                  // Order date
    BigDecimal totalAmount;          // Order total
    BigDecimal paidAmount;           // Amount paid
    OrderStatus status;              // CREATED, COMPLETED, CANCELLED
    List<OrderBook> orderBooks;      // Line items (OneToMany)
    
    // Calculated field
    public BigDecimal getBalanceDue() {
        return totalAmount.subtract(paidAmount);
    }
}
```

**OrderBook** (Order Line Items)
```java
@Entity
@Table(name = "order_book")
public class OrderBook extends BaseEntity {
    Long serialNo;                  // Primary Key
    Order order;                    // Parent order (ManyToOne)

    Long productId;                 // Ordered product (scalar productId)
    BigDecimal quantity;            // Ordered quantity
    BigDecimal quantityFulfilled;   // Fulfilled from stock
    BigDecimal quantityForProduction; // Pending for production

    BigDecimal rate;                // Rate at order time
    BigDecimal lineTotal;           // quantity × rate
}
```

#### Order Status Lifecycle
```
CREATED → COMPLETED → CANCELLED
   ↓         ↓
(default)  (final)
```

#### REST Endpoints
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{id}` - Get order details
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/client/{clientId}` - Client's orders
- `POST /api/v1/orders/{id}/complete` - Mark order complete
- `POST /api/v1/orders/{id}/cancel` - Cancel order

#### Business Rules

1. **Order Creation - Inventory Handling**
   ```
   For each order line item:
   
   STEP 1: Check if inventory entry exists for the product
   IF (inventory entry does NOT exist):
       ✅ Verify product exists in Product master table
       ✅ Create new inventory entry with zero stock
       ✅ Mark entire quantity for production
   
   STEP 2: Check available stock
   IF (availableStock >= orderedQuantity):
       ✅ Fulfill entire quantity from stock
       fulfilledQuantity = orderedQuantity
       pendingQuantity = 0
       Deduct from inventory
   
   ELSE IF (availableStock > 0):
       ✅ Partial fulfillment
       fulfilledQuantity = availableStock
       pendingQuantity = orderedQuantity - availableStock
       Deduct available stock
       Mark pending for production
   
   ELSE:
       ✅ No stock available
       fulfilledQuantity = 0
       pendingQuantity = orderedQuantity
       Mark entire quantity for production
   ```

2. **Order Total Calculation**
   ```java
   totalAmount = Σ(lineItem.quantity × lineItem.unitPrice)
   ```

3. **Order Completion**
   ```
   WHEN order.complete():
   1. Update status to COMPLETED
   2. Calculate balance due = totalAmount - paidAmount
   3. Create/Update client receivable
   4. receivable.addReceivable(balanceDue)
   ```

4. **Transactional Safety**
   - Order creation is atomic (all line items or none)
   - Inventory deduction and order creation in same transaction
   - Rollback if any item fails
   - Auto-creates inventory entries for products without stock records

---

### 4. Production Management Module

#### Purpose
Tracks production activities, links to orders, manages good/rejected quantities, and updates inventory.

#### Entity: `Production`
```java
@Entity
@Table(name = "production")
public class Production extends BaseEntity {
    Long productionId;               // Primary Key
    Inventory product;               // Produced product (ManyToOne)
    Order order;                     // Linked order (ManyToOne, nullable)
    OrderBook orderBook;             // Specific line item (ManyToOne, nullable)
    String machineName;              // Machine used (required)
    LocalDate productionDate;        // Production date
    BigDecimal plannedQuantity;      // Target quantity
    BigDecimal actualQuantity;       // Actual produced
    BigDecimal rejectedQuantity;     // Quality failures
    BigDecimal goodQuantity;         // Calculated: actual - rejected
    String remarks;                  // Notes
}
```

#### REST Endpoints
- `POST /api/v1/production` - Record production
- `GET /api/v1/production/{id}` - Get by ID
- `GET /api/v1/production` - Get all
- `GET /api/v1/production/product/{productId}` - By product
- `GET /api/v1/production/order/{orderId}` - By order
- `GET /api/v1/production/unlinked` - Production not linked to orders

#### Business Rules

1. **Good Quantity Calculation**
   ```java
   goodQuantity = actualQuantity - rejectedQuantity
   // Automatically calculated on save
   ```

2. **Production WITHOUT Order Link** (Stock Production)
   ```
   When production is NOT linked to an order:
   
   1. Calculate goodQuantity
   2. Add goodQuantity to inventory.availableQuantity
   3. Rejected quantity discarded (not added to inventory)
   
   Example:
   Planned: 100 units
   Actual: 95 units
   Rejected: 5 units
   Good: 90 units → Added to inventory
   ```

3. **Production WITH Order Link** (Order Fulfillment)
   ```
   When production IS linked to an order:
   
   1. Calculate goodQuantity
   2. Fulfill pending order quantity
   
   IF (goodQuantity >= orderBook.pendingQuantity):
       ✅ Full fulfillment
       orderBook.fulfilledQuantity += orderBook.pendingQuantity
       orderBook.pendingQuantity = 0
       overflow = goodQuantity - orderBook.pendingQuantity
       inventory.availableQuantity += overflow
   
   ELSE:
       ✅ Partial fulfillment
       orderBook.fulfilledQuantity += goodQuantity
       orderBook.pendingQuantity -= goodQuantity
       // No overflow to inventory
   ```

4. **Production Efficiency**
   ```java
   efficiency = (actualQuantity / plannedQuantity) × 100
   rejectionRate = (rejectedQuantity / actualQuantity) × 100
   ```

5. **Validation Rules**
   - Machine name is required
   - Actual quantity ≤ planned quantity (warning if exceeded)
   - Rejected quantity ≤ actual quantity
   - Production date cannot be in future

---

### 5. Raw Material Consumption Module

#### Purpose
Tracks raw material usage, calculates wastage, and triggers alerts for high wastage.

#### Entity: `RawMaterialConsumption`
```java
@Entity
@Table(name = "raw_material_consumption")
public class RawMaterialConsumption extends BaseEntity {
    Long consumptionId;              // Primary Key
    String materialName;             // Material name (required)
    Inventory rawMaterial;           // Raw material (ManyToOne)
    Production production;           // Linked production (ManyToOne, nullable)
    LocalDate consumptionDate;       // Date
    BigDecimal issuedQuantity;       // Material issued
    BigDecimal outputQuantity;       // Product output
    BigDecimal wastage;              // Calculated: issued - output
    BigDecimal wastagePercentage;    // Calculated: (wastage/issued)×100
    Boolean highWastageFlag;         // Alert flag
    String remarks;
}
```

#### REST Endpoints
- `POST /api/v1/raw-material-consumption` - Record consumption
- `GET /api/v1/raw-material-consumption/{id}` - Get by ID
- `GET /api/v1/raw-material-consumption` - Get all
- `GET /api/v1/raw-material-consumption/high-wastage` - High wastage alerts
- `GET /api/v1/raw-material-consumption/material/{materialName}` - By material

#### Business Rules

1. **Wastage Calculation**
   ```java
   wastage = issuedQuantity - outputQuantity
   wastagePercentage = (wastage / issuedQuantity) × 100
   
   // Automatically calculated on save
   ```

2. **High Wastage Detection**
   ```
   IF (wastagePercentage > threshold):
       highWastageFlag = true
       // Threshold configurable (default: 10%)
   ELSE:
       highWastageFlag = false
   ```

3. **Inventory Deduction**
   ```
   When material is issued:
   rawMaterial.availableQuantity -= issuedQuantity
   
   // Transactional - rolls back if fails
   ```

4. **Zero Wastage Scenario**
   ```
   Perfect efficiency:
   issuedQuantity = 100
   outputQuantity = 100
   wastage = 0
   wastagePercentage = 0%
   highWastageFlag = false
   ```

5. **Wastage Thresholds** (Configurable)
   ```properties
   app.wastage.threshold=10.0  # 10% threshold
   ```

6. **Material Efficiency**
   ```java
   efficiency = (outputQuantity / issuedQuantity) × 100
   // 100% = perfect, >100% = impossible (validation error)
   ```

---

### 7. Machine Utilization Module

#### Purpose
Monitors machine performance, tracks downtime, detects recurring issues.

#### Entity: `MachineUtilization`
```java
@Entity
@Table(name = "machine_utilization")
public class MachineUtilization extends BaseEntity {
    Long utilizationId;              // Primary Key
    String machineName;              // Machine identifier (required)
    LocalDate utilizationDate;       // Date
    BigDecimal plannedRuntime;       // Planned minutes
    BigDecimal actualRuntime;        // Actual minutes
    BigDecimal downtime;             // Calculated: planned - actual
    BigDecimal utilizationPercentage; // Calculated: (actual/planned)×100
    Boolean repeatedDowntimeFlag;    // Alert flag
    String downtimeReason;           // Reason for downtime
    String remarks;
}
```

#### REST Endpoints
- `POST /api/v1/machine-utilization` - Record utilization
- `GET /api/v1/machine-utilization/{id}` - Get by ID
- `GET /api/v1/machine-utilization` - Get all
- `GET /api/v1/machine-utilization/machine/{machineName}` - By machine
- `GET /api/v1/machine-utilization/date-range?start=...&end=...` - By dates
- `GET /api/v1/machine-utilization/repeated-downtime` - Repeated downtime alerts

#### Business Rules

1. **Downtime Calculation**
   ```java
   downtime = plannedRuntime - actualRuntime
   // Automatically calculated
   ```

2. **Utilization Percentage**
   ```java
   IF (plannedRuntime > 0):
       utilizationPercentage = (actualRuntime / plannedRuntime) × 100
   ELSE:
       utilizationPercentage = 0  // Safe division by zero
   ```

3. **Repeated Downtime Detection**
   ```
   Algorithm:
   1. Check last N days (default: 3 days)
   2. Count days with downtime
   3. IF (downtime occurrences >= threshold AND current day has downtime):
         repeatedDowntimeFlag = true
   
   Configuration:
   app.downtime.repeated.days=3
   app.downtime.repeated.threshold=2
   
   Example:
   Day 1: downtime = 60 min ✓
   Day 2: downtime = 45 min ✓
   Day 3: downtime = 30 min ✓
   → Flag raised (3 consecutive days with downtime)
   ```

4. **Zero Planned Runtime**
   ```
   Scenario: Machine not scheduled (holiday/maintenance)
   
   plannedRuntime = 0
   actualRuntime = 0
   downtime = 0
   utilizationPercentage = 0
   // No error, valid scenario
   ```

5. **Perfect Utilization**
   ```
   actualRuntime = plannedRuntime
   downtime = 0
   utilizationPercentage = 100%
   ```

---

### 7. Power Consumption Module

#### Purpose
Monitors daily power usage, calculates efficiency (unit per kg), detects abnormal spikes.

#### Entity: `PowerConsumption`
```java
@Entity
@Table(name = "power_consumption")
public class PowerConsumption extends BaseEntity {
    Long consumptionId;              // Primary Key
    LocalDate consumptionDate;       // Date
    BigDecimal unitsConsumed;        // Power units (kWh)
    BigDecimal outputKg;             // Production output (kg)
    BigDecimal unitPerKg;            // Calculated: units/output
    Boolean abnormalSpikeFlag;       // Alert flag
    String remarks;
}
```

#### REST Endpoints
- `POST /api/v1/power-consumption` - Record consumption
- `GET /api/v1/power-consumption/{id}` - Get by ID
- `GET /api/v1/power-consumption` - Get all
- `GET /api/v1/power-consumption/date-range?start=...&end=...` - By dates
- `GET /api/v1/power-consumption/abnormal-spikes` - Spike alerts

#### Business Rules

1. **Unit Per Kg Calculation**
   ```java
   IF (outputKg > 0):
       unitPerKg = unitsConsumed / outputKg
   ELSE:
       unitPerKg = 0  // Safe division by zero
   
   // Rounded to 4 decimal places
   ```

2. **Abnormal Spike Detection**
   ```
   Algorithm:
   1. Calculate 7-day rolling average (configurable)
   2. Calculate current day's unit per kg
   3. Calculate deviation percentage
   
   deviation = ((current - average) / average) × 100
   
   IF (deviation > threshold):
       abnormalSpikeFlag = true
   
   Configuration:
   app.power.spike.threshold=30.0        # 30% deviation
   app.power.spike.lookback.days=7       # 7-day average
   ```

3. **Spike Detection Example**
   ```
   Historical 7-day average: 2.0 unit/kg
   Current day: 3.0 unit/kg
   
   Deviation = ((3.0 - 2.0) / 2.0) × 100 = 50%
   Threshold = 30%
   
   50% > 30% → abnormalSpikeFlag = TRUE ⚠️
   ```

4. **Insufficient Historical Data**
   ```
   IF (historical records < 3):
       abnormalSpikeFlag = false
       // Not enough data for baseline
   ```

5. **Zero Output Scenario**
   ```
   No production day:
   unitsConsumed = 100 kWh (idle power)
   outputKg = 0
   unitPerKg = 0
   abnormalSpikeFlag = false
   // No spike detection on zero output
   ```

---

### 8. Payment Management Module

#### Purpose
Records payments and reduces client receivables. Supports optional order-linked payments.

#### Entity: `Payment`
```java
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {
    Long paymentId;
    Long clientId;
    Order order;               // nullable
    LocalDate paymentDate;
    BigDecimal amountPaid;
    PaymentMode paymentMode;
    String remarks;
}
```

#### Request DTO: `CreatePaymentRequest`
```java
public record CreatePaymentRequest(
    Long clientId,
    Long orderId,              // nullable
    LocalDate paymentDate,
    BigDecimal amountPaid,
    PaymentMode paymentMode,
    String remarks
) {}
```

#### Business Rules
1. Client must exist.
2. A receivable account is auto-created if missing.
3. Payment amount must be > 0.
4. Overpayment is not allowed:
   - payment cannot exceed the client receivable total
   - if orderId is provided, payment cannot exceed that order's balanceDue

#### REST Endpoints
- `POST /api/v1/payments` - Record payment
- `GET /api/v1/payments/{id}` - Get by ID
- `GET /api/v1/payments` - Get all
- `GET /api/v1/payments/client/{clientId}` - Client's payments
- `GET /api/v1/payments/order/{orderId}` - Order payments
- `GET /api/v1/payments/date-range?startDate=...&endDate=...` - By dates

---

### 10. Receivable Management Module

#### Entity: `Receivable`
> Note: Receivable stores a scalar `clientId` (no JPA relationship to `Client`).

```java
@Entity
@Table(name = "receivables")
public class Receivable extends BaseEntity {
    Long receivableId;
    Long clientId;                 // unique per client
    BigDecimal totalDue;

    // Aging buckets
    BigDecimal aging0To30;
    BigDecimal aging31To60;
    BigDecimal aging61To90;
    BigDecimal agingOver90;

    void addReceivable(BigDecimal amount);
    void reduceReceivable(BigDecimal amount);
}
```

---

## 📐 Business Rules

### Global Business Rules

#### 1. Transactional Integrity
```
ALL monetary and inventory operations are @Transactional:

✅ ACID Compliance:
   - Atomicity: All or nothing
   - Consistency: Business rules enforced
   - Isolation: Concurrent operations safe
   - Durability: Changes persisted

✅ Automatic Rollback on:
   - RuntimeException
   - InsufficientInventoryException
   - BusinessException
   - Any unchecked exception

✅ No Partial Data:
   - Order creation: All line items or none
   - Payment: Update receivable + save payment atomically
   - Production: Update inventory + order fulfillment atomically
```

#### 2. Data Validation
```java
✅ Jakarta Validation Annotations:
   @NotNull       // Field cannot be null
   @NotBlank      // String cannot be empty
   @DecimalMin    // Minimum value
   @Positive      // Must be > 0
   @PastOrPresent // Date not in future

✅ Applied on:
   - Request DTOs (CreateXxxRequest)
   - Entity fields
   - Method parameters
```

#### 3. Soft Delete Strategy
```java
// All entities extend BaseEntity
@MappedSuperclass
public class BaseEntity {
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime deletedAt;  // Null = active
    
    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    void softDelete() {
        deletedAt = LocalDateTime.now();
    }
}

// Queries filter deleted records
@Query("SELECT e FROM Entity e WHERE e.deletedAt IS NULL")
List<Entity> findAllActive();
```

#### 4. Monetary Calculations
```
✅ BigDecimal for all monetary values (never Double/Float)
✅ Scale: 2 decimal places
✅ Rounding: HALF_UP

Examples:
totalAmount = Σ(lineItem.quantity × lineItem.unitPrice)
balanceDue = totalAmount - paidAmount
```

#### 5. Quantity Calculations
```
✅ BigDecimal for all quantities
✅ Scale: 2 decimal places
✅ Negative quantities not allowed (validation)

Inventory:
totalStock = availableQuantity + reservedQuantity

Production:
goodQuantity = actualQuantity - rejectedQuantity

Wastage:
wastage = issuedQuantity - outputQuantity
```

---

### Module-Specific Business Rules

#### Inventory Rules
1. ✅ Stock cannot go negative (hard constraint)
2. ✅ Deduction requires sufficient available quantity
3. ✅ Reservation moves stock from available to reserved
4. ✅ Product type determines usage (FINISHED/SEMI/RAW)

#### Order Rules
1. ✅ Order creates receivable on completion
2. ✅ Inventory allocated on order creation (not completion)
3. ✅ Partial fulfillment allowed (pending marked for production)
4. ✅ Total = sum of all line items
5. ✅ Balance due = total - paid amount

#### Production Rules
1. ✅ Good quantity = actual - rejected
2. ✅ Unlinked production → add to inventory
3. ✅ Linked production → fulfill order first, overflow to inventory
4. ✅ Machine name required for tracking
5. ✅ Production date cannot be future

#### Payment Rules
1. ✅ Payment reduces receivable
2. ✅ Overpayment not allowed (strict validation)
3. ✅ Auto-create receivable if doesn't exist
4. ✅ Payment must have valid client
5. ✅ Amount must be positive

#### Receivable Rules
1. ✅ ONE receivable per client (unique constraint)
2. ✅ Cannot go below zero (floor at 0)
3. ✅ Updated on order completion (+) and payment (-)
4. ✅ Aging buckets calculated from order dates
5. ✅ Total due = sum of all aging buckets

---

## 🗄 Database Schema

### ERD Overview
```
Client (1) ──────< (∞) Order
   │                     │
   │                     └───< (∞) OrderBook >─── Inventory
   │
   ├────< (∞) Payment
   │
   └──── (1:1) Receivable

Inventory ──< (∞) Production >─── Order
   │                                │
   │                                └─── OrderBook
   │
   └──< (∞) RawMaterialConsumption

MachineUtilization (standalone)
PowerConsumption (standalone)
```

### Current Database Mapping (from JPA Entities)

This section documents the **current** database mapping as defined by the JPA entity annotations in `src/main/java/com/pentagon/emsapi/Models`.

**Common audit columns**
Most entities extend `BaseEntity`, which contributes:
- `created_at` (NOT NULL, set by auditing)
- `updated_at` (nullable)
- `deleted_at` (nullable, soft delete marker)

> Note: Some of the SQL snippets below in this document are **legacy / illustrative** and may not fully match this JPA mapping.

#### Table: `clients` (Entity: `Client`)
- `client_id` BIGINT PK AUTO_INCREMENT
- `name` VARCHAR(255) NOT NULL
- `phoneNo` VARCHAR(20)
- `emailId` VARCHAR(100)
- `address` VARCHAR(500)
- `created_at`, `updated_at`, `deleted_at`

#### Table: `product` (Entity: `Product`)
- `product_id` BIGINT PK AUTO_INCREMENT
- `product_name` VARCHAR(25) NOT NULL
- `product_type` VARCHAR(50) NOT NULL (Enum: `ProductType`)
- `standard_size` INT NULL
- `rate` DECIMAL(10,2) NULL

> Note: `Product` currently **does not** extend `BaseEntity`, so it has **no audit columns**.

#### Table: `inventory` (Entity: `Inventory`)
- `inventory_id` BIGINT PK AUTO_INCREMENT
- `product_id` BIGINT NOT NULL *(stored as scalar `productId`, not a JPA FK relationship)*
- `product_name` VARCHAR(...) NOT NULL *(denormalized)*
- `available_qty` DECIMAL(10,2) NOT NULL
- `reserved_qty` DECIMAL(10,2) NOT NULL
- `created_at`, `updated_at`, `deleted_at`

#### Table: `orders` (Entity: `Order`)
- `order_id` BIGINT PK AUTO_INCREMENT
- `client_id` BIGINT NOT NULL (FK → `clients.client_id`)
- `date` DATE NULL
- `total_amount` DECIMAL(10,2) NOT NULL
- `paid_amount` DECIMAL(10,2) NOT NULL
- `status` VARCHAR(50) (Enum: `OrderStatus`)
- `created_at`, `updated_at`, `deleted_at`

#### Table: `order_book` (Entity: `OrderBook`)
- `serial_no` BIGINT PK AUTO_INCREMENT
- `order_id` BIGINT NOT NULL (FK → `orders.order_id`)
- `item_id` BIGINT NOT NULL (FK → `product.product_id`) *(this is effectively product_id)*
- `quantity` DECIMAL(10,2) NOT NULL
- `quantity_fulfilled` DECIMAL(10,2)
- `quantity_for_production` DECIMAL(10,2)
- `rate` DECIMAL(10,2) NOT NULL
- `total` DECIMAL(10,2) NOT NULL
- `created_at`, `updated_at`, `deleted_at`

#### Table: `production` (Entity: `Production`)
- `production_id` BIGINT PK AUTO_INCREMENT
- `product_id` BIGINT NOT NULL (FK → `inventory.inventory_id`) *(mapped as `Inventory product`)*
- `machine_name` VARCHAR(100) NOT NULL
- `order_id` BIGINT NULL (FK → `orders.order_id`)
- `order_book_id` BIGINT NULL (FK → `order_book.serial_no`)
- `production_date` DATE NULL
- `planned_quantity` DECIMAL(10,2) NOT NULL
- `actual_quantity` DECIMAL(10,2) NOT NULL
- `rejected_quantity` DECIMAL(10,2) NOT NULL
- `good_quantity` DECIMAL(10,2) NOT NULL
- `remarks` VARCHAR(500)
- `created_at`, `updated_at`, `deleted_at`

#### Table: `raw_material_consumption` (Entity: `RawMaterialConsumption`)
- `consumption_id` BIGINT PK AUTO_INCREMENT
- `material_name` VARCHAR(255) NOT NULL
- `material_product_id` BIGINT NOT NULL (FK → `inventory.inventory_id`)
- `production_id` BIGINT NOT NULL (FK → `production.production_id`)
- `issue_date` DATE
- `issued_quantity` DECIMAL(10,2) NOT NULL
- `output_quantity` DECIMAL(10,2) NOT NULL
- `wastage` DECIMAL(10,2) NOT NULL
- `wastage_percentage` DECIMAL(5,2)
- `wastage_alert` BOOLEAN NOT NULL
- `remarks` VARCHAR(500)
- `created_at`, `updated_at`, `deleted_at`

#### Table: `payments` (Entity: `Payment`)
- `payment_id` BIGINT PK AUTO_INCREMENT
- `client_id` BIGINT NOT NULL (FK → `clients.client_id`)
- `order_id` BIGINT NULL (FK → `orders.order_id`)
- `payment_date` DATE
- `amount_paid` DECIMAL(10,2) NOT NULL
- `payment_mode` VARCHAR(50) (Enum: `PaymentMode`)
- `remarks` VARCHAR(500)
- `created_at`, `updated_at`, `deleted_at`

#### Table: `receivables` (Entity: `Receivable`)
- `receivable_id` BIGINT PK AUTO_INCREMENT
- `client_id` BIGINT NOT NULL UNIQUE (FK → `clients.client_id`)
- `total_due` DECIMAL(10,2) NOT NULL
- `aging_0_30` DECIMAL(10,2)
- `aging_31_60` DECIMAL(10,2)
- `aging_61_90` DECIMAL(10,2)
- `aging_over_90` DECIMAL(10,2)
- `created_at`, `updated_at`, `deleted_at`

#### Table: `machine_utilization` (Entity: `MachineUtilization`)
```sql
CREATE TABLE machine_utilization (
    utilization_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    machine_name VARCHAR(100) NOT NULL,
    utilization_date DATE NOT NULL,
    planned_runtime DECIMAL(10,2) NOT NULL,
    actual_runtime DECIMAL(10,2) NOT NULL,
    downtime DECIMAL(10,2) NOT NULL,
    downtime_reason VARCHAR(500),
    utilization_percentage DECIMAL(5,2),
    repeated_downtime_flag BOOLEAN NOT NULL,
    remarks VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### Table: `power_consumption` (Entity: `PowerConsumption`)
```sql
CREATE TABLE power_consumption (
    consumption_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    consumption_date DATE NOT NULL,
    units_consumed DECIMAL(10,2) NOT NULL,
    output_kg DECIMAL(10,2) NOT NULL,
    unit_per_kg DECIMAL(10,4),
    abnormal_spike_flag BOOLEAN NOT NULL,
    remarks VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication
Currently **no authentication** (future: JWT/OAuth2)

### Response Format
```json
{
  "field1": "value",
  "field2": 123,
  "createdAt": "2025-12-29T10:30:00",
  "updatedAt": "2025-12-29T10:30:00"
}
```

### Error Response
```json
{
  "timestamp": "2025-12-29T10:30:00",
  "status": 400,
  "error": "Business Rule Violation",
  "message": "Insufficient inventory for product 'Chair' (ID: 5). Requested: 150.00, Available: 100.00",
  "path": "/api/v1/inventory/5/deduct-stock"
}
```

### HTTP Status Codes
- `200 OK` - Success (GET, PUT)
- `201 Created` - Resource created (POST)
- `204 No Content` - Success, no response body (DELETE)
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `409 Conflict` - Business rule violation (e.g., insufficient stock)
- `500 Internal Server Error` - Unexpected error

### Complete Endpoint List

#### Clients
```
POST   /api/v1/clients
GET    /api/v1/clients
GET    /api/v1/clients/{id}
PUT    /api/v1/clients/{id}
DELETE /api/v1/clients/{id}
```

#### Products
```
POST   /api/v1/products                    # Create product (auto-creates inventory)
GET    /api/v1/products                    # Get all products
GET    /api/v1/products/{id}               # Get by ID
GET    /api/v1/products/type/{type}        # Filter by type
GET    /api/v1/products/search?name=...    # Search by name
PUT    /api/v1/products/{id}               # Update product
DELETE /api/v1/products/{id}               # Hard delete (permanent)
```

#### Admin
```
POST   /api/v1/admin/init-inventory        # Initialize inventory for existing products (one-time)
```

#### Inventory
```
POST   /api/v1/inventory
GET    /api/v1/inventory
GET    /api/v1/inventory/{id}
GET    /api/v1/inventory/type/{type}
GET    /api/v1/inventory/low-stock?threshold=10
POST   /api/v1/inventory/{id}/add-stock
POST   /api/v1/inventory/{id}/deduct-stock
```

#### Orders
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/{id}
GET    /api/v1/orders/client/{clientId}
POST   /api/v1/orders/{id}/complete
POST   /api/v1/orders/{id}/cancel
```

#### Production
```
POST   /api/v1/production
GET    /api/v1/production
GET    /api/v1/production/{id}
GET    /api/v1/production/product/{productId}
GET    /api/v1/production/order/{orderId}
GET    /api/v1/production/unlinked
```

#### Payments
```
POST   /api/v1/payments
GET    /api/v1/payments
GET    /api/v1/payments/{id}
GET    /api/v1/payments/client/{clientId}
GET    /api/v1/payments/order/{orderId}
GET    /api/v1/payments/date-range?startDate=...&endDate=...
```

#### Receivables
```
GET    /api/v1/receivables/client/{clientId}
GET    /api/v1/receivables
GET    /api/v1/receivables/outstanding
POST   /api/v1/receivables/update-aging
POST   /api/v1/receivables/client/{id}/update-aging
```

#### Machine Utilization
```
POST   /api/v1/machine-utilization
GET    /api/v1/machine-utilization
GET    /api/v1/machine-utilization/{id}
GET    /api/v1/machine-utilization/machine/{name}
GET    /api/v1/machine-utilization/date-range?start=...&end=...
GET    /api/v1/machine-utilization/repeated-downtime
```

#### Power Consumption
```
POST   /api/v1/power-consumption
GET    /api/v1/power-consumption
GET    /api/v1/power-consumption/{id}
GET    /api/v1/power-consumption/date-range?start=...&end=...
GET    /api/v1/power-consumption/abnormal-spikes
```

#### Raw Material Consumption
```
POST   /api/v1/raw-material-consumption
GET    /api/v1/raw-material-consumption
GET    /api/v1/raw-material-consumption/{id}
GET    /api/v1/raw-material-consumption/high-wastage
GET    /api/v1/raw-material-consumption/material/{name}
```

---

## 🧪 Testing Strategy

### Test Pyramid
```
                    ▲
                   / \
                  /   \
                 / E2E \ (Future)
                /_______\
               /         \
              /Integration\ (7 tests)
             /_____________\
            /               \
           /   Unit Tests    \ (73 tests)
          /___________________\
```

### Unit Tests (73 tests)
- **Framework**: JUnit 5 + Mockito + AssertJ
- **Approach**: Mock all dependencies
- **Coverage**: Service layer business logic

**Test Classes**:
- InventoryServiceTest (8 tests)
- ProductionServiceTest (8 tests)
- PaymentServiceTest (8 tests)
- OrderServiceTest (5 tests)
- PowerConsumptionServiceTest (6 tests)
- MachineUtilizationServiceTest (8 tests)
- RawMaterialServiceTest (9 tests)

### Integration Tests (7 tests)
- **Framework**: @SpringBootTest + H2
- **Database**: H2 in-memory
- **Coverage**: Transaction integrity, rollback

**Test Classes**:
- TransactionIntegrityTest (6 tests)
- EmsApiApplicationTests (1 test - context loads)

### Repository Tests (Example: 10 tests)
- **Framework**: @DataJpaTest
- **Coverage**: Custom JPQL queries
- **Example**: MachineUtilizationRepositoryTest

### Controller Tests (Example: 8 tests)
- **Framework**: MockMvc + Mockito
- **Coverage**: REST endpoints
- **Example**: MachineUtilizationControllerTest

### DTO Tests (Example: 11 tests)
- **Framework**: Jakarta Validation
- **Coverage**: Validation constraints
- **Example**: CreateMachineUtilizationRequestTest

### Running Tests
```bash
# All tests
mvn test

# Specific test class
mvn test -Dtest=InventoryServiceTest

# Specific test method
mvn test -Dtest=OrderServiceTest#createOrder_withSufficientInventory

# Integration tests only
mvn test -Dtest=TransactionIntegrityTest

# Exclude integration tests
mvn test -Dtest='!TransactionIntegrityTest'
```

---

## ⚙ Configuration

### application.properties (Production)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/ems
spring.datasource.username=root
spring.datasource.password=root123
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update

# Business Rules
app.wastage.threshold=10.0
app.downtime.repeated.days=3
app.downtime.repeated.threshold=2
app.power.spike.threshold=30.0
app.power.spike.lookback.days=7
```

### application-test.properties (Testing)
```properties
# H2 In-Memory Database
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false

# Disable Flyway/Liquibase
spring.autoconfigure.exclude=\
  org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,\
  org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration
```

### Configuration Classes
```java
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    // Enables @Transactional support
}
```

---

## 🚀 Deployment Guide

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8+

### Build
```bash
# Clean and build
mvn clean install

# Skip tests
mvn clean install -DskipTests

# Run tests
mvn test
```

### Run Locally
```bash
# Using Maven
mvn spring-boot:run

# Using JAR
java -jar target/ems-api-0.0.1-SNAPSHOT.jar
```

### Database Setup
```sql
-- Create database
CREATE DATABASE ems CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'emsuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON ems.* TO 'emsuser'@'localhost';
FLUSH PRIVILEGES;
```

### Environment Variables
```bash
# Database
export DB_URL=jdbc:mysql://localhost:3306/ems
export DB_USERNAME=root
export DB_PASSWORD=root123

# Application
export SPRING_PROFILES_ACTIVE=prod
export SERVER_PORT=8080
```

### Health Check
```bash
# Check if application is running
curl http://localhost:8080/api/v1/clients

# Expected: 200 OK with JSON response
```

---

## � CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment. All
workflows live under `.github/workflows/`.

### Branching Strategy
```
feature/**  ──PR──▶  develop  ──PR──▶  main  ──auto-deploy──▶  production
```
- `feature/**` — day-to-day work; build + test only (no image publish).
- `develop` — integration branch; build + test + publish integration image to GHCR.
- `main` — **production branch**; build + test + publish `:latest` image, then auto-deploy.

> **Production deploys happen from `main` ONLY.** There is no manual deploy trigger.

### Workflows

#### 1. `build.yml` — Build (CI)
Triggers on pushes to `main`, `develop`, `feature/**`, and PRs to `main`/`develop`.

| Stage | Action |
|-------|--------|
| Build | `./mvnw clean package -DskipTests`, uploads JAR artifact |
| Test | `./mvnw test`, uploads Surefire reports |
| Docker | Builds & pushes image to **GHCR** — only on pushes to `develop` and `main`. The `:latest` tag is published **only from `main`**. |

Image registry: `ghcr.io/ranaplastic/ems-api`

#### 2. `deploy.yml` — Deploy (CD, main only)
- **Trigger:** `workflow_run` — runs automatically after **Build** completes
  **successfully** on `main` (`branches: [main]`).
- **Guard:** job runs only if `workflow_run.conclusion == 'success'` **and**
  `workflow_run.head_branch == 'main'`.
- **Target:** deploys the `:latest` image over SSH to the AWS Lightsail host.
- **Environment:** `production` (holds the deployment secrets).
- **Health gate:** polls `/actuator/health` after `docker compose up`; the job fails
  if the app never reports `UP`.
- Records the current image in `.deployed_image` (and prior one in `.previous_image`)
  on the server so a rollback can revert.

#### 3. `rollback.yml` — Rollback
- **Automatic:** runs when the **Deploy** workflow finishes with a **failure**,
  reverting to the last known-good image recorded on the server.
- **Manual:** `workflow_dispatch` with an optional `image_tag` to roll back to a
  specific version.

### GitHub Environment & Secrets

A `production` environment (Settings → Environments) holds the deploy secrets:

| Secret | Purpose |
|--------|---------|
| `LIGHTSAIL_HOST` | Server IP / hostname (`13.205.6.156` or `ems.ranaplastics.com`) |
| `LIGHTSAIL_USER` | SSH user (`deploy`) |
| `LIGHTSAIL_SSH_KEY` | Private SSH key whose public key is in `~deploy/.ssh/authorized_keys` |

> Required-reviewer approval gates need a public repo or a paid plan (Pro/Team/Enterprise)
> for private repos. As a free alternative, restrict the environment’s
> **Deployment branches** to `main` (belt-and-suspenders with the workflow branch guard).

### Deployment Flow (main → production)
```
Merge PR into main
    ↓
Build workflow: test + publish ghcr.io/.../ems-api:latest
    ↓ (on success, main only)
Deploy workflow: SSH to Lightsail → docker compose pull + up
    ↓
Health check /actuator/health
    ↓                         ↘ (fails)
  UP → done                Rollback workflow → previous image
```

### Server Layout (AWS Lightsail)
- Path: `/opt/rana-plastics/ems-api` (owned by `deploy`, member of `docker` group)
- Stack: nginx (80/443) → ems-api (`127.0.0.1:8080`) → mysql (internal) — see
  `docker-compose.yml`
- Domain: `ems.ranaplastics.com`; TLS via Let's Encrypt (certbot auto-renew). Bootstrap
  certs once with `scripts/init-letsencrypt.sh`.

---

## �📚 Additional Resources

### Documentation Files
- `TEST_FAILURES_FIXED_REPORT.md` - Unit test fixes
- `INTEGRATION_TESTS_FIXED.md` - Integration test fixes
- `CONTROLLER_REPOSITORY_DTO_TESTS_COMPLETE.md` - Additional test coverage
- `TRANSACTION_SAFETY_COMPLETE.md` - Transaction safety documentation
- `PROJECT_COMPLETE_SUMMARY.md` - Overall project summary

### Future Enhancements
1. **Security**: JWT authentication, role-based access
2. **Reporting**: Dashboard, analytics, export to Excel/PDF
3. **Notifications**: Email alerts for low stock, high wastage
4. **Batch Processing**: Scheduled jobs for aging calculation
5. **API Documentation**: Swagger/OpenAPI integration
6. **Caching**: Redis for frequently accessed data
7. **Audit Trail**: Track all data changes
8. **Multi-tenant**: Support multiple companies

---

## 🎯 Quick Reference

### Key Business Flows

#### 1. Order Processing Flow
```
Customer places order
    ↓
System checks inventory
    ↓
IF (stock available):
    Fulfill from inventory
    Deduct stock
ELSE:
    Mark for production
    ↓
Order completed
    ↓
Create/Update receivable
```

#### 2. Production Flow
```
Production recorded
    ↓
Calculate good quantity (actual - rejected)
    ↓
IF (linked to order):
    Fulfill pending order
    Add overflow to inventory
ELSE:
    Add to inventory
```

#### 3. Payment Flow
```
Payment received
    ↓
Validate against receivable
    ↓
IF (amount ≤ totalDue):
    Reduce receivable
    Save payment
ELSE:
    Reject (overpayment)
```

### Critical Validations
✅ Inventory cannot go negative  
✅ Payment cannot exceed receivable  
✅ One receivable per client  
✅ Good quantity = actual - rejected  
✅ Wastage % triggers alert if > 10%  
✅ Downtime pattern detection  
✅ Power spike detection (30% deviation)  
✅ Product automatically creates inventory entry  
✅ Validation annotations match field types (@NotNull for Long, @NotBlank for String)

---

## 🆕 Recent Updates

### January 6, 2026 - Product Module Enhancements

#### 1. Field Name Refactoring
- **Changed**: `itemName` → `productName` across all Product DTOs and services
- **Reason**: Consistency with database column name `product_name`
- **Impact**: All API requests/responses now use `productName`

#### 2. Automatic Inventory Creation
- **Feature**: Products now automatically create inventory entries on creation
- **Benefit**: Prevents foreign key errors when creating orders
- **Details**: When `POST /api/v1/products` is called, system automatically creates inventory record with qty=0

#### 3. Admin Initialization Endpoint
- **Endpoint**: `POST /api/v1/admin/init-inventory`
- **Purpose**: One-time migration to create inventory for existing products
- **Usage**: Run once after deployment to sync product → inventory

#### 4. Validation Fixes
- **Fixed**: `CreateInventoryRequest` validation (changed `@NotBlank` to `@NotNull` for `productId` field)
- **Reason**: `@NotBlank` only works with String types, not Long

#### 5. Database Schema Alignment
- **Product Entity**: Removed BaseEntity inheritance (no audit columns)
- **Table Name**: `product` (singular, not plural)
- **Fields**: Simplified to 5 fields (productId, productName, productType, standardSize, rate)

### Implementation Files
- ✅ `AdminController.java` - New admin endpoints
- ✅ `ProductServiceImpl.java` - Auto-inventory creation logic
- ✅ `ProductRepository.java` - Simplified queries
- ✅ All Product DTOs - Updated to use `productName`

