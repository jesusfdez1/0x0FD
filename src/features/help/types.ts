export interface HelpContent {
  Id: number
  Title: string
  TitleDisambiguation: string
  Summary: string
  Body: string
  Subject: string
  SubjectId: number
  Order: number
  Difficulty: number
  ReadTime: number | null
  UrlImage: string
  UrlFile: string
  ConceptKeys: string[]
  RelatedContents: RelatedContent[]
  PromoContents: any[]
  ContentType: number
  Context: number
  CreationDate: string
  ExtraData: any
  Read?: boolean
  New?: boolean
  Passed?: boolean
  HasExam?: boolean
  Progress?: number
  LikeIt?: boolean | null
  BlockPendingTime?: number
}

export interface RelatedContent {
  Id: number
  Title: string
  TitleDisambiguation: string
  Summary: string
  UrlImage: string
  UrlFile: string
  ContentType: number
  Context: number
  ExtraData: any
}

export interface HelpSubject {
  subject: string
  subjectId: number
  contents: HelpContent[]
}

