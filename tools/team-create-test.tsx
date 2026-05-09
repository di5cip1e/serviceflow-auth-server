import { createTeamMember, TeamRole, ROLE_DISPLAY, ROLE_COLORS } from '../../../lib/team';
const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [{ value: 'owner', label: 'Owner' }, { value: 'admin', label: 'Admin' }, { value: 'technician', label: 'Tech' }, { value: 'office_staff', label: 'Office' }];
console.log(ROLE_COLORS);
