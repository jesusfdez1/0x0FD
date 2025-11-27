import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AssetType } from '../../types'
import { StockAssetForm } from './stock-asset-form'
import { ETFAssetForm } from './etf-asset-form'
import { FixedIncomeAssetForm } from './fixed-income-asset-form'
import { CurrencyAssetForm } from './currency-asset-form'
import { OptionAssetForm } from './option-asset-form'
import { RealEstateAssetForm } from './real-estate-asset-form'
import { SavingsAccountAssetForm } from './savings-account-asset-form'
import { TermDepositAssetForm } from './term-deposit-asset-form'
import { CheckingAccountAssetForm } from './checking-account-asset-form'
import { PreciousMetalAssetForm } from './precious-metal-asset-form'
import { CommodityAssetForm } from './commodity-asset-form'
import { PensionPlanAssetForm } from './pension-plan-asset-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/context/language-provider'
import { ASSET_TYPE_GROUPS, type AssetTypeGroup } from '../../constants/asset-type-groups'

interface AssetFormDialogProps {
  onSuccess?: () => void
}

export function AssetFormDialog({ onSuccess }: AssetFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [typeGroup, setTypeGroup] = useState<AssetTypeGroup | ''>('')
  const [selectedType, setSelectedType] = useState<AssetType | ''>('')
  const { t } = useLanguage()

  const typeOptions = typeGroup ? ASSET_TYPE_GROUPS[typeGroup] : []

  const handleSuccess = () => {
    setOpen(false)
    setTypeGroup('')
    setSelectedType('')
    onSuccess?.()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          setTypeGroup('')
          setSelectedType('')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          {t('assets.addAsset')}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('assets.forms.dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('assets.forms.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4 py-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{t('assets.forms.dialog.groupLabel')}</Label>
              <Select
                value={typeGroup}
                onValueChange={(value) => {
                  setTypeGroup(value as AssetTypeGroup)
                  setSelectedType('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('assets.forms.dialog.groupPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='quoted'>{t('assets.forms.dialog.groups.quoted')}</SelectItem>
                  <SelectItem value='manual'>{t('assets.forms.dialog.groups.manual')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('assets.forms.dialog.typeLabel')}</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as AssetType)}
                disabled={!typeGroup}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('assets.forms.dialog.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`assets.types.${type}` as const)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedType === AssetType.STOCK && (
            <StockAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.ETF && (
            <ETFAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.FIXED_INCOME && (
            <FixedIncomeAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.CURRENCY && (
            <CurrencyAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.OPTION && (
            <OptionAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.PENSION_PLAN && (
            <PensionPlanAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.REAL_ESTATE && (
            <RealEstateAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.SAVINGS_ACCOUNT && (
            <SavingsAccountAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.TERM_DEPOSIT && (
            <TermDepositAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.CHECKING_ACCOUNT && (
            <CheckingAccountAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.PRECIOUS_METAL && (
            <PreciousMetalAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
          {selectedType === AssetType.COMMODITY && (
            <CommodityAssetForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

