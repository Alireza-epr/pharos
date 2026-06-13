import { useTranslator } from "@/hooks/translator"
import Section from "../common/section/Section"
import SectionItem from "../common/section/SectionItem"
import NumberInput from "../common/inputs/NumberInput"
import { useThresholdAndWeightsStore } from "@/stores/thresholdAndWeights"
import { IConfigJSON } from "@packages/types"

export interface IThresholdAndWeightsProps {

}

const ThresholdAndWeights = () => {
  const threshold = useThresholdAndWeightsStore(s => s.threshold)
  const setThreshold = useThresholdAndWeightsStore(s => s.setThreshold)

  const updateThreshold = (a_Patch: Partial<IConfigJSON["threshold"]>) => {
    setThreshold(prev => ({ ...prev, ...a_Patch }))
  }

  const { t } = useTranslator()

  return (
    <Section title={t('sidebar.titles.thresholdAndWeights')} collapsible={false}>
      <SectionItem title={t("sidebar.title.geography")} collapsible={false}>
        <NumberInput direction="row" label={t("sidebar.label.nearCoastThr")} value={threshold.near_coast_threshold} onChange={(v) => updateThreshold({ near_coast_threshold: v })} />
        <NumberInput direction="row" label={t("sidebar.label.shallowWaterThr")} value={threshold.shallow_water_threshold} onChange={(v) => updateThreshold({ shallow_water_threshold: v })} />
        <NumberInput direction="row" label={t("sidebar.label.deepWaterThr")} value={threshold.deep_water_threshold} onChange={(v) => updateThreshold({ deep_water_threshold: v })} />
        <NumberInput direction="row" label={t("sidebar.label.lowConfProxyThr")} value={threshold.low_confidence_proxy_threshold} onChange={(v) => updateThreshold({ low_confidence_proxy_threshold: v })} />
      </SectionItem>


      <SectionItem title={t("sidebar.title.scoreTiers")} collapsible={false}>
        <NumberInput direction="row" label={t("sidebar.label.lowTriageThr")} value={threshold.low_triage_score_threshold} onChange={(v) => updateThreshold({ low_triage_score_threshold: v })} />
        <NumberInput direction="row" label={t("sidebar.label.medTriageThr")} value={threshold.medium_triage_score_threshold} onChange={(v) => updateThreshold({ medium_triage_score_threshold: v })} />
        <NumberInput direction="row" label={t("sidebar.label.highTriageThr")} value={threshold.high_triage_score_threshold} onChange={(v) => updateThreshold({ high_triage_score_threshold: v })} />
      </SectionItem>

      <SectionItem title={t("sidebar.title.weights")} collapsible={false}>
        <NumberInput direction="row" label={t("sidebar.label.baseUncertaintyWeight")} value={threshold.base_uncertainty_weight} onChange={(v) => updateThreshold({ base_uncertainty_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.missingFieldWeight")} value={threshold.missing_field_weight} onChange={(v) => updateThreshold({ missing_field_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.noisyWeight")} value={threshold.noisy_weight} onChange={(v) => updateThreshold({ noisy_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.unmatchedWeight")} value={threshold.unmatched_weight} onChange={(v) => updateThreshold({ unmatched_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.nearCoastWeight")} value={threshold.near_coast_importance_weight} onChange={(v) => updateThreshold({ near_coast_importance_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.eezWeight")} value={threshold.eez_importance_weight} onChange={(v) => updateThreshold({ eez_importance_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.mpaWeight")} value={threshold.mpa_importance_weight} onChange={(v) => updateThreshold({ mpa_importance_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.missingConfProxyWeight")} value={threshold.missing_confidence_proxy_weight} onChange={(v) => updateThreshold({ missing_confidence_proxy_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.lowConfProxyWeight")} value={threshold.low_confidence_proxy_weight} onChange={(v) => updateThreshold({ low_confidence_proxy_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.lowConfTierWeight")} value={threshold.low_confidence_tier_weight} onChange={(v) => updateThreshold({ low_confidence_tier_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.medConfTierWeight")} value={threshold.medium_confidence_tier_weight} onChange={(v) => updateThreshold({ medium_confidence_tier_weight: v })} />
        <NumberInput direction="row" label={t("sidebar.label.highConfTierWeight")} value={threshold.high_confidence_tier_weight} onChange={(v) => updateThreshold({ high_confidence_tier_weight: v })} />
      </SectionItem>
    </Section>
  )
}

export default ThresholdAndWeights