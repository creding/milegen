# Development Scratchpad

## Terms of Service Management System

### Current Status
- Added terms acceptance tracking to users table
- Implemented basic terms acceptance in signup flow
- Terms version hardcoded as "1.0"

### TODO

1. Database Changes
   - [ ] Create terms_versions table
     ```sql
     CREATE TABLE public.terms_versions (
       id SERIAL PRIMARY KEY,
       version TEXT NOT NULL,
       content TEXT NOT NULL,
       effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(version)
     );
     ```

2. Environment Setup
   - [ ] Add CURRENT_TERMS_VERSION to .env
   - [ ] Add terms content storage strategy (either in DB or as markdown files)

3. Terms Management
   - [ ] Create API endpoint to fetch current terms version
   - [ ] Create admin interface for managing terms versions
   - [ ] Implement terms version comparison logic

4. User Flow
   - [ ] Add terms update notification for existing users
   - [ ] Create terms acceptance page for existing users
   - [ ] Add terms acceptance status check middleware
   - [ ] Implement force-accept flow for outdated terms

5. API Changes
   - [ ] Add endpoint to check if user needs to accept new terms
   - [ ] Add endpoint to accept new terms version
   - [ ] Add admin endpoints for terms management

6. UI Components
   - [ ] Create TermsUpdateModal component
   - [ ] Add terms version display in terms page
   - [ ] Add terms acceptance history to user profile

7. Migration Strategy
   - [ ] Create migration plan for existing users
   - [ ] Add grace period configuration
   - [ ] Implement gradual rollout strategy

### Implementation Priority
1. High Priority
   - Terms versions table and basic management
   - Environment configuration
   - Terms acceptance flow for existing users

2. Medium Priority
   - Admin interface
   - User profile terms history
   - Terms content management

3. Low Priority
   - Grace period configuration
   - Gradual rollout
   - Advanced analytics

### Notes
- Consider legal requirements for terms updates
- Plan for internationalization
- Consider audit logging for terms acceptance
- Think about terms branching for different user types/regions
