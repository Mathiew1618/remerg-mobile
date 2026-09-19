import { FilterChips, type FilterOption } from '@/components/filter-chips';
import type { CommCorrFilter } from '@/data/commcorr';
import type { ResourceFilter } from '@/data/resources';

const RESOURCE_OPTIONS: FilterOption<ResourceFilter>[] = [
  { key: 'justiceInvolved', label: 'Justice-involved' },
  { key: 'medicaid', label: 'Medicaid' },
  { key: 'slidingScale', label: 'Sliding scale' },
  { key: 'spanish', label: 'Español' },
  { key: 'veterans', label: 'Veterans' },
];

export function ResourceFilters({
  active,
  onToggle,
}: {
  active: ResourceFilter[];
  onToggle: (f: ResourceFilter) => void;
}) {
  return <FilterChips options={RESOURCE_OPTIONS} active={active} onToggle={onToggle} />;
}

/**
 * Halfway houses get their own vocabulary. "Medicaid" and "Sliding scale" mean
 * nothing here; whether a bed is open to women, or to someone with a sex
 * offence, is the whole question.
 */
const COMMCORR_OPTIONS: FilterOption<CommCorrFilter>[] = [
  { key: 'women', label: 'Takes women' },
  { key: 'men', label: 'Takes men' },
  { key: 'residentialTreatment', label: 'Intensive residential' },
  { key: 'dualDiagnosis', label: 'Dual diagnosis' },
  { key: 'acceptsSexOffense', label: 'Sex-offence track' },
];

export function CommCorrFilters({
  active,
  onToggle,
}: {
  active: CommCorrFilter[];
  onToggle: (f: CommCorrFilter) => void;
}) {
  return <FilterChips options={COMMCORR_OPTIONS} active={active} onToggle={onToggle} />;
}
