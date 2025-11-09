# School ERP System - Design Guidelines

## Design Approach
**Selected System**: Material Design principles with Linear's modern aesthetic
**Justification**: Enterprise application requiring robust data tables, forms, and clear information hierarchy. Material Design provides proven patterns for data-dense interfaces while Linear's clean aesthetic ensures modern, professional appearance.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter (Google Fonts) - clean, highly legible for data tables
- **Headings**: 
  - Page titles: text-2xl font-semibold
  - Section headers: text-lg font-medium
  - Card titles: text-base font-medium
- **Body Text**: text-sm for table content, text-base for forms
- **Data/Numbers**: font-mono for IDs, amounts, dates

### B. Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 or p-6
- Section gaps: gap-4 or gap-6
- Margins: m-4, m-6, m-8 for major sections
- Table cell padding: p-2 or p-3

**Grid Structure**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Form layouts: Single column max-w-2xl for focused data entry
- Tables: Full-width with horizontal scroll on mobile

### C. Component Library

**Navigation**:
- Top navigation bar with school logo/name on left
- Role-based menu items in center
- User profile/logout on right
- Active state with border-b-2 indicator
- Height: h-16

**Dashboard Cards**:
- Elevated cards with subtle shadow (shadow-sm border)
- Rounded corners: rounded-lg
- Padding: p-6
- Display key metrics: Total Students, Pending Fees, Recent Grades
- Icon + Number + Label layout

**Data Tables**:
- Full-width responsive tables with border
- Header row with background differentiation
- Alternating row backgrounds for readability (stripe pattern)
- Right-aligned action buttons column
- Sticky header on scroll for long tables
- Minimum column widths to prevent crushing

**Forms**:
- Grouped in cards with rounded-lg borders
- Label above input pattern
- Input height: h-10
- Full-width inputs with consistent border styling
- Dropdown selects with same styling as text inputs
- Submit buttons: Primary action, right-aligned or full-width

**Buttons**:
- Primary actions: Solid background, rounded-md, px-4 py-2
- Secondary actions: Border outline style
- Danger actions (Delete): Distinct treatment
- Icon buttons for table actions: Square, p-2

**Modals/Overlays**:
- Payslip modal: Centered, max-w-2xl, clean print-friendly layout
- Report card: A4-like proportions, professional academic format
- Import/Export dialogs: max-w-md, focused task completion

**Data Entry (Grades Page)**:
- Filter section at top: Grid of dropdowns (Grade, Section, Subject, Term)
- Student list below with inline input fields for marks
- Save button prominent at bottom
- Real-time validation feedback

**Empty States**:
- Centered icon + message for empty tables
- Clear call-to-action (e.g., "Add First Student")

### D. Visual Hierarchy
- Use consistent card elevation to group related content
- Page title → Section headers → Content hierarchy
- Action buttons visually distinct from navigation
- Important data (amounts, totals) emphasized with font-weight-semibold

### E. Responsive Behavior
- Tables: Horizontal scroll on mobile with fixed first column option
- Forms: Stack to single column on mobile
- Dashboard: Cards stack vertically on mobile
- Navigation: Hamburger menu on mobile with slide-out drawer

### F. Role-Based UI
- Admin navigation: All menu items visible
- Teacher navigation: Only Dashboard and Grades
- Conditional rendering: Hide entire sections (not just disable)
- Visual indicator of current user role in navigation

### G. Print Optimization
- Payslips: Remove navigation, add print styles, white background
- Report cards: Professional academic layout with school header, grade table, signature lines
- Use @media print styles for clean output

### H. Accessibility
- Semantic HTML throughout (nav, main, table, form elements)
- Sufficient contrast ratios for text
- Clear focus states on all interactive elements
- Descriptive button labels (not just icons)

## Key Design Principles
1. **Data Clarity**: Information is king - tables and forms are clean and scannable
2. **Efficient Workflows**: Minimize clicks for common tasks (grade entry, fee recording)
3. **Role Awareness**: UI adapts seamlessly based on user permissions
4. **Professional Appearance**: Suitable for school administration environment
5. **Print-Ready**: Generated documents (payslips, reports) are professional and clean