import { useEffect } from 'react'
import { ArrowLeft, Clock, BookOpen, ExternalLink, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { HelpContent } from './types'

interface HelpArticleDetailProps {
  article: HelpContent
  onBack: () => void
  onSelectArticle?: (article: HelpContent) => void
  allContents: HelpContent[]
}

export function HelpArticleDetail({
  article,
  onBack,
  onSelectArticle,
  allContents,
}: HelpArticleDetailProps) {
  // Scroll al inicio cuando se monta el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [article.Id])

  // Procesar el HTML del body
  const processBody = (body: string) => {
    if (!body.trim()) return null

    let processedBody = body

    // Reemplazar referencias a imágenes con formato src=img/...
    processedBody = processedBody.replace(
      /src=img\/(\d+_Eq\d+\.svg)/g,
      (match, filename) => {
        return `src="/help-images/${filename}"`
      }
    )

    // Reemplazar referencias a imágenes con formato src="img/..."
    processedBody = processedBody.replace(
      /src=["']img\/(\d+_Eq\d+\.svg)["']/g,
      (match, filename) => {
        return `src="/help-images/${filename}"`
      }
    )

    return processedBody
  }

  const processedBody = processBody(article.Body)

  // Encontrar contenidos relacionados
  const relatedContents = article.RelatedContents.map((related) => {
    return allContents.find((c) => c.Id === related.Id)
  }).filter(Boolean) as HelpContent[]

  // Procesar URL de imagen de portada
  // Intenta usar imagen local primero, si no existe usa la remota
  const getImageUrls = (urlImage: string): { local: string; remote: string | null } | null => {
    if (!urlImage) return null
    if (urlImage.startsWith('http')) {
      return { local: urlImage, remote: null }
    }
    
    // Extraer nombre del archivo
    const filename = urlImage.split('/').pop() || ''
    
    // Intentar primero con imagen local
    const localPath = `/help-images/${filename}`
    
    // Si empieza con assets/, construir URL remota
    if (urlImage.startsWith('assets/')) {
      const remoteUrl = `https://formacion-inversion.bancosantander.es/eci/${urlImage}`
      return { local: localPath, remote: remoteUrl }
    }
    
    return { local: localPath, remote: null }
  }
  
  const imageUrls = article.UrlImage ? getImageUrls(article.UrlImage) : null
  const coverImageUrl = imageUrls?.local || null
  const remoteImageUrl = imageUrls?.remote || null

  return (
    <div className='flex h-full flex-col bg-background'>
      {/* Header */}
      <div className='relative border-b overflow-visible'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/30 to-background' />
        
        <div className='relative container mx-auto max-w-6xl px-6 py-8'>
          <Button
            variant='ghost'
            onClick={onBack}
            className='mb-6 -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent'
          >
            <ArrowLeft className='mr-2 size-4' />
            Volver al centro de ayuda
          </Button>
          
          <div className='relative flex flex-col md:flex-row gap-6 pb-8'>
            <div className='flex-1 space-y-4'>
              <div className='space-y-3'>
                <Badge variant='secondary' className='text-xs font-medium'>
                  {article.Subject}
                </Badge>
                <h1 className='text-4xl font-bold leading-tight tracking-tight'>
                  {article.Title}
                </h1>
                {article.Summary && (
                  <p className='text-muted-foreground text-lg leading-relaxed max-w-3xl'>
                    {article.Summary}
                  </p>
                )}
              </div>
              
              <div className='flex items-center gap-4 pt-2'>
                {article.ReadTime && (
                  <Badge variant='outline' className='text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/15'>
                    <Clock className='mr-1.5 size-3.5' />
                    {article.ReadTime} min de lectura
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Imagen a la derecha del título - posicionada más arriba para no invadir contenido */}
            {coverImageUrl && (
              <div className='hidden md:block absolute right-0 -top-12 w-96' style={{ height: 'fit-content' }}>
                <div className='relative w-full' style={{ aspectRatio: '16/9' }}>
                  <img
                    src={coverImageUrl}
                    alt={article.Title}
                    className='w-full h-full object-contain'
                    onError={(e) => {
                      // Si falla la imagen local, intentar con la remota
                      if (remoteImageUrl && e.currentTarget.src !== remoteImageUrl) {
                        e.currentTarget.src = remoteImageUrl
                      } else {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.style.display = 'none'
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <ScrollArea className='flex-1'>
        <div className='container mx-auto max-w-6xl px-6 py-8 md:px-6 px-4'>
          <div className='flex gap-8'>
            {/* Contenido principal */}
            <article className='flex-1 min-w-0'>
              {processedBody ? (
                <div className='prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-strong:font-semibold prose-sm'>
                  <div
                    dangerouslySetInnerHTML={{ __html: processedBody }}
                    className='help-content text-sm'
                  />
                </div>
              ) : (
                <Card>
                  <CardContent className='py-12 text-center'>
                    <BookOpen className='text-muted-foreground mx-auto mb-4 size-12' />
                    <p className='text-muted-foreground'>
                      Este artículo no tiene contenido disponible.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Conceptos clave - Versión móvil */}
              {article.ConceptKeys.length > 0 && (
                <div className='mt-8 lg:hidden rounded-xl border bg-card/50 p-5'>
                  <div className='flex items-center gap-2 mb-4'>
                    <Key className='size-5 text-primary' />
                    <h3 className='font-semibold text-base'>Conceptos clave</h3>
                  </div>
                  <ul className='space-y-3'>
                    {article.ConceptKeys.map((key, idx) => (
                      <li key={idx} className='flex items-start gap-3'>
                        <div className='mt-1.5 size-1.5 rounded-full bg-primary shrink-0' />
                        <span className='text-sm leading-relaxed text-muted-foreground'>
                          {key}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Imagen en móvil debajo del título */}
              {coverImageUrl && (
                <div className='mt-6 md:hidden rounded-lg border bg-gradient-to-r from-muted via-muted/80 to-muted p-4 overflow-hidden'>
                  <div className='relative w-full aspect-video'>
                    <img
                      src={coverImageUrl}
                      alt={article.Title}
                      className='w-full h-full object-contain'
                      onError={(e) => {
                        // Si falla la imagen local, intentar con la remota
                        if (remoteImageUrl && e.currentTarget.src !== remoteImageUrl) {
                          e.currentTarget.src = remoteImageUrl
                        } else {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.style.display = 'none'
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Contenidos relacionados */}
              {relatedContents.length > 0 && (
                <div className='mt-12 pt-8 border-t'>
                  <h3 className='text-xl font-semibold mb-4'>Artículos relacionados</h3>
                  <div className='grid gap-3 md:grid-cols-2'>
                    {relatedContents.map((related) => (
                      <button
                        key={related.Id}
                        onClick={() => {
                          if (onSelectArticle) {
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                            setTimeout(() => {
                              onSelectArticle(related)
                            }, 100)
                          }
                        }}
                        className='group text-left rounded-lg border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-sm'
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-medium group-hover:text-primary transition-colors line-clamp-2'>
                              {related.Title}
                            </h4>
                            {related.Summary && (
                              <p className='text-muted-foreground mt-1 text-sm line-clamp-2'>
                                {related.Summary}
                              </p>
                            )}
                          </div>
                          <ExternalLink className='text-muted-foreground group-hover:text-primary ml-2 size-4 shrink-0' />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Conceptos clave - Columna derecha */}
            {article.ConceptKeys.length > 0 && (
              <aside className='hidden lg:block w-72 shrink-0'>
                <div className='sticky top-8'>
                  <div className='rounded-xl border bg-card/50 backdrop-blur-sm p-5 shadow-sm'>
                    <div className='flex items-center gap-2 mb-4'>
                      <Key className='size-5 text-primary' />
                      <h3 className='font-semibold text-base'>Conceptos clave</h3>
                    </div>
                    <ul className='space-y-3'>
                      {article.ConceptKeys.map((key, idx) => (
                        <li key={idx} className='flex items-start gap-3'>
                          <div className='mt-1.5 size-1.5 rounded-full bg-primary shrink-0' />
                          <span className='text-sm leading-relaxed text-muted-foreground'>
                            {key}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </ScrollArea>

      <style>{`
        .help-content {
          line-height: 1.7;
          color: hsl(var(--foreground));
          font-size: 0.9375rem;
        }
        
        .help-content h2 {
          margin-top: 2rem;
          margin-bottom: 0.875rem;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3;
          color: hsl(var(--foreground));
        }
        
        .help-content h3 {
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          color: hsl(var(--foreground));
        }
        
        .help-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          font-size: 0.9375rem;
        }
        
        .help-content ul,
        .help-content ol {
          margin-bottom: 1.5rem;
          margin-top: 1rem;
          padding-left: 1.75rem;
          list-style-position: outside;
        }
        
        .help-content ul {
          list-style-type: disc;
        }
        
        .help-content ol {
          list-style-type: decimal;
        }
        
        .help-content li {
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
          line-height: 1.75;
          display: list-item;
        }
        
        .help-content ul li::marker {
          color: hsl(var(--primary));
          font-weight: 600;
        }
        
        .help-content ol li::marker {
          color: hsl(var(--primary));
          font-weight: 600;
        }
        
        .help-content strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        
        .help-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        .help-content img.equation {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          box-shadow: none;
        }
        
        .help-content .box_down {
          background: hsl(var(--muted));
          border-radius: 0.75rem;
          padding: 1.75rem;
          margin: 2rem 0;
          border: 1px solid hsl(var(--border));
        }
        
        .help-content .box_down h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        
        .help-content .box_down p {
          margin-bottom: 1rem;
        }
        
        .help-content .box_down ul {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  )
}
