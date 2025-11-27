import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AssetType } from '../../types'
import { StockAssetForm } from './stock-asset-form'
import { ETFAssetForm } from './etf-asset-form'
import { FixedIncomeAssetForm } from './fixed-income-asset-form'
import { CurrencyAssetForm } from './currency-asset-form'
import { OptionAssetForm } from './option-asset-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface AssetFormDialogProps {
  onSuccess?: () => void
}

export function AssetFormDialog({ onSuccess }: AssetFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<AssetType | ''>('')

  const handleSuccess = () => {
    setOpen(false)
    setSelectedType('')
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Agregar Activo
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Activo</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de activo que deseas agregar
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>Tipo de Activo</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as AssetType)}>
              <SelectTrigger>
                <SelectValue placeholder='Selecciona un tipo de activo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AssetType.STOCK}>Acción</SelectItem>
                <SelectItem value={AssetType.ETF}>ETF</SelectItem>
                <SelectItem value={AssetType.FIXED_INCOME}>Renta Fija</SelectItem>
                <SelectItem value={AssetType.GUARANTEED}>Garantizado</SelectItem>
                <SelectItem value={AssetType.CURRENCY}>Divisa</SelectItem>
                <SelectItem value={AssetType.OPTION}>Opción</SelectItem>
                <SelectItem value={AssetType.MUTUAL_FUND}>Fondo de Inversión</SelectItem>
                <SelectItem value={AssetType.PENSION_PLAN}>Plan de Pensiones</SelectItem>
                <SelectItem value={AssetType.WARRANT}>Warrant</SelectItem>
                <SelectItem value={AssetType.REAL_ESTATE}>Propiedad</SelectItem>
                <SelectItem value={AssetType.CRYPTO}>Criptomoneda</SelectItem>
                <SelectItem value={AssetType.COMMODITY}>Materia Prima</SelectItem>
                <SelectItem value={AssetType.FUTURES}>Futuro</SelectItem>
                <SelectItem value={AssetType.STRUCTURED_PRODUCT}>Producto Estructurado</SelectItem>
                <SelectItem value={AssetType.SAVINGS_ACCOUNT}>Cuenta Remunerada</SelectItem>
                <SelectItem value={AssetType.TERM_DEPOSIT}>Depósito a Plazo</SelectItem>
                <SelectItem value={AssetType.CHECKING_ACCOUNT}>Cuenta Corriente</SelectItem>
                <SelectItem value={AssetType.PRECIOUS_METAL}>Metal Precioso</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

