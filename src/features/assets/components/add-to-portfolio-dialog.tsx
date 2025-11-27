import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { portfolios } from '@/features/portfolios/data/portfolios'
import { toast } from 'sonner'
import { type Asset } from '../types'

interface AddToPortfolioDialogProps {
  asset: Asset
  onSuccess?: () => void
}

export function AddToPortfolioDialog({ asset, onSuccess }: AddToPortfolioDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')

  const { data: portfolioList = portfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return portfolios
    },
  })

  const handleAdd = () => {
    if (!selectedPortfolio) {
      toast.error('Por favor selecciona una cartera')
      return
    }

    // Aquí iría la lógica para agregar el activo a la cartera
    toast.success(`Activo agregado a la cartera`)
    setOpen(false)
    setSelectedPortfolio('')
    setQuantity('')
    setPurchasePrice('')
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Agregar a Cartera
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar a Cartera</DialogTitle>
          <DialogDescription>
            Selecciona la cartera donde deseas agregar este activo
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>Cartera</Label>
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger>
                <SelectValue placeholder='Selecciona una cartera' />
              </SelectTrigger>
              <SelectContent>
                {portfolioList.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Cantidad</Label>
              <Input
                type='number'
                placeholder='0'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Precio de Compra</Label>
              <Input
                type='number'
                step='0.01'
                placeholder='0.00'
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>
          </div>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd}>
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

