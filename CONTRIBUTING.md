
# Contributing to the Workout App

## Architecture Overview
This application is built with React, TypeScript, Vite, and Supabase. It follows a component-based architecture with state management primarily through React's useState and useContext hooks.

## Do-not-touch paths
- `/src/pages/**` except when ticket explicitly lists the file
- `/supabase/functions/**` except *generateWorkoutPlan*

Lovable will show a diff if a future prompt tries to edit a forbidden file.

## Code Style
- Use TypeScript for type safety
- Follow the existing pattern of component organization
- Use shadcn/ui components for UI elements
- Maintain responsive design with Tailwind CSS

## Performance Guidelines
- Memoize expensive calculations and component renders
- Use React.lazy for code splitting of large components
- Keep component state as local as possible
- Avoid unnecessary re-renders

## API Integration
- Use Supabase client for database operations
- Handle errors gracefully with user-friendly messages
- Use edge functions for server-side operations that require secrets
