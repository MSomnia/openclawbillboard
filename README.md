# OpenClaw Billboard

OpenClaw Billboard is a web platform that automatically aggregates and tracks
projects related to the **OpenClaw ecosystem** on GitHub.

The platform discovers repositories, analyzes their activity, and
presents ecosystem insights such as trending projects, active
repositories, and community growth.

------------------------------------------------------------------------

# Features

### Ecosystem Discovery

Automatically discovers GitHub repositories related to OpenClaw and
organizes them into a searchable directory.

### Trending Projects

Highlights repositories that are rapidly gaining attention based on
activity metrics.

### Project Insights

Each repository includes information such as:

-   description
-   primary programming language
-   stars and forks
-   recent commits
-   activity trends

### Daily Updates

Project data is refreshed automatically to keep ecosystem insights up to
date.

### Explore Interface

Users can browse and filter repositories based on attributes such as
language, popularity, and activity level.

------------------------------------------------------------------------

# Tech Stack

  Layer        Technology
  ------------ ----------------
  Framework    Next.js
  Language     TypeScript
  Styling      Tailwind CSS
  Charts       Recharts
  Database     SQLite
  ORM          Prisma
  Deployment   Vercel
  Automation   GitHub Actions

The architecture focuses on simplicity and minimal infrastructure while
still supporting automated data collection and visualization.

------------------------------------------------------------------------


# Activity Scoring Algorithm

To evaluate how active a repository is within the ecosystem, OpenClaw
Billboard calculates an **activity score**.

The score combines several signals that represent development momentum
and community attention.

    score =
        w1 * normalize(recentCommits)
      + w2 * normalize(starGrowthRate)
      + w3 * normalize(issueActivity)
      + w4 * normalize(daysSinceLastPush)
      + w5 * normalize(totalStars)

### Metrics

-   **recentCommits** --- number of commits in the past 7 days
-   **starGrowthRate** --- star increase during the past 7 days
-   **issueActivity** --- issue activity within the past week
-   **daysSinceLastPush** --- recency of the last code push
-   **totalStars** --- baseline popularity

### Suggested Weights

  Metric           Weight
  ---------------- --------
  Commits          0.30
  Star growth      0.25
  Issue activity   0.15
  Push recency     0.20
  Total stars      0.10

All metrics are normalized to a 0--1 range before computing the final
score.

This scoring system helps identify repositories that are **actively
evolving**, not just historically popular.
