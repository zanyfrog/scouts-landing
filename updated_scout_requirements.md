# Scout Troop Site - Updated Requirements

_Last updated: 2026-04-14_

## 1. Product overview

This is a troop management website for scouts, parents/guardians, adult leaders, committee members, and administrators.

The site includes:
- a public landing page
- authenticated access for all people in the system
- troop-role-driven permissions
- person and scout records
- patrols and patrol history
- Google Calendar-backed events
- invitations and attendance
- service hours and fundraising tracking
- event photos and profile photos
- reporting, PDF export, and CSV export
- full audit history for changed information

## 2. Users, registration, and access

### 2.1 Registration and approval
- A person gets access by going to the site and registering.
- A newly registered user is not active immediately.
- Access is granted only after approval by an Adult Scout Leader or Administrator.
- In many cases, an adult leader or administrator may create records directly.

### 2.2 Login and password reset
- Every person in the system should be able to log in.
- Password reset is handled by email with a password reset link.

### 2.3 Person and user relationship
- Every person is a user of the site.
- A person can have multiple roles.

### 2.4 Scout-parent rule
- Every scout must have at least one parent associated.
- Emails sent to a scout must also go to all associated parents.

## 3. Roles and permissions

### 3.1 Site access roles
Current site-access concepts include:
- Scout
- Parent/Guardian
- Adult Scout Leader
- Committee Member
- Administrator

A person may hold multiple roles simultaneously.

### 3.2 Troop roles
- Troop roles follow the possible scout.org roles.
- Troop roles are stored locally by default.
- Sync from scout.org happens only when requested by an Adult Scout Leader.
- If a synced role disappears or changes name, adults will manually adjust it.
- Only Adult Scout Leaders should be emailed when roles change.

### 3.3 Permission model
- All troop roles will be used for granting different access.
- Troop-role permissions are fixed once decided.
- Permissions are defined role-by-role.

### 3.4 Org chart and reporting lines
- The troop hierarchy / org chart should be generated from active leadership assignments.
- The org chart should include scout leaders and adult leaders.
- Reporting lines in the org chart should be the basis for "reports to" relationships.
- Each troop role assignment has a start date and end date.
- Multiple roles per scout are allowed, though uncommon.
- The org chart route should be visible only to Adult Scout Leaders and Administrators.
- The prototype includes edit routes for scout leadership and adult leadership assignments.

## 4. People and relationships

### 4.1 Person information
For each person, collect:
- first name
- last name
- nickname
- email
- contact phone
- text phone
- address:
  - road
  - city
  - state
  - postal code

### 4.2 Relationship model
Each person may have associated people/connections with one or more tags, including:
- parent
- emergency contact
- guardian

### 4.3 Family/household decision
- There is no separate Family/Household record.
- Siblings are grouped by their parent relationships.
- No primary guardian flag is needed.

### 4.4 Address handling
- Address is stored per person.
- This supports different households for parents.
- A convenience option such as "same as parent" should be available.

### 4.5 Privacy
- Phone numbers and email addresses are private by default.
- Only Adult Scout Leaders and Administrators may view others' phone numbers and email addresses.

### 4.6 Contact priority
- Contact priority order should be stored.
- When a leader/administrator views a scout's contacts, the contacts should be shown in priority order.

### 4.7 Current prototype persistence
- The current prototype persists scouts, adults, and adult leaders in CSV files.
- Adults are stored in a master adults list and may be linked to scouts as parents/guardians.
- Adult leader assignments are stored separately from adults and reference the associated adult by `adultId`.
- Adult leader storage should not duplicate `reportsTo` or `area`; those values are derived from the assigned role when displayed.

## 5. Profile photos and media consent

### 5.1 Profile photos
The following people may have profile photos:
- scouts
- guardians/parents
- adult scout leaders

### 5.2 Media consent
- Add a media/photo release section.
- By default, when a user is part of the site, they acknowledge that photos may appear.
- A consent checkbox should be shown that points out that their photos may appear.
- If media consent needs to be revoked, the user will likely be removed.
- Images associated with a banned/removed user may continue to exist temporarily and may later be taken down.

## 6. Scouts, ranks, patrols, and leadership

### 6.1 Scout-specific information
Each scout is a person with additional information:
- date joined
- current rank
- current rank achieved date
- current role
- role first achieved date
- role vacated date

### 6.2 Rank history
A scout's rank history must be preserved.
Each rank history record includes:
- rank
- achievement date
- scoutmaster of record, if available

