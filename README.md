# Hotel Management System – Hotel Amin International

This is a real-time Hotel Management System developed for **Hotel Amin International**. It is a full-featured backend solution that handles bookings, reservations, payments, feedback, housekeeping, inventory, user roles, and more. The system is built using **NestJS**, **TypeORM**, and **PostgreSQL**, with secure **JWT-based authentication** and **role-based access control**.

---

## 🛠 Technologies Used

- **Backend**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + bcrypt
- **Authorization**: Role-Based Access Control (RBAC)

---

## 📦 Features

### 🔐 Auth Module

- Register and login users securely
- JWT token-based session management
- Role-based user access (Admin, User, Staff)

### 🧑‍💼 Admin Module

- Manage all users and staff
- Assign roles and permissions
- View reports and system settings

### 🛏 Booking Module

- Check room availability and book
- Apply coupons and calculate pricing
- Modify or cancel bookings
- Booking history with extra services

### 💳 Billing Module

- Record and view all payments
- Generate invoices and receipts
- Track due amounts and payment history

### 📅 Reservation Module

- Reserve rooms ahead of time
- Confirm or cancel reservations
- View reservation history

### 🧹 Housekeeping Module

- Record housekeeping tasks
- Update room cleanliness status
- Issue tracking for maintenance

### 📦 Inventory Module

- Add/update inventory items
- Track item usage and restocking
- Manage orders and availability

### 🍽 Restaurant Module

- Manage restaurant menu items
- Place food orders by room/booking
- Order history and billing support

### 🛏 Room Module

- Manage room details and availability
- Track issues and assign housekeeping

### 👨‍💼 Salary Module

- Record employee salaries and bonuses
- Track salary history and actions
- Ensure transparency and audit

### 👤 User Module

- Profile management
- View booking and payment history

### ⭐ Feedback Module

- Submit and view customer feedback

---

## 📁 Project Structure

```
src/
├── modules/
│ ├── auth/
│ ├── admin/
│ ├── booking/
│ ├── billing/
│ ├── confirmation/
│ ├── coupon/
│ ├── Management/
│ ├── reservation/
│ ├── housekeeping/
│ ├── inventory/
│ ├── restaurant/
│ ├── room/
│ ├── salary/
│ ├── user/
│ └── feedback/
├── entities/
├── common/
├── app.module.ts
├── main.ts
.env
ormconfig.json
package.json
README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Sikhul007/Hotel-Amin-Adv.-Web.git
cd Full-Stack
```

### 2. Create Table in Postgresql

```
Create a new Table in postgresql
Name: hotel_management
password : root
```

### 3. Install Dependencies

```
npm i
```

### 4. Create a .env file and set:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=hotel_db
JWT_SECRET=your_jwt_secret
```

### 5. Start the Server

```
npm run start:dev
```

### 6.

```
http://localhost:3000/api
```

### Right now backend completely ready... working on process for frontend.

### Thank you.
