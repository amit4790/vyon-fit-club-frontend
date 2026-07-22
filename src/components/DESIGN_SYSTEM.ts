/**
 * DESIGN SYSTEM SHOWCASE
 * Documentation of all available components and their usage
 * 
 * This file serves as a reference for all reusable components
 * and their recommended implementations.
 */

// ============================================================
// COMPONENT USAGE REFERENCE
// ============================================================

/*
BUTTONS
=======
Usage:
  <Button variant="primary">Click Me</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="danger" size="lg">Delete</Button>
  <Button isLoading>Loading...</Button>

Variants: primary, secondary, outline, danger
Sizes: sm, md (default), lg


CARDS
=====
Standard Card:
  <Card>
    <p>Card content</p>
  </Card>

Statistic Card:
  <StatisticCard
    label="Total Members"
    value="150"
    trend="up"
    icon={<Users />}
  />

Dashboard Card:
  <DashboardCard title="Overview" action={<Button size="sm">Edit</Button>}>
    <p>Content goes here</p>
  </DashboardCard>


INPUTS
======
Text Input:
  <Input label="Name" placeholder="Enter name" />

Password:
  <PasswordInput label="Password" />

Search:
  <SearchInput onSearch={(value) => console.log(value)} />

Select:
  <Select
    label="Option"
    options={[
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' }
    ]}
  />


BADGES
======
<Badge variant="active">Active</Badge>
<Badge variant="expired">Expired</Badge>
<Badge variant="pending">Pending</Badge>
<Badge variant="success">Success</Badge>

Variants: active, expired, pending, success


TABLE
=====
<Table>
  <TableHeader>
    <TableHeaderCell>Name</TableHeaderCell>
    <TableHeaderCell>Email</TableHeaderCell>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>


MODAL
=====
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  <p>Modal content</p>
  <footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </footer>
</Modal>


CONFIRMATION DIALOG
===================
<ConfirmationDialog
  isOpen={isOpen}
  title="Delete?"
  message="This cannot be undone"
  onConfirm={handleDelete}
  onCancel={handleCancel}
  isDangerous={true}
/>


LOADING
=======
Spinner:
  <Spinner size="md" />

Skeleton:
  <Skeleton className="h-4 w-full" count={3} />

Skeleton Card:
  <SkeletonCard count={3} />


EMPTY STATE
===========
<EmptyState
  title="No data"
  description="No items found"
  action={<Button>Create New</Button>}
/>


TOAST NOTIFICATIONS
===================
const { toasts, success, error, info, warning, removeToast } = useToast()

// In component:
success('Title', 'Message')
error('Error occurred')

// Render:
<ToastContainer toasts={toasts} onClose={removeToast} />


AVATAR
======
Single:
  <Avatar initials="JD" size="md" />
  <Avatar src="image.jpg" alt="User" />

Group:
  <AvatarGroup
    avatars={[
      { initials: 'JD' },
      { initials: 'SM' },
      { initials: 'KL' }
    ]}
    max={3}
  />


BREADCRUMB
==========
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users' }
  ]}
/>


PAGE HEADER
===========
<PageHeader
  title="Dashboard"
  subtitle="Welcome back"
  breadcrumbs={<Breadcrumb items={[...]} />}
  action={<Button>Add Member</Button>}
/>


SECTION HEADER
==============
<SectionHeader
  title="Recent Members"
  subtitle="Last 30 days"
  action={<Button size="sm">View All</Button>}
/>


LAYOUTS
=======

Public Layout:
  <PublicLayout navbar={<YourNavbar />}>
    <Landing />
  </PublicLayout>

Dashboard Layout:
  <DashboardLayout
    sidebarItems={[
      { icon: <Home />, label: 'Dashboard', href: '/dashboard' },
      { icon: <Users />, label: 'Members', href: '/members' }
    ]}
    appName="VYON FIT CLUB"
    userName="John Doe"
  >
    <Dashboard />
  </DashboardLayout>
*/

// ============================================================
// DESIGN TOKENS REFERENCE
// ============================================================

export const designTokensReference = `
COLORS (Tailwind config)
========================
Primary:        #6A0D25       (text-primary, bg-primary)
Primary Dark:   #4A0819       (hover states)
BG Primary:     #0F0F10       (bg-bg-primary)
BG Secondary:   #151518       (bg-bg-secondary)
BG Card:        #1A1A1D       (bg-bg-card)
Border Light:   #2A2A2E       (border-border-light)
Text Primary:   #F5F5F5       (text-text-primary)
Text Secondary: #B8B8B8       (text-text-secondary)
Chrome:         #C7C9CC       (text-chrome)
Accent:         #B0B5BD       (text-accent)
Success:        #2ECC71       (text-success, bg-success)
Warning:        #F39C12       (text-warning, bg-warning)
Danger:         #E74C3C       (text-danger, bg-danger)


TYPOGRAPHY (Tailwind classes)
==============================
.page-title       2.5rem, bold
.section-title    1.875rem, semibold
.card-title       1.25rem, semibold
.body             1rem, regular
.caption          0.875rem, medium
.label            0.75rem, semibold (uppercase)


SPACING (Tailwind config)
==========================
xs:   0.5rem
sm:   1rem
md:   1.5rem
lg:   2rem
xl:   2.5rem
2xl:  3rem


ANIMATIONS (Tailwind config)
=============================
animate-fade-in   Fades in over 0.3s
animate-slide-up  Slides up with fade over 0.3s
animate-spin-slow Spins at 2s per rotation


SHADOWS (Tailwind config)
==========================
shadow-card        0 1px 3px rgba(0, 0, 0, 0.3)
shadow-card-hover  0 4px 12px rgba(0, 0, 0, 0.4)
shadow-elevated    0 10px 30px rgba(0, 0, 0, 0.5)


RESPONSIVE BREAKPOINTS
=======================
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px

Usage: md:grid-cols-2 (applies at md and above)
`

export default designTokensReference