### 6.3 Patrols
- Patrols exist in the system.
- Scouts can change patrols.
- Patrol membership history must be tracked.
- Some events and activities are patrol-level.
- Patrol names are unique within a troop.
- A troop can have from 1 to many patrols.
- Current Troop 883 patrol names are:
  - Python Patrol
  - Nuclear Meese
  - Flaming Arrows
  - Senior

### 6.4 Patrol-less scouts
- Scouts without a current patrol appear in an Unassigned section in attendance and related reporting.

## 7. Events and calendar

### 7.1 Calendar source
- Use one Google Calendar.
- The site reads from Google Calendar.
- With proper credentials, the site can create and edit Google Calendar events.
- Adult Scout Leaders can create and edit events.

### 7.2 Calendar subscriptions
- Users can subscribe to a general feed.
- Users with the correct role can subscribe to a private feed.

### 7.3 Event visibility
Events can be:
- public
- role-restricted
- invitation-only
- patrol-level

Rules:
- Invitation-only events show only for the specific users invited.
- Committee-only events show only for users with the correct access.
- Patrol-level events should only be visible to the people in that patrol.

### 7.4 Public landing page event usage
- The public landing page should show the most recent events front and center.
- The presentation should be newsletter-like and act as an advertisement to join.
- The next upcoming event should also be displayed prominently.
- The public landing page should show event images.
- Each public event preview should include a link to full event details.

### 7.5 Event data
Each event includes:
- category
- start time
- end time
- repeat settings
- name
- description
- limitations/notes
- location
- built-in directions link

### 7.6 Event categories
Known categories include:
- Regular meeting
- Court of Honor
- Weekend
- Day

Additional event-related categories/capabilities include:
- service hours
- fundraising

### 7.7 Event activities
Each event has activities.
Each activity includes:
- troop-level or patrol-level designation
- date started
- date ended
- name
- description

## 8. Invitations, RSVP, and attendance

### 8.1 Invitations
- Invitations are managed by the troop site, not by Google Calendar attendees.

### 8.2 RSVP and attendance
- RSVP is part of MVP.
- Attendance is part of MVP.

### 8.3 Event attendance audience
For each event, attendance should be presented for:
- scouts
- adults

### 8.4 Attendance statuses
General event attendance statuses are:
- Present
- Absent

### 8.5 Attendance management for non-regular-meeting events
- Any adult leader can mark attendance for non-regular-meeting events.

## 9. Scribe attendance workflow

### 9.1 Scribe route
Create a dedicated route for the Scribe to manage attendance for regular meetings.

Suggested route family:
- /scribe/attendance
- /scribe/attendance/:eventId
- /scribe/attendance/:eventId/print
- /scribe/attendance/:eventId/upload
- /scribe/attendance/history
- /scribe/attendance/reports/monthly

### 9.2 Scribe attendance sheet
The Scribe attendance sheet is for regular meetings and includes:
- scouts only
- grouped by patrol
- meeting date
- a name column
- a checkbox/check-in field or initials field
- an Unassigned section for scouts without a patrol

### 9.3 Attendance entry methods
The Scribe can:
- enter attendance directly in the site
- print/export a PDF attendance sheet
- upload one or more completed attendance sheets

### 9.4 Uploaded attendance sheets
The site should be able to read checkmarks and/or initials from uploaded attendance sheets and map them to users.
Recommended workflow:
1. upload sheet
2. parse checkmarks/initials
3. present a review screen
4. confirm before final save

### 9.5 Attendance history visibility
Attendance history is visible to:
- Scribe
- Adult Scout Leaders
- Administrators

### 9.6 Attendance reports
- Provide a monthly report showing attendance at regular meetings by month.
- Reports should be in an org-chart/grouped format similar to the attendance sheet template.
- Attendance reports should include all current members only.
- Patrol grouping should use current membership.
- Patrol-less scouts appear in the Unassigned section.

## 10. Service hours
- Service hours are associated with an event.
- Service hours are tracked per scout.
- An Adult Scout Leader enters service hours into the system for the scout.
- Service hours must be reportable.

## 11. Fundraising

### 11.1 Fundraising event model
- Fundraising is its own event type/workflow.

### 11.2 Fundraising tracking
For each fundraising event, each scout can have:
- hours worked
- dollars credited

### 11.3 Data entry
- Fundraising is entered by Adult Scout Leaders.
- Adult Scout Leaders approve/record fundraising by entering the information.

### 11.4 Reporting
- Fundraising must be reportable.

## 12. Event photos

### 12.1 Event photo uploads
- Photos are uploaded for events.
- Anyone at an event may upload to that event.
- Photos are visible with the event.

