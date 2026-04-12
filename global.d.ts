declare module '*.css'

declare module 'sanitize-html' {
  export interface TransformAttributes {
    [key: string]: string
  }

  export interface TransformTagResult {
    tagName: string
    attribs: TransformAttributes
  }

  export interface IOptions {
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[]>
    allowedSchemes?: string[]
    allowedSchemesByTag?: Record<string, string[]>
    allowProtocolRelative?: boolean
    transformTags?: Record<
      string,
      (tagName: string, attribs: TransformAttributes) => TransformTagResult
    >
  }

  export default function sanitizeHtml(dirty: string, options?: IOptions): string
}
