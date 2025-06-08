# Touchpoint React App

A TypeScript React application with NLX Touchpoint chat integration, built with Vite.

## Features

- TypeScript support
- Vite for fast development
- Cinematic landing page with background image
- Touchpoint chat widget integration
- Custom MeetingConfirmationCard component
- Dark mode theme

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Build for Production

```bash
npm run build
```

## Notes

- The Touchpoint widget appears as a button in the bottom-right corner
- Click the button to open the chat interface
- Make sure your NLX bot has a modality named "MeetingConfirmationCard"
- The custom component will be displayed when triggered by your bot
