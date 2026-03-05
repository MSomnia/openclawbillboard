# OpenClaw Billboard

OpenClaw Billboard is a web platform that automatically aggregates and tracks projects related to the **OpenClaw ecosystem** on GitHub.

The platform discovers repositories, analyzes their activity, and presents ecosystem insights such as:

- Trending projects
- Active repositories
- Community growth

## Features

- **Ecosystem Discovery**  
  Automatically discovers GitHub repositories related to OpenClaw and organizes them into a searchable directory.

- **Trending Projects**  
  Highlights repositories that are rapidly gaining attention based on activity metrics.

- **Project Insights**  
  Each repository page shows detailed information:
  - Description
  - Primary programming language
  - Stars & forks count
  - Recent commit activity
  - Activity trends over time

- **Daily Updates**  
  Project data is refreshed automatically to keep ecosystem insights current.

- **Explore Interface**  
  Users can browse and filter repositories by attributes such as:
  - Language
  - Popularity (stars/forks)
  - Activity level

## Tech Stack

| Layer        | Technology       |
|--------------|------------------|
| Framework    | Next.js          |
| Language     | TypeScript       |
| Styling      | Tailwind CSS     |
| Charts       | Recharts         |
| Database     | SQLite           |
| ORM          | Prisma           |
| Deployment   | Vercel           |
| Automation   | GitHub Actions   |

The architecture prioritizes **simplicity** and **minimal infrastructure** while enabling fully automated data collection and visualization.

## Activity Scoring Algorithm

To evaluate how active a repository is within the ecosystem, OpenClaw Billboard calculates an **activity score**.

The score combines multiple signals representing development momentum and community attention:


### Metrics Used

- **recentCommits** — number of commits in the past 7 days
- **starGrowthRate** — increase in stars during the past 7 days
- **issueActivity** — issue & PR activity within the past week
- **daysSinceLastPush** — recency of the last code push (lower = more recent)
- **totalStars** — baseline popularity

### Suggested Weights

| Metric            | Weight |
|-------------------|--------|
| Commits           | 0.30   |
| Star growth       | 0.25   |
| Issue activity    | 0.15   |
| Push recency      | 0.20   |
| Total stars       | 0.10   |

All metrics are **normalized** to a 0–1 range before weighting.  

This approach favors repositories that are **actively evolving** rather than those that are only historically popular.
