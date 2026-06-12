
import Section from '../common/section/Section';
import SectionItem from '../common/section/SectionItem';
import SectionInputGroup from '../common/section/SectionInputGroup';
import ButtonInput from '../common/inputs/ButtonInput';
import DropdownInput from '../common/inputs/DropdownInput';
import { useTranslator } from '@/hooks/translator';
import { useEffect } from 'react';
import { eez_options, mpa_options } from '@/helpers/fixtures/context';
import { useAOIStore } from '@/stores/areaOfInterestStore';

export const EAreaOfInterestTools = {
    zonal: "zonal",
    point: "point",
    eez: "eez",
    mpa: "mpa"
} as const
export type TAreaOfInterestTools = typeof EAreaOfInterestTools[keyof typeof EAreaOfInterestTools]

export interface IAreaOfInterestProps {

}

const AreaOfInterest = (props: IAreaOfInterestProps) => {
    const zonal = useAOIStore( s => s.zonal )
    const setZonal = useAOIStore( s => s.setZonal )
   
    const point = useAOIStore( s => s.point )
    const setPoint = useAOIStore( s => s.setPoint )

    const eezOptions = useAOIStore( s => s.eezOptions )
    const setEEZOptions = useAOIStore( s => s.setEEZOptions )
    const eezActive = useAOIStore( s => s.eezActive )
    const setEEZActive = useAOIStore( s => s.setEEZActive )
    
    const mpaOptions = useAOIStore( s => s.mpaOptions )
    const setMPAOptions = useAOIStore( s => s.setMPAOptions )
    const mpaActive = useAOIStore( s => s.mpaActive )
    const setMPAActive = useAOIStore( s => s.setMPAActive )

    const {t} = useTranslator()

    const deactivateExcept = (a_Tool: TAreaOfInterestTools) => {
        switch(a_Tool) {
            case EAreaOfInterestTools.point: 
                setZonal(false)
                setEEZActive(undefined)
                setMPAActive(undefined)
                break;
            case EAreaOfInterestTools.zonal: 
                setPoint(false)
                setEEZActive(undefined)
                setMPAActive(undefined)
                break;
            case EAreaOfInterestTools.eez: 
                setPoint(false)
                setZonal(false)
                setMPAActive(undefined)
                break;
            case EAreaOfInterestTools.mpa: 
                setPoint(false)
                setZonal(false)
                setEEZActive(undefined)
                break;
        }
    }

    const handleZonalClick = () => {
        deactivateExcept(EAreaOfInterestTools.zonal)
        setZonal(!zonal)
    }

    const handlePointClick = () => {
        deactivateExcept(EAreaOfInterestTools.point)
        setPoint(!point)
    }

    const handleChangeEEZOption = (a_Value: string) => {
        deactivateExcept(EAreaOfInterestTools.eez)
        const eez = eezOptions.find( eez => eez.value === a_Value )
        setEEZActive(eez)
    }

    const handleChangeMPAOption = (a_Value: string) => {
        deactivateExcept(EAreaOfInterestTools.mpa)
        const mpa = mpaOptions.find( mpa => mpa.value === a_Value )
        setMPAActive(mpa)
    }

    const handleClearEEZ = () => {
        setEEZActive(undefined)
    }

    const handleClearMPA = () => {
        setMPAActive(undefined)
    }

    useEffect( () => {
        setEEZOptions(eez_options)
        setMPAOptions(mpa_options)
    }, [])

    return (
        <Section title={t("sidebar.titles.areaOfInterest")} collapsible>
            <SectionItem title={t("sidebar.titles.drawOnMap")}>
                <SectionInputGroup>
                    <ButtonInput 
                        label={t("general.label.zonal")} 
                        onClick={handleZonalClick}
                        active={zonal}
                    />
                    <ButtonInput 
                        label={t("general.label.point")} 
                        onClick={handlePointClick}
                        active={point}
                    />
                </SectionInputGroup>
            </SectionItem>

            <SectionItem title={t("sidebar.text.orChooseEEZRegion")}>
                <DropdownInput
                    placeholder={t("sidebar.placeholder.selectEEZ")}
                    options={eezOptions}
                    value={eezActive ? eezActive.value : ""}
                    onChange={handleChangeEEZOption}
                    onClear={handleClearEEZ}
                    clearLabel={t("general.label.clear")}
                />
            </SectionItem>

            <SectionItem title={t("sidebar.text.orChooseMPARegion")}>
                <DropdownInput
                    placeholder={t("sidebar.placeholder.selectMPA")}
                    options={mpaOptions}
                    value={mpaActive ? mpaActive.value : ""}
                    onChange={handleChangeMPAOption}
                    onClear={handleClearMPA}
                    clearLabel={t("general.label.clear")}
                />
            </SectionItem>
        </Section>
    )
}

export default AreaOfInterest