### 12.2 Moderation
- An Adult Scout Leader can hide any photo.

## 13. Audit trail
A full audit trail is required for added and changed information.

Each audit record should store:
- old value
- new value
- actor
- timestamp

At this point:
- no items should be deleted
- no items should be archived

## 13A. Current prototype data storage
- The prototype currently uses CSV-backed persistence instead of a database.
- Current CSV files are:
  - `data/scouts.csv`
  - `data/adults.csv`
  - `data/adult_leaders.csv`
- `adult_leaders.csv` currently stores:
  - `adultId`
  - `role`

## 14. Reports and exports

### 14.1 Required reports
Reports currently required include:
- scout roster report in org-chart format
- org chart
- rank history in spreadsheet format
- service hours reports
- fundraising reports
- attendance reports

### 14.2 Output formats
All reports should support:
- on-screen display
- PDF export
- CSV export

### 14.3 Printing
- Org charts should be printable.
- Roster reports should be printable.

### 14.4 Report visibility
- When a user has access to the underlying data for a role, they can view the associated report.

### 14.5 Rank-history spreadsheet columns
The rank-history spreadsheet report should include:
- Date Received
- Rank

## 15. Google Calendar sync behavior
- The site should sync Google Calendar:
  - at the beginning of the day
  - or when the first user accesses the site
- If Google Calendar events are edited directly outside the site, the site should reflect those edits.
- If Google Calendar events are deleted directly outside the site, the site should reflect those deletions.

## 16. Recommended major routes

### Public/auth
- /
- /register
- /login
- /forgot-password
- /reset-password

### Dashboard and profile
- /dashboard
- /profile
- /people
- /people/:personId

### Scouts
- /scouts
- /scouts/:scoutId
- /scouts/:scoutId/ranks
- /scouts/:scoutId/patrol-history
- /scouts/:scoutId/service-hours
- /scouts/:scoutId/fundraising

### Patrols and org chart
- /patrols
- /patrols/:patrolId
- /org-chart

### Events and calendar
- /calendar
- /events
- /events/:eventId
- /events/:eventId/activities
- /events/:eventId/photos
- /events/:eventId/attendance
- /events/:eventId/invitations

### Scribe attendance
- /scribe/attendance
- /scribe/attendance/:eventId
- /scribe/attendance/:eventId/print
- /scribe/attendance/:eventId/upload
- /scribe/attendance/history
- /scribe/attendance/reports/monthly

### Reports
- /reports
- /reports/roster
- /reports/org-chart
- /reports/rank-history
- /reports/service-hours
- /reports/fundraising
- /reports/attendance

## 17. Resolved decisions
- General event attendance statuses are Present and Absent.
- Any adult leader can mark attendance for non-regular-meeting events.
- Google Calendar edits and deletions made outside the site should be reflected in the site.
- Users should land on a role-based dashboard after login.
- The site must also support a non-logged-in public version.
- Users who can access the underlying role/data can view the related reports.
- The rank-history spreadsheet report should include Date Received and Rank.
- The public landing page should focus on recent and upcoming events for now, with event images and links to full event details.

## 18. Current prototype state
- The review prototype is a static site served locally by a lightweight Node server.
- The public landing page shows recent and upcoming events with images, and event titles navigate directly to the dedicated event route.
- Post-login behavior is represented by role-based dashboard modes in the prototype.
- The `/events` route now presents a monthly calendar with events placed on the correct days for the selected month, with that month's event summaries listed below the calendar.
- Clicking an event from the monthly calendar or from the summary title opens the dedicated `/events/:eventId` route.
- The visitor event page includes a richer event layout with dates, location, a directions map, and a multi-image gallery when images are available.
- Adult leaders and administrators can edit event details from the `/events/:eventId` route and can load multiple visitor-facing images for the event gallery.
- The Scribe attendance route family is present in the prototype.
- The org chart is an adult-only route in the prototype.
- Adult leader editing currently supports:
  - changing a leader's role
  - removing a leader
  - adding an existing adult as a leader
  - adding a new adult to the saved adults list
- Adult leaders display a role emblem beside the linked adult; if no role-specific emblem is available, a Scout.org fallback logo is shown.
- Scout records can be edited by the matching logged-in scout, an adult leader, or an administrator in the prototype.
- Scout records now display linked parents and guardians from the separate adult-scout relationship CSV.
- Scout records support editing name, gender, rank, attendance, patrol assignment, and scout leadership position.
- Scout storage is normalized so `scouts.csv` no longer stores inline parent fields.
- Scout storage now includes a patrol badge association, and changing patrol updates the associated badge value.
