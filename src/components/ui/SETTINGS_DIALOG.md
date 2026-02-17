# Settings Dialog Components

A modular set of Vue components for creating settings dialogs with category navigation and automatic scroll tracking.

## Components

### SettingsDialog

The main container component that extends the InvokableModalDialog pattern. It provides a two-column layout with category navigation on the left and content on the right.

**Props:**
- `active` (v-model): Boolean to control dialog visibility

**Slots:**
- `invoker`: Custom button to open the dialog (default: "Settings" button)
- `button-content`: Content for the default button
- `navigation`: Category navigation buttons
- `content`: Settings sections

**Example:**
```vue
<SettingsDialog v-model:active="dialogActive">
  <template #button-content>
    <Icon>settings</Icon>
    Open Settings
  </template>

  <template #navigation>
    <SettingsCategoryButton category-id="general" label="General" />
    <SettingsCategoryButton category-id="appearance" label="Appearance" />
  </template>

  <template #content>
    <SettingsSection category-id="general" title="General">
      <!-- Settings items -->
    </SettingsSection>
    <SettingsSection category-id="appearance" title="Appearance">
      <!-- Settings items -->
    </SettingsSection>
  </template>
</SettingsDialog>
```

### SettingsCategoryButton

A navigation button for categories. Automatically highlights when its corresponding section is in view.

**Props:**
- `categoryId` (required): String ID matching the SettingsSection category-id
- `label` (required): Display text for the button

**Example:**
```vue
<SettingsCategoryButton category-id="general" label="General" />
```

### SettingsSection

A container for grouping related settings. Uses IntersectionObserver to track visibility and update the active category.

**Props:**
- `categoryId` (required): Unique identifier for the section
- `title` (required): Section heading

**Slots:**
- `default`: Setting items

**Example:**
```vue
<SettingsSection category-id="general" title="General Settings">
  <SettingItem label="Language" description="Select your preferred language">
    <Select v-model="language">
      <option value="en">English</option>
      <option value="nl">Nederlands</option>
    </Select>
  </SettingItem>
</SettingsSection>
```

### SettingItem

A wrapper component for individual settings with label, description, and control.

**Props:**
- `label` (optional): Setting label text
- `description` (optional): Setting description text

**Slots:**
- `default`: The control element (input, switch, button, etc.)

**Example:**
```vue
<SettingItem 
  label="Dark Mode" 
  description="Enable dark theme"
>
  <InputSwitch v-model="darkMode" identifier="dark-mode" />
</SettingItem>
```

## Features

- **Modular Architecture**: Components can be used independently
- **Category Navigation**: Left sidebar with clickable category buttons
- **Smooth Scrolling**: Click a category to scroll to that section with smooth animation
- **Active Highlighting**: Current category in viewport is automatically highlighted
- **Intersection Observer**: Uses modern browser API for efficient scroll tracking
- **Responsive Layout**: Two-column layout with proper overflow handling
- **Keyboard Support**: ESC key closes the dialog

## Demo

See the demo page at `/demo/settings` for a complete working example.

## Styling

All components use scoped styles that match the existing design system. The components inherit colors and styles from CSS custom properties:

- `--yellow2`: Accent color for highlights and focus states
- Background colors follow the existing `#202020` and `#1c2129` pattern
- Border radius, spacing, and transitions are consistent with other UI components

## Best Practices

1. Always provide unique `categoryId` values for each SettingsSection
2. Ensure `categoryId` on SettingsCategoryButton matches the corresponding SettingsSection
3. Provide `identifier` props for form controls (InputSwitch, InputCheckbox) to ensure proper accessibility
4. Keep category labels short and descriptive
5. Group related settings together in the same SettingsSection
6. Use SettingItem for consistent spacing and layout

## Technical Details

The settings dialog uses Vue's provide/inject API to share state between components:

- `settingsContentRef`: Reference to the scrollable content container
- `activeCategory`: Current active category ID
- `scrollToCategory`: Function to programmatically scroll to a category

The IntersectionObserver configuration in SettingsSection uses:
- `threshold`: [0, 0.3, 0.5, 0.7, 1] for fine-grained visibility tracking
- `rootMargin`: '-20% 0px -70% 0px' to trigger updates when sections are well-positioned
