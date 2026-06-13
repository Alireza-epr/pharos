
import Section from '../common/section/Section';
import SectionInputGroup from '../common/section/SectionInputGroup';
import DropdownInput from '../common/inputs/DropdownInput';
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '../../hooks/translator';
import { useSortOrderStore } from '../../stores/sortOrderStore';
import { sort_field_options } from '../../helpers/fixtures/context';
import sortStyle from './SortOrder.module.scss';
import { ISortOption } from '@packages/types';

export interface ISortOrderProps {}

const MAX_SORTS = 5

const SortOrder = (props: ISortOrderProps) => {
    const sorts = useSortOrderStore(s => s.sorts)
    const setSorts = useSortOrderStore(s => s.setSorts)

    const { t } = useTranslator()

    const changeField = (index: number, field: string) => {
        setSorts(sorts.map((s, i): ISortOption => i === index ? { ...s, sortBy: field } : s))
    }

    const toggleDirection = (index: number) => {
        setSorts(sorts.map((s, i): ISortOption => i === index
            ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
            : s
        ))
    }

    const removeSort = (index: number) => {
        setSorts(sorts.filter((_, i) => i !== index))
    }

    const addSort = () => {
        const usedFields = new Set(sorts.map(s => s.sortBy))
        const firstAvailable = sort_field_options.find(o => !usedFields.has(o.value))
        if (!firstAvailable) return
        setSorts([...sorts, { sortBy: firstAvailable.value, direction: 'desc' }])
    }

    const optionsFor = (index: number) => {
        const usedFields = new Set(sorts.filter((_, i) => i !== index).map(s => s.sortBy))
        return sort_field_options.filter(o => !usedFields.has(o.value))
    }

    const canAdd = sorts.length < MAX_SORTS && sorts.length < sort_field_options.length

    return (
        <Section title={t('sidebar.titles.sortOrder')} collapsible>
            <SectionInputGroup direction="column">
                {sorts.map((sort, index) => (
                    <div key={sort.sortBy} className={sortStyle.row}>
                        <span className={`font-size-sm ${sortStyle.rank}`}>{index + 1}</span>
                        <DropdownInput
                            value={sort.sortBy}
                            options={optionsFor(index)}
                            onChange={(field) => changeField(index, field)}
                        />
                        <div className={sortStyle.action}>
                            <ButtonInput
                                label={sort.direction === 'desc' ? '↓' : '↑'}
                                onClick={() => toggleDirection(index)}
                            />
                        </div>
                        <div className={sortStyle.action}>
                            <ButtonInput
                                label="×"
                                onClick={() => removeSort(index)}
                            />
                        </div>
                    </div>
                ))}
                {canAdd && (
                    <ButtonInput
                        label={t('sidebar.label.addSort')}
                        onClick={addSort}
                    />
                )}
            </SectionInputGroup>
        </Section>
    )
}

export default SortOrder
