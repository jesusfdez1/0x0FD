import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useLanguage } from '@/context/language-provider'
import {
  AssetType,
  type Asset,
  type RealEstateAsset,
  type SavingsAccountAsset,
  type TermDepositAsset,
  type CheckingAccountAsset,
  type PreciousMetalAsset,
  type CommodityAsset,
  type PensionPlanAsset,
} from '../types'
import { RealEstateAssetForm } from './asset-form/real-estate-asset-form'
import { SavingsAccountAssetForm } from './asset-form/savings-account-asset-form'
import { TermDepositAssetForm } from './asset-form/term-deposit-asset-form'
import { CheckingAccountAssetForm } from './asset-form/checking-account-asset-form'
import { PreciousMetalAssetForm } from './asset-form/precious-metal-asset-form'
import { CommodityAssetForm } from './asset-form/commodity-asset-form'
import { PensionPlanAssetForm } from './asset-form/pension-plan-asset-form'

interface ManualAssetEditDialogProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManualAssetEditDialog({ asset, open, onOpenChange }: ManualAssetEditDialogProps) {
  const { t } = useLanguage()

  if (!asset) {
    return null
  }

  const baseProps = {
    onSuccess: () => onOpenChange(false),
    onCancel: () => onOpenChange(false),
  }

  let form = null
  switch (asset.type) {
    case AssetType.REAL_ESTATE:
      form = <RealEstateAssetForm {...baseProps} asset={asset as RealEstateAsset} />
      break
    case AssetType.SAVINGS_ACCOUNT:
      form = <SavingsAccountAssetForm {...baseProps} asset={asset as SavingsAccountAsset} />
      break
    case AssetType.TERM_DEPOSIT:
      form = <TermDepositAssetForm {...baseProps} asset={asset as TermDepositAsset} />
      break
    case AssetType.CHECKING_ACCOUNT:
      form = <CheckingAccountAssetForm {...baseProps} asset={asset as CheckingAccountAsset} />
      break
    case AssetType.PRECIOUS_METAL:
      form = <PreciousMetalAssetForm {...baseProps} asset={asset as PreciousMetalAsset} />
      break
    case AssetType.COMMODITY:
      form = <CommodityAssetForm {...baseProps} asset={asset as CommodityAsset} />
      break
    case AssetType.PENSION_PLAN:
      form = <PensionPlanAssetForm {...baseProps} asset={asset as PensionPlanAsset} />
      break
    default:
      form = (
        <p className='text-sm text-muted-foreground'>
          {t('assets.forms.editDialog.unsupported')}
        </p>
      )
      break
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('assets.forms.editDialog.title')}</DialogTitle>
          <DialogDescription>{t('assets.forms.editDialog.description')}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}


