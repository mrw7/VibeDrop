# VibeDrop Domain Model

## Glossary

### Core Entities

#### User
A person who authenticates via GitHub OAuth to use the platform. Each User has a unique GitHub identity.

- **id**: UUID, primary key
- **githubId**: string, GitHub user ID
- **githubLogin**: string, GitHub username
- **avatarUrl**: string, GitHub avatar URL
- **email**: string, optional
- **createdAt**: timestamp

#### App
A published application on the platform. An App represents a shareable, playable web application created via vibe coding.

- **id**: UUID, primary key
- **title**: string, display name of the app
- **description**: string, optional markdown description
- **coverImage**: string, URL to cover image stored in OSS
- **authorId**: UUID, references User
- **sourceType**: enum — `zip` | `github`
- **sourceUrl**: string, GitHub repo URL (if sourceType=github)
- **buildStatus**: enum — `pending` | `building` | `success` | `failed`
- **buildId**: UUID, optional, references latest successful Build
- **playUrl**: string, OSS URL to the built/ uploaded web assets
- **aiToolTag**: string, e.g. "Cursor", "v0", "Bolt", "Lovable"
- **techStackTag**: string, e.g. "React", "Vue", "Flutter", "Vanilla"
- **deviceType**: enum — `web` | `ios` | `android` | `harmony`
- **likesCount**: integer, cached counter
- **commentsCount**: integer, cached counter
- **createdAt**: timestamp
- **updatedAt**: timestamp

#### Build
A record of an automated or manual build process for an App.

- **id**: UUID, primary key
- **appId**: UUID, references App
- **status**: enum — `pending` | `building` | `success` | `failed`
- **sourceType**: enum — `zip` | `github`
- **sourceUrl**: string, GitHub repo URL or ZIP file URL
- **buildLog**: text, optional, build output logs
- **artifactUrl**: string, OSS URL to built artifacts
- **startedAt**: timestamp
- **completedAt**: timestamp, optional

#### Like
A user's appreciation for an App. One Like per User per App.

- **id**: UUID, primary key
- **userId**: UUID, references User
- **appId**: UUID, references App
- **createdAt**: timestamp

#### Comment
A user's text comment on an App.

- **id**: UUID, primary key
- **userId**: UUID, references User
- **appId**: UUID, references App
- **content**: string, markdown text
- **createdAt**: timestamp

### Key Terms

- **Vibe Coding**: The practice of creating applications using AI-assisted tools (Cursor, v0, Bolt, Lovable, etc.) with minimal manual coding.
- **Play**: To interact with an App inside the platform's iframe sandbox player.
- **Fork**: To copy another user's App source and create a new App based on it. (Phase 2 feature)
- **AI Tool Tag**: A label indicating which AI tool was used to generate the App (e.g., "Made with Cursor").
- **Tech Stack Tag**: A label indicating the underlying technology (React, Vue, Flutter, etc.).
- **Device Shell**: The visual phone frame (iPhone or Android) surrounding the iframe player.
- **ZIP Upload**: Direct upload of pre-built web assets as a ZIP file.
- **GitHub Auto-Build**: Automatic cloning and building of a public GitHub repository.

### Relationships

- User 1:N App (an author can publish many apps)
- User 1:N Like (a user can like many apps)
- User 1:N Comment (a user can comment on many apps)
- App 1:N Build (an app can have multiple build attempts)
- App 1:N Like (an app can receive many likes)
- App 1:N Comment (an app can receive many comments)
