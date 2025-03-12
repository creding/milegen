# Mileage Log Entries Migration Plan

## Overview
Convert the mileage log system from storing entries in a JSONB array to using a dedicated entries table, while preserving all mileage generation patterns and realism improvements.

## 1. Database Changes

### New Table Structure
```sql
CREATE TABLE mileage_log_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID REFERENCES mileage_logs(id),
    date DATE NOT NULL,
    start_mileage NUMERIC(10,1) NOT NULL,
    end_mileage NUMERIC(10,1) NOT NULL,
    miles NUMERIC(10,1) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    vehicle_info TEXT NOT NULL,
    business_type VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Efficient querying indexes
CREATE INDEX idx_mileage_log_entries_log_id ON mileage_log_entries(log_id);
CREATE INDEX idx_mileage_log_entries_date ON mileage_log_entries(date);
CREATE INDEX idx_mileage_log_entries_type ON mileage_log_entries(type);
```

### Migration Steps
1. Create new table
2. Migrate existing data:
   ```sql
   INSERT INTO mileage_log_entries (
       log_id, date, start_mileage, end_mileage, miles,
       purpose, type, vehicle_info, business_type
   )
   SELECT 
       ml.id,
       (entry->>'date')::date,
       (entry->>'start_mileage')::numeric,
       (entry->>'end_mileage')::numeric,
       (entry->>'miles')::numeric,
       entry->>'purpose',
       entry->>'type',
       COALESCE(entry->>'vehicle_info', ml.vehicle_info),
       entry->>'business_type'
   FROM mileage_logs ml,
   jsonb_array_elements(ml.log_entries) entry;
   ```
3. Remove log_entries column from mileage_logs

## 2. Code Updates

### Types and Interfaces
```typescript
// types/mileage.ts
interface MileageLogEntry {
    id: string;
    log_id: string;
    date: Date;
    start_mileage: number;
    end_mileage: number;
    miles: number;
    purpose: string;
    type: 'business' | 'personal';
    vehicle_info: string;
    business_type?: string;
    location?: string;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

interface FetchEntriesParams {
    logId: string;
    page: number;
    per_page: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    filter_type?: 'business' | 'personal';
}
```

### Server Actions
1. Update mileage generation (`app/actions/mileageGenerator.ts`):
   - Keep existing generation logic to preserve:
     - Trip clustering
     - Purpose continuity
     - Business/personal distribution (90/10 workdays, 40/60 non-workdays)
     - Geographic coherence
     - Realistic mileage patterns
   - Modify save process to use new table

2. Create new entry fetching actions:
   ```typescript
   // app/actions/loadMileageLogEntries.ts
   async function loadMileageLogEntries({
       logId,
       page,
       per_page,
       sort_by = 'date',
       sort_order = 'asc',
       filter_type
   }: FetchEntriesParams): Promise<PaginatedResponse<MileageLogEntry>>
   
   // For downloads/printing
   async function loadAllMileageLogEntries(
       logId: string
   ): Promise<MileageLogEntry[]>
   ```

## 3. UI Components

### MileageLogDisplay Updates
1. Add pagination state:
   ```typescript
   const [page, setPage] = useState(1);
   const [perPage, setPerPage] = useState(50);
   const [entries, setEntries] = useState<MileageLogEntry[]>([]);
   const [totalEntries, setTotalEntries] = useState(0);
   ```

2. Fetch entries on page change:
   ```typescript
   useEffect(() => {
       loadMileageLogEntries({
           logId: log.id,
           page,
           per_page: perPage
       }).then(response => {
           setEntries(response.data);
           setTotalEntries(response.total);
       });
   }, [log.id, page, perPage]);
   ```

3. Update table to use paginated data:
   - Keep existing column structure
   - Add pagination controls
   - Show loading states
   - Handle sorting/filtering

4. Keep PDF/spreadsheet generation:
   - Use `loadAllMileageLogEntries` for full dataset
   - Maintain existing export formats

### New Components
1. `MileageLogPagination`:
   - Page navigation
   - Items per page selector
   - Entry count display

2. `MileageLogFilters`:
   - Type filter (business/personal)
   - Date range filter
   - Purpose filter

## 4. Implementation Order

### Phase 1: Database Setup
1. Create migration file
2. Add new table
3. Create indexes
4. Test migration with sample data

### Phase 2: Backend Changes
1. Update types and interfaces
2. Modify mileage generation code
3. Create new server actions
4. Add data validation and error handling

### Phase 3: UI Updates
1. Add pagination state management
2. Update MileageLogDisplay
3. Create new components
4. Test all functionality:
   - Pagination
   - Sorting/filtering
   - Downloads/printing
   - Performance with large datasets

### Phase 4: Migration
1. Run migration on staging
2. Test all functionality
3. Plan production deployment
4. Create rollback plan

## 5. Testing Plan

### Unit Tests
1. Entry generation
2. Pagination logic
3. Data formatting
4. Filter/sort functions

### Integration Tests
1. Database operations
2. Server actions
3. UI components
4. Export functionality

### Performance Tests
1. Large dataset handling
2. Pagination efficiency
3. Export performance
4. Memory usage

## 6. Monitoring & Metrics

### Key Metrics
1. Page load times
2. Query performance
3. Memory usage
4. Error rates

### Logging
1. Failed queries
2. Generation errors
3. Export failures
4. Performance issues

## 7. Rollback Plan

### Triggers
1. Data inconsistency
2. Performance degradation
3. Critical bugs

### Process
1. Revert database changes
2. Restore JSONB storage
3. Roll back code changes
4. Validate data integrity
