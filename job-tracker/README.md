# IT Job Tracker

A simple, local job application tracker for IT Support, Help Desk, Desktop Support, Junior Systems Administrator, and IT Systems Engineer Tier 1 roles.

## Features

- Track job title, company, location, salary, job link, date applied, status, and notes
- Status options: Saved, Applied, Interview, Rejected, Offer
- Interview questions and answers per application
- Custom resume keywords per job
- Filter applications by status
- Export and import data as JSON for backup
- Fully offline — no server, no APIs, no accounts

## Getting Started

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
2. Click **Add Application** to create your first entry.
3. Data is saved automatically in your browser's localStorage.

No build step or installation required.

## Backup Your Data

- **Export JSON**: Downloads all applications to a `.json` file.
- **Import JSON**: Restores from a backup file. You can choose to replace all data or merge with existing entries.

> **Privacy note:** Exported files may contain notes you typed. Do not upload or commit them to public repositories if they include sensitive information.

## Data Storage

All data is stored locally in your browser under the key `jobTrackerApplications`. Clearing browser data for this site will remove your applications — use Export JSON to back up regularly.

## File Structure

```
job-tracker/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── storage.js
│   └── app.js
└── README.md
```

## License

Free to use for personal job searching.
