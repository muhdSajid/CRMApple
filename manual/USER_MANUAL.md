# 📘 Inventory Management System - User Manual

**Version:** 2.0  
**Last Updated:** November 26, 2025  
**System:** React + Spring Boot + PostgreSQL  
**Server:** 27.34.245.92

---

## 📑 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard](#dashboard)
4. [Medicine Stock Management](#medicine-stock-management)
5. [Medicine Distribution](#medicine-distribution)
6. [Costing Reports](#costing-reports)
7. [Settings & Configuration](#settings--configuration)
8. [User Management](#user-management)
9. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 🚀 Getting Started

### System Access

- **URL:** http://27.34.245.92
- **Requirements:** Modern web browser (Chrome, Firefox, Safari, Edge)
- **Internet:** Required (for database connectivity)

### Browser Compatibility

- ✅ Google Chrome 90+
- ✅ Mozilla Firefox 88+
- ✅ Apple Safari 14+
- ✅ Microsoft Edge 90+

### First Time Setup

1. Open http://27.34.245.92 in your browser
2. You'll be redirected to the login page if not authenticated
3. Sign in with your credentials (provided by system administrator)
4. On first login, you may be prompted to change your password

---

## 🔐 Authentication

### Login

**Steps:**

1. Navigate to http://27.34.245.92
2. Enter your email address
3. Enter your password
4. Click **"Sign In"** button
5. You'll be directed to the Dashboard

**Note:** Invalid credentials will show an error message. Contact your administrator if you forget your password.

### Password Management

#### Change Password

1. Log in to your account
2. Click your profile name in the top-right corner
3. Select **"Change Password"** from the dropdown menu
4. Enter your current password
5. Enter your new password
6. Confirm your new password
7. Click **"Update Password"**

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&\*)

#### Forgot Password

Contact your system administrator. They can reset your password from the User Management section.

### Session Management

- **Session Duration:** 24 hours
- **Auto-Logout:** You'll be logged out after 24 hours of inactivity
- **Logout:** Click your name in top-right corner → "Logout"

---

## 📊 Dashboard

The Dashboard provides an overview of key metrics and reports for the entire system.

### Dashboard Overview

**Available Widgets:**

#### 1. **Donation Report**

- Shows donation received by location
- **Filters:** Month/Year selector
- **Display:** Amount in ₹ (Indian Rupees)
- **Breakdown:** Visual progress bar with location-wise breakdown

**How to Use:**

1. Select a month/year from the dropdown
2. View total donations received
3. See location-wise breakdown below the progress bar
4. Each location shows donation amount and percentage

#### 2. **Purchase Analytics**

- Displays medicine purchase data
- **Filters:** Year selector
- **Metrics:** Total purchases, trending medicines
- **View:** Charts and statistics

**How to Use:**

1. Select a year from the dropdown
2. View purchase statistics
3. Analyze trending medicines
4. Identify high-demand items

#### 3. **Critical Stock Report**

- Highlights medicines running low on stock
- **Threshold:** Medicines below minimum quantity
- **Urgency:** Color-coded by stock level
- **Action:** Quick access to reorder options

**How to Use:**

1. View medicines with critically low stock
2. Note the current quantity and minimum required
3. Click on medicine to view details
4. Quick reorder link if available

#### 4. **Expense Report**

- Tracks medicine expenses by category
- **Filters:** Location selector, Year selector
- **Display:** Pie chart with expense breakdown
- **Metrics:** Total expenses in ₹

**How to Use:**

1. Select location and year
2. View total expenses
3. See expense distribution by medicine category
4. Analyze spending patterns

### Dashboard Permissions

- **Access Required:** `dashboard.view` privilege
- **Who Can See:** Users with Dashboard View permission

---

## 💊 Medicine Stock Management

Manage your medicine inventory efficiently with comprehensive stock tracking.

### Accessing Medicine Stock

**Steps:**

1. Click **"Medicine Stock"** in the left sidebar
2. You'll see a list of all medicines with their current stock levels

### Stock View Features

#### Column Headers

| Column        | Description                                       |
| ------------- | ------------------------------------------------- |
| Medicine Name | Name of the medicine                              |
| Category      | Medicine category (e.g., Antibiotic, Pain Relief) |
| Quantity      | Current stock quantity                            |
| Unit          | Unit of measurement (tablets, bottles, etc.)      |
| Minimum Level | Minimum quantity to maintain                      |
| Status        | Stock status (In Stock, Low Stock, Critical)      |
| Actions       | Edit, Delete, or View Details                     |

### Viewing Stock Details

1. Click on any medicine row to expand details
2. View:
   - Complete medicine information
   - Batch details with expiry dates
   - Historical stock movements
   - Last updated timestamp
3. Click again to collapse

### Adding Medicine to Stock

**Prerequisites:** `medicine.stock.create` privilege

**Steps:**

1. Click **"+ Add Medicine"** button
2. Fill in the form:
   - **Medicine Name:** Enter medicine name
   - **Category:** Select from dropdown
   - **Quantity:** Enter current quantity
   - **Unit:** Select unit (tablets, bottles, ml, etc.)
   - **Minimum Level:** Set minimum quantity to trigger alert
   - **Manufacturer:** Enter manufacturer name
   - **Price Per Unit:** Enter cost per unit
3. Click **"Add Medicine"**

**Validation:**

- All fields are required
- Quantity must be a positive number
- Minimum level should not exceed quantity

### Batch Management

#### Adding Batch (Lot) to Medicine

**Prerequisites:** `medicine.stock.batch.add` privilege

**Steps:**

1. Select a medicine from the list
2. Click **"Manage Batches"** or **"Add Batch"** option
3. Fill batch details:
   - **Batch Number:** Unique identifier (e.g., LOT20250001)
   - **Expiry Date:** Date when medicine expires
   - **Quantity:** Number of units in this batch
   - **Manufacturing Date:** When produced
   - **Cost Price:** Cost per unit for this batch
4. Click **"Add Batch"**

**Important:** Batches help track medicine origin, expiry, and quality. Always maintain proper batch records.

#### Editing Batch

**Prerequisites:** `medicine.stock.batch.edit` privilege

1. Click on a medicine to view its batches
2. Find the batch to edit
3. Click **"Edit"** icon
4. Modify the details
5. Click **"Save Changes"**

#### Deleting Batch

**Prerequisites:** `medicine.stock.batch.delete` privilege

⚠️ **Warning:** Deleting a batch removes all stock records for that batch.

1. Find the batch to delete
2. Click **"Delete"** icon
3. Confirm deletion
4. Batch and associated stock are removed

### Stock Updates

#### Manual Stock Update

1. Find the medicine in the list
2. Click **"Edit"** or the medicine row
3. Update the **"Quantity"** field
4. Click **"Update"**
5. System records the change with timestamp

#### Bulk Stock Update

**Coming Soon:** Feature to update multiple medicines at once via CSV import.

### Stock Search & Filter

**Search by:**

- Medicine name (type in search box)
- Category (select from dropdown)
- Status (In Stock, Low Stock, Critical)

**Sort by:**

- Medicine Name (A-Z)
- Quantity (Low to High)
- Category
- Status

### Stock Alerts

The system automatically alerts when:

- ✅ Stock falls below minimum level → "Low Stock" status (Yellow)
- ✅ Stock critically low (< 50% of minimum) → "Critical" status (Red)
- ✅ Batch nearing expiry (within 3 months) → "Expiry Alert"

---

## 🚚 Medicine Distribution

Track distribution of medicines to different locations and patients.

### Distribution Dashboard

**Steps to Access:**

1. Click **"Medicine Distribution"** in sidebar
2. View overview of all distributions
3. Filter by status, location, or date range

### Creating Distribution

**Prerequisites:** `medicine.distribution.create` privilege

#### Step 1: Select Distribution Type

Choose how to distribute medicines:

- **By Location:** Distribute to specific delivery centers
- **By Patient:** Distribute to individual patients

#### Step 2: Distribution by Location

1. Click **"New Distribution"** → **"By Location"**
2. Select delivery center/location
3. Fill in distribution details:
   - **Distribution Date:** When medicine is being sent
   - **Received By:** Name of person receiving
   - **Notes:** Any special instructions
4. Add medicines to distribute:
   - Click **"Add Medicine"**
   - Select medicine name
   - Enter quantity to distribute
   - Confirm unit price (auto-filled)
5. Review total cost
6. Click **"Create Distribution"**

#### Step 3: Distribution by Patient

1. Click **"New Distribution"** → **"By Patient"**
2. Search and select patient:
   - Enter patient name/ID
   - Select from suggestions
3. Fill patient distribution details:
   - **Delivery Date:** When patient receives medicine
   - **Urgency Level:** Normal, Urgent, Critical
   - **Distribution Reason:** General, Special, Urgent Need
4. Add medicines:
   - Click **"Add Medicine"**
   - Select medicine
   - Enter prescribed quantity
   - Add notes (e.g., "Take 2 tablets daily")
5. Click **"Distribute"**

### Distribution Status Tracking

**Status Types:**

- 🟢 **Pending:** Awaiting processing
- 🟡 **In Transit:** Medicine on the way
- 🔵 **Delivered:** Successfully delivered
- ⚫ **Cancelled:** Distribution cancelled
- 🔴 **Failed:** Delivery failed

### Distribution History

1. Go to Medicine Distribution
2. Click **"View History"**
3. Filter by:
   - Date range
   - Location
   - Patient
   - Status
4. View detailed distribution record:
   - Medicines included
   - Quantities
   - Cost
   - Delivery confirmation

---

## 💰 Costing Reports

Generate detailed financial reports on medicine costs and expenses.

### Accessing Costing

1. Click **"Costing"** in the sidebar
2. Select report type:
   - **Location Cost Report**
   - **Medicine Category Expense**
   - **Time Period Analysis**

### Location Cost Report

**Steps:**

1. Select **"Location Cost Report"**
2. Choose location from dropdown
3. Select month and year
4. View:
   - Total cost for location in that period
   - Medicine-wise cost breakdown
   - Quantity distributed per medicine
5. Export report (PDF/Excel) if needed

### Medicine Category Expense

**Steps:**

1. Select **"Category Expense"**
2. Choose year
3. View pie chart showing:
   - Cost by medicine category
   - Percentage distribution
   - Total expense for each category
4. Click on a category to drill down into details

### Generate Custom Report

1. Click **"Generate Report"**
2. Select options:
   - **Report Type:** Expense, Purchase, Distribution
   - **Date Range:** Select start and end date
   - **Location(s):** Single or multiple locations
   - **Medicine Category:** All or specific categories
   - **Include:** Quantities, Costs, Summaries
3. Click **"Generate"**
4. View report in browser or export

### Export Options

- 📄 **PDF:** Print-ready format
- 📊 **Excel:** Editable spreadsheet format
- 📋 **CSV:** For data analysis tools

**How to Export:**

1. Generate or view the report
2. Click **"Export"** button
3. Choose format (PDF/Excel/CSV)
4. File downloads automatically

---

## ⚙️ Settings & Configuration

Manage system configuration, medicine types, locations, and roles.

### Accessing Settings

1. Click **"Settings"** in the sidebar
2. Choose from:
   - Medicine Types
   - Locations
   - Role Management

### Medicine Types Management

**Prerequisites:** `settings.medicine.types.manage` privilege

#### View All Medicine Types

1. Go to Settings → Medicine Types
2. See all medicine categories in the system
3. Filter or search for specific types

#### Add New Medicine Type

1. Click **"+ Add Medicine Type"**
2. Enter:
   - **Type Name:** e.g., "Antibiotics", "Pain Relief"
   - **Description:** Brief description of category
   - **Code:** Short unique code (e.g., "AB", "PR")
3. Click **"Add"**

#### Edit Medicine Type

1. Find the medicine type in the list
2. Click **"Edit"** icon
3. Update the details
4. Click **"Save"**

#### Delete Medicine Type

⚠️ **Warning:** Can only delete if no medicines are assigned to this type.

1. Find the medicine type
2. Click **"Delete"** icon
3. Confirm deletion

### Location Management

**Prerequisites:** `settings.location.manage` privilege

Locations represent delivery centers or distribution points.

#### View All Locations

1. Go to Settings → Locations
2. See list of all delivery centers
3. View location details, address, contact

#### Add New Location

1. Click **"+ Add Location"**
2. Fill location details:
   - **Location Name:** Name of delivery center
   - **Address:** Full address
   - **City/District:** City or district
   - **State:** State/Province
   - **PIN/Postal Code:** Postal code
   - **Phone:** Contact phone number
   - **Email:** Contact email
   - **Manager:** Responsible person name
   - **Type:** Delivery Center, Warehouse, Hospital
3. Click **"Add Location"**

#### Edit Location

1. Find location in list
2. Click **"Edit"**
3. Update details
4. Click **"Save Changes"**

#### View Location Details

1. Click on location name to view:
   - Complete address
   - Contact details
   - Stock at this location
   - Recent distributions
   - Manager information

#### Delete Location

⚠️ **Warning:** Location must have no active distributions or stock.

1. Find location
2. Click **"Delete"**
3. Confirm deletion

---

## 👥 User Management

Manage system users, roles, and their permissions.

**Prerequisites:** `user.read` or higher privilege

### Accessing User Management

1. Click **"Settings"** → **"User Management"**
2. View all system users

### User List

**Columns:**
| Column | Description |
|--------|-------------|
| Name | User's full name |
| Email | Email address (login ID) |
| Role | Assigned role |
| Status | Active/Inactive |
| Created | Account creation date |
| Last Login | Last login timestamp |
| Actions | Edit, Reset Password, Deactivate |

### Creating New User

**Prerequisites:** `user.create` privilege

**Steps:**

1. Click **"+ Add User"** button
2. Fill user details:
   - **First Name:** User's first name
   - **Last Name:** User's last name
   - **Email:** Email (used for login)
   - **Phone:** Contact number
   - **Role:** Select role (e.g., Admin, Manager, Operator)
   - **Status:** Active/Inactive
3. Click **"Create User"**
4. System generates temporary password (sent to email)

### Editing User

**Prerequisites:** `user.update` privilege

1. Find user in the list
2. Click **"Edit"** icon
3. Update details:
   - Name, phone, role
   - Status (Active/Inactive)
4. Click **"Update User"**

### Resetting User Password

**Prerequisites:** `user.update` privilege

1. Find user in list
2. Click **"Reset Password"** option
3. Confirm action
4. New temporary password is generated
5. User receives password reset email

### Deactivating User

**Prerequisites:** `user.delete` privilege

1. Find user in list
2. Click **"Deactivate"** or status toggle
3. Confirm deactivation
4. User can no longer log in

### Activating User

1. Filter by "Inactive Users"
2. Find user
3. Click **"Activate"**
4. User can now log in

---

## 🔑 Role Management

Define roles and assign permissions (privileges) to control user access.

**Prerequisites:** `settings.role.manage` privilege

### Accessing Role Management

1. Click **"Settings"** → **"Role Management"**
2. View all system roles

### Role List

Shows all roles with:

- Role name
- Description
- Number of users with this role
- Status
- Actions

### Creating New Role

1. Click **"+ Add Role"**
2. Enter role details:
   - **Role Name:** Unique role identifier (e.g., "Stock Manager")
   - **Display Name:** User-friendly name (e.g., "Medicine Stock Manager")
   - **Description:** What this role does
3. Select permissions:
   - Dashboard View
   - Medicine Stock (View, Create, Update, Batch Management)
   - Distribution (View, Create, Details)
   - Costing (View reports)
   - Settings (Medicine Types, Locations)
   - User Management
4. Click **"Create Role"**

### Editing Role

1. Find role in list
2. Click **"Edit"**
3. Update:
   - Description
   - Permissions
4. Click **"Save Changes"**

### Assigning Permissions

When creating or editing a role:

1. See the permissions list grouped by feature
2. Check boxes for permissions this role should have:
   - ✅ **Dashboard.view** - Can see dashboard
   - ✅ **medicine.stock.view** - Can view stock
   - ✅ **medicine.stock.create** - Can add new medicines
   - ✅ **medicine.distribution.create** - Can create distributions
   - ✅ **Report.costing** - Can view costing reports
   - ✅ **settings.location.manage** - Can manage locations
   - ✅ **user.read** - Can view users
   - ✅ **user.create** - Can create new users

### Deleting Role

⚠️ **Warning:** Cannot delete a role if users are assigned to it.

1. Reassign all users in this role to another role
2. Then click **"Delete"** on the role
3. Confirm deletion

### Predefined Roles

The system comes with these default roles:

#### 1. **Admin**

- Full system access
- Manage all features, users, and settings

#### 2. **Manager**

- View dashboards and reports
- Manage medicine stock
- Create distributions
- View user list (cannot create/edit)

#### 3. **Operator**

- View medicine stock
- Create distributions
- Cannot access settings or user management

#### 4. **Viewer**

- View-only access to dashboards
- Cannot make changes
- Cannot delete or edit

---

## 📚 Help & Support

### Help Center

Access built-in help documentation:

1. Click **"Help Center"** in sidebar
2. Browse articles by topic
3. Search for specific help topics

### FAQ

Get quick answers to common questions:

1. Click **"FAQ"** in sidebar
2. Browse frequently asked questions
3. Expand answers for more details

### User Guide

Access detailed user guide:

1. Click **"Help Center"** → **"User Guide"**
2. Step-by-step guides for all features

### Troubleshooting

#### "Unable to Log In"

- Check email address (case-insensitive)
- Verify password (case-sensitive)
- Contact administrator if forgotten

#### "Access Denied" or "No Permission"

- Your role doesn't have this privilege
- Contact administrator to request access
- Visit Settings to see what features you can access

#### "No Data Showing"

- Page may still be loading (wait a few seconds)
- Filters might be hiding data (check filter selections)
- You may not have permission to view that data
- Refresh the page (F5)

#### "Page Not Loading"

- Check internet connection
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser
- Contact system administrator

#### "Changes Not Saving"

- Check all required fields are filled (marked with \*)
- Ensure you have edit permission for that feature
- Try again, contact administrator if persists

#### Session Expired

- You'll be automatically logged out after 24 hours
- Log in again with your credentials
- Save your work regularly

---

## 🎯 Common Workflows

### Workflow 1: Receiving & Adding New Medicine Stock

1. **Log in** to the system
2. Go to **Medicine Stock**
3. Click **"+ Add Medicine"**
4. Enter medicine details (name, category, quantity, etc.)
5. Click **"Add Medicine"**
6. Click **"Manage Batches"** for that medicine
7. Click **"Add Batch"** and enter batch details
8. Medicine is now in inventory and ready to distribute

### Workflow 2: Distributing Medicine to a Location

1. Go to **Medicine Distribution**
2. Click **"+ New Distribution"** → **"By Location"**
3. Select the delivery center/location
4. Enter distribution date and receiver details
5. Click **"Add Medicine"** for each medicine to distribute
6. Select medicine and quantity
7. Review total cost
8. Click **"Create Distribution"**
9. Distribution is recorded and tracked

### Workflow 3: Generating Cost Report

1. Go to **Costing**
2. Select **"Location Cost Report"**
3. Choose location and time period
4. Review the report
5. Click **"Export"** to download as PDF/Excel
6. Share or print as needed

### Workflow 4: Creating New User Account

1. Go to **Settings** → **User Management**
2. Click **"+ Add User"**
3. Enter user details
4. Select role (e.g., "Manager", "Operator")
5. Click **"Create User"**
6. User receives email with login credentials
7. User can log in and change password

### Workflow 5: Checking Low Stock Items

1. Go to **Dashboard**
2. View **Critical Stock Report** widget
3. See all medicines running low on stock
4. Click on medicine to view details
5. Click **"Reorder"** or go to Medicine Stock to add more

---

## 📊 Understanding the Dashboard Metrics

### Donation Report

- **What it shows:** Total donations received by location
- **How to read:**
  - Main number = Total donations in ₹
  - Progress bar = Percentage from each location
  - Cards = Individual location amounts
- **Use case:** Track fundraising/donation status by location

### Purchase Analytics

- **What it shows:** Medicine purchase trends
- **How to read:** Charts and graphs
- **Use case:** Identify popular medicines, plan future purchases

### Critical Stock Report

- **What it shows:** Medicines below minimum stock level
- **How to read:** Color-coded urgency
  - 🔴 Red = Very low (critical)
  - 🟡 Yellow = Low
  - 🟢 Green = Adequate
- **Use case:** Quick identification of items needing reorder

### Expense Report

- **What it shows:** Breakdown of medicine expenses
- **How to read:** Pie chart by category
- **Use case:** Understand spending patterns, budget planning

---

## 🔒 Security Best Practices

1. **Never share your password** with anyone
2. **Change password regularly** (at least every 3 months)
3. **Logout when done** - especially on shared computers
4. **Don't leave your computer unattended** while logged in
5. **Clear browser cache** on shared computers (Ctrl+Shift+Delete)
6. **Report suspicious activity** to administrator immediately
7. **Use strong passwords** - mix of uppercase, lowercase, numbers, symbols
8. **Verify URLs** - always access from bookmarked or verified link

---

## 💡 Tips & Tricks

1. **Keyboard Shortcuts:**

   - `Ctrl + F` = Search on page
   - `Ctrl + P` = Print
   - `F5` = Refresh page
   - `Esc` = Close dialogs/modals

2. **Efficiency Tips:**

   - Use search to quickly find medicines
   - Set filters to view only what you need
   - Bookmark important pages for quick access
   - Export reports for sharing and archiving

3. **Data Entry:**

   - Fill required fields (marked with \*)
   - Double-check quantities before confirming
   - Use clear descriptions in notes
   - Include batch numbers when relevant

4. **Reporting:**
   - Generate reports regularly for records
   - Set custom date ranges for analysis
   - Export to Excel for further analysis
   - Keep audit trail of all changes

---

## ❓ FAQ

### Q: How do I change my password?

**A:** Go to top-right profile menu → Change Password → Enter current and new password → Update

### Q: What if I forgot my password?

**A:** Contact your system administrator to reset it. They can generate a temporary password.

### Q: Can I have multiple locations?

**A:** Yes! Go to Settings → Locations → Add multiple delivery centers. Each can have its own stock.

### Q: How do I know what permissions I have?

**A:** Check your user profile. Your role determines what features you can access. Contact admin to request more access.

### Q: Can I delete a distribution after creating it?

**A:** Contact your administrator. Only users with delete privileges can remove distributions.

### Q: How long does data stay in the system?

**A:** All data is archived and retained for audit purposes. Contact administrator for data retention policy.

### Q: Can I export data in other formats?

**A:** Currently supports PDF and Excel. CSV export coming soon.

### Q: What if I see "No Data Available"?

**A:** Check date filters, location filters, or permissions. Page might also still be loading - wait a moment.

### Q: How do I report a problem?

**A:** Contact your system administrator with:

- What you were trying to do
- What went wrong
- Error message (if any)
- Screenshot if possible

### Q: Can I access this on mobile?

**A:** Yes, the app is responsive. Works on mobile browsers, but tablet/desktop recommended for best experience.

---

## 📞 Support Contact Information

For technical support or issues:

- **Administrator:** [Your Admin Name/Email]
- **Support Email:** support@inventory.local
- **Help Center:** Available in-app at Help Center
- **Phone:** [Support Phone Number]
- **Business Hours:** [Specify Hours]

---

## 📝 System Information

| Property       | Value                            |
| -------------- | -------------------------------- |
| Application    | Inventory Management System v2.0 |
| Server         | 27.34.245.92                     |
| Database       | PostgreSQL                       |
| Frontend       | React 19 with Vite               |
| Backend        | Spring Boot                      |
| Authentication | JWT (24-hour sessions)           |
| Backup         | Daily automated backups          |

---

## 🔄 Version History

| Version | Date         | Changes                                          |
| ------- | ------------ | ------------------------------------------------ |
| 2.0     | Nov 26, 2025 | Error suppression, UI improvements, new features |
| 1.9     | Oct 15, 2025 | Bug fixes and performance improvements           |
| 1.8     | Sep 1, 2025  | Initial release                                  |

---

## 📋 Document Information

**Document Version:** 2.0  
**Created:** November 26, 2025  
**Last Updated:** November 26, 2025  
**Format:** Markdown  
**Audience:** All system users  
**Availability:** In-app Help Center, Web manual

---

## ✅ Checklist for New Users

- [ ] Received login credentials
- [ ] Successfully logged in
- [ ] Changed temporary password
- [ ] Reviewed dashboard
- [ ] Explored Medicine Stock section
- [ ] Understood your role and permissions
- [ ] Know how to contact support
- [ ] Familiar with help and FAQ sections
- [ ] Ready to use the system!

---

**Last Updated:** November 26, 2025  
**For questions or feedback, contact your system administrator.**

---

_This manual is provided with the Inventory Management System. For the latest version, visit the in-app Help Center._
