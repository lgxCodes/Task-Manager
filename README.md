# Task Manager

A Kanban-style task management app built with React, React Router, TypeScript, and Tailwind CSS.

Live: https://lgxcodes.github.io/Task-Manager

## Features

### Board
- Kanban board with three columns: To Do, In Progress, Done
- Drag and drop tasks between columns
- Smooth card animations on mount and move
- Mobile-friendly tabbed interface for switching between columns
- 3-column grid on tablet and desktop

### Tasks
- Create, edit, and delete tasks with confirmation dialog
- Task priority levels (Low, Medium, High) with color-coded labels
- Due dates with overdue detection and visual warnings
- Task detail view with full description, timestamps, and inline status switching
- Undo delete via toast action button
- Custom confirmation dialogs for unsaved changes and destructive actions

### Multi-Select & Batch Actions
- Toggle selection mode to select multiple tasks
- Batch move selected tasks to any status column
- Batch delete with undo support
- Select all / deselect all

### Search & Filter
- Real-time search across task titles and descriptions with deferred rendering
- Multi-select priority filter with checkboxes
- Sort by newest or oldest
- Combined filter count badge
- Filter state persisted in URL search params
- Press `/` to focus the search bar

### Data
- Data persists in localStorage
- Export tasks to JSON file
- Import tasks from JSON file with schema validation and merge behavior
- Automatic data migration for backwards compatibility

### Keyboard Shortcuts
- `N` — Create a new task from the board
- `/` — Focus the search bar
- `Escape` — Navigate back, dismiss dialogs, or exit selection mode

### UI/UX
- Dark and light mode toggle
- Toast notifications with optional undo and pause-on-hover
- Responsive layout with mobile, tablet, and desktop breakpoints
- Three-dot menu for secondary actions (theme, export, import)
- Error boundary with recovery screen for unexpected errors

### Accessibility
- ARIA attributes on dialogs, menus, tabs, and live regions
- Focus trapping and auto-focus in modals and confirmation dialogs
- Focus restoration when modals close
- Keyboard-dismissible dropdowns, menus, and dialogs (`Escape`)
- Loading spinner with `role="status"` and toast container with `aria-live`

### Performance
- `React.memo` on task cards to prevent unnecessary re-renders
- `useMemo` for grouped task computation in board columns
- `useDeferredValue` for non-blocking search filtering
- `useCallback` on all hook functions for stable references
- Drag-and-drop flicker prevention using counter-based tracking

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS 
- React Router
- Vitest + Testing Library

## Project Structure

```
src/
  types/              Typed models (Task, Status, Priority, ApiResponse)
  api/                Mock API layer (localStorage-backed, export/import)
  context/            React Context + useReducer state management
  hooks/              Custom hooks (useTasks, useToast, useTheme)
  components/
    ui/               Reusable components (Button, Modal, ConfirmDialog, Toast, ErrorBoundary, etc.)
    Board/            Kanban board grid with mobile tabs
    Column/           Status column with drag-and-drop
    TaskCard/         Memoized draggable task card
    TaskForm/         Controlled form with dirty tracking
    Header/           App header with options menu
    SearchFilterBar/  Search input and filter dropdown
  pages/
    BoardPage/        Main Kanban view (/)
    TaskDetailPage/   Task detail view (/task/:id)
```
