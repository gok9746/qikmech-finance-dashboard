# QikMech Finance Dashboard - Design Guidelines

## Design Approach
**System-Based Approach** using Fluent Design principles - optimized for business productivity and data-heavy interfaces. This dashboard prioritizes functional efficiency over visual flair, ensuring mechanics and accountants can work quickly and accurately.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light mode: 220 15% 25% (professional dark blue-gray)
- Dark mode: 220 15% 85% (light blue-gray text)

**Background Colors:**
- Light mode: 0 0% 98% (near white), cards: 0 0% 100%
- Dark mode: 220 15% 8% (dark background), cards: 220 15% 12%

**Status Colors:**
- Success: 142 76% 36% (green for completed jobs)
- Warning: 38 92% 50% (amber for in-progress)
- Error: 0 84% 60% (red for overdue/issues)
- Info: 217 91% 60% (blue for pending status)

**Financial Data Colors:**
- Profit: 142 76% 36% (green)
- Expenses: 0 84% 60% (red)
- Revenue: 217 91% 60% (blue)

### B. Typography
**Font Stack:** Inter via Google Fonts CDN
- Headings: 600 weight, sizes from text-lg to text-3xl
- Body text: 400 weight, text-sm to text-base
- Data/numbers: 500 weight for emphasis, monospace for currency values
- Labels: 500 weight, text-xs to text-sm

### C. Layout System
**Tailwind Spacing Units:** Standardized on 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: mb-6, mb-8
- Card spacing: space-y-4
- Form element spacing: gap-4

### D. Component Library

**Navigation:**
- Fixed sidebar (desktop) with collapsible menu
- Role-based navigation items with clear visual hierarchy
- Mobile: Bottom navigation bar with icons

**Data Tables:**
- Zebra striping for row differentiation
- Sticky headers for long lists
- Sort indicators and filter controls
- Action buttons right-aligned in rows

**Forms:**
- Floating labels for input fields
- Clear validation states (error, success)
- Grouped related fields with subtle borders
- Primary CTA buttons with high contrast

**Cards & Panels:**
- Subtle shadows (shadow-sm) for depth
- Rounded corners (rounded-lg)
- Clear content hierarchy with proper spacing

**Financial Metrics:**
- Large, prominent number displays
- Color-coded positive/negative values
- Euro symbol (€) consistently positioned
- Comparison indicators (up/down arrows)

**Charts & Data Visualization:**
- Minimal, clean chart design
- Consistent color palette across charts
- Clear axis labels and legends
- Responsive sizing for mobile

### E. Dashboard-Specific Patterns

**Summary Cards:**
- Key metrics displayed prominently
- Subtle background tints matching data type
- Progress indicators where applicable

**Job Status System:**
- Color-coded status badges
- Clear visual hierarchy in job listings
- Quick action buttons for status updates

**Role-Based UI:**
- Subtle visual cues for restricted content
- Progressive disclosure based on permissions
- Clear indication of read-only vs editable states

**Mobile Optimization:**
- Horizontal scrolling tables for data overflow
- Stacked card layouts for mobile
- Touch-friendly button sizes (min 44px)
- Simplified navigation for smaller screens

## Key Design Principles
1. **Data First:** Information hierarchy optimized for quick scanning and decision-making
2. **Role Clarity:** Visual differentiation between Admin, Staff, and Accountant views
3. **Financial Focus:** Currency values and financial metrics prominently displayed
4. **Progressive Enhancement:** Core functionality accessible on all devices
5. **Consistent Interactions:** Predictable UI patterns across all pages

This design system creates a professional, efficient dashboard that mechanics and business users can navigate confidently while maintaining the data integrity and role-based access critical to financial management.