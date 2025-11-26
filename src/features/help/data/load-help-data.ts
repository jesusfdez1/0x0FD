import type { HelpContent, HelpSubject } from '../types'

export async function loadHelpData(): Promise<HelpContent[]> {
  try {
    // Intentar cargar archivos JSON dinámicamente
    // Probamos un rango razonable basado en los IDs que vimos (150-181, con algunos saltos)
    const contents: HelpContent[] = []
    
    // Intentar cargar archivos en un rango, solo los que existan se cargarán
    const loadPromises: Promise<HelpContent | null>[] = []
    
    // Rango basado en los archivos que sabemos que existen
    for (let i = 150; i <= 181; i++) {
      // Saltar 166 que no existe
      if (i === 166) continue
      
      const file = `${i}.json`
      loadPromises.push(
        fetch(`/help-jsons/${file}`)
          .then((response) => {
            if (response.ok) {
              return response.json().then((data) => data as HelpContent)
            }
            return null
          })
          .catch(() => null) // Ignorar archivos que no existen
      )
    }

    const results = await Promise.all(loadPromises)
    const validContents = results.filter((content): content is HelpContent => content !== null)

    // Ordenar por Order
    return validContents.sort((a, b) => a.Order - b.Order)
  } catch (error) {
    console.error('Error cargando datos de ayuda:', error)
    return []
  }
}

export function groupBySubject(contents: HelpContent[]): HelpSubject[] {
  const subjectMap = new Map<number, HelpSubject>()

  contents.forEach((content) => {
    const subjectId = content.SubjectId
    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        subject: content.Subject,
        subjectId,
        contents: []
      })
    }
    subjectMap.get(subjectId)!.contents.push(content)
  })

  // Ordenar contenidos dentro de cada subject por Order
  subjectMap.forEach((subject) => {
    subject.contents.sort((a, b) => a.Order - b.Order)
  })

  // Convertir a array y ordenar los subjects por el Order del primer item (o el item tipo sección)
  const subjectsArray = Array.from(subjectMap.values())
  
  // Ordenar subjects por el Order del item tipo sección (ContentType 4) o el primer item
  subjectsArray.sort((a, b) => {
    const aSection = a.contents.find(c => c.ContentType === 4) || a.contents[0]
    const bSection = b.contents.find(c => c.ContentType === 4) || b.contents[0]
    
    if (!aSection || !bSection) return 0
    return aSection.Order - bSection.Order
  })

  return subjectsArray
}

export function searchContents(contents: HelpContent[], query: string): HelpContent[] {
  if (!query.trim()) return contents

  const lowerQuery = query.toLowerCase()
  return contents.filter((content) => {
    return (
      content.Title.toLowerCase().includes(lowerQuery) ||
      content.Summary.toLowerCase().includes(lowerQuery) ||
      content.Subject.toLowerCase().includes(lowerQuery) ||
      content.Body.toLowerCase().includes(lowerQuery) ||
      content.ConceptKeys.some((key) => key.toLowerCase().includes(lowerQuery))
    )
  })
}

