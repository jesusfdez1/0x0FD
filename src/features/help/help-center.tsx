import { useState, useEffect, useMemo } from 'react'
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { loadHelpData, groupBySubject, searchContents } from './data/load-help-data'
import type { HelpContent, HelpSubject } from './types'
import { HelpArticleDetail } from './help-article-detail'

export function HelpCenter() {
  const [contents, setContents] = useState<HelpContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<HelpContent | null>(null)

  useEffect(() => {
    loadHelpData().then((data) => {
      setContents(data)
      setLoading(false)
    })
  }, [])

  const filteredContents = useMemo(() => {
    if (!searchQuery.trim()) return contents
    return searchContents(contents, searchQuery)
  }, [contents, searchQuery])

  const subjects = useMemo(() => {
    return groupBySubject(filteredContents)
  }, [filteredContents])

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-muted-foreground text-center'>
          <BookOpen className='mx-auto mb-4 size-12 animate-pulse' />
          <p>Cargando contenido de ayuda...</p>
        </div>
      </div>
    )
  }

  if (selectedArticle) {
    return (
      <HelpArticleDetail
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        onSelectArticle={(article) => {
          setSelectedArticle(article)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        allContents={contents}
      />
    )
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Header con búsqueda */}
      <div className='border-b bg-background px-6 py-5'>
        <div className='mb-5'>
          <h1 className='mb-1.5 text-2xl font-bold'>Centro de Ayuda</h1>
          <p className='text-muted-foreground text-sm'>
            Encuentra respuestas y guías sobre inversión y finanzas
          </p>
        </div>
        <div className='relative'>
          <Search className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2' />
          <Input
            type='text'
            placeholder='Buscar artículos, temas o conceptos...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
        {searchQuery && (
          <p className='text-muted-foreground mt-2 text-xs'>
            {filteredContents.length} resultado{filteredContents.length !== 1 ? 's' : ''} encontrado{filteredContents.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Contenido */}
      <ScrollArea className='flex-1'>
        <div className='container mx-auto max-w-7xl px-6 py-6'>
          {subjects.length === 0 ? (
            <div className='text-muted-foreground py-12 text-center'>
              <Search className='mx-auto mb-4 size-12 opacity-50' />
              <p className='text-lg font-medium'>No se encontraron resultados</p>
              <p className='text-sm'>Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className='space-y-10'>
              {subjects.map((subject, index) => (
                <SubjectSection
                  key={subject.subjectId}
                  subject={subject}
                  index={index + 1}
                  onSelectArticle={setSelectedArticle}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function SubjectSection({
  subject,
  index,
  onSelectArticle,
}: {
  subject: HelpSubject
  index: number
  onSelectArticle: (article: HelpContent) => void
}) {
  // Filtrar solo artículos con contenido (Body no vacío o ContentType 1)
  const articles = subject.contents.filter(
    (content) => content.Body.trim() || content.ContentType === 1
  )

  if (articles.length === 0) return null

  // Obtener la descripción del primer artículo (tipo sección) o del primero disponible
  const sectionDescription = subject.contents.find(
    (c) => c.ContentType === 4 && c.Summary
  )?.Summary || subject.contents[0]?.Summary || ''

  return (
    <div className='space-y-5'>
      <div className='space-y-1.5'>
        <h2 className='text-xl font-bold tracking-tight'>
          <span className='text-muted-foreground/70 mr-2'>{index}.</span>
          {subject.subject}
        </h2>
        {sectionDescription && (
          <p className='text-muted-foreground text-sm leading-relaxed max-w-3xl ml-6'>
            {sectionDescription}
          </p>
        )}
      </div>
      <div className='grid gap-2.5 md:grid-cols-2 lg:grid-cols-3'>
        {articles.map((content) => (
          <ArticleCard
            key={content.Id}
            content={content}
            onClick={() => onSelectArticle(content)}
          />
        ))}
      </div>
    </div>
  )
}

function ArticleCard({
  content,
  onClick,
}: {
  content: HelpContent
  onClick: () => void
}) {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className='group relative text-left w-full rounded-lg border bg-card/50 p-3.5 transition-all hover:border-primary/50 hover:bg-card hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98]'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0 space-y-1.5'>
          <h3 className='font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors'>
            {content.Title}
          </h3>
          {content.ReadTime && (
            <div className='flex items-center gap-1.5 text-muted-foreground text-xs'>
              <Clock className='size-3 shrink-0' />
              <span>{content.ReadTime} min</span>
            </div>
          )}
        </div>
        <ChevronRight className='text-muted-foreground/60 shrink-0 size-4 mt-0.5 group-hover:text-primary group-hover:translate-x-0.5 transition-all' />
      </div>
    </button>
  )
}

