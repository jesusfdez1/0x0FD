import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useLanguage } from '@/context/language-provider'
import { AssetType, type Asset } from '../types'
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

  const commonProps = {
    asset,
    onSuccess: () => onOpenChange(false),
    onCancel: () => onOpenChange(false),
  }

  let form = null
  switch (asset.type) {
    case AssetType.REAL_ESTATE:
      form = <RealEstateAssetForm {...commonProps} />
      break
    case AssetType.SAVINGS_ACCOUNT:
      form = <SavingsAccountAssetForm {...commonProps} />
      break
    case AssetType.TERM_DEPOSIT:
      form = <TermDepositAssetForm {...commonProps} />
      break
    case AssetType.CHECKING_ACCOUNT:
      form = <CheckingAccountAssetForm {...commonProps} />
      break
    case AssetType.PRECIOUS_METAL:
      form = <PreciousMetalAssetForm {...commonProps} />
      break
    case AssetType.COMMODITY:
      form = <CommodityAssetForm {...commonProps} />
      break
    case AssetType.PENSION_PLAN:
      form = <PensionPlanAssetForm {...commonProps} />
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


