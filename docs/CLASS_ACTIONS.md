# Faculty Class Actions Implementation

## Overview

A comprehensive Class Actions system has been implemented for the faculty Class List page, enabling faculty to efficiently manage their classes with a full suite of actions.

## Implemented Features

### 1. **Class Actions Dropdown** (`class-actions-dropdown.tsx`)

Located in `app/dashboard/faculty/classes/_components/`

A context-aware dropdown menu attached to each class card with the following actions:

#### Quick Actions
- **View Students** - Navigate to the class detail page's People tab
- **Edit Details** - Opens modal to edit class information
- **Duplicate Class** - Create a copy of the class for another semester

#### Export Data
- **Export Roster** - Download student enrollment list as CSV
- **Export Grades** - Download grades data as CSV
- **Export Attendance** - Download attendance records as CSV

#### Management Actions
- **Class Settings** - Configure class-specific preferences (coming soon)
- **Archive Class** - Archive class (hides from active list)
- **Delete Class** - Permanently delete class with confirmation

### 2. **Edit Class Modal** (`edit-class-modal.tsx`)

Form-based modal for updating class details:
- Section name/number
- Maximum student capacity
- Credit hours
- Lecture hours
- Laboratory hours

Features:
- Pre-populated with current values
- Real-time preview of changes
- Form validation
- Loading states
- Success/error feedback

### 3. **Duplicate Class Modal** (`duplicate-class-modal.tsx`)

Wizard for creating class copies:
- Auto-increment section (A → B, B → C)
- Custom semester and school year
- Options to include:
  - Current enrollments
  - Grade history
- Preview of new class details

### 4. **Backend API Endpoints** (`class-actions.ts`)

Elysia routes implemented for all actions:

#### `PATCH /api/faculty-classes/:id/archive`
Archive a class to hide it from active view

#### `DELETE /api/faculty-classes/:id`
Permanently delete a class

#### `PUT /api/faculty-classes/:id`
Update class details

#### `POST /api/faculty-classes/:id/duplicate`
Create a duplicate of an existing class

#### `GET /api/faculty-classes/:id/export?type=roster|grades|attendance`
Export class data as CSV file

## File Structure

```
app/dashboard/faculty/classes/_components/
├── class-actions-dropdown.tsx     # Main dropdown component
├── edit-class-modal.tsx          # Edit class form modal
├── duplicate-class-modal.tsx     # Duplicate class wizard
└── class-card.tsx                # Updated to use new actions

server/routes/
└── class-actions.ts              # Backend API endpoints

docs/
└── CLASS_ACTIONS.md              # This documentation
```

## API Integration

### Laravel API Integration

The backend endpoints are designed to integrate with the Laravel API. Currently, they return success responses but are structured to:
1. Validate user authentication via Clerk
2. Make appropriate calls to the Laravel API
3. Handle errors gracefully
4. Return consistent response formats

### To Implement (Laravel API):

1. **Archive Endpoint** - Add Laravel endpoint to update class status to 'archived'
2. **Delete Endpoint** - Add Laravel endpoint to permanently delete class
3. **Update Endpoint** - Add Laravel endpoint to update class information
4. **Duplicate Endpoint** - Add Laravel endpoint to create new class from existing
5. **Export Endpoints** - Add Laravel endpoints to fetch and format data for export

## Usage

### For Faculty:

1. **Open Class Actions**
   - Hover over any class card
   - Click the three-dot menu (⋮) in the top-right corner

2. **Quick Actions**
   - Select action from dropdown menu
   - Follow prompts for destructive actions (archive/delete)

3. **Edit Class**
   - Click "Edit Details"
   - Modify fields as needed
   - Click "Save Changes"

4. **Duplicate Class**
   - Click "Duplicate Class"
   - Review auto-filled details
   - Adjust section, semester, or school year
   - Choose what to include
   - Click "Duplicate Class"

5. **Export Data**
   - Click "Export [Type]"
   - CSV file downloads automatically
   - File named: `{subject_code}_{section}_{type}_{date}.csv`

### For Developers:

```typescript
// Import the dropdown component
import { ClassActionsDropdown } from "./class-actions-dropdown";

// Use with class card
<ClassCard
  classItem={classData}
  onActionComplete={() => {
    // Refresh class list or refetch data
    router.refresh();
  }}
/>
```

## Security Features

1. **Authentication Required** - All endpoints require valid Clerk session
2. **Authorization Checks** - Verify user owns the class
3. **Confirmation Dialogs** - Destructive actions require explicit confirmation
4. **Input Validation** - All forms validate input before submission
5. **Error Handling** - Graceful error handling with user-friendly messages
6. **Loading States** - Prevent double-submission with loading indicators

## User Experience

### Visual Feedback
- ✓ Toast notifications for success/error states
- ✓ Loading spinners during async operations
- ✓ Disabled states for buttons during processing
- ✓ Hover effects on interactive elements
- ✓ Contextual icons for each action

### Accessibility
- ✓ Keyboard navigation support
- ✓ ARIA labels on interactive elements
- ✓ Focus management in modals
- ✓ High contrast confirmations for destructive actions

### Mobile Responsive
- ✓ Dropdown works on touch devices
- ✓ Modals stack vertically on small screens
- ✓ Touch-friendly button sizes

## Future Enhancements

### Planned Features
1. **Class Settings Modal**
   - Grade weighting configuration
   - Attendance tracking options
   - Late submission policies
   - Custom field definitions

2. **Bulk Actions**
   - Select multiple classes
   - Archive/unarchive in batch
   - Export multiple classes at once

3. **Class Templates**
   - Save class configurations as templates
   - Apply template to new classes
   - Share templates with other faculty

4. **Advanced Export Options**
   - PDF exports with formatting
   - Custom date ranges
   - Include/exclude specific fields
   - Email roster to students

### Technical Improvements
1. **Real-time Updates** - Use websockets for live class updates
2. **Offline Support** - Cache class data for offline viewing
3. **Performance** - Virtualize long class lists
4. **Audit Trail** - Log all class modifications
5. **API Caching** - Cache export generation

## Testing

To test the implementation:

1. **Edit Modal**
   - Open a class card
   - Click "Edit Details"
   - Change values
   - Submit and verify

2. **Duplicate Modal**
   - Open a class card
   - Click "Duplicate Class"
   - Modify details
   - Submit and verify

3. **Archive Action**
   - Open a class card
   - Click "Archive Class"
   - Confirm action
   - Verify class is hidden

4. **Export Actions**
   - Open a class card
   - Click any export option
   - Verify CSV file downloads

## Dependencies

- ✓ `@radix-ui/react-dropdown-menu` - Dropdown menus
- ✓ `@radix-ui/react-dialog` - Modals
- ✓ `@radix-ui/react-alert-dialog` - Confirmations
- ✓ `@radix-ui/react-checkbox` - Checkboxes
- ✓ `@radix-ui/react-label` - Form labels
- ✓ `lucide-react` - Icons
- ✓ `sonner` - Toast notifications
- ✓ `elysia` - Backend framework

## Notes

- All API endpoints currently return success responses for development
- Laravel API integration points are clearly marked with TODOs
- CSV export format can be customized as needed
- Modals include previews to help users understand changes
- Action complete callbacks allow parent components to refresh data
