# Email Naming Convention

Phoenix International School uses a structured email naming convention to make user accounts easily identifiable and groupable by role.

## Format

All user emails follow this pattern:

```
{role_prefix}_{firstname}.{lastname}@phoenixgh.edu
```

## Role Prefixes

| Prefix | Role | Example |
|--------|------|---------|
| `a` | Admin | `a_emmanuel.adjei@phoenixgh.edu` |
| `pr` | Principal | `pr_akua.boateng@phoenixgh.edu` |
| `t` | Teacher | `t_adjoa.koomson@phoenixgh.edu` |
| `p` | Parent | `p_kwame.asante@phoenixgh.edu` |
| `s` | Student | `s_kwame.asante.jr@phoenixgh.edu` |
| `d` | Driver | `d_kwesi@phoenixgh.edu` |

## Benefits

- **Structural Grouping**: All admins start with `a_`, all teachers with `t_`, etc. Makes it easy to filter users by role
- **Memorable**: Users remember who they're contacting by the role prefix
- **Scalable**: No duplicate emails across roles, even if names are similar
- **Programmable**: A utility function `parseRoleFromEmail()` automatically extracts role from email

## Implementation

Use the helper function in `src/lib/utils.ts`:

```typescript
import { parseRoleFromEmail } from '@/lib/utils'

const role = parseRoleFromEmail('t_adjoa.koomson@phoenixgh.edu') // returns 'teacher'
const role = parseRoleFromEmail('a_emmanuel.adjei@phoenixgh.edu') // returns 'admin'
```

## Special Cases

- **Parent names with spaces**: Use dots for all separations, e.g., `p_anna.marie.dade@phoenixgh.edu`
- **Admin/Principal onboarding**: Use domain-neutral emails like `a_admin@phoenixintl.school` for schools' internal accounts, then migrate to `phoenixgh.edu` after setup
- **External admins** (non-school): Can use personal domains (e.g., Enam's account: `a_enam.egyir@phoenixgh.edu`)

## Migration Notes

When updating an existing school's email system:
1. Create new accounts with the naming convention
2. Archive old generic accounts (admin@, teacher@, etc.)
3. Update demo credentials in `src/app/login/page.tsx`
4. Update MOCK_USERS in `src/lib/mockData.ts`
5. Update seeded accounts in `src/store/useAppStore.ts`
